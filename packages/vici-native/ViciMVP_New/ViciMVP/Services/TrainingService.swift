import Foundation
import Combine

/// Service for managing training plans and workouts
class TrainingService {
    // MARK: - Properties
    
    /// Singleton instance
    static let shared = TrainingService()
    
    /// API client for network requests
    private let apiClient: APIClient
    
    // MARK: - Initialization
    
    /// Initialize with an API client
    init(apiClient: APIClient = .shared) {
        self.apiClient = apiClient
    }
    
    // MARK: - Training Plan Methods
    
    /// Get all training plans for the current user
    func getTrainingPlans() -> AnyPublisher<[TrainingPlan], APIError> {
        return apiClient.get(endpoint: "training/plans")
    }
    
    /// Get a specific training plan by ID
    func getTrainingPlan(id: String) -> AnyPublisher<TrainingPlan, APIError> {
        return apiClient.get(endpoint: "training/plans/\(id)")
    }
    
    /// Create a new training plan
    func createTrainingPlan(name: String, sport: String, goal: String, startDate: Date, endDate: Date, description: String? = nil) -> AnyPublisher<TrainingPlan, APIError> {
        let parameters: [String: Any] = [
            "name": name,
            "sport": sport,
            "goal": goal,
            "startDate": ISO8601DateFormatter().string(from: startDate),
            "endDate": ISO8601DateFormatter().string(from: endDate),
            "description": description ?? ""
        ]
        
        return apiClient.post(endpoint: "training/plans", body: parameters)
    }
    
    /// Update an existing training plan
    func updateTrainingPlan(id: String, name: String? = nil, sport: String? = nil, goal: String? = nil, startDate: Date? = nil, endDate: Date? = nil, description: String? = nil) -> AnyPublisher<TrainingPlan, APIError> {
        var parameters: [String: Any] = [:]
        
        if let name = name {
            parameters["name"] = name
        }
        
        if let sport = sport {
            parameters["sport"] = sport
        }
        
        if let goal = goal {
            parameters["goal"] = goal
        }
        
        if let startDate = startDate {
            parameters["startDate"] = ISO8601DateFormatter().string(from: startDate)
        }
        
        if let endDate = endDate {
            parameters["endDate"] = ISO8601DateFormatter().string(from: endDate)
        }
        
        if let description = description {
            parameters["description"] = description
        }
        
        return apiClient.put(endpoint: "training/plans/\(id)", body: parameters)
    }
    
    /// Delete a training plan
    func deleteTrainingPlan(id: String) -> AnyPublisher<Bool, APIError> {
        return apiClient.delete(endpoint: "training/plans/\(id)")
    }
    
    // MARK: - Workout Methods
    
    /// Get all workouts for a training plan
    func getWorkouts(planId: String? = nil) -> AnyPublisher<[Workout], APIError> {
        let endpoint = planId != nil ? "training/plans/\(planId!)/workouts" : "training/workouts"
        return apiClient.get(endpoint: endpoint)
    }
    
    /// Get a specific workout by ID
    func getWorkout(id: String, planId: String? = nil) -> AnyPublisher<Workout, APIError> {
        let endpoint = planId != nil ? "training/plans/\(planId!)/workouts/\(id)" : "training/workouts/\(id)"
        return apiClient.get(endpoint: endpoint)
    }
    
    /// Create a new workout in a training plan
    func createWorkout(name: String, date: Date, type: String, duration: Int, intensity: String, description: String? = nil, planId: String? = nil) -> AnyPublisher<Workout, APIError> {
        var parameters: [String: Any] = [
            "name": name,
            "date": ISO8601DateFormatter().string(from: date),
            "type": type,
            "duration": duration,
            "intensity": intensity
        ]
        
        if let description = description {
            parameters["description"] = description
        }
        
        let endpoint = planId != nil ? "training/plans/\(planId!)/workouts" : "training/workouts"
        return apiClient.post(endpoint: endpoint, body: parameters)
    }
    
