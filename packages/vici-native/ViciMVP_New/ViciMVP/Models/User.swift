import Foundation

/// A user in the Vici system, aligning with TypeScript User interface
struct User: Codable, Identifiable {
    // Core identifiers and properties
    var id: String
    var email: String
    var name: String?
    var createdAt: Date?
    var updatedAt: Date?
    
    // Related entities
    var settings: UserSettings?
    var runnerProfile: RunnerProfile?
    var stravaConnection: StravaConnection?
    
    // CodingKeys to map between Swift and API JSON
    enum CodingKeys: String, CodingKey {
        case id
        case email
        case name
        case createdAt
        case updatedAt
        case settings
        case runnerProfile
        case stravaConnection
    }
    
    // Computed properties for the UI
    var isStravaConnected: Bool {
        return stravaConnection?.connected == true
    }
    
    var profilePictureUrl: String? {
        // If we have a Strava connection, check for profile picture
        if let athleteInfo = stravaConnection?.athleteInfo as? [String: Any],
           let profile = athleteInfo["profile"] as? String {
            return profile
        }
        return nil
    }
    
    var displayName: String {
        if let name = name, !name.isEmpty {
            return name
        }
        return email.components(separatedBy: "@").first ?? email
    }
    
    var experienceLevel: String {
        return runnerProfile?.experienceLevel.rawValue ?? "Not set"
    }
    
    // Preview data for development and testing
    static var previewUser: User {
        User(
            id: "user123",
            email: "runner@example.com",
            name: "Test Runner",
            createdAt: Date(),
            updatedAt: Date(),
            settings: UserSettings(
                id: "settings123",
                userId: "user123",
                distanceUnit: .km,
                language: "en",
                coachingStyle: .balanced,
                notificationPreferences: NotificationPreferences(
                    id: "notif123",
                    email: true,
                    push: true,
                    sms: false,
                    inApp: true
                ),
                privacyDataSharing: true
            ),
            runnerProfile: RunnerProfile(
                id: "profile123",
                userId: "user123",
                experienceLevel: .intermediate,
                weeklyRunningFrequency: 4,
                weeklyRunningDistanceKm: 40,
                typicalPaceMinPerKm: 5 * 60,
                recentRaces: [],
                primaryGoal: "Run a marathon",
                injuries: [],
                maxHR: 185,
                restingHR: 65,
                dateOfBirth: Calendar.current.date(byAdding: .year, value: -30, to: Date()),
                weight: 70.5,
                height: 175.0,
                sex: .preferNotToSay
            ),
            stravaConnection: nil
        )
    }
}

/// User settings for preferences and app configuration
struct UserSettings: Codable, Identifiable {
    var id: String
    var userId: String
    var distanceUnit: DistanceUnit
    var language: String // e.g., "en", "fr", etc.
    var coachingStyle: CoachingStyle
    var notificationPreferences: NotificationPreferences
    var privacyDataSharing: Bool
    
    // Enums for settings options
    enum DistanceUnit: String, Codable {
        case km
        case mi
    }
    
    enum CoachingStyle: String, Codable {
        case balanced = "Balanced"
        case aggressive = "Aggressive"
        case conservative = "Conservative"
    }
    
    // CodingKeys to map between Swift and API JSON
    enum CodingKeys: String, CodingKey {
        case id
        case userId
        case distanceUnit
        case language
        case coachingStyle
        case notificationPreferences
        case privacyDataSharing
    }
}

/// Notification preferences for the user
struct NotificationPreferences: Codable, Identifiable {
    var id: String
    var email: Bool
    var push: Bool
    var sms: Bool
    var inApp: Bool
    
    // CodingKeys to map between Swift and API JSON
    enum CodingKeys: String, CodingKey {
        case id
        case email
        case push
        case sms
        case inApp
    }
}

/// Running profile with athletic background info
struct RunnerProfile: Codable, Identifiable {
    var id: String
    var userId: String
    var experienceLevel: ExperienceLevel
    var weeklyRunningFrequency: Int?
    var weeklyRunningDistanceKm: Int?
    var typicalPaceMinPerKm: Int? // Seconds per km
    var recentRaces: [RecentRace]?
    var primaryGoal: String?
    var injuries: [Injury]?
    var maxHR: Int?
    var restingHR: Int?
    var dateOfBirth: Date?
    var weight: Double? // in kg
    var height: Double? // in cm
    var sex: Sex?
    
    // Enums for runner profile options
    enum ExperienceLevel: String, Codable {
        case beginner = "Beginner"
        case intermediate = "Intermediate"
        case advanced = "Advanced"
        case elite = "Elite"
    }
    
    enum Sex: String, Codable {
        case male = "Male"
        case female = "Female"
        case other = "Other"
        case preferNotToSay = "PreferNotToSay"
    }
    
