// LLM Service: Handles interactions with the Language Model provider (Google Gemini)
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { z } from "zod"; // Import Zod

const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

if (!API_KEY) {
    console.warn("GOOGLE_GEMINI_API_KEY environment variable not set. LLM Service will not function.");
}

// Choose the Gemini model to use - start with a balanced one
// See https://ai.google.dev/models/gemini
const GEMINI_MODEL_NAME = "gemini-1.0-pro"; // Or "gemini-1.5-pro-latest"

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: GEMINI_MODEL_NAME });
    console.log(`LLM Service initialized with model: ${GEMINI_MODEL_NAME}`);
} else {
    console.error("LLM Service could not initialize due to missing API key.");
}

// --- Define interfaces for input/output structures ---

// For training plan generation input
interface TrainingPlanRequestData {
    profile: {
        experienceLevel?: string;
        fitnessLevel?: string;
        personalBests?: Array<{
            distanceMeters: number;
            timeSeconds: number;
            dateAchieved?: string;
        }>;
    };
    goal: {
        type: 'Race' | 'NonRace';
        distanceMeters?: number;
        raceDate?: string;
        goalTimeSeconds?: number;
        previousPbSeconds?: number;
        objective?: string;
    };
    preferences: {
        runningDaysPerWeek?: number;
        preferredLongRunDay?: string;
        targetWeeklyDistanceMeters?: number;
        qualityWorkoutsPerWeek?: number;
        coachingStyle?: string;
    };
    historicalWeeklySummaries?: Array<{
        startDate: string;
        totalDistanceMeters: number;
        numberOfRuns: number;
    }>;
    recentKeyWorkouts?: Array<{
        date: string;
        type: string;
        distanceMeters: number;
        movingTimeSeconds: number;
        averagePaceSecondsPerKm: number | null;
    }>;
}

// For Ask Vici input
interface AskViciRequestData {
    query: string;
    context: {
        plan: {
            id: string;
            status: string;
            goal: any; // Could be more specific based on your schema
            currentWeekData?: {
                weekNumber: number;
                startDate: string;
                endDate: string;
                phase: string | null;
                workouts: Array<{
                    date: string;
                    workoutType: string;
                    description: string | null;
                    distanceMeters: number | null;
                    durationSeconds: number | null;
                    status: string;
                }>;
            };
        };
        profile: {
            experienceLevel?: string;
            fitnessLevel?: string;
        };
    };
}

// For Ask Vici response
interface AskViciResponse {
    answerText: string;
    proposedChanges: any | null; // Could be more specific if you define a standard structure
    hasStructuredChanges: boolean;
    timestamp: string;
}

// --- Zod Schema Definition for LLM Training Plan Output --- 
const paceTargetSchema = z.object({
    minSecondsPerKm: z.number().positive().nullable(),
    maxSecondsPerKm: z.number().positive().nullable(),
}).nullable();

const dailyWorkoutSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
    dayOfWeek: z.string(), // Could use z.enum([...]) if needed
    workoutType: z.string(), // Could use z.enum([...]) based on Prisma enum
    description: z.string(),
    purpose: z.string(),
    distanceMeters: z.number().positive().int().nullable(),
    durationSeconds: z.number().positive().int().nullable(),
    paceTarget: paceTargetSchema,
    // Add other optional fields if included in the prompt output spec
    // heartRateZoneTarget: z.number().int().nullable(),
    // perceivedEffortTarget: z.string().nullable(),
    // components: z.array(z.object({...})).optional()
});

