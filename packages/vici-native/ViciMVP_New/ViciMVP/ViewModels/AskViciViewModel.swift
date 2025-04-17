import Foundation
import SwiftUI
import Combine
import os

/// Represents a conversation between the user and Vici
struct ViciConversation: Identifiable, Codable {
    let id: String
    let question: String
    let answer: String
    let date: Date
    let hasStructuredChanges: Bool
    
    init(id: String, question: String, answer: String, date: Date, hasStructuredChanges: Bool = false) {
        self.id = id
        self.question = question
        self.answer = answer
        self.date = date
        self.hasStructuredChanges = hasStructuredChanges
    }
    
    enum CodingKeys: String, CodingKey {
        case id, question, answer, date, hasStructuredChanges
    }
}

/// Enum representing different types of errors that can occur in AskViciViewModel
enum AskViciError: Error, Identifiable {
    case networkError(String)
    case serverError(String)
    case authenticationError
    case unknown(String)
    case offline
    case rateLimited
    case noActivePlan
    
    var id: String {
        switch self {
        case .networkError: return "networkError"
        case .serverError: return "serverError"
        case .authenticationError: return "authenticationError"
        case .unknown: return "unknown"
        case .offline: return "offline"
        case .rateLimited: return "rateLimited"
        case .noActivePlan: return "noActivePlan"
        }
    }
    
    var message: String {
        switch self {
        case .networkError(let message):
            return message
        case .serverError(let message):
            return message
        case .authenticationError:
            return "Please log in to ask Vici questions"
        case .unknown(let message):
            return message
        case .offline:
            return "You're offline. Connect to the internet to ask Vici questions."
        case .rateLimited:
            return "You've asked too many questions too quickly. Please wait a moment and try again."
        case .noActivePlan:
            return "No active training plan found. Create a plan first to get personalized advice."
        }
    }
}

/// ViewModel for the AskVici feature
class AskViciViewModel: ObservableObject {
    // MARK: - Published Properties
    @Published var conversations: [ViciConversation] = []
    @Published var isLoading = false
    @Published var error: AskViciError?
    @Published var showError = false
    @Published var isOffline = false
    
    // MARK: - Private Properties
    private let llmService = LLMService.shared
    private let apiClient = APIClient.shared
    private let trainingService = TrainingService.shared
    private var cancellables = Set<AnyCancellable>()
    private var activePlanId: String?
    private let logger = Logger(subsystem: "com.vici.app", category: "AskViciViewModel")
    
    // MARK: - Initialization
    init(activePlanId: String? = nil) {
        self.activePlanId = activePlanId
        logger.debug("Initializing AskViciViewModel with activePlanId: \(activePlanId ?? "nil")")
        checkNetworkStatus()
        checkForActivePlan()
        loadConversations()
    }
    
    // MARK: - Public Methods
    
    /// Checks if the user has an active training plan
    func checkForActivePlan() {
        guard activePlanId == nil else { return }
        logger.debug("Checking for active training plan")
        
        Task {
            do {
                let plan = try await trainingService.getActivePlan()
                await MainActor.run {
                    self.activePlanId = plan?.id
                    logger.debug("Active plan ID set to: \(self.activePlanId ?? "nil")")
                }
            } catch {
                logger.error("Failed to get active plan: \(error.localizedDescription)")
                // Not setting an error here as this is just informational
                // We can still handle general questions without a plan
            }
        }
    }
    
