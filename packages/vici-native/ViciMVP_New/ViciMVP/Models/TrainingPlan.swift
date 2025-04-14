import Foundation

/// A training plan in the Vici system, aligning with TypeScript TrainingPlan interface
struct TrainingPlan: Codable, Identifiable, Hashable {
    var id: String
    var userId: String
    var name: String
    var description: String?
    var goal: String?
    var startDate: Date
    var endDate: Date
    var isActive: Bool
    var isCompleted: Bool
    var createdAt: Date?
    var updatedAt: Date?
    var workouts: [Workout]?
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId
        case name
        case description
        case goal
        case startDate
        case endDate
        case isActive
        case isCompleted
        case createdAt
        case updatedAt
        case workouts
    }
    
    // Hashable conformance
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
    
    static func == (lhs: TrainingPlan, rhs: TrainingPlan) -> Bool {
        return lhs.id == rhs.id
    }
}

// MARK: - Date Conversion Extensions

extension TrainingPlan {
    /// Creates a TrainingPlan from TypeScript-compatible ISO8601 date strings
    static func fromTypeScript(
        id: String,
        userId: String,
        name: String,
        description: String?,
        goal: String?,
        startDate: String,
        endDate: String,
        isActive: Bool,
        isCompleted: Bool,
        createdAt: String?,
        updatedAt: String?,
        workouts: [Workout]?
    ) -> TrainingPlan? {
        let dateFormatter = ISO8601DateFormatter()
        
        guard let startDateObj = dateFormatter.date(from: startDate),
              let endDateObj = dateFormatter.date(from: endDate) else {
            return nil
        }
        
        let createdAtDate = createdAt != nil ? dateFormatter.date(from: createdAt!) : nil
        let updatedAtDate = updatedAt != nil ? dateFormatter.date(from: updatedAt!) : nil
        
        return TrainingPlan(
            id: id,
            userId: userId,
            name: name,
            description: description,
            goal: goal,
            startDate: startDateObj,
            endDate: endDateObj,
            isActive: isActive,
            isCompleted: isCompleted,
            createdAt: createdAtDate,
            updatedAt: updatedAtDate,
            workouts: workouts
        )
    }
    
    // Computed properties for formatted display
    
    var formattedDateRange: String {
        let dateFormatter = DateFormatter()
        dateFormatter.dateStyle = .medium
        dateFormatter.timeStyle = .none
        
        return "\(dateFormatter.string(from: startDate)) - \(dateFormatter.string(from: endDate))"
    }
    
    var durationInWeeks: Int {
        let calendar = Calendar.current
        let components = calendar.dateComponents([.day], from: startDate, to: endDate)
        guard let days = components.day else { return 0 }
        return (days / 7) + (days % 7 > 0 ? 1 : 0)  // Round up to include partial weeks
    }
    
    var completedWorkoutsCount: Int {
        return workouts?.filter { $0.isCompleted }.count ?? 0
    }
    
    var totalWorkoutsCount: Int {
        return workouts?.count ?? 0
    }
    
    var progressPercentage: Double {
        let total = totalWorkoutsCount
        if total == 0 { return 0.0 }
        return Double(completedWorkoutsCount) / Double(total) * 100.0
    }
} 