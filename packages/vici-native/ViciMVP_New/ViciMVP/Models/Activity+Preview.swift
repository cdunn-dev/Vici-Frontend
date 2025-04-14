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
        let now = Date()
        
        return [
            // Recent easy run
            Activity(
                id: "activity-1",
                userId: "user-1",
                workoutId: "workout-1",
                type: "run",
                name: "Morning Easy Run",
                description: "Easy recovery run around the park",
                startDate: now.addingTimeInterval(-86400), // Yesterday
                endDate: now.addingTimeInterval(-84600),   // 30 minutes later
                duration: 1800, // 30 minutes
                distance: 5000, // 5km
                avgHeartRate: 142,
                maxHeartRate: 158,
                avgPace: 360, // 6:00 min/km
                calories: 350,
                elevationGain: 45,
                source: "manual",
                polyline: nil,
                createdAt: now.addingTimeInterval(-84600),
                updatedAt: now.addingTimeInterval(-84600)
            ),
            
            // Interval workout
            Activity(
                id: "activity-2",
                userId: "user-1",
                workoutId: "workout-2",
                type: "run",
                name: "Interval Training",
                description: "6x400m repeats with 200m recovery",
                startDate: now.addingTimeInterval(-259200), // 3 days ago
                endDate: now.addingTimeInterval(-256800),   // 40 minutes later
                duration: 2400, // 40 minutes
                distance: 7000, // 7km
                avgHeartRate: 165,
                maxHeartRate: 182,
                avgPace: 330, // 5:30 min/km
                calories: 520,
                elevationGain: 30,
                source: "strava",
                polyline: nil,
                createdAt: now.addingTimeInterval(-256800),
                updatedAt: now.addingTimeInterval(-256800)
            ),
            
            // Long run
            Activity(
                id: "activity-3",
                userId: "user-1",
                workoutId: "workout-3",
                type: "run",
                name: "Weekend Long Run",
                description: "Long steady run at easy pace",
                startDate: now.addingTimeInterval(-345600), // 4 days ago
                endDate: now.addingTimeInterval(-340200),   // 90 minutes later
                duration: 5400, // 90 minutes
                distance: 15000, // 15km
                avgHeartRate: 148,
                maxHeartRate: 160,
                avgPace: 360, // 6:00 min/km
                calories: 950,
                elevationGain: 120,
                source: "strava",
                polyline: nil,
                createdAt: now.addingTimeInterval(-340200),
                updatedAt: now.addingTimeInterval(-340200)
            ),
            
            // Cross-training
            Activity(
                id: "activity-4",
                userId: "user-1",
                workoutId: "workout-4",
                type: "cycling",
                name: "Indoor Cycling",
                description: "Recovery ride on trainer",
                startDate: now.addingTimeInterval(-172800), // 2 days ago
                endDate: now.addingTimeInterval(-169800),   // 50 minutes later
                duration: 3000, // 50 minutes
                distance: 25000, // 25km
                avgHeartRate: 135,
                maxHeartRate: 145,
                avgPace: nil, // Not applicable for cycling
                calories: 420,
                elevationGain: 200,
                source: "manual",
                polyline: nil,
                createdAt: now.addingTimeInterval(-169800),
                updatedAt: now.addingTimeInterval(-169800)
            )
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

/// Preview extensions for the Activity model to help with the transition from mock data
extension Activity {
    /// Generate mock GPS coordinates
    static func previewCoordinates() -> [ActivityCoordinate] {
        let now = Date()
        let baseLatitude = 37.7749
        let baseLongitude = -122.4194
        var coordinates: [ActivityCoordinate] = []
        
        // Create 100 coordinates in a rough circle pattern
        for i in 0..<100 {
            let angle = Double(i) * (2 * Double.pi / 100)
            let radius = 0.01 + 0.002 * sin(Double(i) / 5) // Slightly irregular circle
            
            let latitude = baseLatitude + radius * cos(angle)
            let longitude = baseLongitude + radius * sin(angle)
            let timestamp = now.addingTimeInterval(Double(i) * 30) // Every 30 seconds
            
            // Heart rate varies with "effort"
            let heartRate = 130 + Int(20 * sin(Double(i) / 10))
            
            // Speed varies between 3-4 m/s (~ 7-10 min/km pace)
            let speed = 3.0 + 1.0 * sin(Double(i) / 8)
            
            coordinates.append(ActivityCoordinate(
                latitude: latitude,
                longitude: longitude,
                elevation: 10 + 5 * sin(Double(i) / 7),
                timestamp: timestamp,
                heartRate: heartRate,
                speed: speed
            ))
        }
        
        return coordinates
    }
} 