import Foundation

class TrainingService {
    static let shared = TrainingService()
    
    private let apiClient = APIClient.shared
    
    private init() {}
    
    // MARK: - Training Plans
    
    func getTrainingPlans() async throws -> [TrainingPlan] {
        return try await apiClient.get(endpoint: "training/plans")
    }
    
    func getTrainingPlan(id: Int) async throws -> TrainingPlan {
        return try await apiClient.get(endpoint: "training/plans/\(id)")
    }
    
    func getActiveTrainingPlan() async throws -> TrainingPlan? {
        struct ActivePlanResponse: Codable {
            let plan: TrainingPlan?
        }
        
        let response: ActivePlanResponse = try await apiClient.get(endpoint: "training/plans/active")
        return response.plan
    }
    
    func createTrainingPlan(name: String, description: String, goal: String, goalType: GoalType, startDate: Date, endDate: Date) async throws -> TrainingPlan {
        let dateFormatter = ISO8601DateFormatter()
        
        let parameters: [String: Any] = [
            "name": name,
            "description": description,
            "goal": goal,
            "goalType": goalType.rawValue,
            "startDate": dateFormatter.string(from: startDate),
            "endDate": dateFormatter.string(from: endDate)
        ]
        
        return try await apiClient.post(endpoint: "training/plans", parameters: parameters)
    }
    
    func updateTrainingPlan(id: Int, name: String? = nil, description: String? = nil, goal: String? = nil, goalType: GoalType? = nil) async throws -> TrainingPlan {
        var parameters: [String: Any] = [:]
        
        if let name = name {
            parameters["name"] = name
        }
        
        if let description = description {
            parameters["description"] = description
        }
        
        if let goal = goal {
            parameters["goal"] = goal
        }
        
        if let goalType = goalType {
            parameters["goalType"] = goalType.rawValue
        }
        
        return try await apiClient.put(endpoint: "training/plans/\(id)", parameters: parameters)
    }
    
    func deleteTrainingPlan(id: Int) async throws -> Bool {
        struct DeleteResponse: Codable {
            let success: Bool
        }
        
        let response: DeleteResponse = try await apiClient.delete(endpoint: "training/plans/\(id)")
        return response.success
    }
    
    // MARK: - Workouts
    
    func getWorkouts(planId: Int? = nil) async throws -> [Workout] {
        let endpoint = planId != nil ? "training/plans/\(planId!)/workouts" : "training/workouts"
        return try await apiClient.get(endpoint: endpoint)
    }
    
    func getWorkout(id: Int, planId: Int? = nil) async throws -> Workout {
        let endpoint = planId != nil ? "training/plans/\(planId!)/workouts/\(id)" : "training/workouts/\(id)"
        return try await apiClient.get(endpoint: endpoint)
    }
    
    func getTodaysWorkout() async throws -> Workout? {
        struct TodayWorkoutResponse: Codable {
            let workout: Workout?
        }
        
        let response: TodayWorkoutResponse = try await apiClient.get(endpoint: "training/plans/today")
        return response.workout
    }
    
    func createWorkout(title: String, description: String, date: Date, duration: TimeInterval? = nil, distance: Double? = nil, workoutType: WorkoutType, planId: Int? = nil) async throws -> Workout {
        let dateFormatter = ISO8601DateFormatter()
        
        var parameters: [String: Any] = [
            "title": title,
            "description": description,
            "date": dateFormatter.string(from: date),
            "workoutType": workoutType.rawValue
        ]
        
        if let duration = duration {
            parameters["duration"] = duration
        }
        
        if let distance = distance {
            parameters["distance"] = distance
        }
        
        let endpoint = planId != nil ? "training/plans/\(planId!)/workouts" : "training/workouts"
        return try await apiClient.post(endpoint: endpoint, parameters: parameters)
    }
    
    func updateWorkout(id: Int, title: String? = nil, description: String? = nil, date: Date? = nil, duration: TimeInterval? = nil, distance: Double? = nil, workoutType: WorkoutType? = nil, planId: Int? = nil) async throws -> Workout {
        let dateFormatter = ISO8601DateFormatter()
        var parameters: [String: Any] = [:]
        
        if let title = title {
            parameters["title"] = title
        }
        
        if let description = description {
            parameters["description"] = description
        }
        
        if let date = date {
            parameters["date"] = dateFormatter.string(from: date)
        }
        
        if let duration = duration {
            parameters["duration"] = duration
        }
        
        if let distance = distance {
            parameters["distance"] = distance
        }
        
        if let workoutType = workoutType {
            parameters["workoutType"] = workoutType.rawValue
        }
        
        let endpoint = planId != nil ? "training/plans/\(planId!)/workouts/\(id)" : "training/workouts/\(id)"
        return try await apiClient.put(endpoint: endpoint, parameters: parameters)
    }
    
