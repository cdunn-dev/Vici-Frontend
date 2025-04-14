import Foundation
import Combine

/// Data model for chat messages
struct ChatMessage: Identifiable {
    let id = UUID()
    let text: String
    let isUser: Bool
    let timestamp = Date()
    let suggestion: SuggestionAction?
    
    init(text: String, isUser: Bool, suggestion: SuggestionAction? = nil) {
        self.text = text
        self.isUser = isUser
        self.suggestion = suggestion
    }
}

/// Action suggestions from the AI coach
struct SuggestionAction: Identifiable {
    let id = UUID()
    let type: SuggestionType
    let description: String
    let data: [String: Any]
    
    enum SuggestionType: String {
        case adjustWorkout
        case createPlan
        case modifyPlan
        case rescheduleWorkout
    }
}

/// Response from the Vici AI
struct ViciResponse: Decodable {
    let text: String
    let suggestion: SuggestionInfo?
    
    struct SuggestionInfo: Decodable {
        let type: String
        let description: String
        let data: [String: String]?
    }
}

class AskViciViewModel: ObservableObject {
    // MARK: - Published Properties
    
    @Published var messages: [ChatMessage] = []
    @Published var isLoading = false
    @Published var error: String?
    
    // MARK: - Private Properties
    
    private let trainingService = TrainingService.shared
    private var cancellables = Set<AnyCancellable>()
    
    // MARK: - Lifecycle
    
    init() {
        // Initial setup
    }
    
    // MARK: - Public Methods
    
    /// Add a welcome message when the view appears
    func addWelcomeMessage() {
        let welcomeText = "👋 Hi! I'm Vici, your AI running coach. How can I help you with your training today?"
        messages.append(ChatMessage(text: welcomeText, isUser: false))
    }
    
    /// Send a message to the AI coach
    func sendMessage(_ text: String) {
        // Add user message to chat
        let userMessage = ChatMessage(text: text, isUser: true)
        messages.append(userMessage)
        
        // Clear any previous errors
        error = nil
        isLoading = true
        
        Task {
            do {
                // Send message to AI coach
                let response = try await trainingService.askVici(question: text)
                
                var suggestion: SuggestionAction?
                
                // Check if response contains a suggestion
                if let suggestionInfo = response.suggestion,
                   let type = SuggestionType(rawValue: suggestionInfo.type) {
                    suggestion = SuggestionAction(
                        type: type,
                        description: suggestionInfo.description,
                        data: suggestionInfo.data as [String: Any]? ?? [:]
                    )
                }
                
                // Add AI response to chat
                DispatchQueue.main.async {
                    self.isLoading = false
                    let aiMessage = ChatMessage(
                        text: response.text,
                        isUser: false,
                        suggestion: suggestion
                    )
                    self.messages.append(aiMessage)
                }
            } catch {
                DispatchQueue.main.async {
                    self.isLoading = false
                    self.error = "Sorry, I couldn't process your request. Please try again."
                    print("Error asking Vici: \(error.localizedDescription)")
                }
            }
        }
    }
    
    /// Handle a suggestion action from the AI coach
    func handleSuggestion(_ suggestion: SuggestionAction) {
        // Implement suggestion handling based on type
        switch suggestion.type {
        case .adjustWorkout:
            // Handle workout adjustment
            break
            
        case .createPlan:
            // Handle plan creation
            break
            
        case .modifyPlan:
            // Handle plan modification
            break
            
        case .rescheduleWorkout:
            // Handle workout rescheduling
            break
        }
    }
} 