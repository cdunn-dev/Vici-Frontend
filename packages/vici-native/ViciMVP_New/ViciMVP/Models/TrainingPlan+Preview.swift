import Foundation

// MARK: - Preview Extensions
// These extensions provide sample data for SwiftUI previews
// They should NOT be used in production code

/// Preview extensions for the TrainingPlan model to help with the transition from mock data
extension TrainingPlan {
    /// A sample training plan for preview purposes
    static var samplePlan: TrainingPlan {
        return TrainingPlan(
            id: "plan-123",
            userId: "user-123",
            title: "Half Marathon Training Plan",
            description: "12-week progressive plan to prepare for your half marathon race",
            status: .active,
            startDate: Date(),
            endDate: Calendar.current.date(byAdding: .day, value: 84, to: Date())!, // 12 weeks
            goalRaceDate: Calendar.current.date(byAdding: .day, value: 84, to: Date())!,
            goalRaceDistance: 21097.5, // Half marathon in meters
            goalRaceTime: 5940, // 1:39:00 in seconds
            workouts: [],
            createdAt: Date().addingTimeInterval(-86400),
            updatedAt: Date(),
            trainingPhases: [
                TrainingPhase(
                    id: "phase-1",
                    trainingPlanId: "plan-123",
                    title: "Base Building",
                    description: "Focus on building aerobic base and increasing weekly mileage",
                    startDate: Date(),
                    endDate: Calendar.current.date(byAdding: .day, value: 28, to: Date())!,
                    order: 1,
                    type: .baseBuilding
                ),
                TrainingPhase(
                    id: "phase-2",
                    trainingPlanId: "plan-123",
                    title: "Strength & Speed",
                    description: "Incorporate interval training and hill workouts to build strength and speed",
                    startDate: Calendar.current.date(byAdding: .day, value: 29, to: Date())!,
                    endDate: Calendar.current.date(byAdding: .day, value: 56, to: Date())!,
                    order: 2,
                    type: .strengthSpeed
                ),
                TrainingPhase(
                    id: "phase-3",
                    trainingPlanId: "plan-123",
                    title: "Peak & Taper",
                    description: "Peak training followed by gradual taper to race day",
                    startDate: Calendar.current.date(byAdding: .day, value: 57, to: Date())!,
                    endDate: Calendar.current.date(byAdding: .day, value: 84, to: Date())!,
                    order: 3,
                    type: .peakTaper
                )
            ]
        )
    }
    
    /// A sample training plan with workouts for a full preview
    static var samplePlanWithWorkouts: TrainingPlan {
        var plan = samplePlan
        // Add a set of workouts for the current week
        plan.workouts = Workout.previewWeek
        return plan
    }
    
    /// Multiple sample plans for preview purposes
    static var previewPlans: [TrainingPlan] {
        let today = Date()
        let calendar = Calendar.current
        
        return [
            // Active plan
            TrainingPlan(
                id: "plan-1",
                userId: "user-1",
                title: "Half Marathon Training",
                description: "12-week plan to prepare for your race",
                status: .active,
                startDate: calendar.date(byAdding: .day, value: -14, to: today),
                endDate: calendar.date(byAdding: .day, value: 70, to: today),
                goalRaceDate: calendar.date(byAdding: .day, value: 70, to: today),
                goalRaceDistance: 21097,
                goalRaceTime: 5400,
                workouts: [],
                createdAt: calendar.date(byAdding: .day, value: -20, to: today),
                updatedAt: today
            ),
            
            // Completed plan
            TrainingPlan(
                id: "plan-2",
                userId: "user-1",
                title: "10K Training",
                description: "8-week plan for a 10K race",
                status: .completed,
                startDate: calendar.date(byAdding: .day, value: -90, to: today),
                endDate: calendar.date(byAdding: .day, value: -30, to: today),
                goalRaceDate: calendar.date(byAdding: .day, value: -30, to: today),
                goalRaceDistance: 10000,
                goalRaceTime: 2700,
                workouts: [],
                createdAt: calendar.date(byAdding: .day, value: -100, to: today),
                updatedAt: calendar.date(byAdding: .day, value: -30, to: today)
            ),
            
            // Draft plan
            TrainingPlan(
                id: "plan-3",
                userId: "user-1",
                title: "Marathon Training",
                description: "16-week progressive plan for a marathon",
                status: .draft,
                startDate: calendar.date(byAdding: .day, value: 30, to: today),
                endDate: calendar.date(byAdding: .day, value: 142, to: today),
                goalRaceDate: calendar.date(byAdding: .day, value: 142, to: today),
                goalRaceDistance: 42195,
                goalRaceTime: 14400,
                workouts: [],
                createdAt: today,
                updatedAt: today
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
    
    // Computed property to support ModelValidation
    var name: String {
        return title
    }
} 