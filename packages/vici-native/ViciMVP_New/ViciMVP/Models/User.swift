import Foundation

struct User: Identifiable, Codable {
    let id: Int
    var name: String
    var email: String
    var bio: String?
    var profileImageURL: String?
    var dateJoined: Date
    var isStravaConnected: Bool = false
    var stravaAthleteId: Int?
    var preferredActivityTypes: [String] = []
    var profile: UserProfile?
    var createdAt: Date
    var updatedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case name
        case email
        case bio
        case profileImageURL = "profile_image_url"
        case dateJoined = "date_joined"
        case isStravaConnected = "is_strava_connected"
        case stravaAthleteId = "strava_athlete_id"
        case preferredActivityTypes = "preferred_activity_types"
        case profile
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

struct UserProfile: Codable {
    var age: Int?
    var weight: Double?
    var height: Double?
    var gender: String?
    var fitnessLevel: String?
    var activityLevels: [String]?
    var preferredSports: [String]?
    var weeklyAvailability: Int?
    var goals: [String]?
    
    enum CodingKeys: String, CodingKey {
        case age
        case weight
        case height
        case gender
        case fitnessLevel = "fitness_level"
        case activityLevels = "activity_levels"
        case preferredSports = "preferred_sports"
        case weeklyAvailability = "weekly_availability"
        case goals
    }
}

// Helper for mock data
extension User {
    static var mock: User {
        User(
            id: 1,
            name: "John Runner",
            email: "john@example.com",
            bio: "I'm a runner and cyclist looking to improve my endurance.",
            profileImageURL: nil,
            dateJoined: Date(),
            isStravaConnected: false,
            stravaAthleteId: nil,
            preferredActivityTypes: ["running", "cycling"],
            profile: UserProfile(
                age: 32,
                weight: 75.0,
                height: 180.0,
                gender: "male",
                fitnessLevel: "intermediate",
                activityLevels: ["running", "cycling"],
                preferredSports: ["running", "cycling", "swimming"],
                weeklyAvailability: 8,
                goals: ["Complete a marathon", "Improve overall fitness"]
            ),
            createdAt: Date(),
            updatedAt: Date()
        )
    }
}
