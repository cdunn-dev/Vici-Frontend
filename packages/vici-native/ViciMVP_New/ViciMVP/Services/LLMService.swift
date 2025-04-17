import Foundation

// MARK: - Response Structs for LLMService

struct PlanResponse: Decodable {
    let plan: TrainingPlan
}

struct AnswerResponse: Decodable {
    let answer: String
}

// Placeholder struct to make ProposedChangesResponse Decodable
struct ProposedChangesData: Decodable {
    // Define properties here if/when the structure is known
}

struct ProposedChangesResponse: Decodable {
    // Use the specific Decodable struct
    let proposedChanges: ProposedChangesData 
}

struct TipResponse: Decodable {
    let tip: String
}

struct AnalysisResponse: Decodable {
    let analysis: String
}

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
        guard authService.isAuthenticated else {
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
        
        do {
            let response: APIResponse<TrainingPlan> = try await apiClient.post(
                endpoint: "/training/generate-plan",
                body: requestBody
            )
            
            guard let plan = response.data else {
                 throw APIError.invalidResponseData
            }
            return plan
        } catch let error as APIError {
            throw error
        } catch {
            throw APIError.decodingError("Failed to decode training plan: \(error.localizedDescription)")
        }
    }
    
    // MARK: - Ask Vici (General Questions)
    
    /// Ask Vici a general running/training question
    func askGeneralQuestion(question: String) async throws -> String {
        guard authService.isAuthenticated else {
            throw APIError.unauthorized
        }
        
        let requestBody: [String: Any] = [
            "question": question
        ]
        
        do {
            let response: APIResponse<AnswerResponse> = try await apiClient.post(
                endpoint: "/training/ask",
                body: requestBody
            )
            
            guard let answer = response.data?.answer else {
                throw APIError.invalidResponseData
            }
            return answer
        } catch let error as APIError {
            throw error
        } catch {
            throw APIError.decodingError("Failed to decode answer response: \(error.localizedDescription)")
        }
    }
    
    // MARK: - Plan-specific Questions
    
    /// Ask Vici about a specific training plan
    func askAboutPlan(planId: String, question: String) async throws -> String {
        guard authService.isAuthenticated else {
            throw APIError.unauthorized
        }
        
        let requestBody: [String: Any] = [
            "question": question
        ]
        
        do {
            let response: APIResponse<AnswerResponse> = try await apiClient.post(
                endpoint: "/training/plans/\(planId)/ask-vici",
                body: requestBody
            )
            
            guard let answer = response.data?.answer else {
                throw APIError.invalidResponseData
            }
            return answer
        } catch let error as APIError {
            throw error
        } catch {
             throw APIError.decodingError("Failed to decode plan question answer response: \(error.localizedDescription)")
        }
    }
    
    // MARK: - Plan Adjustments
    
    /// Request adjustments to a training plan
    func requestPlanAdjustment(
        planId: String,
        adjustmentRequest: String,
        reason: String? = nil
    ) async throws -> ProposedChangesData {
        guard authService.isAuthenticated else {
            throw APIError.unauthorized
        }
        
        let requestBody: [String: Any] = [
            "adjustmentRequest": adjustmentRequest,
            "reason": reason ?? ""
        ]
        
        do {
            let response: APIResponse<ProposedChangesResponse> = try await apiClient.post(
                endpoint: "/training/plans/\(planId)/ask-vici",
                body: requestBody
            )
            
            guard let changes = response.data?.proposedChanges else {
                throw APIError.invalidResponseData
            }
            return changes
        } catch let error as APIError {
             throw error
        } catch {
             throw APIError.decodingError("Failed to decode proposed changes response: \(error.localizedDescription)")
        }
    }
    
    /// Approve proposed changes to a training plan
    func approvePlanChanges(planId: String, changeId: String) async throws -> TrainingPlan {
        guard authService.isAuthenticated else {
            throw APIError.unauthorized
        }
        
        let requestBody: [String: Any] = [
            "changeId": changeId
        ]
        
        do {
            let response: APIResponse<TrainingPlan> = try await apiClient.post(
                endpoint: "/training/plans/\(planId)/approve-changes",
                body: requestBody
            )
            
            guard let plan = response.data else {
                throw APIError.invalidResponseData
            }
            return plan
        } catch let error as APIError {
            throw error
        } catch {
            throw APIError.decodingError("Failed to decode updated training plan: \(error.localizedDescription)")
        }
    }
    
    // MARK: - Workout Analysis
    
    /// Get AI analysis of a completed workout
    func analyzeWorkout(workoutId: String) async throws -> String {
        guard authService.isAuthenticated else {
            throw APIError.unauthorized
        }
        
        do {
            let response: APIResponse<AnalysisResponse> = try await apiClient.get(
                endpoint: "/training/workouts/\(workoutId)/analyze"
            )
            
            guard let analysis = response.data?.analysis else {
                throw APIError.invalidResponseData
            }
            return analysis
        } catch let error as APIError {
             throw error
        } catch {
             throw APIError.decodingError("Failed to decode workout analysis response: \(error.localizedDescription)")
        }
    }
    
    // MARK: - Training Tips
    
    /// Get a personalized training tip
    func getDailyTrainingTip() async throws -> String {
        guard authService.isAuthenticated else {
            throw APIError.unauthorized
        }
        
        do {
            let response: APIResponse<TipResponse> = try await apiClient.get(
                endpoint: "/training/tip"
            )
            
            guard let tip = response.data?.tip else {
                throw APIError.invalidResponseData
            }
            return tip
        } catch let error as APIError {
            throw error
        } catch {
            throw APIError.decodingError("Failed to decode training tip response: \(error.localizedDescription)")
        }
    }
} 