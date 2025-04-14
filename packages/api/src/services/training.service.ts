// Training Service: Handles business logic related to training plans and workouts
import { PrismaClient, User, RunnerProfile, TrainingPlan, PlanWeek, Workout, PaceTarget, WorkoutType, DayOfWeek, PlanStatus } from '@prisma/client';
import { LLMService } from './llm.service';
import { UserService } from './user.service'; // Might need user data
import { z } from 'zod';

const prisma = new PrismaClient();
const llmService = new LLMService();
const userService = new UserService();

// Get the LLM plan response schema type to reuse
// Define the schema here since we can't import it from LLMService directly
const paceTargetSchema = z.object({
    minSecondsPerKm: z.number().positive().nullable(),
    maxSecondsPerKm: z.number().positive().nullable(),
}).nullable();

const dailyWorkoutSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
    dayOfWeek: z.string(), 
    workoutType: z.string(), 
    description: z.string(),
    purpose: z.string(),
    distanceMeters: z.number().positive().int().nullable(),
    durationSeconds: z.number().positive().int().nullable(),
    paceTarget: paceTargetSchema,
});

const planWeekSchema = z.object({
    weekNumber: z.number().positive().int(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    phase: z.string().nullable(),
    totalDistanceMeters: z.number().int(),
    dailyWorkouts: z.array(dailyWorkoutSchema).min(1), 
});

const planSummarySchema = z.object({
    durationWeeks: z.number().positive().int(),
    totalDistanceMeters: z.number().int(),
    avgWeeklyDistanceMeters: z.number().int(),
});

const llmPlanResponseSchema = z.object({
    planSummary: planSummarySchema,
    weeks: z.array(planWeekSchema).min(1),
});

// Import the interfaces from LLM service, or redefine them here
// For simplicity, we'll redefine the core parts we need
interface Goal {
    type: 'Race' | 'NonRace';
    raceName?: string;
    distanceMeters?: number;
    raceDate?: string;
    goalTimeSeconds?: number;
    previousPbSeconds?: number;
    objective?: string;
}

interface PlanPreferences {
    runningDaysPerWeek: number;
    preferredLongRunDay?: string;
    targetWeeklyDistanceMeters?: number;
    qualityWorkoutsPerWeek: number;
    coachingStyle?: string;
}

// Define input structure for plan creation request
interface CreatePlanInput {
    userId: string;
    goal: Goal;
    preferences: PlanPreferences;
}

// For the Ask Vici functionality
interface AskViciInput {
    userId: string;
    planId: string;
    query: string;
}

export class TrainingService {

    constructor() {}

    /**
     * Creates a new training plan preview for a user.
     * Gathers necessary data, calls LLMService, saves preview to DB.
     * @param {CreatePlanInput} input - The request data for creating the plan.
     * @returns {Promise<TrainingPlan>} The created TrainingPlan object (status: Preview).
     */
    async createTrainingPlanPreview(input: CreatePlanInput): Promise<TrainingPlan> {
        if (!input.userId || !input.goal || !input.preferences) {
            throw new Error('Missing required input data for plan creation.');
        }
        
        if (!llmService.isAvailable()) {
             throw new Error('LLM Service is not available, cannot generate plan.');
        }

        const userId = input.userId;
        console.log(`Starting training plan preview generation for user ${userId}`);

        // 1. Gather required data for the LLM prompt
        // Fetch User, RunnerProfile, recent Activity Summary
        const userProfile = await prisma.user.findUnique({ 
            where: { id: userId },
            include: { runnerProfile: true }
        });
        
        if (!userProfile) {
            throw new Error(`User not found: ${userId}`);
        }
        
        // --- Enhanced Activity Summary Logic --- 
        console.log(`Fetching activity history for enhanced summary for user ${userId}`);
        const WEEKS_FOR_SUMMARY = 16;
        const WEEKS_FOR_KEY_RUNS = 6;
        const NUM_KEY_RUNS = 7; // Max number of key runs to include
        
        const historyStartDate = new Date();
        historyStartDate.setDate(historyStartDate.getDate() - WEEKS_FOR_SUMMARY * 7);

        const allRecentActivities = await prisma.activity.findMany({
            where: {
                userId: userId,
                startTime: { gte: historyStartDate },
                // Assuming source='Strava' and type='Run' filters were applied during import
            },
            orderBy: { startTime: 'desc' }, // Get newest first for easier processing
        });

        // --- Calculate Weekly Summaries (Last WEEKS_FOR_SUMMARY weeks) --- 
        const weeklySummaries: { [weekStart: string]: { startDate: string, totalDistance: number, runCount: number } } = {};
        const getWeekStartDate = (d: Date): Date => { // Monday as start of week
            const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
            const day = date.getUTCDay() || 7; 
            if (day !== 1) date.setUTCDate(date.getUTCDate() - day + 1);
            date.setUTCHours(0, 0, 0, 0); // Normalize time
            return date;
        };

        allRecentActivities.forEach(act => {
            const weekStart = getWeekStartDate(act.startTime);
            const weekStartString = weekStart.toISOString().split('T')[0];

            if (!weeklySummaries[weekStartString]) {
                weeklySummaries[weekStartString] = {
                    startDate: weekStartString,
                    totalDistance: 0,
                    runCount: 0,
                };
            }
            weeklySummaries[weekStartString].totalDistance += act.distanceMeters || 0;
            weeklySummaries[weekStartString].runCount += 1;
        });
        
        // Convert summaries to sorted array
        const sortedWeeklySummaries = Object.values(weeklySummaries)
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
            .map((summary, index) => ({
                // weekIdentifier: `Week ${index + 1} starting ${summary.startDate}`, // More descriptive?
                startDate: summary.startDate,
                totalDistanceMeters: Math.round(summary.totalDistance),
                numberOfRuns: summary.runCount,
            }));

        // --- Identify Key Recent Workouts (Longest run per week for last WEEKS_FOR_KEY_RUNS weeks) --- 
        const keyWorkouts: any[] = [];
        const processedWeeks = new Set<string>();
        const keyRunsStartDate = new Date();
        keyRunsStartDate.setDate(keyRunsStartDate.getDate() - WEEKS_FOR_KEY_RUNS * 7);
        
        // Iterate through activities (already sorted newest first) from the relevant period
        const activitiesForKeyRuns = allRecentActivities.filter(a => a.startTime >= keyRunsStartDate);
        
        let longestRunPerWeek: { [weekStart: string]: any } = {};
        activitiesForKeyRuns.forEach(act => {
            const weekStartString = getWeekStartDate(act.startTime).toISOString().split('T')[0];
            if (!longestRunPerWeek[weekStartString] || (act.distanceMeters || 0) > (longestRunPerWeek[weekStartString].distanceMeters || 0)) {
                 longestRunPerWeek[weekStartString] = act; 
            }
        });
        
        // Get the actual key runs, sorted by date descending (newest first)
        const recentKeyRuns = Object.values(longestRunPerWeek)
                                    .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
                                    .slice(0, NUM_KEY_RUNS) // Limit the number
                                    .map(act => ({
                                        date: act.startTime.toISOString().split('T')[0],
                                        type: 'LongRun', // Label it, could be workout later
                                        distanceMeters: act.distanceMeters || 0,
                                        movingTimeSeconds: act.movingTimeSeconds || 0,
                                        averagePaceSecondsPerKm: act.averagePaceSecondsPerKm || null
                                    }));

        // --- End Enhanced Activity Summary Logic ---
        
        // Fix RunnerProfile type issues
        interface ExtendedRunnerProfile extends RunnerProfile {
            personalBests?: Array<{
                distanceMeters: number;
                timeSeconds: number;
                dateAchieved?: string;
            }>;
        }

        // Create properly typed LLM input data
        const llmInputData = {
            profile: {
                experienceLevel: userProfile.runnerProfile?.experienceLevel,
                fitnessLevel: userProfile.runnerProfile?.fitnessLevel, 
                personalBests: (userProfile.runnerProfile as ExtendedRunnerProfile)?.personalBests
                    ? JSON.parse(JSON.stringify((userProfile.runnerProfile as ExtendedRunnerProfile).personalBests)) 
                    : undefined,
            },
            goal: input.goal, 
            preferences: input.preferences,
            historicalWeeklySummaries: sortedWeeklySummaries,
            recentKeyWorkouts: recentKeyRuns,
        };

        // 2. Call LLMService to generate the plan structure
        console.log(`Calling LLM to generate plan structure for user ${userId}`);
        // Use the llmPlanResponseSchema defined above
        const generatedPlanStructure = await llmService.generateTrainingPlan(llmInputData);

        // --- Removed basic validation here, as Zod validation happens in LLMService ---
        
        const planSummary = generatedPlanStructure.planSummary;

        // 3. Map and Save the generated plan as a "Preview" in the database
        console.log(`Mapping LLM response and saving generated plan preview to DB for user ${userId}`);
        try {
            // Helper function to safely map string to enum (case-insensitive)
            const mapToEnum = <T extends object>(enumObj: T, value: string | null | undefined): T[keyof T] | undefined => {
                if (!value) return undefined;
                const upperValue = value.toUpperCase();
                for (const key in enumObj) {
                    if (enumObj[key as keyof T]?.toString().toUpperCase() === upperValue) {
                        return enumObj[key as keyof T];
                    }
                }
                console.warn(`Could not map value "${value}" to enum ${Object.keys(enumObj).join('|')}. Using default or undefined.`);
                return undefined; // Or return a default enum value if appropriate
            };
            
            const savedPlan = await prisma.trainingPlan.create({
                data: {
                    userId: userId,
                    status: PlanStatus.Preview, // Use Prisma enum
                    // Use JSON.stringify to store the goal as a JSONB field in the database
                    // This assumes the TrainingPlan model has a field called 'goalData' of type JSONB or similar
                    goalData: input.goal ? JSON.stringify(input.goal) : undefined,
                    // or store individual fields if your Prisma schema uses them
                    goalType: input.goal.type,
                    goalRaceDistance: input.goal.distanceMeters,
                    goalRaceDate: input.goal.raceDate ? new Date(input.goal.raceDate) : undefined,
                    
                    // --- Nested Prisma Create with Detailed Mapping --- 
                    // PlanSummary: planSummary ? { create: planSummary } : undefined, // Add if model exists
                    
                    PlanWeek: { 
                        create: generatedPlanStructure.weeks.map((week) => ({
                            weekNumber: week.weekNumber,
                            startDate: new Date(week.startDate + 'T00:00:00Z'), // Assume UTC start of day
                            endDate: new Date(week.endDate + 'T23:59:59Z'),     // Assume UTC end of day
                            phase: week.phase || null,
                            totalDistanceMeters: Math.round(week.totalDistanceMeters || 0),
                            Workout: { 
                                create: week.dailyWorkouts.map((workout) => ({
                                    userId: userId, 
                                    date: new Date(workout.date + 'T12:00:00Z'), // Assume UTC midday for workout time
                                    dayOfWeek: mapToEnum(DayOfWeek, workout.dayOfWeek), // Map to enum
                                    workoutType: mapToEnum(WorkoutType, workout.workoutType) || WorkoutType.Run, // Map or default
                                    description: workout.description || null,
                                    purpose: workout.purpose || null,
                                    distanceMeters: workout.distanceMeters ? Math.round(workout.distanceMeters) : null,
                                    durationSeconds: workout.durationSeconds ? Math.round(workout.durationSeconds) : null,
                                    status: 'Upcoming', 
                                    // Create PaceTarget if data exists and is valid
                                    PaceTarget: workout.paceTarget && (workout.paceTarget.minSecondsPerKm || workout.paceTarget.maxSecondsPerKm) ? { 
                                        create: { 
                                            minSecondsPerKm: workout.paceTarget.minSecondsPerKm ? Math.round(workout.paceTarget.minSecondsPerKm) : null,
                                            maxSecondsPerKm: workout.paceTarget.maxSecondsPerKm ? Math.round(workout.paceTarget.maxSecondsPerKm) : null,
                                        }
                                    } : undefined,
                                    // Map other fields like heartRateZoneTarget, etc. here if needed
                                }))
                            }
                        }))
                    }
                },
                // Optionally include generated relations in the result
                include: { PlanWeek: { include: { Workout: { include: { PaceTarget: true } } } } }
            });

            console.log(`Successfully created training plan preview ${savedPlan.id} for user ${userId}`);
            return savedPlan;
        } catch (error) {
            console.error(`Error saving generated training plan preview for user ${userId}:`, error);
            // Log the structure that failed to save for debugging
            console.error("LLM structure that failed DB save:", JSON.stringify(generatedPlanStructure, null, 2));
            throw new Error('Failed to save generated training plan to database.');
        }
    }

    /**
     * Approves a training plan preview, changing its status to Active.
     * @param {string} planId The ID of the plan to approve.
     * @param {string} userId The ID of the user requesting approval (for verification).
     * @returns {Promise<TrainingPlan>} The updated TrainingPlan object with status Active.
     * @throws {Error} If plan not found, not owned by user, or not in Preview status.
     */
    async approveTrainingPlan(planId: string, userId: string): Promise<TrainingPlan> {
        if (!planId || !userId) {
            throw new Error('Plan ID and User ID are required to approve a plan.');
        }

        console.log(`Attempting to approve training plan ${planId} for user ${userId}`);

        // 1. Find the plan and verify ownership and status
        const planToApprove = await prisma.trainingPlan.findUnique({
            where: { id: planId },
        });

        if (!planToApprove) {
            console.warn(`Approve failed: Plan ${planId} not found.`);
            throw new Error('Training plan not found.');
        }

        if (planToApprove.userId !== userId) {
            console.warn(`Approve failed: User ${userId} does not own plan ${planId}.`);
            // Security: Throw a generic "not found" or specific "forbidden" error
            throw new Error('Training plan not found or access denied.'); 
        }

        if (planToApprove.status !== 'Preview') {
            console.warn(`Approve failed: Plan ${planId} is not in Preview status (current: ${planToApprove.status}).`);
            throw new Error(`Training plan cannot be approved, status is: ${planToApprove.status}`);
        }
        
        // TODO: Consider cancelling any other ACTIVE plans for the user here?
        // Or handle this logic in the frontend/client side.

        // 2. Update the plan status to Active
        try {
            const approvedPlan = await prisma.trainingPlan.update({
                where: { id: planId },
                data: {
                    status: 'Active', // Set status to Active
                    // Optionally set startDate here if not set during generation?
                    // startDate: planToApprove.startDate || new Date(), 
                },
            });
            console.log(`Successfully approved training plan ${planId} for user ${userId}`);
            return approvedPlan;
        } catch (error) {
            console.error(`Error updating plan ${planId} status to Active:`, error);
            throw new Error('Failed to approve training plan.');
        }
    }

    /**
     * Handles an "Ask Vici" request by gathering context and calling the LLM service.
     * @param {AskViciInput} input - Contains userId, planId, and the user's query.
     * @returns {Promise<any>} The response from the LLM service.
     * @throws {Error} If plan/user not found or LLM fails.
     */
    async handleAskViciRequest(input: AskViciInput): Promise<any> {
        const { userId, planId, query } = input;

        if (!llmService.isAvailable()) {
            throw new Error('LLM Service is not available.');
        }
        
        console.log(`Handling Ask Vici request for user ${userId}, plan ${planId}: "${query}"`);

        // 1. Fetch necessary context: Current plan details, user profile, current/upcoming week
        const plan = await prisma.trainingPlan.findUnique({
            where: { id: planId },
            // Include weeks and workouts to provide context
            include: { 
                PlanWeek: { 
                    include: { Workout: true },
                    orderBy: { weekNumber: 'asc' } // Order weeks chronologically
                } 
            }
        });

        if (!plan || plan.userId !== userId) {
            throw new Error('Training plan not found or user not authorized.');
        }
        
        // Find current/upcoming week data for context
        let currentWeekData = null;
        const today = new Date();
        today.setUTCHours(0,0,0,0); // Normalize time for comparison
        if (plan.PlanWeek && plan.PlanWeek.length > 0) {
             // Find the first week where the endDate is today or later
             const currentOrNextWeek = plan.PlanWeek.find(week => new Date(week.endDate) >= today);
             if(currentOrNextWeek) {
                currentWeekData = {
                    weekNumber: currentOrNextWeek.weekNumber,
                    startDate: currentOrNextWeek.startDate.toISOString().split('T')[0],
                    endDate: currentOrNextWeek.endDate.toISOString().split('T')[0],
                    phase: currentOrNextWeek.phase,
                    workouts: currentOrNextWeek.Workout.map(wo => ({ // Simplify workouts for prompt
                        date: wo.date.toISOString().split('T')[0],
                        workoutType: wo.workoutType,
                        description: wo.description,
                        distanceMeters: wo.distanceMeters,
                        durationSeconds: wo.durationSeconds,
                        status: wo.status
                    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Sort workouts by date
                };
             }
        }
        
        // Fetch user profile data if needed for the prompt
        const userProfile = await prisma.user.findUnique({ 
            where: { id: userId },
            include: { runnerProfile: true }
        });
        // Omit sensitive data like passwordHash if fetching full User

        // 2. Prepare data for LLMService
        const llmInputData = {
            query: query,
            context: {
                plan: { 
                    id: plan.id,
                    status: plan.status,
                    goal: plan.goal, 
                    currentWeekData: currentWeekData // Pass the fetched week data
                },
                profile: {
                     experienceLevel: userProfile?.runnerProfile?.experienceLevel,
                     fitnessLevel: userProfile?.runnerProfile?.fitnessLevel, 
                }
            }
        };
        
        // 3. Call LLMService
        console.log(`Calling LLM for Ask Vici request for user ${userId}`);
        const llmResponse = await llmService.handleAskVici(llmInputData);

        // 4. Process/Return LLM Response
        // For MVP, we might just return the raw response object from the LLM service.
        // Future: Could involve parsing structured responses, saving proposed adjustments,
        // updating conversation history, etc.
        console.log(`Received Ask Vici response from LLM for user ${userId}`);
        return llmResponse; 
    }

    // Other training-related methods...
} 