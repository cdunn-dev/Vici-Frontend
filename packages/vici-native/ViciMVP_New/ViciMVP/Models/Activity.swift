import Foundation
import CoreLocation

struct Activity: Identifiable, Codable {
    let id: Int
    let userId: Int
    let workoutId: Int?
    let name: String
    let activityType: ActivityType
    let startDate: Date
    let endDate: Date
    let duration: TimeInterval
    let distance: Double
    let elevationGain: Double?
    let avgHeartRate: Double?
    let maxHeartRate: Double?
    let avgPace: Double?
    let maxPace: Double?
    let calories: Double?
    let polyline: String?
    let source: ActivitySource
    let stravaId: Int64?
    let gpsData: [GPSPoint]?
    let createdAt: Date
    let updatedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case workoutId = "workout_id" 
        case name
        case activityType = "activity_type"
        case startDate = "start_date"
        case endDate = "end_date"
        case duration
        case distance
        case elevationGain = "elevation_gain"
        case avgHeartRate = "avg_heart_rate"
        case maxHeartRate = "max_heart_rate"
        case avgPace = "avg_pace"
        case maxPace = "max_pace"
        case calories
        case polyline
        case source
        case stravaId = "strava_id"
        case gpsData = "gps_data"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

struct GPSPoint: Codable {
    let latitude: Double
    let longitude: Double
    let elevation: Double?
    let timestamp: Date
    let heartRate: Int?
    
    enum CodingKeys: String, CodingKey {
        case latitude
        case longitude
        case elevation
        case timestamp
        case heartRate = "heart_rate"
    }
    
    var coordinate: CLLocationCoordinate2D {
        CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    }
}

enum ActivityType: String, Codable, CaseIterable {
    case run = "Run"
    case walk = "Walk"
    case hike = "Hike"
    case ride = "Ride"
    case swim = "Swim"
    case yoga = "Yoga"
    case strength = "Strength"
    case crossTraining = "Cross Training"
    case other = "Other"
}

enum ActivitySource: String, Codable, CaseIterable {
    case strava = "Strava"
    case manual = "Manual"
    case vici = "Vici"
    case appleHealth = "Apple Health"
}

// Mock data extension
extension Activity {
    static var mock: Activity {
        Activity(
            id: 1,
            userId: 1,
            workoutId: 1,
            name: "Morning Run",
            activityType: .run,
            startDate: Date().addingTimeInterval(-3600), // 1 hour ago
            endDate: Date(),
            duration: 3600, // 1 hour
            distance: 10.5, // 10.5 km
            elevationGain: 125,
            avgHeartRate: 148,
            maxHeartRate: 172,
            avgPace: 343, // 5:43 min/km
            maxPace: 280, // 4:40 min/km
            calories: 750,
            polyline: nil,
            source: .manual,
            stravaId: nil,
            gpsData: nil,
            createdAt: Date(),
            updatedAt: Date()
        )
    }
}
