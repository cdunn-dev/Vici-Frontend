import Foundation

struct MockData {
    // MARK: - User Mock Data
    static let sampleUser = User(
        id: "user123",
        email: "test@example.com",
        name: "John Doe",
        createdAt: Date(),
        updatedAt: Date(),
        settings: sampleUserSettings,
        runnerProfile: sampleRunnerProfile,
        stravaConnection: nil
    )
    
    // MARK: - User Settings Mock Data
    static let sampleUserSettings = UserSettings(
        id: "settings123",
        userId: "user123",
        distanceUnit: .km,
        language: "en",
        coachingStyle: .balanced,
        notificationPreferences: sampleNotificationPreferences,
        privacyDataSharing: true
    )
    
    // MARK: - Notification Preferences Mock Data
    static let sampleNotificationPreferences = NotificationPreferences(
        id: "notif123",
        email: true,
        push: true,
        sms: false,
        inApp: true
    )
    
    // MARK: - Runner Profile Mock Data
    static let sampleRunnerProfile = RunnerProfile(
        id: "profile123",
        userId: "user123",
        experienceLevel: .intermediate,
        weeklyRunningFrequency: 4,
        weeklyRunningDistanceKm: 30,
        typicalPaceMinPerKm: 330, // 5:30 min/km
        recentRaces: [sampleRecentRace],
        primaryGoal: "Run a marathon",
        injuries: [sampleInjury],
        maxHR: 185,
        restingHR: 60,
        dateOfBirth: Calendar.current.date(from: DateComponents(year: 1990, month: 1, day: 1)),
        weight: 75.0,
        height: 180.0,
        sex: .male
    )
    
    // MARK: - Recent Race Mock Data
    static let sampleRecentRace = RecentRace(
        id: "race123",
        userId: "user123",
        runnerProfileId: "profile123",
        name: "Local 10K",
        distance: 10000,
        date: Calendar.current.date(byAdding: .month, value: -3, to: Date())!,
        finishTime: 3000 // 50 minutes
    )
    
    // MARK: - Injury Mock Data
    static let sampleInjury = Injury(
        id: "injury123",
        userId: "user123",
        runnerProfileId: "profile123",
        type: "Ankle sprain",
        severity: .moderate,
        startDate: Calendar.current.date(byAdding: .month, value: -6, to: Date())!,
        endDate: Calendar.current.date(byAdding: .month, value: -5, to: Date()),
        notes: "Right ankle, happened during trail run",
        current: false
    )
    
    // MARK: - Training Plan Mock Data
    static let sampleTrainingPlans = [
        TrainingPlan(
            id: "plan1",
            userId: "user123",
            name: "5K Training Plan",
            description: "A beginner-friendly plan to prepare for a 5K race",
            goal: "Complete a 5K race in under 30 minutes",
            startDate: Date(),
            endDate: Date().addingTimeInterval(60 * 86400), // 60 days later
            isActive: true,
            isCompleted: false,
            createdAt: Date(),
            updatedAt: Date(),
            workouts: sampleWorkouts
        ),
        TrainingPlan(
            id: "plan2",
            userId: "user123",
            name: "Half Marathon Training",
            description: "Intermediate plan for half marathon preparation",
            goal: "Finish a half marathon in under 2 hours",
            startDate: Date(),
            endDate: Date().addingTimeInterval(90 * 86400), // 90 days later
            isActive: false,
            isCompleted: false,
            createdAt: Date(),
            updatedAt: Date(),
            workouts: nil
        )
    ]
    
    // MARK: - Workout Mock Data
    static let sampleWorkouts = [
        Workout(
            id: "workout1",
            planId: "plan1",
            userId: "user123",
            name: "Easy Run",
            description: "Light jog to build endurance",
            scheduledDate: Date().addingTimeInterval(86400), // Tomorrow
            completed: false,
            completedDate: nil,
            duration: 30,  // 30 minutes
            distance: 5000, // 5 km
            activities: nil,
            createdAt: Date(),
            updatedAt: Date()
        ),
        Workout(
            id: "workout2",
            planId: "plan1",
            userId: "user123",
            name: "Interval Training",
            description: "4x400m sprints with 2 min rest",
            scheduledDate: Date().addingTimeInterval(2 * 86400), // Day after tomorrow
            completed: false,
            completedDate: nil,
            duration: 40, // 40 minutes
            distance: 4000, // 4 km
            activities: nil,
            createdAt: Date(),
            updatedAt: Date()
        ),
        Workout(
            id: "workout3",
            planId: "plan1",
            userId: "user123",
            name: "Long Run",
            description: "Slow-paced endurance building run",
            scheduledDate: Date().addingTimeInterval(5 * 86400), // 5 days from now
            completed: false,
            completedDate: nil,
            duration: 60, // 60 minutes
            distance: 10000, // 10 km
            activities: nil,
            createdAt: Date(),
            updatedAt: Date()
        )
    ]
    
    // MARK: - Activity Mock Data
    static let sampleActivities = [
        Activity(
            id: "activity1",
            userId: "user123",
            workoutId: "workout1",
            type: "run",
            name: "Morning Run",
            description: "Nice and easy run around the park",
            startDate: Date().addingTimeInterval(-86400), // Yesterday
            endDate: Date().addingTimeInterval(-86400 + 1800), // 30 min later
            duration: 1800, // 30 minutes in seconds
            distance: 5200, // 5.2 km
            avgHeartRate: 145,
            maxHeartRate: 165,
            avgPace: 346.0, // 5:46 min/km
            calories: 320,
            elevationGain: 58,
            source: "manual",
            polyline: nil,
            createdAt: Date(),
            updatedAt: Date()
        ),
        Activity(
            id: "activity2",
            userId: "user123",
            workoutId: "workout2",
            type: "run",
            name: "Speed Work",
            description: "Intervals at the track",
            startDate: Date().addingTimeInterval(-2 * 86400), // 2 days ago
            endDate: Date().addingTimeInterval(-2 * 86400 + 2400), // 40 min later
            duration: 2400, // 40 minutes in seconds
            distance: 4200, // 4.2 km
            avgHeartRate: 155,
            maxHeartRate: 175,
            avgPace: 343.0, // 5:43 min/km
            calories: 460,
            elevationGain: 45,
            source: "manual",
            polyline: nil,
            createdAt: Date(),
            updatedAt: Date()
        )
    ]
} 