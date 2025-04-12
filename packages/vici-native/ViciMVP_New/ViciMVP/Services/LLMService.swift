import Foundation

enum LLMRole: String {
    case system
    case user
    case assistant
}

struct LLMMessage: Codable {
    let role: String
    let content: String
    
    init(role: LLMRole, content: String) {
        self.role = role.rawValue
        self.content = content
    }
}

class LLMService {
    static let shared = LLMService()
    
    private let apiClient = APIClient.shared
    
    // MARK: - Training Plan Generation
    
    func generateTrainingPlan(
        userDetails: String,
        goal: String,
        duration: Int,
        constraints: String,
        preferences: String
    ) async throws -> TrainingPlan {
        let messages = [
            LLMMessage(role: .system, content: "You are a personal trainer AI that creates training plans based on user goals and constraints."),
            LLMMessage(role: .user, content: """
                Generate a \(duration)-week training plan for a user with the following details:
                
                User Info: \(userDetails)
                
                Goal: \(goal)
                
                Constraints: \(constraints)
                
                Preferences: \(preferences)
                
                Please provide a structured training plan with clear progression and rest days.
                """)
        ]
        
        let parameters: [String: Any] = [
            "messages": messages.map { ["role": $0.role, "content": $0.content] },
            "goal": goal,
            "duration": duration,
            "model": "gpt-4" // or whichever model is most appropriate
        ]
        
        return try await apiClient.post(endpoint: "ai/training-plans/generate", parameters: parameters)
    }
    
    // MARK: - Workout Generation
    
    func generateWorkout(
        userDetails: String,
        goal: String,
        constraints: String,
        preferences: String
    ) async throws -> Workout {
        let messages = [
            LLMMessage(role: .system, content: "You are a personal trainer AI that creates workout plans based on user goals and constraints."),
            LLMMessage(role: .user, content: """
                Generate a workout for a user with the following details:
                
                User Info: \(userDetails)
                
                Goal: \(goal)
                
                Constraints: \(constraints)
                
                Preferences: \(preferences)
                
                Please provide a structured workout with clear instructions.
                """)
        ]
        
        let parameters: [String: Any] = [
            "messages": messages.map { ["role": $0.role, "content": $0.content] },
            "goal": goal,
            "model": "gpt-4" // or whichever model is most appropriate
        ]
        
        return try await apiClient.post(endpoint: "ai/workouts/generate", parameters: parameters)
    }
    
    // MARK: - Workout Analysis
    
    func analyzeWorkoutPerformance(workout: Workout, activityData: [String: Any]) async throws -> String {
        let parameters: [String: Any] = [
            "workout_id": workout.id,
            "activity_data": activityData
        ]
        
        struct AnalysisResponse: Codable {
            let analysis: String
        }
        
        let response: AnalysisResponse = try await apiClient.post(
            endpoint: "ai/workouts/analyze",
            parameters: parameters
        )
        
        return response.analysis
    }
    
    // MARK: - Coaching Feedback
    
    func getCoachingFeedback(
        user: User,
        recentWorkouts: [Workout],
        goal: String
    ) async throws -> String {
        let parameters: [String: Any] = [
            "user_id": user.id,
            "recent_workouts": recentWorkouts.map { $0.id },
            "goal": goal
        ]
        
        struct FeedbackResponse: Codable {
            let feedback: String
        }
        
        let response: FeedbackResponse = try await apiClient.post(
            endpoint: "ai/feedback",
            parameters: parameters
        )
        
        return response.feedback
    }
    
    // MARK: - Chat with AI Coach
    
    func chatWithAICoach(messages: [LLMMessage]) async throws -> String {
        let parameters: [String: Any] = [
            "messages": messages.map { ["role": $0.role, "content": $0.content] }
        ]
        
        struct ChatResponse: Codable {
            let message: String
        }
        
        let response: ChatResponse = try await apiClient.post(
            endpoint: "ai/chat",
            parameters: parameters
        )
        
        return response.message
    }
    
    // MARK: - Workout Adaptation
    
    func adaptWorkout(
        workoutId: Int,
        reason: String,
        constraints: String
    ) async throws -> Workout {
        let parameters: [String: Any] = [
            "workout_id": workoutId,
            "reason": reason,
            "constraints": constraints
        ]
        
        return try await apiClient.post(endpoint: "ai/workouts/adapt", parameters: parameters)
    }
} 