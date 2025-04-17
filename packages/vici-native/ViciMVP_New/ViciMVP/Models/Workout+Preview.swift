import Foundation

// MARK: - Preview Extensions
// These extensions provide sample data for SwiftUI previews
// They should NOT be used in production code

/// Preview extensions for the Workout model to help with the transition from mock data
extension Workout {
    /// A sample workout for previews
    static var sampleWorkout: Workout {
        Workout(
            id: "sample-1",
            planId: "plan-1",
            userId: "user-1",
            name: "Easy Recovery Run",
            description: "Start the week with a gentle recovery run to flush out any fatigue from the weekend.",
            scheduledDate: Date(),
            completed: false,
            completedDate: nil,
            duration: 30,
            distance: 5000,
            activities: [],
            createdAt: Date(),
            updatedAt: Date()
        )
    }
    
    /// A collection of workouts for a preview week
    static var previewWeek: [Workout] {
        let calendar = Calendar.current
        let today = Date()
        
        // Create date components for this week
        let monday = calendar.date(from: calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: today))!
        let weekDates = (0...6).map { day in
            calendar.date(byAdding: .day, value: day, to: monday)!
        }
        
        return [
            // Monday - Easy Run
            Workout(
                id: "w1",
                planId: "plan-1",
                userId: "user-1",
                name: "Easy Recovery Run",
                description: "Start the week with a gentle recovery run to flush out any fatigue from the weekend.",
                scheduledDate: weekDates[0],
                completed: weekDates[0] < today,
                completedDate: weekDates[0] < today ? weekDates[0] : nil,
                duration: 30,
                distance: 5000,
                activities: [],
                createdAt: Date().addingTimeInterval(-86400),
                updatedAt: Date()
            ),
            
            // Wednesday - Intervals
            Workout(
                id: "w2",
                planId: "plan-1",
                userId: "user-1",
                name: "Interval Workout",
                description: "6 x 400m repeats with 200m recovery jogs. Target pace 10-15 sec/km faster than 5K pace.",
                scheduledDate: weekDates[2],
                completed: weekDates[2] < today,
                completedDate: weekDates[2] < today ? weekDates[2] : nil,
                duration: 40,
                distance: 7000,
                activities: [],
                createdAt: Date().addingTimeInterval(-86400),
                updatedAt: Date()
            ),
            
            // Friday - Tempo Run
            Workout(
                id: "w3",
                planId: "plan-1",
                userId: "user-1",
                name: "Tempo Run",
                description: "Warm up 10min, 20min at marathon pace, 10min cooldown.",
                scheduledDate: weekDates[4],
                completed: weekDates[4] < today,
                completedDate: weekDates[4] < today ? weekDates[4] : nil,
                duration: 45,
                distance: 8000,
                activities: [],
                createdAt: Date().addingTimeInterval(-86400),
                updatedAt: Date()
            ),
            
            // Saturday - Easy Run
            Workout(
                id: "w4",
                planId: "plan-1",
                userId: "user-1",
                name: "Easy Run",
                description: "Easy effort run with focus on good form. Keep the effort conversational.",
                scheduledDate: weekDates[5],
                completed: weekDates[5] < today,
                completedDate: weekDates[5] < today ? weekDates[5] : nil,
                duration: 35,
                distance: 6000,
                activities: [],
                createdAt: Date().addingTimeInterval(-86400),
                updatedAt: Date()
            ),
            
            // Sunday - Long Run
            Workout(
                id: "w5",
                planId: "plan-1",
                userId: "user-1",
                name: "Long Run",
                description: "Weekly long run to build endurance. Keep the pace easy and focus on time on feet.",
                scheduledDate: weekDates[6],
                completed: weekDates[6] < today,
                completedDate: weekDates[6] < today ? weekDates[6] : nil,
                duration: 90,
                distance: 16000,
                activities: [],
                createdAt: Date().addingTimeInterval(-86400),
                updatedAt: Date()
            )
        ]
    }
    
    /// Today's workout for preview
    static var previewTodaysWorkout: Workout? {
        let calendar = Calendar.current
        let today = Date()
        
        return previewWeek.first(where: { workout in
            calendar.isDate(calendar.startOfDay(for: workout.scheduledDate), 
                           inSameDayAs: calendar.startOfDay(for: today))
        })
    }
    
    /// Format duration in minutes to a display string
    func formattedDuration() -> String {
        guard let duration = duration else { return "N/A" }
        
        let hours = duration / 60
        let minutes = duration % 60
        
        if hours > 0 {
            return String(format: "%dh %dm", hours, minutes)
        } else {
            return String(format: "%d min", minutes)
        }
    }
    
    /// Format distance in meters to a display string
    func formattedDistance() -> String? {
        guard let distance = distance else { return nil }
        
        if distance >= 1000 {
            return String(format: "%.2f km", distance / 1000)
        } else {
            return String(format: "%.0f m", distance)
        }
    }
    
    /// A collection of workout previews for a week
    static var previewWorkouts: [Workout] {
        let calendar = Calendar.current
        let today = Date()
        let thisWeekStart = calendar.date(from: calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: today))!
        
        return [
            // Today's workout (easy run)
            Workout(
                id: "workout-1",
                planId: "plan-1",
                scheduledDate: today,
                workoutType: "Easy Run",
                name: "Recovery Run",
                description: "A easy-paced recovery run",
                durationMinutes: 45,
                distanceMeters: 7000,
                completed: false,
                completedDate: nil,
                notes: nil
            ),
            
            // Tomorrow's workout (tempo)
            Workout(
                id: "workout-2",
                planId: "plan-1",
                scheduledDate: calendar.date(byAdding: .day, value: 1, to: today)!,
                workoutType: "Tempo Run",
                name: "Tempo Intervals",
                description: "5 min warm up, 4 x 5 min @ tempo pace with 2 min recovery, 5 min cool down",
                durationMinutes: 40,
                distanceMeters: 8000,
                completed: false,
                completedDate: nil,
                notes: nil
            ),
            
            // Yesterday's workout (completed)
            Workout(
                id: "workout-3",
                planId: "plan-1",
                scheduledDate: calendar.date(byAdding: .day, value: -1, to: today)!,
                workoutType: "Long Run",
                name: "Weekend Long Run",
                description: "Steady pace throughout, focus on endurance",
                durationMinutes: 90,
                distanceMeters: 15000,
                completed: true,
                completedDate: calendar.date(byAdding: .day, value: -1, to: today)!,
                notes: "Felt good, maintained steady pace"
            ),
            
            // Two days ago (completed)
            Workout(
                id: "workout-4",
                planId: "plan-1",
                scheduledDate: calendar.date(byAdding: .day, value: -2, to: today)!,
                workoutType: "Rest Day",
                name: "Rest",
                description: "Full rest day or light stretching",
                durationMinutes: 0,
                distanceMeters: 0,
                completed: true,
                completedDate: calendar.date(byAdding: .day, value: -2, to: today)!,
                notes: "Took a full rest day"
            )
        ]
    }
    
    /// A single workout preview for testing
    static var previewWorkout: Workout {
        let today = Date()
        
        return Workout(
            id: "workout-preview",
            planId: "plan-1",
            scheduledDate: today,
            workoutType: "Interval",
            name: "Speed Intervals",
            description: "8 x 400m @ 5K pace with 200m recovery jog between intervals",
            durationMinutes: 50,
            distanceMeters: 8000,
            completed: false,
            completedDate: nil,
            notes: nil
        )
    }
} 