    /// Send a question to Vici
    /// - Parameter question: The user's question
    func sendQuestion(_ question: String) {
        guard !question.isEmpty else { return }
        guard !isLoading else { return }
        
        logger.debug("Sending question to Vici: \(question)")
        
        if isOffline {
            logger.warning("Attempted to send question while offline")
            self.error = .offline
            self.showError = true
            return
        }
        
        isLoading = true
        
        // If we have an active plan, ask about that plan, otherwise ask a general question
        let task = activePlanId != nil ?
            askAboutPlan(question: question) :
            askGeneralQuestion(question: question)
        
        Task {
            do {
                let response = try await task
                logger.debug("Received response from LLM service")
                
                await MainActor.run {
                    self.isLoading = false
                    
                    // Create conversation from response
                    let conversation = ViciConversation(
                        id: UUID().uuidString,
                        question: question,
                        answer: response.answerText,
                        date: Date(),
                        hasStructuredChanges: response.hasStructuredChanges
                    )
                    
                    // Insert at beginning of array
                    self.conversations.insert(conversation, at: 0)
                    
                    // Save conversations
                    self.saveConversations()
                    logger.debug("Saved new conversation to storage")
                }
            } catch {
                logger.error("Error receiving response: \(error.localizedDescription)")
                
                await MainActor.run {
                    self.isLoading = false
                    self.handleError(error)
                }
            }
        }
    }
    
    /// Load conversations from storage
    func loadConversations() {
        logger.debug("Loading conversations from storage")
        guard let planId = activePlanId else {
            // For general conversations, load from general key
            loadFromUserDefaults(key: "vici_general_conversations")
            return
        }
        
        // For plan-specific conversations, include plan ID in key
        loadFromUserDefaults(key: "vici_plan_\(planId)_conversations")
    }
    
    /// Clears the error state
    func clearError() {
        logger.debug("Clearing error state")
        error = nil
        showError = false
    }
    
    // MARK: - Private Methods
    
    /// Ask a general question to Vici
    /// - Parameter question: The user's question
    /// - Returns: The Vici response
    private func askGeneralQuestion(question: String) async throws -> ViciResponse {
        logger.debug("Asking general question")
        do {
            let answer = try await llmService.askGeneralQuestion(question: question)
            logger.debug("Received general question answer from LLM service")
            
            // Create a simple ViciResponse since general questions don't have structured changes
            let response = ViciResponse(
                answerText: answer,
                hasStructuredChanges: false,
                proposedChanges: nil,
                timestamp: ISO8601DateFormatter().string(from: Date())
            )
            
            return response
        } catch {
            logger.error("Error in askGeneralQuestion: \(error.localizedDescription)")
            throw convertToAskViciError(error)
        }
    }
    
    /// Ask a question about a specific training plan
    /// - Parameters:
    ///   - planId: The training plan ID
    ///   - question: The user's question
    /// - Returns: The Vici response
    private func askAboutPlan(question: String) async throws -> ViciResponse {
        guard let planId = activePlanId else {
            logger.error("Attempted to ask about plan but no active plan ID is available")
            throw AskViciError.noActivePlan
        }
        
        logger.debug("Asking question about plan: \(planId)")
        
        do {
            // We want to request the full ViciResponse for plan-specific questions
            let endpoint = "/training/plans/\(planId)/ask-vici"
            let requestBody: [String: Any] = ["question": question]
            
            logger.debug("Making API call to: \(endpoint)")
            let response: ViciResponse = try await apiClient.post(endpoint: endpoint, body: requestBody)
            logger.debug("Received plan-specific response from API")
            
            return response
        } catch {
            logger.error("Error in askAboutPlan: \(error.localizedDescription)")
            throw convertToAskViciError(error)
        }
    }
    
    /// Convert generic errors to AskViciError types
    /// - Parameter error: The error to convert
    /// - Returns: An AskViciError
    private func convertToAskViciError(_ error: Error) -> AskViciError {
        if let viciError = error as? AskViciError {
            return viciError
        }
        
        if let apiError = error as? APIError {
            switch apiError {
            case .unauthorized:
                return .authenticationError
            case .networkError:
                return .offline
            case .serverError(let code, let message):
                if code == 429 {
                    return .rateLimited
                }
                return .serverError(message)
            case .decodingError(let message):
                return .unknown("Failed to process response: \(message)")
            case .encodingError(let message):
                return .unknown("Failed to prepare request: \(message)")
            case .timeout:
                return .networkError("Request timed out. Please try again.")
            default:
                return .unknown("An unexpected error occurred: \(apiError.localizedDescription)")
            }
        }
        
        // Check for URLError connection issues
        let nsError = error as NSError
        if nsError.domain == NSURLErrorDomain {
            switch nsError.code {
            case NSURLErrorNotConnectedToInternet, NSURLErrorDataNotAllowed:
                return .offline
            case NSURLErrorTimedOut:
                return .networkError("Request timed out. Please try again.")
            default:
                return .networkError("Network connection issue: \(nsError.localizedDescription)")
            }
        }
        
        return .unknown("An unexpected error occurred: \(error.localizedDescription)")
    }
    
