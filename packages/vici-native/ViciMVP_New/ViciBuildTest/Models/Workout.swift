import Foundation

/// A workout in the Vici system, aligning with TypeScript Workout interface
struct Workout: Codable, Identifiable, Hashable {
    var id: String
    var planId: String?
    var userId: String
    var name: String
    var description: String?
    var scheduledDate: Date
    var completed: Bool
    var completedDate: Date?
    var duration: Int?  // Duration in minutes
    var distance: Double?  // Distance in meters
    var activities: [Activity]?
    var createdAt: Date?
    var updatedAt: Date?
    
    // CodingKeys to map between Swift and API JSON
    enum CodingKeys: String, CodingKey {
        case id
        case planId
        case userId
        case name
        case description
        case scheduledDate
        case completed
        case completedDate
        case duration
        case distance
        case activities
        case createdAt
        case updatedAt
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
                planId: "plan123",
                userId: "user123",
                name: "Easy Run",
                description: "An easy recovery run to build endurance",
                scheduledDate: today,
                completed: false,
                completedDate: nil,
                duration: 30,
                distance: 5000,
                activities: [],
                createdAt: today,
                updatedAt: today
            ),
            Workout(
                id: "workout2",
                planId: "plan123",
                userId: "user123",
                name: "Interval Training",
                description: "High-intensity intervals to improve speed",
                scheduledDate: tomorrow,
                completed: false,
                completedDate: nil,
                duration: 45,
                distance: 8000,
                activities: [],
                createdAt: today,
                updatedAt: today
            ),
            Workout(
                id: "workout3",
                planId: "plan123",
                userId: "user123",
                name: "Long Run",
                description: "Building endurance with a longer distance",
                scheduledDate: dayAfterTomorrow,
                completed: false,
                completedDate: nil,
                duration: 90,
                distance: 15000,
                activities: [],
                createdAt: today,
                updatedAt: today
            ),
            Workout(
                id: "workout4",
                planId: "plan123",
                userId: "user123",
                name: "Recovery Run",
                description: "Easy recovery run",
                scheduledDate: yesterday,
                completed: true,
                completedDate: yesterday,
                duration: 25,
                distance: 4000,
                activities: [],
                createdAt: yesterday,
                updatedAt: yesterday
            )
        ]
    }
}

// MARK: - Date Conversion Extensions

extension Workout {
    /// Creates a Workout from TypeScript-compatible ISO8601 date strings
    static func fromTypeScript(
        id: String,
        planId: String?,
        userId: String,
        name: String,
        description: String?,
        scheduledDate: String,
        completed: Bool,
        completedDate: String?,
        duration: Int?,
        distance: Double?,
        activities: [Activity]?,
        createdAt: String?,
        updatedAt: String?
    ) -> Workout? {
        let dateFormatter = ISO8601DateFormatter()
        
        guard let scheduledDateObj = dateFormatter.date(from: scheduledDate) else {
            return nil
        }
        
        let completedDateObj = completedDate != nil ? dateFormatter.date(from: completedDate!) : nil
        let createdAtDate = createdAt != nil ? dateFormatter.date(from: createdAt!) : nil
        let updatedAtDate = updatedAt != nil ? dateFormatter.date(from: updatedAt!) : nil
        
        return Workout(
            id: id,
            planId: planId,
            userId: userId,
            name: name,
            description: description,
            scheduledDate: scheduledDateObj,
            completed: completed,
            completedDate: completedDateObj,
            duration: duration,
            distance: distance,
            activities: activities,
            createdAt: createdAtDate,
            updatedAt: updatedAtDate
        )
    }
} 