    /// Update an existing workout
    func updateWorkout(id: String, name: String? = nil, date: Date? = nil, type: String? = nil, duration: Int? = nil, intensity: String? = nil, description: String? = nil, planId: String? = nil) -> AnyPublisher<Workout, APIError> {
        var parameters: [String: Any] = [:]
        
        if let name = name {
            parameters["name"] = name
        }
        
        if let date = date {
            parameters["date"] = ISO8601DateFormatter().string(from: date)
        }
        
        if let type = type {
            parameters["type"] = type
        }
        
        if let duration = duration {
            parameters["duration"] = duration
        }
        
        if let intensity = intensity {
            parameters["intensity"] = intensity
        }
        
        if let description = description {
            parameters["description"] = description
        }
        
        let endpoint = planId != nil ? "training/plans/\(planId!)/workouts/\(id)" : "training/workouts/\(id)"
        return apiClient.put(endpoint: endpoint, body: parameters)
    }
    
    /// Delete a workout
    func deleteWorkout(id: String, planId: String? = nil) -> AnyPublisher<Bool, APIError> {
        let endpoint = planId != nil ? "training/plans/\(planId!)/workouts/\(id)" : "training/workouts/\(id)"
        return apiClient.delete(endpoint: endpoint)
    }
    
    /// Mark a workout as completed
    func completeWorkout(id: String, completionDate: Date = Date(), notes: String? = nil, planId: String? = nil) -> AnyPublisher<Workout, APIError> {
        var parameters: [String: Any] = [
            "completed": true,
            "completionDate": ISO8601DateFormatter().string(from: completionDate)
        ]
        
        if let notes = notes {
            parameters["completionNotes"] = notes
        }
        
        let endpoint = planId != nil ? "training/plans/\(planId!)/workouts/\(id)/complete" : "training/workouts/\(id)/complete"
        return apiClient.put(endpoint: endpoint, body: parameters)
    }
    
    // MARK: - Activity Methods
    
    /// Get all activities associated with a workout
    func getActivities(workoutId: String, planId: String? = nil) -> AnyPublisher<[Activity], APIError> {
        let endpoint = planId != nil ? 
            "training/plans/\(planId!)/workouts/\(workoutId)/activities" : 
            "training/workouts/\(workoutId)/activities"
        return apiClient.get(endpoint: endpoint)
    }
    
    /// Get a specific activity by ID
    func getActivity(id: String, workoutId: String, planId: String? = nil) -> AnyPublisher<Activity, APIError> {
        let endpoint = planId != nil ? 
            "training/plans/\(planId!)/workouts/\(workoutId)/activities/\(id)" : 
            "training/workouts/\(workoutId)/activities/\(id)"
        return apiClient.get(endpoint: endpoint)
    }
    
    /// Create a new activity in a workout
    func createActivity(name: String, type: String, duration: Int, distance: Double? = nil, pace: Double? = nil, calories: Int? = nil, notes: String? = nil, workoutId: String, planId: String? = nil) -> AnyPublisher<Activity, APIError> {
        var parameters: [String: Any] = [
            "name": name,
            "type": type,
            "duration": duration
        ]
        
        if let distance = distance {
            parameters["distance"] = distance
        }
        
        if let pace = pace {
            parameters["pace"] = pace
        }
        
        if let calories = calories {
            parameters["calories"] = calories
        }
        
        if let notes = notes {
            parameters["notes"] = notes
        }
        
        let endpoint = planId != nil ? 
            "training/plans/\(planId!)/workouts/\(workoutId)/activities" : 
            "training/workouts/\(workoutId)/activities"
        return apiClient.post(endpoint: endpoint, body: parameters)
    }
    
    /// Update an existing activity
    func updateActivity(id: String, name: String? = nil, type: String? = nil, duration: Int? = nil, distance: Double? = nil, pace: Double? = nil, calories: Int? = nil, notes: String? = nil, workoutId: String, planId: String? = nil) -> AnyPublisher<Activity, APIError> {
        var parameters: [String: Any] = [:]
        
        if let name = name {
            parameters["name"] = name
        }
        
        if let type = type {
            parameters["type"] = type
        }
        
        if let duration = duration {
            parameters["duration"] = duration
        }
        
        if let distance = distance {
            parameters["distance"] = distance
        }
        
        if let pace = pace {
            parameters["pace"] = pace
        }
        
        if let calories = calories {
            parameters["calories"] = calories
        }
        
        if let notes = notes {
            parameters["notes"] = notes
        }
        
        let endpoint = planId != nil ? 
            "training/plans/\(planId!)/workouts/\(workoutId)/activities/\(id)" : 
            "training/workouts/\(workoutId)/activities/\(id)"
        return apiClient.put(endpoint: endpoint, body: parameters)
    }
    
