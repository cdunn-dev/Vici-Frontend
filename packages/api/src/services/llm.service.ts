// LLM Service: Handles interactions with the Language Model provider (Google Gemini)
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

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
     * TODO: Define input structure and implement prompt engineering.
     * @param {object} planRequestData - Data containing user profile, goal, preferences, history.
     * @returns {Promise<any>} The generated training plan structure (e.g., JSON).
     */
    async generateTrainingPlan(planRequestData: any): Promise<any> {
        if (!this.model) {
            throw new Error("LLM Service not initialized. Check API Key.");
        }

        console.log("Generating training plan with LLM...", planRequestData); // Log input for debugging

        // --- TODO: Prompt Engineering --- 
        const prompt = this.buildTrainingPlanPrompt(planRequestData);
        // --- End Prompt Engineering ---

        try {
            // Example call - adjust generationConfig and safetySettings as needed
            const result = await this.model.generateContent(prompt);
            const response = result.response;
            const text = response.text();
            console.log("LLM Response Text:", text); // Log raw response

            // --- TODO: Response Parsing --- 
            // Parse the text response (expecting JSON or structured format)
            const planJson = this.parsePlanFromResponse(text);
            // --- End Response Parsing ---

            return planJson;

        } catch (error) {
            console.error("Error generating training plan from LLM:", error);
            throw new Error("Failed to generate training plan using LLM.");
        }
    }

    /**
     * Handles "Ask Vici" requests for plan adjustments or Q&A.
     * TODO: Define input structure and implement prompt engineering.
     * @param {object} askRequestData - Data containing user query, current plan context, profile.
     * @returns {Promise<any>} The response (text or structured adjustment proposal).
     */
    async handleAskVici(askRequestData: any): Promise<any> {
        if (!this.model) {
            throw new Error("LLM Service not initialized. Check API Key.");
        }
        
        console.log("Handling Ask Vici request with LLM...", askRequestData);

        const prompt = this.buildAskViciPrompt(askRequestData);
        
         try {
            const result = await this.model.generateContent(prompt);
            const response = result.response;
            const text = response.text();
            console.log("Ask Vici LLM Response Text:", text);
            
            // For MVP, just return the text response. Parsing structured adjustments is complex.
            const askViciResponse = this.parseAskViciResponse(text);
            return askViciResponse;

        } catch (error) {
            console.error("Error handling Ask Vici request from LLM:", error);
            throw new Error("Failed to handle Ask Vici request using LLM.");
        }
    }

    // --- Private Helper Methods for Prompt Building & Parsing --- 

    private buildTrainingPlanPrompt(data: any): string {
        const { profile, goal, preferences, historicalWeeklySummaries, recentKeyWorkouts } = data;
        
        let prompt = `You are an expert running coach named Vici, tasked with creating a personalized training plan.`;\
        prompt += `\nGenerate a structured training plan based on the following user details and requirements.`;\
        
        // User Profile Section
        prompt += `\n\n## User Profile:\n`;\
        prompt += `- Experience Level: ${profile?.experienceLevel || 'Not specified'}\\n`;\
        // TODO: Define how fitness level is represented (e.g., score, recent paces)\
        prompt += `- Current Fitness Level Indicator: ${profile?.fitnessLevel || 'Not specified'}\\n`; \
        // Include PBs if available and relevant for goal setting
        // prompt += `- Personal Bests: ${JSON.stringify(profile?.personalBests || {}, null, 2)}\\n`; \
        
        // Goal Section
        prompt += `\\n## Training Goal:\\n`;\
        if (goal?.type === 'Race') {\
            prompt += `- Type: Race\\n`;\
            prompt += `- Race Distance (meters): ${goal.distanceMeters || 'Not specified'}\\n`;\
            prompt += `- Race Date: ${goal.raceDate || 'Not specified'}\\n`;\
            prompt += `- Goal Time (seconds): ${goal.goalTimeSeconds || 'Not specified'}\\n`;\
            prompt += `- Previous PB (seconds): ${goal.previousPbSeconds || 'None provided'}\\n`;\
        } else {\
            prompt += `- Type: Non-Race\\n`;\
            prompt += `- Objective: ${goal.objective || 'General Fitness'}\\n`;\
        }\
        
        // Preferences Section
        prompt += `\\n## User Preferences:\\n`;\
        prompt += `- Running Days Per Week: ${preferences?.runningDaysPerWeek || 'Not specified'}\\n`;\
        prompt += `- Preferred Long Run Day: ${preferences?.preferredLongRunDay || 'Not specified'}\\n`;\
        prompt += `- Target Weekly Distance (meters): ${preferences?.targetWeeklyDistanceMeters || 'Flexible'}\\n`;\
        prompt += `- Quality Workouts Per Week: ${preferences?.qualityWorkoutsPerWeek || 1}\\n`;\
        prompt += `- Coaching Style Preference: ${preferences?.coachingStyle || 'Balanced'}\\n`;\

        // --- Updated Activity History Section --- 
        prompt += `\\n## Historical Weekly Summaries (Up to 16 weeks, oldest first):\n`;\
        if (historicalWeeklySummaries && historicalWeeklySummaries.length > 0) {\
            historicalWeeklySummaries.forEach((week: any) => { \
                prompt += `- Week starting ${week.startDate}: ${week.numberOfRuns} runs, ${Math.round(week.totalDistanceMeters/1000)}km total\\n`;\
            });\
        } else {\
            prompt += `- No weekly summary data available.\\n`;\
        }\

        prompt += `\\n## Key Recent Workouts (Approx. last 6 weeks, newest first):\n`;\
        if (recentKeyWorkouts && recentKeyWorkouts.length > 0) {\n            recentKeyWorkouts.forEach((act: any) => { \
            const paceMin = Math.floor(act.averagePaceSecondsPerKm / 60);\
            const paceSec = (act.averagePaceSecondsPerKm % 60).toString().padStart(2, '0');\
            prompt += `- Date: ${act.date}, Type: ${act.type}, Distance: ${Math.round(act.distanceMeters/1000)}km, Duration: ${Math.round(act.movingTimeSeconds/60)}min, Avg Pace: ${act.averagePaceSecondsPerKm ? `${paceMin}:${paceSec} min/km` : 'N/A'}\\n`;\
        });\
    } else {\n            prompt += `- No key recent workouts identified.\\n`;\
    }\n        // --- End Updated Activity History Section --- \n\n        // Core Instructions & Constraints\n        prompt += `\\n## Plan Generation Requirements:\n`;\n        prompt += `- Determine an appropriate plan duration in weeks based on the goal and user profile.\\n`;\n        prompt += `- Structure the plan into logical phases (e.g., Base, Build, Peak, Taper) if applicable.\\n`;\n        prompt += `- Ensure gradual weekly volume progression (generally <= 10% increase, with occasional down/recovery weeks).\\n`;\n        prompt += `- Schedule workouts across the preferred number of running days, including at least one rest day per week.\\n`;\n        prompt += `- Include a weekly long run, preferably on the user's preferred day.\\n`;\n        prompt += `- Include the specified number of quality workouts (e.g., Tempo, Intervals) appropriate for the goal and user level.\\n`;\n        prompt += `- Define each daily workout clearly with type, target distance OR duration, and intensity guidance (e.g., pace range, perceived effort, heart rate zone - be specific based on user data if possible).\\n`;\n        prompt += `- Provide a concise, descriptive purpose for each workout (e.g., \"Build aerobic capacity\", \"Improve lactate threshold\").\\n`;\n        prompt += `- Prioritize user safety and injury prevention.\\n`;\n

        // Output Format Constraint
        prompt += `\\n## Output Format:\n`;\
        prompt += `Respond ONLY with a valid JSON object. Do NOT include any introductory text, explanations, or markdown formatting like \`\`\`json. The JSON object must represent the training plan and strictly follow this structure:\n`;\
        prompt += `{\n`;\
        prompt += `  \"planSummary\": {\n`;\
        prompt += `    \"durationWeeks\": <number>,\n`;\
        prompt += `    \"totalDistanceMeters\": <number>,\n`;\
        prompt += `    \"avgWeeklyDistanceMeters\": <number>\n`;\
        prompt += `  },\n`;\
        prompt += `  \"weeks\": [\n`;\
        prompt += `    {\n`;\
        prompt += `      \"weekNumber\": <number>,\n`;\
        prompt += `      \"startDate\": \"YYYY-MM-DD\",\n`;\
        prompt += `      \"endDate\": \"YYYY-MM-DD\",\n`;\
        prompt += `      \"phase\": <string | null>,\n`;\
        prompt += `      \"totalDistanceMeters\": <number>,\n`;\
        prompt += `      \"dailyWorkouts\": [\n`;\
        prompt += `        {\n`;\
        prompt += `          \"date\": \"YYYY-MM-DD\",\n`;\
        prompt += `          \"dayOfWeek\": \"<e.g., Monday>\",\n`;\
        prompt += `          \"workoutType\": \"<e.g., EasyRun, Tempo, Intervals, LongRun, Rest>\",\n`;\
        prompt += `          \"description\": <string>,\n`;\
        prompt += `          \"purpose\": <string>,\n`;\
        prompt += `          \"distanceMeters\": <number | null>,\n`;\
        prompt += `          \"durationSeconds\": <number | null>,\n`;\
        prompt += `          \"paceTarget\": { \"minSecondsPerKm\": <number | null>, \"maxSecondsPerKm\": <number | null> } | null\n`;\
        // Add other optional fields like heartRateZoneTarget, perceivedEffortTarget, components if needed
        prompt += `        }\n`;\
        prompt += `      ]\n`;\
        prompt += `    }\n`;\
        prompt += `  ]\n`;\
        prompt += `}\n`;\

        console.log("Generated LLM Prompt (using enhanced summary):\n", prompt); 
        return prompt;
    }

    private parsePlanFromResponse(responseText: string): any {
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
            const parsed = JSON.parse(potentialJson);
            
            // Basic validation: Check if it has the top-level keys we expect
            if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.weeks)) {
                 console.error("Parsed JSON missing expected structure (e.g., 'weeks' array).", parsed);
                throw new Error("LLM response structure invalid after parsing.");
            }
            
            console.log("Successfully parsed LLM response as JSON.");
            return parsed;

        } catch (error: any) {
            console.error("Failed to parse LLM response as JSON:", error.message);
            // Log a snippet of the response for debugging without logging potentially huge strings
            const snippet = potentialJson.substring(0, 500) + (potentialJson.length > 500 ? "..." : "");
            console.error("Raw LLM response snippet for parsing error:", snippet); 
            throw new Error("LLM response was not valid JSON or had incorrect structure.");
        }
    }
    
     private buildAskViciPrompt(data: any): string {
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
        // TODO: Add more relevant plan context (e.g., current week number, upcoming workouts)
        // prompt += `\n- Current Week Summary: ...`;

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
    
    private parseAskViciResponse(responseText: string): any {
        // For MVP, we assume the response is primarily textual.
        // Future: Could parse for structured adjustment proposals (e.g., JSON diff).
        return { 
            answerText: responseText.trim() // Return the cleaned text response
        }; 
    }
} 