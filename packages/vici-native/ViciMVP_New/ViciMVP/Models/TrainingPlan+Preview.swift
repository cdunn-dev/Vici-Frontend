import Foundation

// MARK: - Preview Extensions
// These extensions provide sample data for SwiftUI previews
// They should NOT be used in production code

/// Preview extensions for the TrainingPlan model to help with the transition from mock data
extension TrainingPlan {
    /// A sample training plan for previews
    static var previewPlan: TrainingPlan {
        let calendar = Calendar.current
        let today = Date()
        
        return TrainingPlan(
            id: "plan-1",
            userId: "user-1",
            name: "Half Marathon Training",
            description: "12-week training plan for a half marathon",
            goal: "Complete the City Half Marathon",
            startDate: calendar.date(byAdding: .day, value: -28, to: today)!,
            endDate: calendar.date(byAdding: .day, value: 56, to: today)!,
            isActive: true,
            isCompleted: false,
            createdAt: calendar.date(byAdding: .day, value: -35, to: today)!,
            updatedAt: calendar.date(byAdding: .day, value: -28, to: today)!,
            workouts: nil
        )
    }
    
    /// A sample training plan with workouts for previews
    static var samplePlanWithWorkouts: TrainingPlan {
        var plan = previewPlan
        plan.workouts = Workout.previewWorkouts
        return plan
    }
    
    /// A collection of training plans for previews
    static var previewPlans: [TrainingPlan] {
        let calendar = Calendar.current
        let today = Date()
        
        return [
            // Active plan
            TrainingPlan(
                id: "plan-1",
                userId: "user-1",
                name: "Half Marathon Training",
                description: "12-week training plan for a half marathon",
                goal: "Complete the City Half Marathon",
                startDate: calendar.date(byAdding: .day, value: -28, to: today)!,
                endDate: calendar.date(byAdding: .day, value: 56, to: today)!,
                isActive: true,
                isCompleted: false,
                createdAt: calendar.date(byAdding: .day, value: -35, to: today)!,
                updatedAt: calendar.date(byAdding: .day, value: -28, to: today)!,
                workouts: nil
            ),
            
            // Completed plan
            TrainingPlan(
                id: "plan-2",
                userId: "user-1",
                name: "10K Training",
                description: "8-week training plan for a 10K race",
                goal: "Complete the Spring 10K",
                startDate: calendar.date(byAdding: .day, value: -90, to: today)!,
                endDate: calendar.date(byAdding: .day, value: -34, to: today)!,
                isActive: false,
                isCompleted: true,
                createdAt: calendar.date(byAdding: .day, value: -100, to: today)!,
                updatedAt: calendar.date(byAdding: .day, value: -34, to: today)!,
                workouts: nil
            )
        ]
    }
    
    /// Computed property to get the formatted duration of the plan in weeks
    var durationInWeeks: Int {
        guard let startDate = startDate, let endDate = endDate else { return 0 }
        let calendar = Calendar.current
        let components = calendar.dateComponents([.day], from: startDate, to: endDate)
        guard let days = components.day else { return 0 }
        return (days / 7) + (days % 7 > 0 ? 1 : 0)
    }
    
    /// Formatted date range for display
    var formattedDateRange: String {
        guard let startDate = startDate, let endDate = endDate else { return "Not scheduled" }
        let dateFormatter = DateFormatter()
        dateFormatter.dateStyle = .medium
        dateFormatter.timeStyle = .none
        return "\(dateFormatter.string(from: startDate)) - \(dateFormatter.string(from: endDate))"
    }
    
    /// Formatted short date range (month/day only)
    var formattedShortDateRange: String {
        guard let startDate = startDate, let endDate = endDate else { return "Not scheduled" }
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "MMM d"
        return "\(dateFormatter.string(from: startDate)) - \(dateFormatter.string(from: endDate))"
    }
    
    /// Progress percentage based on today's date relative to start and end dates
    var progressPercentage: Double {
        guard let startDate = startDate, let endDate = endDate else { return 0.0 }
        let now = Date()
        if now < startDate { return 0.0 }
        if now > endDate { return 1.0 }
        
        let totalDuration = endDate.timeIntervalSince(startDate)
        let elapsedDuration = now.timeIntervalSince(startDate)
        
        return elapsedDuration / totalDuration
    }
    
    /// Count of completed workouts
    var completedWorkoutsCount: Int {
        return workouts?.filter({ $0.completed }).count ?? 0
    }
    
    /// Total count of workouts in the plan
    var totalWorkoutsCount: Int {
        return workouts?.count ?? 0
    }
} 