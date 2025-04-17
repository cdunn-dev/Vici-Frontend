import Foundation
import CoreLocation

// MARK: - Preview Extensions
// These extensions provide sample data for SwiftUI previews
// They should NOT be used in production code

extension Activity {
    /// Sample activity for preview purposes
    static var sampleActivity: Activity {
        let calendar = Calendar.current
        let yesterday = calendar.date(byAdding: .day, value: -1, to: Date())!
        
        return Activity(
            id: "activity-123",
            userId: "user-123",
            workoutId: "workout-123",
            title: "Morning Run",
            description: "Easy run around the park",
            activityType: .run,
            startTime: calendar.date(bySettingHour: 7, minute: 30, second: 0, of: yesterday)!,
            endTime: calendar.date(bySettingHour: 8, minute: 15, second: 0, of: yesterday)!,
            duration: 45 * 60, // 45 minutes in seconds
            distance: 8500, // 8.5 km in meters
            elevationGain: 120, // 120 meters
            calories: 550,
            averageHeartRate: 145,
            maxHeartRate: 165,
            averagePace: 318, // 5:18 min/km in seconds
            averageCadence: 170,
            stravaActivityId: "strava-12345678",
            routeData: nil,
            segments: []
        )
    }
    
    /// Sample activity with GPS data for preview purposes
    static var sampleActivityWithRoute: Activity {
        let activity = sampleActivity
        // In a real implementation, this would include a real polyline
        return activity
    }
    
    /// Generate a preview set of activities for the past week
    static var previewActivities: [Activity] {
        let calendar = Calendar.current
        let today = Date()
        var activities: [Activity] = []
        
        for dayOffset in (-7...(-1)).reversed() {
            var activity = sampleActivity
            
            if let date = calendar.date(byAdding: .day, value: dayOffset, to: today) {
                activity.id = "activity-\(abs(dayOffset) + 100)"
                
                // Set appropriate times for the activity
                activity.startTime = calendar.date(bySettingHour: 7, minute: 30, second: 0, of: date)!
                activity.endTime = calendar.date(bySettingHour: 8, minute: 15, second: 0, of: date)!
                
                // Vary the workout details
                activity.title = "Day \(abs(dayOffset)) Run"
                
                // Vary distance and duration based on day of week
                switch abs(dayOffset) % 7 {
                case 1: // Recovery day
                    activity.activityType = .run
                    activity.distance = 5000 // 5K
                    activity.duration = 30 * 60 // 30 minutes
                    activity.averageHeartRate = 130
                    activity.maxHeartRate = 145
                    activity.averagePace = 360 // 6:00 min/km
                case 2: // Interval day
                    activity.activityType = .intervalWorkout
                    activity.distance = 8000 // 8K
                    activity.duration = 40 * 60 // 40 minutes
                    activity.averageHeartRate = 160
                    activity.maxHeartRate = 180
                    activity.averagePace = 300 // 5:00 min/km
                case 3: // Cross-training
                    activity.activityType = .cycling
                    activity.distance = 20000 // 20K
                    activity.duration = 50 * 60 // 50 minutes
                    activity.averageHeartRate = 140
                    activity.maxHeartRate = 155
                    activity.averagePace = 0 // Not applicable for cycling
                case 4: // Tempo day
                    activity.activityType = .run
                    activity.distance = 10000 // 10K
                    activity.duration = 50 * 60 // 50 minutes
                    activity.averageHeartRate = 155
                    activity.maxHeartRate = 170
                    activity.averagePace = 300 // 5:00 min/km
                case 5: // Easy day
                    activity.activityType = .run
                    activity.distance = 6000 // 6K
                    activity.duration = 35 * 60 // 35 minutes
                    activity.averageHeartRate = 135
                    activity.maxHeartRate = 150
                    activity.averagePace = 350 // 5:50 min/km
                case 6: // Rest day
                    activity.activityType = .walk
                    activity.distance = 3000 // 3K
                    activity.duration = 30 * 60 // 30 minutes
                    activity.averageHeartRate = 110
                    activity.maxHeartRate = 125
                    activity.averagePace = 600 // 10:00 min/km
                case 0: // Long run
                    activity.activityType = .run
                    activity.distance = 16000 // 16K
                    activity.duration = 90 * 60 // 90 minutes
                    activity.averageHeartRate = 145
                    activity.maxHeartRate = 160
                    activity.averagePace = 338 // 5:38 min/km
                default:
                    break
                }
                
                activities.append(activity)
            }
        }
        
        return activities
    }
    
    /// Sample Strava activities for preview purposes
    static var previewStravaActivities: [Activity] {
        var activities = previewActivities
        for i in 0..<activities.count {
            activities[i].source = "strava"
        }
        return activities
    }
    
    // Computed property to support ModelValidation
    var name: String {
        return title
    }
    
    // Computed properties for better display
    var formattedDuration: String {
        let hours = duration / 3600
        let minutes = (duration % 3600) / 60
        let seconds = duration % 60
        
        if hours > 0 {
            return String(format: "%d:%02d:%02d", hours, minutes, seconds)
        } else {
            return String(format: "%d:%02d", minutes, seconds)
        }
    }
    
    var formattedDistance: String? {
        guard distance > 0 else { return nil }
        
        if distance >= 1000 {
            return String(format: "%.2f km", distance / 1000)
        } else {
            return String(format: "%.0f m", distance)
        }
    }
    
    var formattedPace: String? {
        guard let pace = averagePace, pace > 0 else { return nil }
        
        let minutes = pace / 60
        let seconds = pace % 60
        return String(format: "%d:%02d /km", minutes, seconds)
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
    
    /// Generate coordinates for a simple route
    static var previewCoordinates: [[Double]] {
        // Simple loop route with 10 points
        return [
            [40.7128, -74.0060], // Start
            [40.7135, -74.0070],
            [40.7145, -74.0075],
            [40.7155, -74.0070],
            [40.7165, -74.0060],
            [40.7160, -74.0050],
            [40.7150, -74.0040],
            [40.7140, -74.0035],
            [40.7130, -74.0045],
            [40.7128, -74.0060]  // End (same as start)
        ]
    }
} 