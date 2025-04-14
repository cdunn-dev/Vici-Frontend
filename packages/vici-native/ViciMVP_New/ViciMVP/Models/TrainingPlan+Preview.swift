import Foundation

// MARK: - Preview Extensions
// These extensions provide sample data for SwiftUI previews
// They should NOT be used in production code

extension TrainingPlan {
    /// Sample training plan for preview purposes
    static var samplePlan: TrainingPlan {
        TrainingPlan(
            id: "preview-plan-1",
            userId: "preview-user-1",
            name: "10K Training Plan",
            description: "A comprehensive 8-week plan to prepare for a 10K race with a mix of easy runs, tempo work, and progressive long runs.",
            goal: "Complete a 10K race in under 55 minutes",
            startDate: Date().addingTimeInterval(-14 * 86400), // 14 days ago
            endDate: Date().addingTimeInterval(42 * 86400),    // 42 days from now
            isActive: true,
            isCompleted: false,
            createdAt: Date().addingTimeInterval(-15 * 86400),
            updatedAt: Date().addingTimeInterval(-15 * 86400),
            workouts: []
        )
    }
    
    /// Sample training plan with workouts for preview purposes
    static var samplePlanWithWorkouts: TrainingPlan {
        var plan = samplePlan
        plan.workouts = Workout.previewWeek
        return plan
    }
    
    /// Sample completed training plan for preview purposes
    static var sampleCompletedPlan: TrainingPlan {
        TrainingPlan(
            id: "preview-plan-2",
            userId: "preview-user-1",
            name: "5K Beginner Plan",
            description: "An introductory training plan for new runners aiming to complete their first 5K race.",
            goal: "Finish a 5K race",
            startDate: Date().addingTimeInterval(-90 * 86400), // 90 days ago
            endDate: Date().addingTimeInterval(-14 * 86400),   // 14 days ago
            isActive: false,
            isCompleted: true,
            createdAt: Date().addingTimeInterval(-95 * 86400),
            updatedAt: Date().addingTimeInterval(-14 * 86400),
            workouts: []
        )
    }
    
    /// Sample training plans for preview purposes
    static var previewPlans: [TrainingPlan] {
        [samplePlan, sampleCompletedPlan]
    }
} 