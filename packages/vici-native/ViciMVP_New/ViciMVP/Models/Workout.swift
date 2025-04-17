import Foundation

/// A workout in the Vici system, aligning with TypeScript Workout interface
struct Workout: Codable, Identifiable, Hashable {
    var id: String
    var trainingPlanId: String
    var userId: String
    var title: String
    var description: String?
    var date: Date
    var status: WorkoutStatus
    var workoutType: WorkoutType
    var scheduledDuration: Int?  // Duration in seconds
    var scheduledDistance: Double?  // Distance in meters
    var tags: [String]?
    var notes: String?
    var goal: String?
    var segments: [WorkoutSegment]?
    
    // Enums for workout status and type
    enum WorkoutStatus: String, Codable {
        case upcoming
        case inProgress
        case completed
        case missed
        case cancelled
    }
    
    enum WorkoutType: String, Codable {
        case run
        case recovery
        case longRun
        case tempo
        case interval
        case intervalWorkout = "interval_workout"
        case easy
        case hills
        case fartlek
        case progression
        case race
        case crossTraining = "cross_training"
        case walk
        case cycling
        case swimming
        case strength
        case other
    }
    
    // CodingKeys to map between Swift and API JSON
    enum CodingKeys: String, CodingKey {
        case id
        case trainingPlanId
        case userId
        case title
        case description
        case date
        case status
        case workoutType
        case scheduledDuration
        case scheduledDistance
        case tags
        case notes
        case goal
        case segments
    }
    
    // Hashable conformance
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
    
    static func == (lhs: Workout, rhs: Workout) -> Bool {
        return lhs.id == rhs.id
    }
    
    // Preview data for development and testing
    static var previewWorkouts: [Workout] {
        let calendar = Calendar.current
        let today = Date()
        let tomorrow = calendar.date(byAdding: .day, value: 1, to: today)!
        let dayAfterTomorrow = calendar.date(byAdding: .day, value: 2, to: today)!
        let yesterday = calendar.date(byAdding: .day, value: -1, to: today)!
        
        return [
            Workout(
                id: "workout1",
                trainingPlanId: "plan123",
                userId: "user123",
                title: "Easy Run",
                description: "An easy recovery run to build endurance",
                date: today,
                status: .upcoming,
                workoutType: .run,
                scheduledDuration: 30,
                scheduledDistance: 5000,
                tags: [],
                notes: nil,
                goal: nil,
                segments: [],
                createdAt: today,
                updatedAt: today
            ),
            Workout(
                id: "workout2",
                trainingPlanId: "plan123",
                userId: "user123",
                title: "Interval Training",
                description: "High-intensity intervals to improve speed",
                date: tomorrow,
                status: .upcoming,
                workoutType: .interval,
                scheduledDuration: 45,
                scheduledDistance: 8000,
                tags: [],
                notes: nil,
                goal: nil,
                segments: [],
                createdAt: today,
                updatedAt: today
            ),
            Workout(
                id: "workout3",
                trainingPlanId: "plan123",
                userId: "user123",
                title: "Long Run",
                description: "Building endurance with a longer distance",
                date: dayAfterTomorrow,
                status: .upcoming,
                workoutType: .longRun,
                scheduledDuration: 90,
                scheduledDistance: 15000,
                tags: [],
                notes: nil,
                goal: nil,
                segments: [],
                createdAt: today,
                updatedAt: today
            ),
            Workout(
                id: "workout4",
                trainingPlanId: "plan123",
                userId: "user123",
                title: "Recovery Run",
                description: "Easy recovery run",
                date: yesterday,
                status: .completed,
                workoutType: .recovery,
                scheduledDuration: 25,
                scheduledDistance: 4000,
                tags: [],
                notes: nil,
                goal: nil,
                segments: [],
                createdAt: yesterday,
                updatedAt: yesterday
            )
        ]
    }
}

