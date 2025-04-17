import Foundation
import CoreLocation

/// An activity in the Vici system, representing a completed workout or training session, 
/// aligning with TypeScript Activity interface
struct Activity: Codable, Identifiable, Hashable {
    var id: String
    var userId: String
    var workoutId: String?
    var title: String
    var description: String?
    var activityType: ActivityType
    var startTime: Date
    var endTime: Date
    var duration: Int      // Duration in seconds
    var distance: Double?  // Distance in meters
    var elevationGain: Double?
    var calories: Int?
    var averageHeartRate: Int?
    var maxHeartRate: Int?
    var averagePace: Int?   // Pace in seconds per kilometer
    var averageCadence: Int?
    var stravaActivityId: String?
    var routeData: [ActivityCoordinate]?
    var segments: [ActivitySegment]?
    
    enum ActivityType: String, Codable {
        case run
        case walk
        case cycling
        case swimming
        case strength
        case hiit
        case yoga
        case recovery
        case crossTraining = "cross_training"
        case intervalWorkout = "interval_workout"
        case other
    }
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId
        case workoutId
        case title
        case description
        case activityType
        case startTime
        case endTime
        case duration
        case distance
        case elevationGain
        case calories
        case averageHeartRate
        case maxHeartRate
        case averagePace
        case averageCadence
        case stravaActivityId
        case routeData
        case segments
    }
    
    // Hashable conformance
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
    
    static func == (lhs: Activity, rhs: Activity) -> Bool {
        return lhs.id == rhs.id
    }
}

/// A segment of an activity (e.g., warm-up, main set, cool-down)
struct ActivitySegment: Codable, Identifiable, Hashable {
    var id: String
    var activityId: String
    var order: Int
    var title: String
    var duration: Int?  // Duration in seconds
    var distance: Double?  // Distance in meters
    var averageHeartRate: Int?
    var averagePace: Int?  // Seconds per kilometer
    var averageCadence: Int?
    
    enum CodingKeys: String, CodingKey {
        case id
        case activityId
        case order
        case title
        case duration
        case distance
        case averageHeartRate
        case averagePace
        case averageCadence
    }
    
    // Hashable conformance
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
    
    static func == (lhs: ActivitySegment, rhs: ActivitySegment) -> Bool {
        return lhs.id == rhs.id
    }
}

// MARK: - Date Conversion Extensions

extension Activity {
    /// Creates an Activity from TypeScript-compatible ISO8601 date strings
    static func fromTypeScript(
        id: String,
        userId: String,
        workoutId: String?,
        title: String,
        description: String?,
        activityType: ActivityType,
        startTime: String,
        endTime: String,
        duration: Int,
        distance: Double?,
        elevationGain: Double?,
        calories: Int?,
        averageHeartRate: Int?,
        maxHeartRate: Int?,
        averagePace: Int?,
        averageCadence: Int?,
        stravaActivityId: String?,
        routeData: [ActivityCoordinate]?,
        segments: [ActivitySegment]?
    ) -> Activity? {
        let dateFormatter = ISO8601DateFormatter()
        
        guard let startTimeObj = dateFormatter.date(from: startTime),
              let endTimeObj = dateFormatter.date(from: endTime) else {
            return nil
        }
        
        return Activity(
            id: id,
            userId: userId,
            workoutId: workoutId,
            title: title,
            description: description,
            activityType: activityType,
            startTime: startTimeObj,
            endTime: endTimeObj,
            duration: duration,
            distance: distance,
            elevationGain: elevationGain,
            calories: calories,
            averageHeartRate: averageHeartRate,
            maxHeartRate: maxHeartRate,
            averagePace: averagePace,
            averageCadence: averageCadence,
            stravaActivityId: stravaActivityId,
            routeData: routeData,
            segments: segments
        )
    }
    
    // Computed properties for formatted display
    
    var formattedDuration: String {
        let hours = duration / 3600
        let minutes = (duration % 3600) / 60
        let seconds = duration % 60
        
        if hours > 0 {
            return String(format: "%d:%02d:%02d", hours, minutes, seconds)
        } else {
            return String(format: "%02d:%02d", minutes, seconds)
        }
    }
    
    var formattedDistance: String? {
        guard let distance = distance else { return nil }
        
        if distance >= 1000 {
            return String(format: "%.2f km", distance / 1000)
        } else {
            return String(format: "%.0f m", distance)
        }
    }
    
    var formattedPace: String? {
        guard let pace = averagePace else { return nil }
        
        let minutes = pace / 60
        let seconds = pace % 60
        
        return String(format: "%d:%02d /km", minutes, seconds)
    }
    
    var formattedActivityType: String {
        switch activityType {
        case .run:
            return "Run"
        case .walk:
            return "Walk"
        case .cycling:
            return "Cycling"
        case .swimming:
            return "Swimming"
        case .strength:
            return "Strength Training"
        case .hiit:
            return "HIIT"
        case .yoga:
            return "Yoga"
        case .recovery:
            return "Recovery"
        case .crossTraining:
            return "Cross Training"
        case .intervalWorkout:
            return "Interval Workout"
        case .other:
            return "Other"
        }
    }
}

// MARK: - Coordinate Mapping

/// Represents a GPS coordinate point in an activity
struct ActivityCoordinate: Codable, Equatable, Hashable {
    /// Latitude in degrees
    var latitude: Double
    
    /// Longitude in degrees
    var longitude: Double
    
    /// Elevation in meters
    var elevation: Double?
    
    /// Timestamp of the coordinate
    var timestamp: Date
    
    /// Heart rate at this point if available
    var heartRate: Int?
    
    /// Speed at this point in meters per second
    var speed: Double?
    
    /// Convert to CLLocationCoordinate2D for mapping
    var clCoordinate: CLLocationCoordinate2D {
        return CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    }
    
    // Hashable conformance
    func hash(into hasher: inout Hasher) {
        hasher.combine(latitude)
        hasher.combine(longitude)
        hasher.combine(timestamp)
    }
} 