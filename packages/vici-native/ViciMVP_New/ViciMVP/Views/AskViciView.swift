import SwiftUI

/// View for asking questions to the Vici AI coach
struct AskViciView: View {
    // MARK: - Properties
    @StateObject private var viewModel = AskViciViewModel()
    @State private var question = ""
    @FocusState private var isFocused: Bool
    @State private var scrollToID: String?
    
    // MARK: - View
    var body: some View {
        NavigationView {
            ZStack {
                // Main content
                VStack {
                    if viewModel.isOffline {
                        offlineBanner
                    }
                    
                    // Conversation list
                    conversationList
                    
                    // Input field
                    inputField
                }
                
                // Error overlay
                if viewModel.showError {
                    errorOverlay
                }
                
                // Initial loading state
                if viewModel.isLoading && viewModel.conversations.isEmpty {
                    initialLoadingView
                }
            }
            .navigationTitle("Ask Vici")
            .onTapGesture {
                // Dismiss keyboard when tapping outside the input field
                isFocused = false
            }
            .onAppear {
                // Check for active plan when the view appears
                viewModel.checkForActivePlan()
            }
        }
    }
    
    // MARK: - Subviews
    
    /// Loading view for initial state
    private var initialLoadingView: some View {
        VStack(spacing: 20) {
            ProgressView()
                .progressViewStyle(CircularProgressViewStyle())
                .scaleEffect(1.5)
            
            Text("Connecting to Vici...")
                .font(.headline)
                .foregroundColor(.primary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemBackground).opacity(0.9))
    }
    
    /// Offline banner displayed when the user is offline
    private var offlineBanner: some View {
        VStack {
            HStack {
                Image(systemName: "wifi.slash")
                    .foregroundColor(.white)
                
                Text("You're offline. Connect to the internet to ask Vici questions.")
                    .font(.subheadline)
                    .foregroundColor(.white)
                
                Spacer()
                
                Button(action: {
                    // Retry connection
                    viewModel.checkNetworkStatus()
                }) {
                    Image(systemName: "arrow.clockwise")
                        .foregroundColor(.white)
                }
            }
            .padding(.horizontal)
            .padding(.vertical, 8)
            .background(Color.orange)
        }
    }
    
    /// List of conversations between the user and Vici
    private var conversationList: some View {
        ScrollViewReader { scrollView in
            List {
                if viewModel.conversations.isEmpty {
                    emptyStateView
                } else {
                    ForEach(viewModel.conversations) { conversation in
                        VStack(alignment: .leading, spacing: 10) {
                            // User question
                            HStack {
                                Spacer()
                                
                                Text(conversation.question)
                                    .padding()
                                    .background(Color.blue.opacity(0.2))
                                    .foregroundColor(.primary)
                                    .cornerRadius(16)
                                    .multilineTextAlignment(.trailing)
                            }
                            
                            // Vici answer
                            HStack {
                                VStack(alignment: .leading, spacing: 5) {
                                    HStack(alignment: .top, spacing: 8) {
                                        Image(systemName: "figure.run.circle.fill")
                                            .foregroundColor(.blue)
                                            .font(.title2)
                                        
                                        Text("Vici")
                                            .fontWeight(.bold)
                                            .foregroundColor(.blue)
                                    }
                                    
                                    Text(conversation.answer)
                                        .padding()
                                        .background(Color(.systemGray6))
                                        .cornerRadius(16)
                                }
                                
                                Spacer()
                            }
                            
                            // Plan changes indicator (if applicable)
                            if conversation.hasStructuredChanges {
                                HStack {
                                    Image(systemName: "calendar.badge.plus")
                                        .foregroundColor(.green)
                                    
                                    Text("Vici suggested changes to your plan")
                                        .font(.caption)
                                        .foregroundColor(.green)
                                    
                                    Spacer()
                                }
                                .padding(.leading)
                            }
                            
                            // Timestamp
                            HStack {
                                Spacer()
                                
                                Text(conversation.date.formatted(date: .numeric, time: .shortened))
                                    .font(.caption2)
                                    .foregroundColor(.secondary)
                            }
                        }
                        .padding(.vertical, 5)
                        .id(conversation.id)
                    }
                }
            }
            .listStyle(PlainListStyle())
            .refreshable {
                // Reload conversations when pulled to refresh
                viewModel.loadConversations()
            }
            .onChange(of: viewModel.conversations) { newValue in
                if let firstId = newValue.first?.id {
                    withAnimation {
                        scrollView.scrollTo(firstId, anchor: .top)
                    }
                }
            }
        }
    }
    
    /// Empty state view when there are no conversations
    private var emptyStateView: some View {
        VStack(spacing: 20) {
            Image(systemName: "bubble.left.and.bubble.right")
                .font(.system(size: 50))
                .foregroundColor(.gray)
            
            Text("Ask Vici anything about your training")
                .font(.headline)
                .multilineTextAlignment(.center)
            
            Text("Get advice on workouts, race preparation, recovery, injuries, and more")
                .font(.subheadline)
                .multilineTextAlignment(.center)
                .foregroundColor(.secondary)
                .padding(.horizontal)
            
            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .listRowBackground(Color.clear)
        .listRowSeparator(.hidden)
    }
    
    /// Input field for asking questions
    private var inputField: some View {
        VStack(spacing: 0) {
            Divider()
            
            HStack {
                TextField("Ask Vici about your training...", text: $question)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .focused($isFocused)
                    .disabled(viewModel.isLoading || viewModel.isOffline)
                
                Button(action: {
                    sendQuestion()
                }) {
                    if viewModel.isLoading {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle())
                    } else {
                        Image(systemName: "paperplane.fill")
                            .foregroundColor(.blue)
                    }
                }
                .disabled(question.isEmpty || viewModel.isLoading || viewModel.isOffline)
                .padding(.horizontal, 10)
            }
            .padding()
            .background(Color(.systemBackground))
            .animation(.default, value: viewModel.isLoading)
        }
    }
    