/// A segment of a workout (e.g., warm-up, main set, cool-down)
struct WorkoutSegment: Codable, Identifiable, Hashable {
    var id: String
    var workoutId: String
    var order: Int
    var title: String
    var description: String?
    var duration: Int?  // Duration in seconds
    var distance: Double?  // Distance in meters
    var intensity: WorkoutIntensity
    var targetPace: Int?  // Seconds per kilometer
    var targetHeartRate: Int?
    var targetPower: Int?
    var targetCadence: Int?
    var completed: Bool
    
    enum WorkoutIntensity: String, Codable {
        case recovery
        case easy
        case moderate
        case tempo
        case threshold
        case interval
        case maximal
    }
    
    // CodingKeys to map between Swift and API JSON
    enum CodingKeys: String, CodingKey {
        case id
        case workoutId
        case order
        case title
        case description
        case duration
        case distance
        case intensity
        case targetPace
        case targetHeartRate
        case targetPower
        case targetCadence
        case completed
    }
    
    // Hashable conformance
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
    
    static func == (lhs: WorkoutSegment, rhs: WorkoutSegment) -> Bool {
        return lhs.id == rhs.id
    }
}

// MARK: - Computed Properties

extension Workout {
    /// Format the workout duration as a string (e.g., "45 min")
    var formattedDuration: String {
        guard let duration = scheduledDuration else { return "N/A" }
        
        let hours = duration / 3600
        let minutes = (duration % 3600) / 60
        
        if hours > 0 {
            return "\(hours)h \(minutes)m"
        } else {
            return "\(minutes) min"
        }
    }
    
    /// Format the workout distance as a string (e.g., "5.0 km")
    var formattedDistance: String {
        guard let distance = scheduledDistance else { return "N/A" }
        
        let kilometers = distance / 1000.0
        return String(format: "%.1f km", kilometers)
    }
    
    /// Get the workout type as a user-friendly string
    var workoutTypeDisplay: String {
        switch workoutType {
        case .run:
            return "Run"
        case .recovery:
            return "Recovery Run"
        case .longRun:
            return "Long Run"
        case .tempo:
            return "Tempo Run"
        case .interval, .intervalWorkout:
            return "Interval Workout"
        case .easy:
            return "Easy Run"
        case .hills:
            return "Hill Workout"
        case .fartlek:
            return "Fartlek"
        case .progression:
            return "Progression Run"
        case .race:
            return "Race"
        case .crossTraining:
            return "Cross Training"
        case .walk:
            return "Walk"
        case .cycling:
            return "Cycling"
        case .swimming:
            return "Swimming"
        case .strength:
            return "Strength Training"
        case .other:
            return "Other"
        }
    }
}

// MARK: - Date Conversion Extensions

extension Workout {
    /// Creates a Workout from TypeScript-compatible ISO8601 date strings
    static func fromTypeScript(
        id: String,
        trainingPlanId: String?,
        userId: String,
        title: String,
        description: String?,
        date: String,
        status: WorkoutStatus,
        workoutType: WorkoutType,
        scheduledDuration: Int?,
        scheduledDistance: Double?,
        tags: [String]?,
        notes: String?,
        goal: String?,
        segments: [WorkoutSegment]?,
        createdAt: String?,
        updatedAt: String?
    ) -> Workout? {
        let dateFormatter = ISO8601DateFormatter()
        
        guard let dateObj = dateFormatter.date(from: date) else {
            return nil
        }
        
        let createdAtDate = createdAt != nil ? dateFormatter.date(from: createdAt!) : nil
        let updatedAtDate = updatedAt != nil ? dateFormatter.date(from: updatedAt!) : nil
        
        return Workout(
            id: id,
            trainingPlanId: trainingPlanId ?? "",
            userId: userId,
            title: title,
            description: description,
            date: dateObj,
            status: status,
            workoutType: workoutType,
            scheduledDuration: scheduledDuration,
            scheduledDistance: scheduledDistance,
            tags: tags,
            notes: notes,
            goal: goal,
            segments: segments,
            createdAt: createdAtDate,
            updatedAt: updatedAtDate
        )
    }
} 