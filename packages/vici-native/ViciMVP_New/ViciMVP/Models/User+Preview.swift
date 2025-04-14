import Foundation

// MARK: - Preview Extensions
// These extensions provide sample data for SwiftUI previews
// They should NOT be used in production code

extension User {
    /// Sample user for preview purposes
    static var previewUser: User {
        User(
            id: "preview-user-1",
            email: "runner@example.com",
            name: "Jane Runner",
            profilePictureUrl: nil,
            dateOfBirth: Calendar.current.date(from: DateComponents(year: 1990, month: 5, day: 15)),
            gender: "female",
            experienceLevel: "intermediate",
            runnerProfile: RunnerProfile(
                height: 170,
                weight: 62,
                primaryGoal: "Improve my 10K time",
                typicalMileage: 30,
                preferredRunningDays: ["Monday", "Wednesday", "Friday", "Sunday"],
                recentInjuries: nil
            ),
            stravaConnection: StravaConnection(
                connected: true,
                athleteId: "strava-12345678",
                lastSync: Date().addingTimeInterval(-3600)
            ),
            createdAt: Date().addingTimeInterval(-86400 * 30),
            updatedAt: Date().addingTimeInterval(-86400)
        )
    }
    
    /// Sample user without Strava connection for preview purposes
    static var previewUserNoStrava: User {
        var user = previewUser
        user.stravaConnection = StravaConnection(
            connected: false,
            athleteId: nil,
            lastSync: nil
        )
        return user
    }
    
    /// Sample new user with minimal profile for preview purposes
    static var previewNewUser: User {
        User(
            id: "preview-user-2",
            email: "newrunner@example.com",
            name: "John Newbie",
            profilePictureUrl: nil,
            dateOfBirth: nil,
            gender: "male",
            experienceLevel: "beginner",
            runnerProfile: nil,
            stravaConnection: nil,
            createdAt: Date(),
            updatedAt: Date()
        )
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