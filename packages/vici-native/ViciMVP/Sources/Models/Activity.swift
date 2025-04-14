import Foundation
import CoreLocation

struct Activity: Identifiable, Codable {
    let id: String
    let name: String
    let description: String?
    let activityType: ActivityType
    let startTime: Date
    let movingTimeSeconds: Int
    let distance: Double  // In meters
    let calories: Int
    let elevationGain: Double?  // In meters
    let averageHeartRate: Int?
    let weather: Weather
    
    var durationFormatted: String {
        let hours = movingTimeSeconds / 3600
        let minutes = (movingTimeSeconds % 3600) / 60
        let seconds = movingTimeSeconds % 60
        
        if hours > 0 {
            return String(format: "%d:%02d:%02d", hours, minutes, seconds)
        } else {
            return String(format: "%d:%02d", minutes, seconds)
        }
    }
    
    var distanceFormatted: String {
        if distance >= 1000 {
            return String(format: "%.2f km", distance / 1000)
        } else {
            return String(format: "%d m", Int(distance))
        }
    }
    
    var paceFormatted: String? {
        guard distance > 0 else { return nil }
        
        let paceSeconds = Double(movingTimeSeconds) / (distance / 1000)
        let paceMinutes = Int(paceSeconds) / 60
        let paceSecondsRemainder = Int(paceSeconds) % 60
        
        switch activityType {
        case .run, .walk:
            return String(format: "%d:%02d /km", paceMinutes, paceSecondsRemainder)
        case .ride:
            let speedKmh = (distance / 1000) / (Double(movingTimeSeconds) / 3600)
            return String(format: "%.1f km/h", speedKmh)
        case .swim:
            // For swimming, pace is often per 100m
            let pace100m = (Double(movingTimeSeconds) / (distance / 100))
            let paceMinutes = Int(pace100m) / 60
            let paceSeconds = Int(pace100m) % 60
            return String(format: "%d:%02d /100m", paceMinutes, paceSeconds)
        case .other:
            return nil
        }
    }
}

struct Split: Identifiable {
    let id = UUID()
    let distance: Double // in meters
    let seconds: Int
    let paceSecondsPerKm: Int
    let elevationChange: Double?
}

enum ActivityType: String, Codable, CaseIterable {
    case run
    case ride
    case swim
    case walk
    case other
    
    var icon: String {
        switch self {
        case .run:
            return "figure.run"
        case .ride:
            return "bicycle"
        case .swim:
            return "figure.swimming"
        case .walk:
            return "figure.walk"
        case .other:
            return "figure.mixed.cardio"
        }
    }
}

enum WeatherCondition: String, Codable, CaseIterable {
    case clear
    case cloudy
    case rain
    case snow
    case fog
    case windy
    
    var icon: String {
        switch self {
        case .clear:
            return "sun.max"
        case .cloudy:
            return "cloud"
        case .rain:
            return "cloud.rain"
        case .snow:
            return "cloud.snow"
        case .fog:
            return "cloud.fog"
        case .windy:
            return "wind"
        }
    }
}

struct Weather: Codable {
    let condition: WeatherCondition
    let temperatureCelsius: Double
}

// Extend Date to provide formatting for activities
extension Date {
    var monthYearString: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMMM yyyy"
        return formatter.string(from: self)
    }
    
    var dayMonthString: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "d MMM"
        return formatter.string(from: self)
    }
    
    var fullDateString: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .long
        formatter.timeStyle = .short
        return formatter.string(from: self)
    }
}

