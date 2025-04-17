import Foundation

// MARK: - Preview Extensions
// These extensions provide sample data for SwiftUI previews
// They should NOT be used in production code

/// Preview extensions for the Workout model to help with the transition from mock data
extension Workout {
    /// Sample workout for preview purposes
    static var sampleWorkout: Workout {
        return Workout(
            id: "workout-123",
            trainingPlanId: "plan-123",
            userId: "user-123",
            title: "Easy 5K Run",
            description: "An easy recovery run to build aerobic base",
            date: Date(),
            status: .upcoming,
            workoutType: .run,
            scheduledDuration: 30 * 60, // 30 minutes in seconds
            scheduledDistance: 5000, // 5K in meters
            tags: ["recovery", "easy"],
            notes: "Keep heart rate in Zone 2",
            goal: "Build aerobic base and recover from yesterday's workout",
            segments: [
                WorkoutSegment(
                    id: "segment-1",
                    workoutId: "workout-123",
                    order: 1,
                    title: "Warm-up",
                    description: "Easy jog to warm up",
                    duration: 5 * 60, // 5 minutes
                    distance: 800, // 800 meters
                    intensity: .easy,
                    targetPace: 360, // 6:00 min/km
                    targetHeartRate: 130,
                    targetPower: nil,
                    targetCadence: 165,
                    completed: false
                ),
                WorkoutSegment(
                    id: "segment-2",
                    workoutId: "workout-123",
                    order: 2,
                    title: "Main",
                    description: "Steady easy run",
                    duration: 20 * 60, // 20 minutes
                    distance: 3400, // 3.4 km
                    intensity: .easy,
                    targetPace: 350, // 5:50 min/km
                    targetHeartRate: 140,
                    targetPower: nil,
                    targetCadence: 170,
                    completed: false
                ),
                WorkoutSegment(
                    id: "segment-3",
                    workoutId: "workout-123",
                    order: 3,
                    title: "Cool-down",
                    description: "Easy jog to cool down",
                    duration: 5 * 60, // 5 minutes
                    distance: 800, // 800 meters
                    intensity: .easy,
                    targetPace: 360, // 6:00 min/km
                    targetHeartRate: 125,
                    targetPower: nil,
                    targetCadence: 165,
                    completed: false
                )
            ]
        )
    }
    
    /// Sample workout for the current week (preview)
    static var previewTodaysWorkout: Workout {
        var workout = sampleWorkout
        workout.title = "Today's Interval Session"
        workout.description = "High-intensity intervals to improve VO2 max"
        workout.date = Date()
        workout.status = .upcoming
        workout.workoutType = .interval
        workout.scheduledDuration = 45 * 60 // 45 minutes
        workout.scheduledDistance = 8000 // 8K
        return workout
    }
    
    /// Generate a preview week of workouts
    static var previewWeek: [Workout] {
        let calendar = Calendar.current
        let today = Date()
        var weekWorkouts: [Workout] = []
        
        // Generate 5 workouts for the week
        for dayOffset in -2...2 {
            var workout = sampleWorkout
            
            if let date = calendar.date(byAdding: .day, value: dayOffset, to: today) {
                workout.id = "workout-\(dayOffset+100)"
                workout.date = date
                
                // Past workouts are completed
                if dayOffset < 0 {
                    workout.status = .completed
                    workout.title = "Completed \(abs(dayOffset)) days ago"
                } else if dayOffset == 0 {
                    workout.status = .upcoming
                    workout.title = "Today's Workout"
                } else {
                    workout.status = .upcoming
                    workout.title = "Upcoming in \(dayOffset) days"
                }
                
                // Add some variety to workout types
                switch dayOffset {
                case -2: workout.workoutType = .recovery
                case -1: workout.workoutType = .longRun
                case 0: workout.workoutType = .interval
                case 1: workout.workoutType = .tempo
                case 2: workout.workoutType = .easy
                default: workout.workoutType = .run
                }
                
                weekWorkouts.append(workout)
            }
        }
        
        return weekWorkouts
    }
    
    // Computed properties to match ModelValidation expectations
    var name: String {
        return title
    }
    
    /// Format duration in minutes to a display string
    func formattedDuration() -> String {
        guard let duration = scheduledDuration else { return "N/A" }
        
        let hours = duration / 3600
        let minutes = (duration % 3600) / 60
        
        if hours > 0 {
            return String(format: "%dh %dm", hours, minutes)
        } else {
            return String(format: "%d min", minutes / 60)
        }
    }
    
    /// Format distance in meters to a display string
    func formattedDistance() -> String? {
        guard let distance = scheduledDistance else { return nil }
        
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
                trainingPlanId: "plan-1",
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
                trainingPlanId: "plan-1",
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
                trainingPlanId: "plan-1",
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
                trainingPlanId: "plan-1",
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
            trainingPlanId: "plan-1",
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