    /// Error overlay displayed when there is an error
    private var errorOverlay: some View {
        VStack {
            Spacer()
            
            VStack(alignment: .leading, spacing: 15) {
                HStack {
                    Image(systemName: errorIcon)
                        .foregroundColor(.white)
                        .font(.title3)
                    
                    Text(errorTitle)
                        .font(.headline)
                        .foregroundColor(.white)
                    
                    Spacer()
                    
                    Button(action: {
                        viewModel.clearError()
                    }) {
                        Image(systemName: "xmark")
                            .foregroundColor(.white)
                    }
                }
                
                Text(viewModel.error?.message ?? "An unknown error occurred")
                    .font(.subheadline)
                    .foregroundColor(.white)
                
                // Different action buttons based on error type
                HStack {
                    if let error = viewModel.error {
                        switch error {
                        case .offline:
                            Button(action: {
                                viewModel.checkNetworkStatus()
                            }) {
                                Text("Check Connection")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                    .padding(.horizontal, 20)
                                    .padding(.vertical, 8)
                                    .background(Color.white.opacity(0.2))
                                    .foregroundColor(.white)
                                    .cornerRadius(8)
                            }
                        case .rateLimited:
                            Button(action: {
                                viewModel.clearError()
                            }) {
                                Text("Dismiss")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                    .padding(.horizontal, 20)
                                    .padding(.vertical, 8)
                                    .background(Color.white.opacity(0.2))
                                    .foregroundColor(.white)
                                    .cornerRadius(8)
                            }
                        case .authenticationError:
                            Button(action: {
                                // Navigate to auth screen would go here
                                viewModel.clearError()
                            }) {
                                Text("Log in")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                    .padding(.horizontal, 20)
                                    .padding(.vertical, 8)
                                    .background(Color.white.opacity(0.2))
                                    .foregroundColor(.white)
                                    .cornerRadius(8)
                            }
                        case .noActivePlan:
                            Button(action: {
                                // Navigation to plan creation would go here
                                viewModel.clearError()
                            }) {
                                Text("Create Plan")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                    .padding(.horizontal, 20)
                                    .padding(.vertical, 8)
                                    .background(Color.white.opacity(0.2))
                                    .foregroundColor(.white)
                                    .cornerRadius(8)
                            }
                        default:
                            Button(action: {
                                viewModel.clearError()
                            }) {
                                Text("Dismiss")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                    .padding(.horizontal, 20)
                                    .padding(.vertical, 8)
                                    .background(Color.white.opacity(0.2))
                                    .foregroundColor(.white)
                                    .cornerRadius(8)
                            }
                        }
                    }
                }
                .padding(.top, 5)
            }
            .padding()
            .background(errorBackgroundColor)
            .cornerRadius(12)
            .shadow(radius: 5)
            .padding()
        }
    }
    
    /// Error icon for the error overlay
    private var errorIcon: String {
        guard let error = viewModel.error else { return "exclamationmark.triangle" }
        
        switch error {
        case .networkError:
            return "wifi.exclamationmark"
        case .serverError:
            return "server.rack"
        case .authenticationError:
            return "person.crop.circle.badge.exclamationmark"
        case .offline:
            return "wifi.slash"
        case .rateLimited:
            return "clock"
        case .noActivePlan:
            return "calendar.badge.exclamationmark"
        case .unknown:
            return "exclamationmark.triangle"
        }
    }
    
    /// Error title for the error overlay
    private var errorTitle: String {
        guard let error = viewModel.error else { return "Error" }
        
        switch error {
        case .networkError:
            return "Connection Error"
        case .serverError:
            return "Server Error"
        case .authenticationError:
            return "Authentication Error"
        case .offline:
            return "You're Offline"
        case .rateLimited:
            return "Rate Limited"
        case .noActivePlan:
            return "No Active Plan"
        case .unknown:
            return "Unexpected Error"
        }
    }
    
    /// Error background color for the error overlay
    private var errorBackgroundColor: Color {
        guard let error = viewModel.error else { return .red }
        
        switch error {
        case .networkError:
            return .red
        case .serverError:
            return .red
        case .authenticationError:
            return .blue
        case .offline:
            return .orange
        case .rateLimited:
            return .purple
        case .noActivePlan:
            return .green
        case .unknown:
            return .red
        }
    }
    
    // MARK: - Methods
    
    /// Send a question to Vici
    private func sendQuestion() {
        guard !question.isEmpty else { return }
        
        let userQuestion = question
        viewModel.sendQuestion(userQuestion)
        question = ""
        isFocused = false
    }
}

// MARK: - Preview
struct AskViciView_Previews: PreviewProvider {
    static var previews: some View {
        AskViciView()
    }
}
