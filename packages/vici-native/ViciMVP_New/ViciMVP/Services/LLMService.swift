import Foundation

/// Service for interacting with the LLM (Large Language Model) for intelligent features
class LLMService {
    // MARK: - Singleton
    static let shared = LLMService()
    
    // MARK: - Properties
    private let apiClient = APIClient.shared
    private let authService = AuthService.shared
    
    // MARK: - Initialization
    private init() {}
    
    // MARK: - Training Plan Generation
    
    /// Generate a training plan based on user goals and profile
    func generateTrainingPlan(
        goal: String,
        goalDate: Date,
        experienceLevel: String,
        weeklyFrequency: Int,
        additionalInfo: String? = nil
    ) async throws -> TrainingPlan {
        guard authService.isLoggedIn() else {
            throw APIError.unauthorized
        }
        
        let dateFormatter = ISO8601DateFormatter()
        
        let requestBody: [String: Any] = [
            "goal": goal,
            "goalDate": dateFormatter.string(from: goalDate),
            "experienceLevel": experienceLevel,
            "weeklyFrequency": weeklyFrequency,
            "additionalInfo": additionalInfo ?? ""
        ]
        
        let response: [String: Any] = try await apiClient.post(
            endpoint: "/training/generate-plan",
            body: requestBody
        )
        
        // Parse training plan from response
        do {
            let jsonData = try JSONSerialization.data(withJSONObject: response)
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            return try decoder.decode(TrainingPlan.self, from: jsonData)
        } catch {
            throw APIError.decodingError("Failed to decode training plan: \(error.localizedDescription)")
        }
    }
    
    // MARK: - Ask Vici (General Questions)
    
    /// Ask Vici a general running/training question
    func askGeneralQuestion(question: String) async throws -> String {
        guard authService.isLoggedIn() else {
            throw APIError.unauthorized
        }
        
        let requestBody: [String: Any] = [
            "question": question
        ]
        
        let response: [String: Any] = try await apiClient.post(
            endpoint: "/training/ask",
            body: requestBody
        )
        
        guard let answer = response["answer"] as? String else {
            throw APIError.decodingError("Invalid response format")
        }
        
        return answer
    }
    
    // MARK: - Plan-specific Questions
    
    /// Ask Vici about a specific training plan
    func askAboutPlan(planId: String, question: String) async throws -> String {
        guard authService.isLoggedIn() else {
            throw APIError.unauthorized
        }
        
        let requestBody: [String: Any] = [
            "question": question
        ]
        
        let response: [String: Any] = try await apiClient.post(
            endpoint: "/training/plans/\(planId)/ask-vici",
            body: requestBody
        )
        
        guard let answer = response["answer"] as? String else {
            throw APIError.decodingError("Invalid response format")
        }
        
        return answer
    }
    
    // MARK: - Plan Adjustments
    
    /// Request adjustments to a training plan
    func requestPlanAdjustment(
        planId: String,
        adjustmentRequest: String,
        reason: String? = nil
    ) async throws -> [String: Any] {
        guard authService.isLoggedIn() else {
            throw APIError.unauthorized
        }
        
        let requestBody: [String: Any] = [
            "adjustmentRequest": adjustmentRequest,
            "reason": reason ?? ""
        ]
        
        let response: [String: Any] = try await apiClient.post(
            endpoint: "/training/plans/\(planId)/ask-vici",
            body: requestBody
        )
        
        guard let proposedChanges = response["proposedChanges"] as? [String: Any] else {
            throw APIError.decodingError("Invalid response format")
        }
        
        return proposedChanges
    }
    
    /// Approve proposed changes to a training plan
    func approvePlanChanges(planId: String, changeId: String) async throws -> TrainingPlan {
        guard authService.isLoggedIn() else {
            throw APIError.unauthorized
        }
        
        let requestBody: [String: Any] = [
            "changeId": changeId
        ]
        
        let response: [String: Any] = try await apiClient.post(
            endpoint: "/training/plans/\(planId)/approve-changes",
            body: requestBody
        )
        
        // Parse updated training plan
        do {
            let jsonData = try JSONSerialization.data(withJSONObject: response)
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            return try decoder.decode(TrainingPlan.self, from: jsonData)
        } catch {
            throw APIError.decodingError("Failed to decode updated training plan: \(error.localizedDescription)")
        }
    }
    
    // MARK: - Workout Analysis
    
    /// Get AI analysis of a completed workout
    func analyzeWorkout(workoutId: String) async throws -> String {
        guard authService.isLoggedIn() else {
            throw APIError.unauthorized
        }
        
        let response: [String: Any] = try await apiClient.get(
            endpoint: "/training/workouts/\(workoutId)/analyze"
        )
        
        guard let analysis = response["analysis"] as? String else {
            throw APIError.decodingError("Invalid response format")
        }
        
        return analysis
    }
    
    // MARK: - Training Tips
    
    /// Get a personalized training tip
    func getDailyTrainingTip() async throws -> String {
        guard authService.isLoggedIn() else {
            throw APIError.unauthorized
        }
        
        let response: [String: Any] = try await apiClient.get(
            endpoint: "/training/tip"
        )
        
        guard let tip = response["tip"] as? String else {
            throw APIError.decodingError("Invalid response format")
        }
        
        return tip
    }
} 