// MARK: - Sample Data
extension Activity {
    static var sampleActivities: [Activity] {
        [
            // Sample Run
            Activity(
                id: "1",
                name: "Morning Run",
                description: "Great morning run through the park. Felt really good today!",
                activityType: .run,
                startTime: Date().addingTimeInterval(-86400), // Yesterday
                movingTimeSeconds: 1800, // 30 minutes
                distance: 5000, // 5 km
                calories: 450,
                elevationGain: 85,
                averageHeartRate: 155,
                weather: Weather(
                    condition: .sunny,
                    temperatureCelsius: 18
                ),
                stravaId: "123456789",
                kudosCount: 12,
                photoUrls: nil
            ),
            
            // Sample Ride
            Activity(
                id: "2",
                name: "Weekend Bike Ride",
                description: "Long ride through the hills. Great views!",
                activityType: .ride,
                startTime: Date().addingTimeInterval(-172800), // 2 days ago
                movingTimeSeconds: 5400, // 90 minutes
                distance: 30000, // 30 km
                calories: 750,
                elevationGain: 350,
                averageHeartRate: 145,
                weather: Weather(
                    condition: .partlyCloudy,
                    temperatureCelsius: 22
                ),
                stravaId: "987654321",
                kudosCount: 25,
                photoUrls: nil
            ),
            
            // Sample Swim
            Activity(
                id: "3",
                name: "Pool Swim",
                description: "50m pool, worked on technique",
                activityType: .swim,
                startTime: Date().addingTimeInterval(-259200), // 3 days ago
                movingTimeSeconds: 1200, // 20 minutes
                distance: 1000, // 1 km
                calories: 300,
                elevationGain: nil,
                averageHeartRate: 130,
                weather: Weather(
                    condition: .sunny,
                    temperatureCelsius: 25
                ),
                stravaId: "456789123",
                kudosCount: 8,
                photoUrls: nil
            ),
            
            // Sample Walk
            Activity(
                id: "4",
                name: "Evening Stroll",
                description: "Relaxing walk after dinner",
                activityType: .walk,
                startTime: Date().addingTimeInterval(-345600), // 4 days ago
                movingTimeSeconds: 2700, // 45 minutes
                distance: 3500, // 3.5 km
                calories: 200,
                elevationGain: 30,
                averageHeartRate: 105,
                weather: Weather(
                    condition: .cloudy,
                    temperatureCelsius: 15
                ),
                stravaId: "234567891",
                kudosCount: 5,
                photoUrls: nil
            ),
            
            // Sample Other Workout
            Activity(
                id: "5",
                name: "Gym Session",
                description: "Strength training and some cardio",
                activityType: .other,
                startTime: Date().addingTimeInterval(-432000), // 5 days ago
                movingTimeSeconds: 3600, // 60 minutes
                distance: 0, // No distance for gym workout
                calories: 400,
                elevationGain: nil,
                averageHeartRate: 125,
                weather: Weather(
                    condition: .cloudy,
                    temperatureCelsius: 18
                ),
                stravaId: nil,
                kudosCount: nil,
                photoUrls: nil
            )
        ]
    }
}

#if DEBUG
extension Activity {
    static let mockActivities: [Activity] = [
        Activity(
            id: "act-1",
            name: "Morning Run",
            activityType: .run,
            startTime: Calendar.current.date(byAdding: .day, value: -1, to: Date()) ?? Date(),
            distance: 5000,
            movingTimeSeconds: 1800,
            averagePaceSecondsPerKm: 360,
            averageHeartRate: 155,
            elevationGain: 32,
            mapThumbnailUrl: "https://example.com/map1.jpg",
            mapPolyline: nil,
            description: "Easy morning run to start the day"
        ),
        Activity(
            id: "act-2",
            name: "Easy Recovery Run",
            activityType: .run,
            startTime: Calendar.current.date(byAdding: .day, value: -3, to: Date()) ?? Date(),
            distance: 3500,
            movingTimeSeconds: 1260,
            averagePaceSecondsPerKm: 360,
            averageHeartRate: 140,
            elevationGain: 15,
            mapThumbnailUrl: "https://example.com/map2.jpg",
            mapPolyline: nil,
            description: "Easy recovery run"
        ),
        Activity(
            id: "act-3",
            name: "Long Run",
            activityType: .run,
            startTime: Calendar.current.date(byAdding: .day, value: -7, to: Date()) ?? Date(),
            distance: 15000,
            movingTimeSeconds: 5400,
            averagePaceSecondsPerKm: 360,
            averageHeartRate: 148,
            elevationGain: 120,
            mapThumbnailUrl: "https://example.com/map3.jpg",
            mapPolyline: nil,
            description: "Weekend long run through the park"
        )
    ]
}
#endif 