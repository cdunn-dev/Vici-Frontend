import Foundation
import SwiftUI
import Combine

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
    
    var id: String {
        switch self {
        case .networkError: return "networkError"
        case .serverError: return "serverError"
        case .authenticationError: return "authenticationError"
        case .unknown: return "unknown"
        case .offline: return "offline"
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
    private var cancellables = Set<AnyCancellable>()
    private let activePlanId: String?
    
    // MARK: - Initialization
    init(activePlanId: String? = nil) {
        self.activePlanId = activePlanId
        checkNetworkStatus()
        loadConversations()
    }
    
    // MARK: - Public Methods
    
    /// Send a question to Vici
    /// - Parameter question: The user's question
    func sendQuestion(_ question: String) {
        guard !question.isEmpty else { return }
        guard !isLoading else { return }
        
        if isOffline {
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
                
                DispatchQueue.main.async {
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
                }
            } catch {
                DispatchQueue.main.async {
                    self.isLoading = false
                    self.handleError(error)
                }
            }
        }
    }
    
    /// Clears the error state
    func clearError() {
        error = nil
        showError = false
    }
    
    // MARK: - Private Methods
    
    /// Ask a general question to Vici
    /// - Parameter question: The user's question
    /// - Returns: The Vici response
    private func askGeneralQuestion(question: String) async throws -> ViciResponse {
        do {
            let answer = try await llmService.askGeneralQuestion(question: question)
            
            // Create a simple ViciResponse since general questions don't have structured changes
            let response = ViciResponse(
                answerText: answer,
                hasStructuredChanges: false,
                proposedChanges: nil,
                timestamp: ISO8601DateFormatter().string(from: Date())
            )
            
            return response
        } catch {
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
            throw AskViciError.unknown("No active plan available")
        }
        
        do {
            // We want to request the full ViciResponse for plan-specific questions
            let endpoint = "/training/plans/\(planId)/ask-vici"
            let requestBody: [String: Any] = ["question": question]
            
            let response: ViciResponse = try await APIClient.shared.post(endpoint: endpoint, body: requestBody)
            return response
        } catch {
            throw convertToAskViciError(error)
        }
    }
    
    /// Convert generic errors to AskViciError types
    /// - Parameter error: The error to convert
    /// - Returns: An AskViciError
    private func convertToAskViciError(_ error: Error) -> AskViciError {
        if let apiError = error as? APIError {
            switch apiError {
            case .unauthorized:
                return .authenticationError
            case .networkError:
                return .offline
            case .serverError(let message):
                return .serverError(message)
            case .decodingError(let message):
                return .unknown("Failed to process response: \(message)")
            default:
                return .unknown("An unexpected error occurred: \(apiError.localizedDescription)")
            }
        }
        return .unknown("An unexpected error occurred: \(error.localizedDescription)")
    }
    
    /// Handle errors from API calls
    /// - Parameter error: The error to handle
    private func handleError(_ error: Error) {
        let viciError = error as? AskViciError ?? convertToAskViciError(error)
        
        self.error = viciError
        self.showError = true
        
        if case .offline = viciError {
            self.isOffline = true
        }
    }
    
    /// Check network connectivity status
    private func checkNetworkStatus() {
        // This would integrate with a NetworkMonitor in a real implementation
        // For now, we'll assume online status
        isOffline = false
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
    
    /// Load conversations from UserDefaults
    private func loadConversations() {
        guard let planId = activePlanId else {
            // For general conversations, load from general key
            loadFromUserDefaults(key: "vici_general_conversations")
            return
        }
        
        // For plan-specific conversations, include plan ID in key
        loadFromUserDefaults(key: "vici_plan_\(planId)_conversations")
    }
    
    /// Save conversations to UserDefaults with the specified key
    /// - Parameter key: The UserDefaults key
    private func saveToUserDefaults(key: String) {
        let encoder = JSONEncoder()
        if let encoded = try? encoder.encode(conversations) {
            UserDefaults.standard.set(encoded, forKey: key)
        }
    }
    
    /// Load conversations from UserDefaults with the specified key
    /// - Parameter key: The UserDefaults key
    private func loadFromUserDefaults(key: String) {
        if let savedConversations = UserDefaults.standard.data(forKey: key) {
            let decoder = JSONDecoder()
            if let loadedConversations = try? decoder.decode([ViciConversation].self, from: savedConversations) {
                self.conversations = loadedConversations
            }
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