    func deleteWorkout(id: Int, planId: Int? = nil) async throws -> Bool {
        struct DeleteResponse: Codable {
            let success: Bool
        }
        
        let endpoint = planId != nil ? "training/plans/\(planId!)/workouts/\(id)" : "training/workouts/\(id)"
        let response: DeleteResponse = try await apiClient.delete(endpoint: endpoint)
        return response.success
    }
    
    func completeWorkout(id: Int, completedDistance: Double? = nil, completedDuration: TimeInterval? = nil, notes: String? = nil, planId: Int? = nil) async throws -> Workout {
        var parameters: [String: Any] = [:]
        
        if let completedDistance = completedDistance {
            parameters["completedDistance"] = completedDistance
        }
        
        if let completedDuration = completedDuration {
            parameters["completedDuration"] = completedDuration
        }
        
        if let notes = notes {
            parameters["notes"] = notes
        }
        
        let endpoint = planId != nil ? "training/plans/\(planId!)/workouts/\(id)/complete" : "training/workouts/\(id)/complete"
        return try await apiClient.post(endpoint: endpoint, parameters: parameters)
    }
    
    // MARK: - Activities
    
    func getActivities() async throws -> [Activity] {
        return try await apiClient.get(endpoint: "activities")
    }
    
    func getActivity(id: Int) async throws -> Activity {
        return try await apiClient.get(endpoint: "activities/\(id)")
    }
    
    func createActivity(name: String, activityType: ActivityType, startDate: Date, endDate: Date, distance: Double, duration: TimeInterval, elevationGain: Double? = nil, avgHeartRate: Double? = nil, maxHeartRate: Double? = nil, avgPace: Double? = nil, workoutId: Int? = nil) async throws -> Activity {
        let dateFormatter = ISO8601DateFormatter()
        
        var parameters: [String: Any] = [
            "name": name,
            "activityType": activityType.rawValue,
            "startDate": dateFormatter.string(from: startDate),
            "endDate": dateFormatter.string(from: endDate),
            "distance": distance,
            "duration": duration
        ]
        
        if let elevationGain = elevationGain {
            parameters["elevationGain"] = elevationGain
        }
        
        if let avgHeartRate = avgHeartRate {
            parameters["avgHeartRate"] = avgHeartRate
        }
        
        if let maxHeartRate = maxHeartRate {
            parameters["maxHeartRate"] = maxHeartRate
        }
        
        if let avgPace = avgPace {
            parameters["avgPace"] = avgPace
        }
        
        if let workoutId = workoutId {
            parameters["workoutId"] = workoutId
        }
        
        return try await apiClient.post(endpoint: "activities", parameters: parameters)
    }
    
    func updateActivity(id: Int, name: String? = nil, distance: Double? = nil, duration: TimeInterval? = nil) async throws -> Activity {
        var parameters: [String: Any] = [:]
        
        if let name = name {
            parameters["name"] = name
        }
        
        if let distance = distance {
            parameters["distance"] = distance
        }
        
        if let duration = duration {
            parameters["duration"] = duration
        }
        
        return try await apiClient.put(endpoint: "activities/\(id)", parameters: parameters)
    }
    
    func deleteActivity(id: Int) async throws -> Bool {
        struct DeleteResponse: Codable {
            let success: Bool
        }
        
        let response: DeleteResponse = try await apiClient.delete(endpoint: "activities/\(id)")
        return response.success
    }
    
    // MARK: - AI Coaching
    
    func askVici(planId: Int, question: String) async throws -> String {
        struct AskViciResponse: Codable {
            let response: String
        }
        
        let parameters: [String: Any] = [
            "question": question
        ]
        
        let response: AskViciResponse = try await apiClient.post(endpoint: "training/plans/\(planId)/ask-vici", parameters: parameters)
        return response.response
    }
    
    func approveViciChanges(planId: Int) async throws -> TrainingPlan {
        return try await apiClient.post(endpoint: "training/plans/\(planId)/approve-changes", parameters: nil)
    }
} 