import SwiftUI

struct AskViciView: View {
    @StateObject private var viewModel = AskViciViewModel()
    @State private var question = ""
    
    var body: some View {
        NavigationView {
            VStack {
                if viewModel.hasActivePlan {
                    conversationView
                } else {
                    noActivePlanView
                }
            }
            .navigationTitle("Ask Vici")
            .onAppear {
                viewModel.checkForActivePlan()
            }
            .alert(isPresented: $viewModel.showError) {
                Alert(
                    title: Text("Error"),
                    message: Text(viewModel.errorMessage),
                    dismissButton: .default(Text("OK"))
                )
            }
        }
    }
    
    private var conversationView: some View {
        VStack {
            List {
                ForEach(viewModel.conversations) { conversation in
                    VStack(alignment: .leading, spacing: 10) {
                        HStack {
                            Image(systemName: "person.fill")
                                .foregroundColor(.blue)
                            Text(conversation.question)
                                .font(.headline)
                                .padding(.leading, 5)
                        }
                        .padding(.bottom, 5)
                        
                        HStack {
                            Image(systemName: "bubbles.and.sparkles.fill")
                                .foregroundColor(.purple)
                            Text(conversation.answer)
                                .font(.body)
                                .padding(.leading, 5)
                        }
                        
                        if conversation.hasProposedChanges {
                            HStack {
                                Spacer()
                                
                                Button(action: {
                                    viewModel.approveChanges(conversationId: conversation.id)
                                }) {
                                    Text("Approve Changes")
                                        .font(.caption)
                                        .padding(.horizontal, 10)
                                        .padding(.vertical, 5)
                                        .background(Color.green)
                                        .foregroundColor(.white)
                                        .cornerRadius(15)
                                }
                                
                                Button(action: {
                                    viewModel.rejectChanges(conversationId: conversation.id)
                                }) {
                                    Text("Reject")
                                        .font(.caption)
                                        .padding(.horizontal, 10)
                                        .padding(.vertical, 5)
                                        .background(Color.gray.opacity(0.5))
                                        .foregroundColor(.white)
                                        .cornerRadius(15)
                                }
                            }
                            .padding(.top, 5)
                        }
                        
                        Text(conversation.timestamp.formatted(date: .abbreviated, time: .shortened))
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .padding(.vertical, 5)
                }
            }
            
            HStack {
                TextField("Ask about your training plan...", text: $question)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .disabled(viewModel.isLoading)
                
                Button(action: {
                    if !question.isEmpty {
                        viewModel.askQuestion(question)
                        question = ""
                    }
                }) {
                    if viewModel.isLoading {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle())
                    } else {
                        Image(systemName: "paperplane.fill")
                            .foregroundColor(.blue)
                    }
                }
                .disabled(question.isEmpty || viewModel.isLoading)
                .padding(.horizontal, 10)
            }
            .padding()
        }
    }
    
    private var noActivePlanView: some View {
        VStack(spacing: 20) {
            Image(systemName: "exclamationmark.circle")
                .font(.system(size: 60))
                .foregroundColor(.gray)
                .padding()
            
            Text("No Active Training Plan")
                .font(.title)
            
            Text("You need an active training plan to use the Ask Vici feature. Create a plan to get started.")
                .multilineTextAlignment(.center)
                .foregroundColor(.secondary)
                .padding(.horizontal)
            
            NavigationLink(destination: TrainingPlanView()) {
                Text("Create a Training Plan")
                    .font(.headline)
                    .foregroundColor(.white)
                    .padding()
                    .background(Color.blue)
                    .cornerRadius(10)
            }
            .padding()
            
            Spacer()
        }
        .padding()
    }
}

class AskViciViewModel: ObservableObject {
    // MARK: - Published Properties
    
    @Published var hasActivePlan = false
    @Published var isLoading = false
    @Published var conversations: [ViciConversation] = []
    @Published var showError = false
    @Published var errorMessage = ""
    
    // MARK: - Private Properties
    
    private let apiClient = APIClient()
    private var activePlanId: String?
    
    // MARK: - Public Methods
    
    /// Checks if the user has an active training plan
    func checkForActivePlan() {
        isLoading = true
        
        Task {
            do {
                let plan = try await apiClient.getActivePlan()
                
                await MainActor.run {
                    self.hasActivePlan = plan != nil
                    self.activePlanId = plan?.id
                    self.isLoading = false
                }
            } catch {
                await MainActor.run {
                    self.hasActivePlan = false
                    self.activePlanId = nil
                    self.isLoading = false
                    self.showError = true
                    self.errorMessage = "Failed to check active plan: \(error.localizedDescription)"
                }
            }
        }
    }
    
    /// Asks a question to Vici
    func askQuestion(_ questionText: String) {
        guard let planId = activePlanId, !questionText.isEmpty else { return }
        
        isLoading = true
        
        Task {
            do {
                let response = try await apiClient.askVici(planId: planId, query: questionText)
                
                // Create a conversation from the response
                let conversation = ViciConversation(
                    id: UUID().uuidString,
                    question: questionText,
                    answer: response.answerText,
                    timestamp: ISO8601DateFormatter().date(from: response.timestamp) ?? Date(),
                    hasProposedChanges: response.hasStructuredChanges,
                    proposedChanges: response.proposedChanges 
                )
                
                await MainActor.run {
                    self.conversations.insert(conversation, at: 0)
                    self.isLoading = false
                }
            } catch {
                await MainActor.run {
                    self.isLoading = false
                    self.showError = true
                    self.errorMessage = "Failed to get response: \(error.localizedDescription)"
                }
            }
        }
    }
    
    /// Approves changes proposed by Vici
    func approveChanges(conversationId: String) {
        guard let planId = activePlanId, 
              let conversation = conversations.first(where: { $0.id == conversationId }),
              conversation.hasProposedChanges else { 
            return 
        }
        
        // TODO: Implement approving changes via API
        // For now, just update the conversation
        if let index = conversations.firstIndex(where: { $0.id == conversationId }) {
            conversations[index].isApproved = true
        }
    }
    
    /// Rejects changes proposed by Vici
    func rejectChanges(conversationId: String) {
        guard let conversation = conversations.first(where: { $0.id == conversationId }),
              conversation.hasProposedChanges else { 
            return 
        }
        
        // Just update the local state
        if let index = conversations.firstIndex(where: { $0.id == conversationId }) {
            conversations[index].isRejected = true
        }
    }
}

// Model for a conversation with Vici
struct ViciConversation: Identifiable {
    let id: String
    let question: String
    let answer: String
    let timestamp: Date
    let hasProposedChanges: Bool
    let proposedChanges: ProposedChanges?
    var isApproved: Bool = false
    var isRejected: Bool = false
} 