    // CodingKeys to map between Swift and API JSON
    enum CodingKeys: String, CodingKey {
        case id
        case userId
        case experienceLevel
        case weeklyRunningFrequency
        case weeklyRunningDistanceKm
        case typicalPaceMinPerKm
        case recentRaces
        case primaryGoal
        case injuries
        case maxHR
        case restingHR
        case dateOfBirth
        case weight
        case height
        case sex
    }
}

/// Information about a recent race the user has run
struct RecentRace: Codable, Identifiable {
    var id: String
    var userId: String
    var runnerProfileId: String
    var name: String
    var distance: Double // in meters
    var date: Date
    var finishTime: Int? // in seconds
    
    // CodingKeys to map between Swift and API JSON
    enum CodingKeys: String, CodingKey {
        case id
        case userId
        case runnerProfileId
        case name
        case distance
        case date
        case finishTime
    }
}

/// Information about a user's injury
struct Injury: Codable, Identifiable {
    var id: String
    var userId: String
    var runnerProfileId: String
    var type: String
    var severity: InjurySeverity
    var startDate: Date
    var endDate: Date?
    var notes: String?
    var current: Bool
    
    enum InjurySeverity: String, Codable {
        case minor = "Minor"
        case moderate = "Moderate"
        case severe = "Severe"
    }
    
    // CodingKeys to map between Swift and API JSON
    enum CodingKeys: String, CodingKey {
        case id
        case userId
        case runnerProfileId
        case type
        case severity
        case startDate
        case endDate
        case notes
        case current
    }
}

/// Information about a connection to Strava
struct StravaConnection: Codable, Identifiable {
    var id: String
    var userId: String
    var stravaUserId: String
    var accessToken: String
    var refreshToken: String
    var tokenExpiresAt: Date
    var athleteInfo: [String: Any]?
    var scopes: [String]
    var connected: Bool
    var lastSyncDate: Date?
    
    // CodingKeys to map between Swift and API JSON
    enum CodingKeys: String, CodingKey {
        case id
        case userId
        case stravaUserId
        case accessToken
        case refreshToken
        case tokenExpiresAt
        case athleteInfo
        case scopes
        case connected
        case lastSyncDate
    }
    
    // Custom decoder for athleteInfo JSON
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        id = try container.decode(String.self, forKey: .id)
        userId = try container.decode(String.self, forKey: .userId)
        stravaUserId = try container.decode(String.self, forKey: .stravaUserId)
        accessToken = try container.decode(String.self, forKey: .accessToken)
        refreshToken = try container.decode(String.self, forKey: .refreshToken)
        tokenExpiresAt = try container.decode(Date.self, forKey: .tokenExpiresAt)
        scopes = try container.decode([String].self, forKey: .scopes)
        connected = try container.decode(Bool.self, forKey: .connected)
        lastSyncDate = try container.decodeIfPresent(Date.self, forKey: .lastSyncDate)
        
        // Handle athleteInfo as a dictionary
        if let athleteInfoData = try container.decodeIfPresent(Data.self, forKey: .athleteInfo) {
            athleteInfo = try JSONSerialization.jsonObject(with: athleteInfoData) as? [String: Any]
        } else {
            athleteInfo = nil
        }
    }
    
    // Custom encoder for athleteInfo JSON
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        
        try container.encode(id, forKey: .id)
        try container.encode(userId, forKey: .userId)
        try container.encode(stravaUserId, forKey: .stravaUserId)
        try container.encode(accessToken, forKey: .accessToken)
        try container.encode(refreshToken, forKey: .refreshToken)
        try container.encode(tokenExpiresAt, forKey: .tokenExpiresAt)
        try container.encode(scopes, forKey: .scopes)
        try container.encode(connected, forKey: .connected)
        try container.encodeIfPresent(lastSyncDate, forKey: .lastSyncDate)
        
        // Handle athleteInfo as a dictionary
        if let athleteInfo = athleteInfo,
           let athleteInfoData = try? JSONSerialization.data(withJSONObject: athleteInfo) {
            try container.encode(athleteInfoData, forKey: .athleteInfo)
        }
    }
}

// MARK: - Date Conversion Extensions

extension User {
    /// Creates a User from TypeScript-compatible ISO8601 date strings
    static func fromTypeScript(
        id: String,
        email: String,
        name: String?,
        createdAt: String?,
        updatedAt: String?,
        settings: UserSettings,
        runnerProfile: RunnerProfile?,
        stravaConnection: StravaConnection?
    ) -> User? {
        let dateFormatter = ISO8601DateFormatter()
        
        let createdAtDate = createdAt != nil ? dateFormatter.date(from: createdAt!) : nil
        let updatedAtDate = updatedAt != nil ? dateFormatter.date(from: updatedAt!) : nil
        
        return User(
            id: id,
            email: email,
            name: name,
            createdAt: createdAtDate,
            updatedAt: updatedAtDate,
            settings: settings,
            runnerProfile: runnerProfile,
            stravaConnection: stravaConnection
        )
    }
} 