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