    /// Delete an activity
    func deleteActivity(id: String, workoutId: String, planId: String? = nil) -> AnyPublisher<Bool, APIError> {
        let endpoint = planId != nil ? 
            "training/plans/\(planId!)/workouts/\(workoutId)/activities/\(id)" : 
            "training/workouts/\(workoutId)/activities/\(id)"
        return apiClient.delete(endpoint: endpoint)
    }
    
    // MARK: - AI Features
    
    /// Generate a training plan using AI
    func generateTrainingPlanWithAI(sport: String, goal: String, startDate: Date, endDate: Date, experienceLevel: String, hoursPerWeek: Int) -> AnyPublisher<TrainingPlan, APIError> {
        let parameters: [String: Any] = [
            "sport": sport,
            "goal": goal,
            "startDate": ISO8601DateFormatter().string(from: startDate),
            "endDate": ISO8601DateFormatter().string(from: endDate),
            "experienceLevel": experienceLevel,
            "hoursPerWeek": hoursPerWeek
        ]
        
        return apiClient.post(endpoint: "ai/generate-plan", body: parameters)
    }
    
    /// Ask Vici AI about a training plan
    func askViciAI(question: String, planId: String? = nil) -> AnyPublisher<AIResponse, APIError> {
        var parameters: [String: Any] = [
            "question": question
        ]
        
        if let planId = planId {
            parameters["planId"] = planId
        }
        
        return apiClient.post(endpoint: "ai/ask", body: parameters)
    }
    
    // MARK: - Async/Await APIs
    
    /// Get the active training plan for the current user
    func getActivePlan() async throws -> TrainingPlan? {
        return try await apiClient.get(endpoint: "training/plans/active")
    }
    
    /// Get workouts for a specific plan
    func getWorkouts(planId: String) async throws -> [Workout] {
        return try await apiClient.get(endpoint: "training/plans/\(planId)/workouts")
    }
    
    /// Create a plan preview using LLM with user preferences
    func createPlanPreview(_ planRequest: [String: Any]) async throws -> TrainingPlan {
        return try await apiClient.post(endpoint: "training/plans/preview", body: planRequest)
    }
    
    /// Approve a plan preview to make it active
    func approvePlan(_ planId: String) async throws -> TrainingPlan {
        return try await apiClient.post(endpoint: "training/plans/\(planId)/approve", body: nil)
    }
    
    /// Mark a workout as completed
    func completeWorkout(id: String, completionDate: Date, notes: String? = nil, planId: String? = nil) async throws -> Workout {
        var parameters: [String: Any] = [
            "completed": true,
            "completionDate": ISO8601DateFormatter().string(from: completionDate)
        ]
        
        if let notes = notes {
            parameters["completionNotes"] = notes
        }
        
        let endpoint = planId != nil ? "training/plans/\(planId!)/workouts/\(id)/complete" : "training/workouts/\(id)/complete"
        return try await apiClient.put(endpoint: endpoint, body: parameters)
    }
    
    /// Get today's workout
    func getTodaysWorkout() async throws -> Workout? {
        return try await apiClient.get(endpoint: "training/workouts/today")
    }
    
    /// Ask the AI coach a question about training
    func askVici(question: String, planId: String? = nil) async throws -> ViciResponse {
        var endpoint = "training/ask"
        if let planId = planId {
            endpoint = "training/plans/\(planId)/ask"
        }
        
        return try await apiClient.post(endpoint: endpoint, body: ["query": question])
    }
}

/// Response structure for AI queries
struct AIResponse: Codable {
    let answer: String
    let sources: [String]?
} 