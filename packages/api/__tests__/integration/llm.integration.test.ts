import { LLMService } from '../../src/services/llm.service';

// Mock the GenerativeModel's generateContent method
jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => {
      return {
        getGenerativeModel: jest.fn().mockImplementation(() => {
          return {
            generateContent: jest.fn().mockImplementation(async (prompt) => {
              // Return a valid response structure based on the prompt
              if (prompt.includes('Generate a structured training plan')) {
                return {
                  response: {
                    text: () => JSON.stringify(mockTrainingPlan)
                  }
                };
              } else if (prompt.includes('User Query:')) {
                return {
                  response: {
                    text: () => mockAskViciResponse
                  }
                };
              } else {
                return {
                  response: {
                    text: () => "Sorry, I don't understand that request."
                  }
                };
              }
            })
          };
        })
      };
    })
  };
});

// Mock training plan response from LLM
const mockTrainingPlan = {
  planSummary: {
    durationWeeks: 12,
    totalDistanceMeters: 480000,
    avgWeeklyDistanceMeters: 40000
  },
  weeks: [
    {
      weekNumber: 1,
      startDate: "2023-01-01",
      endDate: "2023-01-07",
      phase: "Base",
      totalDistanceMeters: 30000,
      dailyWorkouts: [
        {
          date: "2023-01-01",
          dayOfWeek: "Monday",
          workoutType: "Rest",
          description: "Rest day",
          purpose: "Recovery",
          distanceMeters: null,
          durationSeconds: null,
          paceTarget: null
        },
        {
          date: "2023-01-02",
          dayOfWeek: "Tuesday",
          workoutType: "EasyRun",
          description: "Easy 5k run",
          purpose: "Build aerobic base",
          distanceMeters: 5000,
          durationSeconds: 1800,
          paceTarget: {
            minSecondsPerKm: 330,
            maxSecondsPerKm: 360
          }
        }
      ]
    }
  ]
};

// Mock Ask Vici response
const mockAskViciResponse = `I'd be happy to adjust your plan for next week due to your travel. 
Instead of the scheduled 10km long run on Saturday, let's move it to Thursday when you'll be home, 
and we'll decrease Wednesday's workout to a shorter recovery run.`;

describe('LLM Service Integration', () => {
  let llmService: LLMService;
  
  beforeEach(() => {
    // Reset environment and create a new service instance for each test
    process.env.GOOGLE_GEMINI_API_KEY = 'test-api-key';
    llmService = new LLMService();
  });
  
  afterEach(() => {
    // Clean up after each test
    jest.clearAllMocks();
    delete process.env.GOOGLE_GEMINI_API_KEY;
  });

  describe('Service Initialization', () => {
    it('should correctly identify when the service is available', () => {
      expect(llmService.isAvailable()).toBe(true);
    });
    
    it('should correctly identify when the service is not available', () => {
      delete process.env.GOOGLE_GEMINI_API_KEY;
      const unavailableService = new LLMService();
      expect(unavailableService.isAvailable()).toBe(false);
    });
  });

  describe('Training Plan Generation', () => {
    it('should generate a valid training plan structure', async () => {
      // Prepare input data
      const planRequestData = {
        profile: {
          experienceLevel: 'Intermediate',
          fitnessLevel: '70',
          personalBests: [
            { distanceMeters: 5000, timeSeconds: 1500, dateAchieved: '2022-12-01' }
          ]
        },
        goal: {
          type: 'Race' as const,
          distanceMeters: 10000,
          raceDate: '2023-04-01',
          goalTimeSeconds: 3000
        },
        preferences: {
          runningDaysPerWeek: 4,
          preferredLongRunDay: 'Saturday',
          targetWeeklyDistanceMeters: 40000,
          qualityWorkoutsPerWeek: 2,
          coachingStyle: 'Balanced'
        },
        historicalWeeklySummaries: [
          { startDate: '2022-12-01', totalDistanceMeters: 30000, numberOfRuns: 4 }
        ],
        recentKeyWorkouts: [
          { date: '2022-12-10', type: 'LongRun', distanceMeters: 12000, movingTimeSeconds: 3600, averagePaceSecondsPerKm: 300 }
        ]
      };
      
      // Call the service
      const result = await llmService.generateTrainingPlan(planRequestData);
      
      // Check structure and content
      expect(result).toBeDefined();
      expect(result.planSummary).toBeDefined();
      expect(result.weeks).toBeInstanceOf(Array);
      expect(result.weeks.length).toBeGreaterThan(0);
      expect(result.weeks[0].dailyWorkouts).toBeInstanceOf(Array);
      
      // Verify some key values match our mock data
      expect(result.planSummary.durationWeeks).toBe(12);
    });
    
    it('should throw an error when the service is not available', async () => {
      delete process.env.GOOGLE_GEMINI_API_KEY;
      const unavailableService = new LLMService();
      
      // Prepare input data
      const planRequestData = {
        profile: { experienceLevel: 'Beginner' },
        goal: { type: 'NonRace' as const, objective: 'General fitness' },
        preferences: { 
          runningDaysPerWeek: 3,
          qualityWorkoutsPerWeek: 1
        }
      };
      
      // Expect error when calling the service
      await expect(unavailableService.generateTrainingPlan(planRequestData)).rejects.toThrow();
    });
  });

  describe('Ask Vici Functionality', () => {
    it('should handle a user query and return a valid response', async () => {
      // Prepare input data
      const askViciRequest = {
        query: "I need to adjust my plan for next week because I'll be traveling.",
        context: {
          plan: {
            id: '12345',
            status: 'Active',
            goal: { type: 'Race', distanceMeters: 10000 },
            currentWeekData: {
              weekNumber: 3,
              startDate: '2023-01-15',
              endDate: '2023-01-21',
              phase: 'Base',
              workouts: [
                { date: '2023-01-15', workoutType: 'LongRun', description: '10km easy', distanceMeters: 10000, durationSeconds: 3600, status: 'Upcoming' }
              ]
            }
          },
          profile: {
            experienceLevel: 'Intermediate',
            fitnessLevel: '70'
          }
        }
      };
      
      // Call the service
      const result = await llmService.handleAskVici(askViciRequest);
      
      // Check structure and content
      expect(result).toBeDefined();
      expect(result.answerText).toBeDefined();
      expect(typeof result.answerText).toBe('string');
      expect(result.timestamp).toBeDefined();
      
      // Match content with our mock
      expect(result.answerText).toContain("adjust your plan for next week");
    });
  });
}); 