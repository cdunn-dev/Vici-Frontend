import Foundation
import CoreLocation

// MARK: - Preview Extensions
// These extensions provide sample data for SwiftUI previews
// They should NOT be used in production code

extension Activity {
    /// Sample activity for preview purposes
    static var sampleActivity: Activity {
        Activity(
            id: "preview-activity-1",
            userId: "preview-user-1",
            workoutId: "preview-workout-1",
            type: "run",
            name: "Morning Run",
            description: "Easy morning run around the park",
            startDate: Date().addingTimeInterval(-3600),
            endDate: Date().addingTimeInterval(-400),
            duration: 3200,
            distance: 5230,
            avgHeartRate: 148,
            maxHeartRate: 165,
            avgPace: 367.2,
            calories: 450,
            elevationGain: 86,
            source: "manual",
            polyline: nil,
            createdAt: Date(),
            updatedAt: Date()
        )
    }
    
    /// Sample activity with GPS data for preview purposes
    static var sampleActivityWithRoute: Activity {
        let activity = sampleActivity
        // In a real implementation, this would include a real polyline
        return activity
    }
    
    /// Sample activities for preview purposes
    static var previewActivities: [Activity] {
        [
            Activity(
                id: "preview-activity-2",
                userId: "preview-user-1",
                workoutId: "preview-workout-2",
                type: "run",
                name: "Long Run",
                description: "Weekend long run along the river",
                startDate: Date().addingTimeInterval(-172800),
                endDate: Date().addingTimeInterval(-170100),
                duration: 2700,
                distance: 8120,
                avgHeartRate: 152,
                maxHeartRate: 172,
                avgPace: 332.5,
                calories: 720,
                elevationGain: 124,
                source: "manual",
                polyline: nil,
                createdAt: Date().addingTimeInterval(-172800),
                updatedAt: Date().addingTimeInterval(-172800)
            ),
            Activity(
                id: "preview-activity-3",
                userId: "preview-user-1",
                workoutId: "preview-workout-3",
                type: "run",
                name: "Interval Session",
                description: "6x800m repeats with 400m recovery",
                startDate: Date().addingTimeInterval(-345600),
                endDate: Date().addingTimeInterval(-343200),
                duration: 2400,
                distance: 6400,
                avgHeartRate: 165,
                maxHeartRate: 182,
                avgPace: 312.5,
                calories: 580,
                elevationGain: 68,
                source: "manual",
                polyline: nil,
                createdAt: Date().addingTimeInterval(-345600),
                updatedAt: Date().addingTimeInterval(-345600)
            ),
            sampleActivity
        ]
    }
    
    /// Sample Strava activities for preview purposes
    static var previewStravaActivities: [Activity] {
        var activities = previewActivities
        for i in 0..<activities.count {
            activities[i].source = "strava"
        }
        return activities
    }
} 