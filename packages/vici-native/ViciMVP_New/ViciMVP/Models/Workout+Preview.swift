import Foundation

// MARK: - Preview Extensions
// These extensions provide sample data for SwiftUI previews
// They should NOT be used in production code

extension Workout {
    /// Sample workout for preview purposes
    static var sampleWorkout: Workout {
        Workout(
            id: "preview-workout-1",
            planId: "preview-plan-1",
            userId: "preview-user-1",
            name: "Easy Recovery Run",
            description: "An easy recovery run to promote blood flow and active recovery.",
            scheduledDate: Date().addingTimeInterval(3600),
            completed: false,
            completedDate: nil,
            duration: 45,
            distance: 5000,
            activities: nil,
            createdAt: Date(),
            updatedAt: Date()
        )
    }
    
    /// Sample completed workout for preview purposes
    static var sampleCompletedWorkout: Workout {
        Workout(
            id: "preview-workout-2",
            planId: "preview-plan-1",
            userId: "preview-user-1",
            name: "Tempo Run",
            description: "20 minute warm-up, 20 minutes at threshold pace, 10 minute cool-down.",
            scheduledDate: Date().addingTimeInterval(-86400),
            completed: true,
            completedDate: Date().addingTimeInterval(-82800),
            duration: 50,
            distance: 8000,
            activities: nil,
            createdAt: Date().addingTimeInterval(-172800),
            updatedAt: Date().addingTimeInterval(-82800)
        )
    }
    
    /// Sample preview workouts for a week
    static var previewWeek: [Workout] {
        let calendar = Calendar.current
        let today = Date()
        let weekStartDate = calendar.date(from: calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: today))!
        
        return [
            Workout(
                id: "preview-workout-3",
                planId: "preview-plan-1",
                userId: "preview-user-1",
                name: "Easy Run",
                description: "Easy aerobic run at conversational pace.",
                scheduledDate: calendar.date(byAdding: .day, value: 0, to: weekStartDate)!,
                completed: true,
                completedDate: calendar.date(byAdding: .day, value: 0, to: weekStartDate)!,
                duration: 40,
                distance: 6000,
                activities: nil,
                createdAt: Date().addingTimeInterval(-604800),
                updatedAt: Date().addingTimeInterval(-518400)
            ),
            Workout(
                id: "preview-workout-4",
                planId: "preview-plan-1",
                userId: "preview-user-1",
                name: "Interval Training",
                description: "6 x 400m repeats with 200m recovery jogs.",
                scheduledDate: calendar.date(byAdding: .day, value: 2, to: weekStartDate)!,
                completed: false,
                completedDate: nil,
                duration: 45,
                distance: 7000,
                activities: nil,
                createdAt: Date().addingTimeInterval(-604800),
                updatedAt: Date().addingTimeInterval(-604800)
            ),
            Workout(
                id: "preview-workout-5",
                planId: "preview-plan-1",
                userId: "preview-user-1",
                name: "Long Run",
                description: "Build endurance with steady pace throughout.",
                scheduledDate: calendar.date(byAdding: .day, value: 5, to: weekStartDate)!,
                completed: false,
                completedDate: nil,
                duration: 90,
                distance: 15000,
                activities: nil,
                createdAt: Date().addingTimeInterval(-604800),
                updatedAt: Date().addingTimeInterval(-604800)
            )
        ]
    }
    
    /// Returns a workout scheduled for today (for preview purposes)
    static var previewTodaysWorkout: Workout? {
        let today = Calendar.current.startOfDay(for: Date())
        return previewWeek.first { Calendar.current.isDate($0.scheduledDate, inSameDayAs: today) }
    }
} 