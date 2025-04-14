import Foundation

// MARK: - Preview Extensions
// These extensions provide sample data for SwiftUI previews
// They should NOT be used in production code

/// Preview extensions for the User model to help with the transition from mock data
extension User {
    /// A sample user with complete profile for previews
    static var previewUser: User {
        User(
            id: "user-1",
            email: "runner@example.com",
            name: "Alex Runner",
            profileImageUrl: "https://randomuser.me/api/portraits/women/44.jpg",
            gender: "female",
            dateOfBirth: Calendar.current.date(byAdding: .year, value: -28, to: Date())!,
            weight: 65.5,
            height: 170,
            preferredUnits: "metric",
            experienceLevel: "intermediate",
            trainingFrequency: 4,
            preferredWorkoutTimes: ["morning", "evening"],
            goals: ["Complete a half marathon", "Improve 5K time"],
            isOnboarded: true,
            isActive: true,
            createdAt: Calendar.current.date(byAdding: .year, value: -1, to: Date())!,
            updatedAt: Calendar.current.date(byAdding: .day, value: -14, to: Date())!,
            stravaConnected: true,
            garminConnected: false
        )
    }
    
    /// A newly registered user for previews
    static var previewNewUser: User {
        User(
            id: "user-2",
            email: "new.runner@example.com",
            name: "New Runner",
            profileImageUrl: nil,
            gender: nil,
            dateOfBirth: nil,
            weight: nil,
            height: nil,
            preferredUnits: "metric",
            experienceLevel: nil,
            trainingFrequency: nil,
            preferredWorkoutTimes: nil,
            goals: nil,
            isOnboarded: false,
            isActive: true,
            createdAt: Date(),
            updatedAt: Date(),
            stravaConnected: false,
            garminConnected: false
        )
    }
    
    /// A collection of users for previews
    static var previewUsers: [User] {
        [
            // Experienced runner
            User(
                id: "user-1",
                email: "runner@example.com",
                name: "Alex Runner",
                profileImageUrl: "https://randomuser.me/api/portraits/women/44.jpg",
                gender: "female",
                dateOfBirth: Calendar.current.date(byAdding: .year, value: -28, to: Date())!,
                weight: 65.5,
                height: 170,
                preferredUnits: "metric",
                experienceLevel: "intermediate",
                trainingFrequency: 4,
                preferredWorkoutTimes: ["morning", "evening"],
                goals: ["Complete a half marathon", "Improve 5K time"],
                isOnboarded: true,
                isActive: true,
                createdAt: Calendar.current.date(byAdding: .year, value: -1, to: Date())!,
                updatedAt: Calendar.current.date(byAdding: .day, value: -14, to: Date())!,
                stravaConnected: true,
                garminConnected: false
            ),
            
            // New runner
            User(
                id: "user-2",
                email: "new.runner@example.com",
                name: "New Runner",
                profileImageUrl: nil,
                gender: nil,
                dateOfBirth: nil,
                weight: nil,
                height: nil,
                preferredUnits: "metric",
                experienceLevel: nil,
                trainingFrequency: nil,
                preferredWorkoutTimes: nil,
                goals: nil,
                isOnboarded: false,
                isActive: true,
                createdAt: Date(),
                updatedAt: Date(),
                stravaConnected: false,
                garminConnected: false
            ),
            
            // Advanced runner
            User(
                id: "user-3",
                email: "elite@example.com",
                name: "Elite Runner",
                profileImageUrl: "https://randomuser.me/api/portraits/men/32.jpg",
                gender: "male",
                dateOfBirth: Calendar.current.date(byAdding: .year, value: -35, to: Date())!,
                weight: 70.0,
                height: 180,
                preferredUnits: "metric",
                experienceLevel: "advanced",
                trainingFrequency: 6,
                preferredWorkoutTimes: ["morning"],
                goals: ["Qualify for Boston", "Run sub-3 marathon"],
                isOnboarded: true,
                isActive: true,
                createdAt: Calendar.current.date(byAdding: .year, value: -2, to: Date())!,
                updatedAt: Calendar.current.date(byAdding: .day, value: -3, to: Date())!,
                stravaConnected: true,
                garminConnected: true
            )
        ]
    }
    
    /// Format user's age
    var formattedAge: String? {
        guard let dob = dateOfBirth else { return nil }
        
        let calendar = Calendar.current
        let ageComponents = calendar.dateComponents([.year], from: dob, to: Date())
        guard let age = ageComponents.year else { return nil }
        
        return "\(age)"
    }
    
    /// Format height in cm
    var formattedHeight: String? {
        guard let height = height else { return nil }
        
        if preferredUnits == "imperial" {
            // Convert to feet and inches
            let heightInches = height / 2.54
            let feet = Int(heightInches) / 12
            let inches = Int(heightInches) % 12
            return "\(feet)'\(inches)\""
        } else {
            return "\(Int(height)) cm"
        }
    }
    
    /// Format weight in kg
    var formattedWeight: String? {
        guard let weight = weight else { return nil }
        
        if preferredUnits == "imperial" {
            // Convert to pounds
            let pounds = weight * 2.20462
            return String(format: "%.1f lbs", pounds)
        } else {
            return String(format: "%.1f kg", weight)
        }
    }
}

/// Runner profile for preview purposes
struct RunnerProfile: Codable {
    let height: Int?
    let weight: Double?
    let primaryGoal: String?
    let typicalMileage: Double?
    let preferredRunningDays: [String]?
    let recentInjuries: String?
}

/// Strava connection for preview purposes
struct StravaConnection: Codable {
    let connected: Bool
    let athleteId: String?
    let lastSync: Date?
} 