    /// Handle errors from API calls
    /// - Parameter error: The error to handle
    private func handleError(_ error: Error) {
        let viciError = error as? AskViciError ?? convertToAskViciError(error)
        logger.error("Handling error: \(viciError.id) - \(viciError.message)")
        
        self.error = viciError
        self.showError = true
        
        if case .offline = viciError {
            self.isOffline = true
        }
    }
    
    /// Check network connectivity status
    private func checkNetworkStatus() {
        // This would integrate with a NetworkMonitor in a real implementation
        // For now, we'll assume online status and check when we make calls
        logger.debug("Checking network status")
        
        // Make a lightweight API call to verify connectivity
        Task {
            do {
                let _ = try await apiClient.get(endpoint: "health")
                await MainActor.run {
                    self.isOffline = false
                    logger.debug("Network check passed - online")
                }
            } catch {
                await MainActor.run {
                    self.isOffline = true
                    logger.warning("Network check failed - offline")
                }
            }
        }
    }
    
    /// Save conversations to UserDefaults
    private func saveConversations() {
        guard let planId = activePlanId else { 
            // For general conversations, save to general key
            saveToUserDefaults(key: "vici_general_conversations")
            return
        }
        
        // For plan-specific conversations, include plan ID in key
        saveToUserDefaults(key: "vici_plan_\(planId)_conversations")
    }
    
    /// Save conversations to UserDefaults with the specified key
    /// - Parameter key: The UserDefaults key
    private func saveToUserDefaults(key: String) {
        do {
            let encoder = JSONEncoder()
            encoder.dateEncodingStrategy = .iso8601
            let data = try encoder.encode(conversations)
            UserDefaults.standard.set(data, forKey: key)
            logger.debug("Saved \(self.conversations.count) conversations to UserDefaults with key: \(key)")
        } catch {
            logger.error("Failed to save conversations: \(error.localizedDescription)")
        }
    }
    
    /// Load conversations from UserDefaults with the specified key
    /// - Parameter key: The UserDefaults key
    private func loadFromUserDefaults(key: String) {
        guard let data = UserDefaults.standard.data(forKey: key) else {
            logger.debug("No conversations found in UserDefaults for key: \(key)")
            return
        }
        
        do {
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            self.conversations = try decoder.decode([ViciConversation].self, from: data)
            logger.debug("Loaded \(self.conversations.count) conversations from UserDefaults with key: \(key)")
        } catch {
            logger.error("Failed to load conversations: \(error.localizedDescription)")
        }
    }
}

// MARK: - Mock Conversations for Preview
extension ViciConversation {
    static var mockConversations: [ViciConversation] = [
        ViciConversation(
            id: "1",
            question: "How should I prepare for my upcoming 10K race?",
            answer: "Based on your training history, I recommend focusing on these key areas in the final two weeks:\n\n1. Reduce your training volume by about 30% but maintain intensity\n2. Practice race pace in short intervals (2-3 x 1 mile at goal pace)\n3. Prioritize sleep and recovery\n4. Plan your race nutrition and hydration strategy\n5. Do a light 2-mile jog with a few strides the day before the race",
            date: Date().addingTimeInterval(-86400 * 2)
        ),
        ViciConversation(
            id: "2",
            question: "I'm feeling tired today. Should I skip my workout?",
            answer: "Looking at your recent training load and heart rate variability data, I do see signs of accumulated fatigue. It's best to listen to your body and take a recovery day today. Consider light stretching or yoga instead of your scheduled tempo run. You can move the tempo workout to Thursday when you should be more recovered.",
            date: Date().addingTimeInterval(-86400)
        )
    ]
}
