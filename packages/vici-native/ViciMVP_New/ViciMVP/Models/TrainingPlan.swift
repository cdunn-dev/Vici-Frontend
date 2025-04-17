import Foundation

/// A training plan in the Vici system, aligning with TypeScript TrainingPlan interface
struct TrainingPlan: Codable, Identifiable, Hashable {
    var id: String
    var userId: String
    var title: String
    var description: String?
    var status: PlanStatus
    var startDate: Date
    var endDate: Date
    var goalRaceDate: Date?
    var goalRaceDistance: Double?  // in meters
    var goalRaceTime: Int?  // in seconds
    var workouts: [Workout]
    var createdAt: Date?
    var updatedAt: Date?
    var trainingPhases: [TrainingPhase]?
    
    enum PlanStatus: String, Codable {
        case draft
        case active
        case completed
        case archived
    }
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId
        case title
        case description
        case status
        case startDate
        case endDate
        case goalRaceDate
        case goalRaceDistance
        case goalRaceTime
        case workouts
        case createdAt
        case updatedAt
        case trainingPhases
    }
    
    // Hashable conformance
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
    
    static func == (lhs: TrainingPlan, rhs: TrainingPlan) -> Bool {
        return lhs.id == rhs.id
    }
}

/// A phase within a training plan (e.g., base building, strength & speed, peak & taper)
struct TrainingPhase: Codable, Identifiable, Hashable {
    var id: String
    var trainingPlanId: String
    var title: String
    var description: String?
    var startDate: Date
    var endDate: Date
    var order: Int
    var type: PhaseType
    
    enum PhaseType: String, Codable {
        case baseBuilding = "base_building"
        case strengthSpeed = "strength_speed"
        case peakTaper = "peak_taper"
        case recovery
        case maintenance
        case custom
    }
    
    enum CodingKeys: String, CodingKey {
        case id
        case trainingPlanId
        case title
        case description
        case startDate
        case endDate
        case order
        case type
    }
    
    // Hashable conformance
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
    
    static func == (lhs: TrainingPhase, rhs: TrainingPhase) -> Bool {
        return lhs.id == rhs.id
    }
}

// MARK: - Date Conversion Extensions

extension TrainingPlan {
    /// Creates a TrainingPlan from TypeScript-compatible ISO8601 date strings
    static func fromTypeScript(
        id: String,
        userId: String,
        title: String,
        description: String?,
        status: PlanStatus,
        startDate: String,
        endDate: String,
        goalRaceDate: String?,
        goalRaceDistance: Double?,
        goalRaceTime: Int?,
        workouts: [Workout],
        createdAt: String?,
        updatedAt: String?,
        trainingPhases: [TrainingPhase]?
    ) -> TrainingPlan? {
        let dateFormatter = ISO8601DateFormatter()
        
        guard let startDateObj = dateFormatter.date(from: startDate),
              let endDateObj = dateFormatter.date(from: endDate) else {
            return nil
        }
        
        let goalRaceDateObj = goalRaceDate != nil ? dateFormatter.date(from: goalRaceDate!) : nil
        let createdAtDate = createdAt != nil ? dateFormatter.date(from: createdAt!) : nil
        let updatedAtDate = updatedAt != nil ? dateFormatter.date(from: updatedAt!) : nil
        
        return TrainingPlan(
            id: id,
            userId: userId,
            title: title,
            description: description,
            status: status,
            startDate: startDateObj,
            endDate: endDateObj,
            goalRaceDate: goalRaceDateObj,
            goalRaceDistance: goalRaceDistance,
            goalRaceTime: goalRaceTime,
            workouts: workouts,
            createdAt: createdAtDate,
            updatedAt: updatedAtDate,
            trainingPhases: trainingPhases
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
        return workouts.filter { $0.status == .completed }.count
    }
    
    var totalWorkoutsCount: Int {
        return workouts.count
    }
    
    var progressPercentage: Double {
        let total = totalWorkoutsCount
        if total == 0 { return 0.0 }
        return Double(completedWorkoutsCount) / Double(total) * 100.0
    }
    
    // Format the goal race time as a string (e.g., "3:45:30")
    var formattedGoalRaceTime: String? {
        guard let seconds = goalRaceTime else { return nil }
        
        let hours = seconds / 3600
        let minutes = (seconds % 3600) / 60
        let remainingSeconds = seconds % 60
        
        if hours > 0 {
            return String(format: "%d:%02d:%02d", hours, minutes, remainingSeconds)
        } else {
            return String(format: "%d:%02d", minutes, remainingSeconds)
        }
    }
    
    // Format the goal race distance as a string (e.g., "42.2 km")
    var formattedGoalRaceDistance: String? {
        guard let distance = goalRaceDistance else { return nil }
        
        // Convert to kilometers
        let kilometers = distance / 1000.0
        
        // Use common race distance names if applicable
        if abs(kilometers - 5) < 0.1 {
            return "5K"
        } else if abs(kilometers - 10) < 0.1 {
            return "10K"
        } else if abs(kilometers - 21.0975) < 0.1 {
            return "Half Marathon"
        } else if abs(kilometers - 42.195) < 0.1 {
            return "Marathon"
        } else {
            return String(format: "%.1f km", kilometers)
        }
    }
} 