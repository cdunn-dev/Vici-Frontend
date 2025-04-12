import Foundation

struct Workout: Identifiable, Codable {
    let id: Int
    let planId: Int?
    let title: String
    let description: String
    let date: Date
    let duration: TimeInterval?
    let distance: Double?
    let workoutType: WorkoutType
    let status: WorkoutStatus
    let activityId: Int?
    
    // Optional - completed information
    let completedDate: Date?
    let completedDistance: Double?
    let completedDuration: TimeInterval?
    let notes: String?
    
    let createdAt: Date
    let updatedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case planId = "plan_id"
        case title
        case description
        case date
        case duration
        case distance
        case workoutType = "workout_type"
        case status
        case activityId = "activity_id"
        case completedDate = "completed_date"
        case completedDistance = "completed_distance"
        case completedDuration = "completed_duration"
        case notes
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

enum WorkoutType: String, Codable, CaseIterable {
    case easy = "Easy Run"
    case tempo = "Tempo Run"
    case interval = "Interval"
    case longRun = "Long Run"
    case recovery = "Recovery Run"
    case fartlek = "Fartlek"
    case hillRepeats = "Hill Repeats"
    case crossTraining = "Cross Training"
    case strength = "Strength"
    case rest = "Rest"
}

enum WorkoutStatus: String, Codable, CaseIterable {
    case scheduled = "Scheduled"
    case completed = "Completed"
    case skipped = "Skipped"
    case missed = "Missed"
    case inProgress = "In Progress"
}

// Mock data extension
extension Workout {
    static var mockEasyRun: Workout {
        Workout(
            id: 1,
            planId: 1,
            title: "Easy Run",
            description: "An easy-paced 5K run to build aerobic base",
            date: Date(),
            duration: 30 * 60, // 30 minutes
            distance: 5.0,
            workoutType: .easy,
            status: .scheduled,
            activityId: nil,
            completedDate: nil,
            completedDistance: nil,
            completedDuration: nil,
            notes: nil,
            createdAt: Date(),
            updatedAt: Date()
        )
    }
    
    static var mockIntervalWorkout: Workout {
        Workout(
            id: 2,
            planId: 1,
            title: "Interval Session",
            description: "8 x 400m repeats with 200m recovery jogs",
            date: Calendar.current.date(byAdding: .day, value: 2, to: Date())!,
            duration: 45 * 60, // 45 minutes
            distance: 7.0,
            workoutType: .interval,
            status: .scheduled,
            activityId: nil,
            completedDate: nil,
            completedDistance: nil,
            completedDuration: nil,
            notes: nil,
            createdAt: Date(),
            updatedAt: Date()
        )
    }
    
    static var mockLongRun: Workout {
        Workout(
            id: 3,
            planId: 1,
            title: "Long Run",
            description: "Long slow distance run to build endurance",
            date: Calendar.current.date(byAdding: .day, value: 5, to: Date())!,
            duration: 70 * 60, // 70 minutes
            distance: 12.0,
            workoutType: .longRun,
            status: .scheduled,
            activityId: nil,
            completedDate: nil,
            completedDistance: nil,
            completedDuration: nil,
            notes: nil,
            createdAt: Date(),
            updatedAt: Date()
        )
    }
}
