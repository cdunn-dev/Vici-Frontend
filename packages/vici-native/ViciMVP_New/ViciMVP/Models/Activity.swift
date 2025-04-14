import Foundation
import CoreLocation

/// An activity in the Vici system, representing a completed workout or training session, 
/// aligning with TypeScript Activity interface
struct Activity: Codable, Identifiable, Hashable {
    var id: String
    var userId: String
    var workoutId: String?
    var type: String      // e.g., "run", "bike", "swim"
    var name: String
    var description: String?
    var startDate: Date
    var endDate: Date
    var duration: Int      // Duration in seconds
    var distance: Double?  // Distance in meters
    var avgHeartRate: Int?
    var maxHeartRate: Int?
    var avgPace: Double?   // Pace in seconds per kilometer
    var calories: Int?
    var elevationGain: Double?
    var source: String?    // e.g., "manual", "strava", "garmin"
    var polyline: String?  // Encoded path for maps
    var createdAt: Date?
    var updatedAt: Date?
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId
        case workoutId
        case type
        case name
        case description
        case startDate
        case endDate
        case duration
        case distance
        case avgHeartRate
        case maxHeartRate
        case avgPace
        case calories
        case elevationGain
        case source
        case polyline
        case createdAt
        case updatedAt
    }
    
    // Hashable conformance
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
    
    static func == (lhs: Activity, rhs: Activity) -> Bool {
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
        type: String,
        name: String,
        description: String?,
        startDate: String,
        endDate: String,
        duration: Int,
        distance: Double?,
        avgHeartRate: Int?,
        maxHeartRate: Int?,
        avgPace: Double?,
        calories: Int?,
        elevationGain: Double?,
        source: String?,
        polyline: String?,
        createdAt: String?,
        updatedAt: String?
    ) -> Activity? {
        let dateFormatter = ISO8601DateFormatter()
        
        guard let startDateObj = dateFormatter.date(from: startDate),
              let endDateObj = dateFormatter.date(from: endDate) else {
            return nil
        }
        
        let createdAtDate = createdAt != nil ? dateFormatter.date(from: createdAt!) : nil
        let updatedAtDate = updatedAt != nil ? dateFormatter.date(from: updatedAt!) : nil
        
        return Activity(
            id: id,
            userId: userId,
            workoutId: workoutId,
            type: type,
            name: name,
            description: description,
            startDate: startDateObj,
            endDate: endDateObj,
            duration: duration,
            distance: distance,
            avgHeartRate: avgHeartRate,
            maxHeartRate: maxHeartRate,
            avgPace: avgPace,
            calories: calories,
            elevationGain: elevationGain,
            source: source,
            polyline: polyline,
            createdAt: createdAtDate,
            updatedAt: updatedAtDate
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
        guard let pace = avgPace else { return nil }
        
        let minutes = Int(pace) / 60
        let seconds = Int(pace) % 60
        
        return String(format: "%d:%02d /km", minutes, seconds)
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