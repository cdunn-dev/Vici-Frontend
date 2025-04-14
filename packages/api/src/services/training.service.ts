// Training Service: Handles business logic related to training plans and workouts
import { PrismaClient, User, RunnerProfile, TrainingPlan } from '@prisma/client';
import { LLMService } from './llm.service';
import { UserService } from './user.service'; // Might need user data

const prisma = new PrismaClient();
const llmService = new LLMService();
const userService = new UserService();

// Define input structure for plan creation request (adjust as needed based on API input)
interface CreatePlanInput {
    userId: string;
    goal: any; // Define Goal structure (e.g., type, distance, time, objective)
    preferences: any; // Define Preferences structure (e.g., days/week, long run day)
    // Potentially other inputs like start date?
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
        
        const llmInputData = {
            profile: {
                experienceLevel: userProfile.runnerProfile?.experienceLevel,
                fitnessLevel: userProfile.runnerProfile?.fitnessLevel, 
            },
            goal: input.goal, 
            preferences: input.preferences,
            // Provide both summaries and key runs
            historicalWeeklySummaries: sortedWeeklySummaries, // Full history summaries
            recentKeyWorkouts: recentKeyRuns, // Details of recent long/key runs
        };

        // 2. Call LLMService to generate the plan structure
        console.log(`Calling LLM to generate plan structure for user ${userId}`);
        const generatedPlanStructure = await llmService.generateTrainingPlan(llmInputData);

        // Basic validation (more robust validation like Zod is recommended)
        if (!generatedPlanStructure || !generatedPlanStructure.weeks || !Array.isArray(generatedPlanStructure.weeks)) {
            throw new Error('LLM failed to return a valid plan structure with a weeks array.');
        }
        
        const planSummary = generatedPlanStructure.planSummary; // Extract summary if provided by LLM

        // 3. Save the generated plan as a "Preview" in the database
        console.log(`Mapping LLM response and saving generated plan preview to DB for user ${userId}`);
        try {
            const savedPlan = await prisma.trainingPlan.create({
                data: {
                    userId: userId,
                    status: 'Preview', // Save as Preview first
                    goal: input.goal, // Store the original goal request as JSON
                    // Store original preferences if needed, or derive from plan
                    // preferences: input.preferences, 
                    
                    // --- Map LLM Output to Nested Prisma Create --- 
                    // Add PlanSummary if available and schema supports it
                    // PlanSummary: planSummary ? { create: planSummary } : undefined,
                    
                    PlanWeek: { // Use the correct relation field name from schema.prisma
                        create: generatedPlanStructure.weeks.map((week: any) => ({
                            weekNumber: week.weekNumber,
                            startDate: new Date(week.startDate), // Ensure valid Date object
                            endDate: new Date(week.endDate),     // Ensure valid Date object
                            phase: week.phase || null,
                            totalDistanceMeters: Math.round(week.totalDistanceMeters || 0),
                            // completedDistanceMeters defaults to 0
                            Workout: { // Use the correct relation field name
                                create: week.dailyWorkouts.map((workout: any) => ({
                                    userId: userId, // Important: Link workout to user too
                                    date: new Date(workout.date), // Ensure valid Date object
                                    dayOfWeek: workout.dayOfWeek || null, // Ensure matches DayOfWeek enum if used
                                    // Ensure workoutType matches WorkoutType enum if used
                                    workoutType: workout.workoutType || 'Run', 
                                    description: workout.description || null,
                                    purpose: workout.purpose || null,
                                    distanceMeters: workout.distanceMeters ? Math.round(workout.distanceMeters) : null,
                                    durationSeconds: workout.durationSeconds ? Math.round(workout.durationSeconds) : null,
                                    status: 'Upcoming', // Default status
                                    // TODO: Map paceTarget correctly if provided and schema supports it
                                    // PaceTarget: workout.paceTarget ? { create: workout.paceTarget } : undefined,
                                    // Map other fields like heartRateZoneTarget, perceivedEffortTarget if needed
                                }))
                            }
                        }))
                    }
                },
                // Include nested relations in the return object if needed for the response
                // include: { PlanWeek: { include: { Workout: true } } } 
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
     * @param {object} input - Contains userId, planId, and the user's query.
     * @returns {Promise<any>} The response from the LLM service.
     * @throws {Error} If plan/user not found or LLM fails.
     */
    async handleAskViciRequest(input: { userId: string; planId: string; query: string }): Promise<any> {
        const { userId, planId, query } = input;

        if (!llmService.isAvailable()) {
            throw new Error('LLM Service is not available.');
        }
        
        console.log(`Handling Ask Vici request for user ${userId}, plan ${planId}: "${query}"`);

        // 1. Fetch necessary context: Current plan details, user profile
        const plan = await prisma.trainingPlan.findUnique({
            where: { id: planId },
            // Include relevant parts of the plan for context
            // include: { PlanWeek: { include: { Workout: true } } }
            // TODO: Fetch only necessary plan context to keep prompt manageable
        });

        if (!plan) {
            throw new Error('Training plan not found.');
        }
        if (plan.userId !== userId) {
            throw new Error('User not authorized for this training plan.');
        }
        if (plan.status !== 'Active') {
             // Maybe allow asking about Preview plans too?
             // throw new Error('Cannot ask Vici about a non-active plan.');
             console.warn(`User ${userId} asking Vici about a non-active plan (${plan.status})`);
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
                    // Selectively include relevant plan data
                    id: plan.id,
                    status: plan.status,
                    goal: plan.goal, 
                    // TODO: Include summary of current/upcoming week(s)?
                    // weeks: plan.PlanWeek?.slice(-2) // Example: Last 2 weeks?
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