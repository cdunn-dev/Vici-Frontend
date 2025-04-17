import Foundation

// MARK: - Preview Extensions
// These extensions provide sample data for SwiftUI previews
// They should NOT be used in production code

/// Preview extensions for the User model to help with the transition from mock data
extension User {
    /// Sample user for preview purposes
    static var previewUser: User {
        User(
            id: "user-123",
            email: "runner@example.com",
            name: "Test Runner",
            createdAt: Date(),
            updatedAt: Date(),
            settings: UserSettings(
                id: "settings-123",
                userId: "user-123",
                distanceUnit: .km,
                language: "en",
                coachingStyle: .balanced,
                notificationPreferences: NotificationPreferences(
                    id: "notif-123",
                    email: true,
                    push: true,
                    sms: false,
                    inApp: true
                ),
                privacyDataSharing: true
            ),
            runnerProfile: RunnerProfile(
                id: "profile-123",
                userId: "user-123",
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
    
    /// New user for preview and onboarding state
    static var previewNewUser: User {
        User(
            id: "new-user-123",
            email: "new@example.com",
            name: "New Runner",
            createdAt: Date(),
            updatedAt: Date(),
            settings: UserSettings(
                id: "settings-new",
                userId: "new-user-123",
                distanceUnit: .km,
                language: "en",
                coachingStyle: .balanced,
                notificationPreferences: NotificationPreferences(
                    id: "notif-new",
                    email: true,
                    push: true,
                    sms: false,
                    inApp: true
                ),
                privacyDataSharing: true
            ),
            runnerProfile: nil, // New user hasn't completed profile
            stravaConnection: nil
        )
    }
    
    /// Sample user with Strava connected
    static var previewUserWithStrava: User {
        var user = previewUser
        
        // Add Strava connection
        user.stravaConnection = StravaConnection(
            id: "stravaconn-123",
            userId: "user-123",
            stravaUserId: "strava-user-12345",
            accessToken: "fake-access-token",
            refreshToken: "fake-refresh-token",
            tokenExpiresAt: Calendar.current.date(byAdding: .day, value: 90, to: Date())!,
            athleteInfo: [
                "firstname": "Test",
                "lastname": "Runner",
                "profile": "https://example.com/avatar.jpg",
                "city": "New York",
                "state": "NY",
                "country": "United States"
            ],
            scopes: ["read", "activity:read", "activity:write"],
            connected: true,
            lastSyncDate: Date()
        )
        
        return user
    }
    
    /// Collection of users for preview purposes
    static var previewUsers: [User] {
        [
            // Regular user
            previewUser,
            
            // User with Strava connected
            previewUserWithStrava,
            
            // Beginner runner
            User(
                id: "user-456",
                email: "beginner@example.com",
                name: "Beginner Runner",
                createdAt: Date().addingTimeInterval(-86400 * 30), // 30 days ago
                updatedAt: Date().addingTimeInterval(-86400), // 1 day ago
                settings: UserSettings(
                    id: "settings-456",
                    userId: "user-456",
                    distanceUnit: .mi,
                    language: "en",
                    coachingStyle: .conservative,
                    notificationPreferences: NotificationPreferences(
                        id: "notif-456",
                        email: true,
                        push: false,
                        sms: false,
                        inApp: true
                    ),
                    privacyDataSharing: true
                ),
                runnerProfile: RunnerProfile(
                    id: "profile-456",
                    userId: "user-456",
                    experienceLevel: .beginner,
                    weeklyRunningFrequency: 3,
                    weeklyRunningDistanceKm: 15,
                    typicalPaceMinPerKm: 6 * 60,
                    recentRaces: [],
                    primaryGoal: "Complete first 5K",
                    injuries: [],
                    maxHR: 190,
                    restingHR: 70,
                    dateOfBirth: Calendar.current.date(byAdding: .year, value: -25, to: Date()),
                    weight: 65.0,
                    height: 165.0,
                    sex: .female
                ),
                stravaConnection: nil
            ),
            
            // Advanced runner
            User(
                id: "user-789",
                email: "advanced@example.com",
                name: "Elite Runner",
                createdAt: Date().addingTimeInterval(-86400 * 365), // 1 year ago
                updatedAt: Date().addingTimeInterval(-86400 * 3), // 3 days ago
                settings: UserSettings(
                    id: "settings-789",
                    userId: "user-789",
                    distanceUnit: .km,
                    language: "en",
                    coachingStyle: .aggressive,
                    notificationPreferences: NotificationPreferences(
                        id: "notif-789",
                        email: true,
                        push: true,
                        sms: true,
                        inApp: true
                    ),
                    privacyDataSharing: true
                ),
                runnerProfile: RunnerProfile(
                    id: "profile-789",
                    userId: "user-789",
                    experienceLevel: .advanced,
                    weeklyRunningFrequency: 6,
                    weeklyRunningDistanceKm: 80,
                    typicalPaceMinPerKm: 4 * 60,
                    recentRaces: [
                        RecentRace(
                            id: "race-123",
                            userId: "user-789",
                            runnerProfileId: "profile-789",
                            name: "City Marathon",
                            distance: 42195, // marathon
                            date: Calendar.current.date(byAdding: .month, value: -3, to: Date())!,
                            finishTime: 3 * 3600 + 30 * 60 // 3:30:00
                        ),
                        RecentRace(
                            id: "race-456",
                            userId: "user-789",
                            runnerProfileId: "profile-789",
                            name: "Half Marathon Championship",
                            distance: 21097.5, // half marathon
                            date: Calendar.current.date(byAdding: .month, value: -6, to: Date())!,
                            finishTime: 1 * 3600 + 35 * 60 // 1:35:00
                        )
                    ],
                    primaryGoal: "Boston Marathon Qualification",
                    injuries: [
                        Injury(
                            id: "injury-123",
                            userId: "user-789",
                            runnerProfileId: "profile-789",
                            type: "Ankle Sprain",
                            severity: .moderate,
                            startDate: Calendar.current.date(byAdding: .month, value: -8, to: Date())!,
                            endDate: Calendar.current.date(byAdding: .month, value: -7, to: Date())!,
                            notes: "Right ankle sprain from trail running",
                            current: false
                        )
                    ],
                    maxHR: 182,
                    restingHR: 45,
                    dateOfBirth: Calendar.current.date(byAdding: .year, value: -35, to: Date()),
                    weight: 62.0,
                    height: 172.0,
                    sex: .male
                ),
                stravaConnection: nil
            )
        ]
    }
    
    /// Create a sample profile picture URL for a user
    static func sampleProfilePictureUrl(for userId: String) -> URL? {
        return URL(string: "https://randomuser.me/api/portraits/\(Int(userId.hash % 2) == 0 ? "men" : "women")/\(abs(userId.hash % 70) + 1).jpg")
    }
}

/// Helper extension for formatting user age
extension User {
    /// Calculate age in years from birthdate
    var formattedAge: String? {
        guard let dateOfBirth = runnerProfile?.dateOfBirth else {
            return nil
        }
        
        let calendar = Calendar.current
        let ageComponents = calendar.dateComponents([.year], from: dateOfBirth, to: Date())
        
        if let age = ageComponents.year {
            return "\(age)"
        }
        
        return nil
    }
    
    /// Format height in user-friendly format
    var formattedHeight: String? {
        guard let height = runnerProfile?.height else {
            return nil
        }
        
        return "\(Int(height)) cm"
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