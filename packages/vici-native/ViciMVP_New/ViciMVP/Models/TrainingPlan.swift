import Foundation

struct TrainingPlan: Identifiable, Codable {
    let id: Int
    let userId: Int
    let name: String
    let description: String?
    let goal: String
    let goalType: GoalType
    let startDate: Date
    let endDate: Date
    let currentWeek: Int
    let totalWeeks: Int
    var workouts: [Workout]
    let createdAt: Date
    let updatedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case name
        case description
        case goal
        case goalType = "goal_type"
        case startDate = "start_date"
        case endDate = "end_date"
        case currentWeek = "current_week"
        case totalWeeks = "total_weeks"
        case workouts
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
    
    // Helper computed properties
    var currentWeekWorkouts: [Workout] {
        let calendar = Calendar.current
        let today = Date()
        let weekStartDate = calendar.date(from: calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: today))!
        let weekEndDate = calendar.date(byAdding: .day, value: 7, to: weekStartDate)!
        
        return workouts.filter { workout in
            workout.date >= weekStartDate && workout.date < weekEndDate
        }
    }
    
    var currentWeekDistance: Double {
        currentWeekWorkouts.reduce(0) { $0 + ($1.distance ?? 0) }
    }
    
    var percentComplete: Double {
        let completedWorkouts = workouts.filter { $0.status == .completed }.count
        let totalWorkouts = workouts.count
        return totalWorkouts > 0 ? Double(completedWorkouts) / Double(totalWorkouts) * 100.0 : 0.0
    }
}

enum GoalType: String, Codable, CaseIterable {
    case general = "General Fitness"
    case race = "Race"
    case distance = "Distance Goal"
    case time = "Time Goal"
}

// Mock data extension
extension TrainingPlan {
    static var mock: TrainingPlan {
        let startDate = Calendar.current.date(byAdding: .day, value: -14, to: Date())!
        let endDate = Calendar.current.date(byAdding: .day, value: 70, to: startDate)!
        
        return TrainingPlan(
            id: 1,
            userId: 1,
            name: "10K Training Plan",
            description: "A 12-week plan to prepare for a 10K race",
            goal: "Complete a 10K race in under 50 minutes",
            goalType: .race,
            startDate: startDate,
            endDate: endDate,
            currentWeek: 3,
            totalWeeks: 12,
            workouts: [
                Workout.mockEasyRun,
                Workout.mockIntervalWorkout,
                Workout.mockLongRun
            ],
            createdAt: Date(),
            updatedAt: Date()
        )
    }
}
