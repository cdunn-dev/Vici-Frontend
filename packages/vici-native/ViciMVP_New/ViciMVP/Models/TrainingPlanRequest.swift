import Foundation

/// Model representing a request to create a new training plan
struct TrainingPlanRequest: Codable, Hashable {
    /// The user ID requesting the plan
    let userId: String
    
    /// The goal of the training plan (e.g., "Run a half marathon")
    let goal: String
    
    /// The target event date, if applicable
    let targetDate: Date?
    
    /// The preferred weekly run frequency (e.g., 4 times per week)
    let weeklyFrequency: Int
    
    /// Maximum time available for each workout in minutes
    let maxWorkoutDuration: Int?
    
    /// Additional notes or preferences for the plan
    let additionalNotes: String?
    
    /// Whether to include strength training in the plan
    let includeStrength: Bool
    
    /// Whether to include flexibility/mobility work in the plan
    let includeFlexibility: Bool
    
    /// User's experience level (beginner, intermediate, advanced)
    let experienceLevel: ExperienceLevel
    
    /// Preferred coaching style
    let coachingStyle: CoachingStyle
    
    /// Whether to prioritize easy runs over hard runs
    let prioritizeEasyRuns: Bool?
    
    /// Target weekly mileage in kilometers
    let targetWeeklyDistanceKm: Double?
    
    /// Initialization with required fields
    init(userId: String, 
         goal: String, 
         targetDate: Date? = nil, 
         weeklyFrequency: Int, 
         maxWorkoutDuration: Int? = nil, 
         additionalNotes: String? = nil, 
         includeStrength: Bool = true, 
         includeFlexibility: Bool = true, 
         experienceLevel: ExperienceLevel, 
         coachingStyle: CoachingStyle = .balanced,
         prioritizeEasyRuns: Bool? = nil,
         targetWeeklyDistanceKm: Double? = nil) {
        
        self.userId = userId
        self.goal = goal
        self.targetDate = targetDate
        self.weeklyFrequency = weeklyFrequency
        self.maxWorkoutDuration = maxWorkoutDuration
        self.additionalNotes = additionalNotes
        self.includeStrength = includeStrength
        self.includeFlexibility = includeFlexibility
        self.experienceLevel = experienceLevel
        self.coachingStyle = coachingStyle
        self.prioritizeEasyRuns = prioritizeEasyRuns
        self.targetWeeklyDistanceKm = targetWeeklyDistanceKm
    }
}

/// Enum representing user experience levels
enum ExperienceLevel: String, Codable, CaseIterable, Identifiable {
    case beginner = "BEGINNER"
    case intermediate = "INTERMEDIATE"
    case advanced = "ADVANCED"
    
    var id: String { self.rawValue }
    
    var displayName: String {
        switch self {
        case .beginner: return "Beginner"
        case .intermediate: return "Intermediate"
        case .advanced: return "Advanced"
        }
    }
    
    var description: String {
        switch self {
        case .beginner:
            return "Running for less than 6 months, or running less than 15km per week"
        case .intermediate:
            return "Running for 6 months to 2 years, or running 15-40km per week"
        case .advanced:
            return "Running for more than 2 years, or running more than 40km per week"
        }
    }
}

/// Enum representing coaching style preferences
enum CoachingStyle: String, Codable, CaseIterable, Identifiable {
    case supportive = "SUPPORTIVE"
    case balanced = "BALANCED"
    case demanding = "DEMANDING"
    
    var id: String { self.rawValue }
    
    var displayName: String {
        switch self {
        case .supportive: return "Supportive"
        case .balanced: return "Balanced"
        case .demanding: return "Demanding"
        }
    }
    
    var description: String {
        switch self {
        case .supportive:
            return "Focus on enjoyment and steady progress with more flexibility"
        case .balanced:
            return "Mix of supportive guidance with challenging goals"
        case .demanding:
            return "Push your limits with challenging workouts and specific targets"
        }
    }
} 