const planWeekSchema = z.object({
    weekNumber: z.number().positive().int(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    phase: z.string().nullable(),
    totalDistanceMeters: z.number().int(),
    dailyWorkouts: z.array(dailyWorkoutSchema).min(1), // Must have at least one workout
});

const planSummarySchema = z.object({
    durationWeeks: z.number().positive().int(),
    totalDistanceMeters: z.number().int(),
    avgWeeklyDistanceMeters: z.number().int(),
});

const llmPlanResponseSchema = z.object({
    planSummary: planSummarySchema,
    weeks: z.array(planWeekSchema).min(1), // Must have at least one week
});
// --- End Zod Schema Definition --- 

export class LLMService {

    private model: GenerativeModel | null;

    constructor() {
        // Use the globally initialized model
        this.model = model; 
    }

    /**
     * Checks if the LLM service is available (API key is set).
     */
    isAvailable(): boolean {
        return !!this.model;
    }

    /**
     * Generates a training plan based on user profile, goals, and history.
     * @param {TrainingPlanRequestData} planRequestData - Structured data containing user profile, goal, preferences, history.
     * @returns {Promise<z.infer<typeof llmPlanResponseSchema>>} The generated training plan structure.
     */
    async generateTrainingPlan(planRequestData: TrainingPlanRequestData): Promise<z.infer<typeof llmPlanResponseSchema>> {
        if (!this.model) {
            throw new Error("LLM Service not initialized. Check API Key.");
        }

        console.log("Generating training plan with LLM...", planRequestData); // Log input for debugging

        const prompt = this.buildTrainingPlanPrompt(planRequestData);
        
        const MAX_RETRIES = 2;
        let retries = 0;
        let lastError;

        while (retries <= MAX_RETRIES) {
            try {
                const result = await this.model.generateContent(prompt);
                const response = result.response;
                const text = response.text();
                console.log("LLM Response Text:", text); // Log raw response

                // Parse the text response
                const planJson = this.parsePlanFromResponse(text);
                return planJson;
            } catch (error) {
                lastError = error;
                console.warn(`Error in training plan LLM call (attempt ${retries+1}/${MAX_RETRIES+1}):`, error);
                
                // Only retry on network/timeout errors, not on format or prompt errors
                if (error.message?.includes('network') || error.message?.includes('timeout')) {
                    retries++;
                    if (retries <= MAX_RETRIES) {
                        const backoffMs = Math.pow(2, retries) * 1000;
                        console.log(`Retrying in ${backoffMs}ms...`);
                        await new Promise(resolve => setTimeout(resolve, backoffMs));
                        continue;
                    }
                } else {
                    // Don't retry on other errors
                    break;
                }
            }
        }
        
        console.error("Error generating training plan from LLM after retries:", lastError);
        throw new Error("Failed to generate training plan using LLM.");
    }

    /**
     * Handles "Ask Vici" requests for plan adjustments or Q&A.
     * @param {AskViciRequestData} askRequestData - Data containing user query, current plan context, profile.
     * @returns {Promise<AskViciResponse>} The response with text and potentially structured adjustment proposal.
     */
    async handleAskVici(askRequestData: AskViciRequestData): Promise<AskViciResponse> {
        if (!this.model) {
            throw new Error("LLM Service not initialized. Check API key.");
        }
        
        console.log("Handling Ask Vici request with LLM...", askRequestData);

        const prompt = this.buildAskViciPrompt(askRequestData);
        
        const MAX_RETRIES = 2;
        let retries = 0;
        let lastError;

        while (retries <= MAX_RETRIES) {
            try {
                const result = await this.model.generateContent(prompt);
                const response = result.response;
                const text = response.text();
                console.log("Ask Vici LLM Response Text:", text);
                
                // Parse response using our improved parser
                const askViciResponse = this.parseAskViciResponse(text);
                return askViciResponse;
            } catch (error) {
                lastError = error;
                console.warn(`Error in Ask Vici LLM call (attempt ${retries+1}/${MAX_RETRIES+1}):`, error);
                
                // Only retry on network/timeout errors, not on format or prompt errors
                if (error.message?.includes('network') || error.message?.includes('timeout')) {
                    retries++;
                    if (retries <= MAX_RETRIES) {
                        const backoffMs = Math.pow(2, retries) * 1000;
                        console.log(`Retrying in ${backoffMs}ms...`);
                        await new Promise(resolve => setTimeout(resolve, backoffMs));
                        continue;
                    }
                } else {
                    // Don't retry on other errors
                    break;
                }
            }
        }
        
        console.error("Error handling Ask Vici request from LLM after retries:", lastError);
        throw new Error("Failed to handle Ask Vici request using LLM.");
    }

    // --- Private Helper Methods for Prompt Building & Parsing --- 

    private buildTrainingPlanPrompt(data: TrainingPlanRequestData): string {
        const { profile, goal, preferences, historicalWeeklySummaries, recentKeyWorkouts } = data;
        
        // Build prompt piece by piece
        let prompt = `You are an expert running coach named Vici, tasked with creating a personalized training plan.`;
        prompt += `\nGenerate a structured training plan based on the following user details and requirements.`;
        
        // User Profile Section
        prompt += `\n\n## User Profile:\n`;
        prompt += `- Experience Level: ${profile?.experienceLevel || 'Not specified'}\n`;
        prompt += `- Current Fitness Level Indicator: ${profile?.fitnessLevel || 'Not specified'}\n`;
        if (profile?.personalBests && Array.isArray(profile.personalBests) && profile.personalBests.length > 0) {
            prompt += `- Personal Bests:\n`;
            profile.personalBests.forEach((pb: any) => {
                const distanceKm = pb.distanceMeters ? (pb.distanceMeters / 1000).toFixed(1) + "km" : "Unknown distance";
                const timeMin = pb.timeSeconds ? Math.floor(pb.timeSeconds / 60) : null;
                const timeSec = pb.timeSeconds ? (pb.timeSeconds % 60).toString().padStart(2, '0') : null;
                const timeFormatted = timeMin !== null && timeSec !== null ? `${timeMin}:${timeSec}` : "N/A";
                prompt += `  - ${distanceKm}: ${timeFormatted} (Achieved: ${pb.dateAchieved || 'N/A'})\n`;
            });
        }
        
        // Goal Section
        prompt += `\n\n## Training Goal:\n`;
        if (goal?.type === 'Race') {
            prompt += `- Type: Race\n`;
            prompt += `- Race Distance (meters): ${goal.distanceMeters || 'Not specified'}\n`;
            prompt += `- Race Date: ${goal.raceDate || 'Not specified'}\n`;
            prompt += `- Goal Time (seconds): ${goal.goalTimeSeconds || 'Not specified'}\n`;
            prompt += `- Previous PB (seconds): ${goal.previousPbSeconds || 'None provided'}\n`;
        } else {
            prompt += `- Type: Non-Race\n`;
            prompt += `- Objective: ${goal.objective || 'General Fitness'}\n`;
        }
        
        // Preferences Section
        prompt += `\n\n## User Preferences:\n`;
        prompt += `- Running Days Per Week: ${preferences?.runningDaysPerWeek || 'Not specified'}\n`;
        prompt += `- Preferred Long Run Day: ${preferences?.preferredLongRunDay || 'Not specified'}\n`;
        prompt += `- Target Weekly Distance (meters): ${preferences?.targetWeeklyDistanceMeters || 'Flexible'}\n`;
        prompt += `- Quality Workouts Per Week: ${preferences?.qualityWorkoutsPerWeek || 1}\n`;
        prompt += `- Coaching Style Preference: ${preferences?.coachingStyle || 'Balanced'}\n`;
        
        // --- Updated Activity History Section --- 
        prompt += `\n\n## Historical Weekly Summaries (Up to 16 weeks, oldest first):\n`;
        if (historicalWeeklySummaries && historicalWeeklySummaries.length > 0) {
            historicalWeeklySummaries.forEach((week: any) => { 
                prompt += `- Week starting ${week.startDate}: ${week.numberOfRuns} runs, ${Math.round(week.totalDistanceMeters/1000)}km total\n`;
            });
        } else {
            prompt += `- No weekly summary data available.\n`;
        }
        
        prompt += `\n\n## Key Recent Workouts (Approx. last 6 weeks, newest first):\n`;
        if (recentKeyWorkouts && recentKeyWorkouts.length > 0) {
            recentKeyWorkouts.forEach((act: any) => { 
                const paceMin = Math.floor(act.averagePaceSecondsPerKm / 60);
                const paceSec = (act.averagePaceSecondsPerKm % 60).toString().padStart(2, '0');
                prompt += `- Date: ${act.date}, Type: ${act.type}, Distance: ${Math.round(act.distanceMeters/1000)}km, Duration: ${Math.round(act.movingTimeSeconds/60)}min, Avg Pace: ${act.averagePaceSecondsPerKm ? `${paceMin}:${paceSec} min/km` : 'N/A'}\n`;
            });
        } else {
            prompt += `- No key recent workouts identified.\n`;
        }
        // --- End Updated Activity History Section --- 
        
        // Core Instructions & Constraints 
        prompt += `\n\n## Plan Generation Requirements:\n`;
        prompt += `- Determine an appropriate plan duration in weeks based on the goal and user profile.\n`;
        prompt += `- Structure the plan into logical phases (e.g., Base, Build, Peak, Taper) if applicable.\n`;
        prompt += `- Ensure gradual weekly volume progression (generally <= 10% increase, with occasional down/recovery weeks).\n`;
        prompt += `- Schedule workouts across the preferred number of running days, including at least one rest day per week.\n`;
        prompt += `- Include a weekly long run, preferably on the user\'s preferred day.\n`;
        prompt += `- Include the specified number of quality workouts (e.g., Tempo, Intervals) appropriate for the goal and user level.\n`;
        prompt += `- Define each daily workout clearly with type, target distance OR duration, and intensity guidance (e.g., pace range, perceived effort, heart rate zone - be specific based on user data if possible).\n`;
        prompt += `- Provide a concise, descriptive purpose for each workout (e.g., \"Build aerobic capacity\", \"Improve lactate threshold\").\n`;
        prompt += `- Prioritize user safety and injury prevention.\n`;
        
        // Output Format Constraint
        prompt += `\n\n## Output Format:\n`;
        prompt += `Respond ONLY with a valid JSON object. Do NOT include any introductory text, explanations, or markdown formatting like \`\`\`json. The JSON object must represent the training plan and strictly follow this structure:\n`;
        prompt += `{\n`;
        prompt += `  \"planSummary\": {\n`;
        prompt += `    \"durationWeeks\": <number>,\n`;
        prompt += `    \"totalDistanceMeters\": <number>,\n`;
        prompt += `    \"avgWeeklyDistanceMeters\": <number>\n`;
        prompt += `  },\n`;
        prompt += `  \"weeks\": [\n`;
        prompt += `    {\n`;
        prompt += `      \"weekNumber\": <number>,\n`;
        prompt += `      \"startDate\": \"YYYY-MM-DD\",\n`;
        prompt += `      \"endDate\": \"YYYY-MM-DD\",\n`;
        prompt += `      \"phase\": <string | null>,\n`;
        prompt += `      \"totalDistanceMeters\": <number>,\n`;
        prompt += `      \"dailyWorkouts\": [\n`;
        prompt += `        {\n`;
        prompt += `          \"date\": \"YYYY-MM-DD\",\n`;
        prompt += `          \"dayOfWeek\": \"<e.g., Monday>\",\n`;
        prompt += `          \"workoutType\": \"<e.g., EasyRun, Tempo, Intervals, LongRun, Rest>\",\n`;
        prompt += `          \"description\": <string>,\n`;
        prompt += `          \"purpose\": <string>,\n`;
        prompt += `          \"distanceMeters\": <number | null>,\n`;
        prompt += `          \"durationSeconds\": <number | null>,\n`;
        prompt += `          \"paceTarget\": { \"minSecondsPerKm\": <number | null>, \"maxSecondsPerKm\": <number | null> } | null\n`;
        prompt += `        }\n`;
        prompt += `      ]\n`;
        prompt += `    }\n`;
        prompt += `  ]\n`;
        prompt += `}\n`;
        
        console.log("Generated LLM Prompt (with PBs):\n", prompt); 
        return prompt;
    }

    private parsePlanFromResponse(responseText: string): z.infer<typeof llmPlanResponseSchema> {
        if (!responseText) {
            throw new Error("LLM returned an empty response.");
        }

        let potentialJson = responseText.trim();

        // Attempt to remove markdown code fences if present
        const jsonRegex = /```(?:json)?\n?(.*\n?)```/s; // More flexible regex
        const match = potentialJson.match(jsonRegex);
        if (match && match[1]) {
            potentialJson = match[1].trim();
            console.log("Extracted JSON from markdown fence.");
        }

        try {
            const parsedJson = JSON.parse(potentialJson);
            
            // --- Validate JSON against Zod schema --- 
            const validationResult = llmPlanResponseSchema.safeParse(parsedJson);
            if (!validationResult.success) {
                 console.error("LLM response failed Zod validation:", validationResult.error.errors);
                 // Log the structure that failed validation
                 console.error("Invalid LLM response structure:", JSON.stringify(parsedJson, null, 2));
                 throw new Error(`LLM response structure invalid: ${validationResult.error.message}`);
            }
            // --- End Zod Validation --- 
            
            console.log("Successfully parsed and validated LLM response.");
            return validationResult.data; // Return the validated data

        } catch (error: any) {
            console.error("Failed to parse or validate LLM response:", error.message);
            const snippet = potentialJson.substring(0, 500) + (potentialJson.length > 500 ? "..." : "");
            console.error("Raw LLM response snippet for parsing error:", snippet); 
            throw new Error("LLM response was not valid JSON or had incorrect structure.");
        }
    }
    
     private buildAskViciPrompt(data: AskViciRequestData): string {
        const { query, context } = data;
        const { plan, profile } = context;

        let prompt = `You are Vici, an expert running coach AI assistant.`;
        prompt += `\nA user is asking a question or requesting an adjustment regarding their training plan.`;
        prompt += `\nUser Query: "${query}"`;

        // Provide Context
        prompt += `\n\n## User Profile Summary:\n`;
        prompt += `- Experience: ${profile?.experienceLevel || 'N/A'}, Fitness: ${profile?.fitnessLevel || 'N/A'}`;
        
        prompt += `\n\n## Current Plan Context:\n`;
        prompt += `- Plan Goal: ${JSON.stringify(plan?.goal) || 'N/A'}`;
        prompt += `\n- Plan Status: ${plan?.status || 'N/A'}`;

        // --- Add Current/Upcoming Week Context --- 
        // TODO: Fetch actual week/workout data in TrainingService and pass it here
        // This requires the TrainingPlan include relation for PlanWeek/Workout
        const currentWeekContext = plan?.currentWeekData; // Assuming this structure is passed in context
        if (currentWeekContext) {
            prompt += `\n- Current Week (${currentWeekContext.startDate} to ${currentWeekContext.endDate}):`;
            currentWeekContext.workouts?.forEach((wo: any) => {
                 prompt += `\n  - ${wo.date}: ${wo.workoutType} - ${wo.description} (${wo.distanceMeters ? wo.distanceMeters + "m" : wo.durationSeconds + "s"})`;
            });
        }
        // --- End Week Context --- 

        // Instructions
        prompt += `\n\n## Instructions:\n`;
        prompt += `- Analyze the user query in the context of their profile and plan.`;
        prompt += `- If it's a question, provide a clear, concise, and encouraging answer.`;
        prompt += `- If it's a request for adjustment (e.g., swap days, make easier/harder), analyze its feasibility and safety.`;
        prompt += `- For MVP: Respond primarily with text. Explain if an adjustment is feasible and what it might entail, but DO NOT output structured plan changes yet.`;
        prompt += `\n- Keep responses conversational and aligned with a supportive coaching tone.`;
        prompt += `\n- Prioritize safety. Do not suggest unsafe increases in volume or intensity.`;
        prompt += `\n- If the request is unclear or unsafe, explain why and ask for clarification or suggest alternatives.`;
        
        console.log("Generated Ask Vici Prompt:\n", prompt);
        return prompt;
    }
    
    private parseAskViciResponse(responseText: string): AskViciResponse {
        if (!responseText) {
            throw new Error("LLM returned an empty response.");
        }

        let cleanedText = responseText.trim();
        
        // Try to extract structured adjustments if present
        // This looks for JSON blocks in the response that contain adjustment proposals
        const adjustmentRegex = /```(?:json)?\s*({[\s\S]*?})```|({[\s\S]*"adjustments"[\s\S]*})/i;
        let proposedChanges = null;
        
        const match = cleanedText.match(adjustmentRegex);
        if (match && (match[1] || match[2])) {
            const jsonStr = (match[1] || match[2]).trim();
            try {
                proposedChanges = JSON.parse(jsonStr);
                // Remove the JSON block from the text so we return clean text
                cleanedText = cleanedText.replace(adjustmentRegex, '').trim();
                console.log("Successfully extracted structured adjustment proposal from LLM response");
            } catch (e) {
                console.warn("Found potential adjustment JSON in response, but failed to parse:", e);
                // We continue with the text response since we couldn't parse the JSON
            }
        }

        // Handle special cases or clean up text if needed
        // For example, remove any markdown formatting or standardize terminology
        
        // Build the final response object
        return { 
            answerText: cleanedText,
            proposedChanges: proposedChanges, // Will be null if no structured changes detected
            hasStructuredChanges: !!proposedChanges,
            timestamp: new Date().toISOString()
        }; 
    }
} 