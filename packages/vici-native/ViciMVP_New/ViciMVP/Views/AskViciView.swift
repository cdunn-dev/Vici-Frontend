import SwiftUI

struct AskViciView: View {
    @StateObject private var viewModel = AskViciViewModel()
    @State private var message = ""
    @FocusState private var isTextFieldFocused: Bool
    
    var body: some View {
        NavigationView {
            VStack {
                // Chat messages scroll view
                ScrollViewReader { scrollView in
                    ScrollView {
                        LazyVStack(spacing: 16) {
                            ForEach(viewModel.messages) { message in
                                MessageBubble(message: message)
                            }
                        }
                        .padding()
                        .id("messagesEnd")
                    }
                    .onChange(of: viewModel.messages.count) { _ in
                        withAnimation {
                            scrollView.scrollTo("messagesEnd", anchor: .bottom)
                        }
                    }
                }
                
                Divider()
                
                // User input field
                VStack(spacing: 8) {
                    if viewModel.isLoading {
                        HStack {
                            Spacer()
                            ProgressView()
                                .padding(.vertical, 10)
                            Spacer()
                        }
                    } else if let error = viewModel.error {
                        Text(error)
                            .font(.caption)
                            .foregroundColor(.red)
                            .padding(.horizontal)
                    }
                    
                    // Suggestion chips
                    if viewModel.messages.isEmpty {
                        SuggestionChipsView { suggestion in
                            message = suggestion
                            sendMessage()
                        }
                    }
                    
                    HStack {
                        TextField("Ask Vici about your training...", text: $message)
                            .padding(10)
                            .background(Color(.systemGray6))
                            .cornerRadius(20)
                            .focused($isTextFieldFocused)
                        
                        Button(action: sendMessage) {
                            Image(systemName: "arrow.up.circle.fill")
                                .font(.system(size: 30))
                                .foregroundColor(message.isEmpty ? .gray : .blue)
                        }
                        .disabled(message.isEmpty || viewModel.isLoading)
                    }
                    .padding(.horizontal)
                    .padding(.bottom, 8)
                }
                .background(Color(.systemBackground))
            }
            .navigationTitle("Ask Vici")
            .onTapGesture {
                isTextFieldFocused = false
            }
            .onAppear {
                if viewModel.messages.isEmpty {
                    // Add welcome message
                    viewModel.addWelcomeMessage()
                }
            }
        }
    }
    
    private func sendMessage() {
        guard !message.isEmpty else { return }
        
        viewModel.sendMessage(message)
        message = ""
    }
}

struct MessageBubble: View {
    let message: ChatMessage
    
    var body: some View {
        HStack {
            if message.isUser {
                Spacer()
            }
            
            VStack(alignment: message.isUser ? .trailing : .leading, spacing: 4) {
                HStack {
                    if !message.isUser {
                        Image("vici-avatar") // Add this to Assets.xcassets
                            .resizable()
                            .frame(width: 24, height: 24)
                            .clipShape(Circle())
                    }
                    
                    Text(message.isUser ? "You" : "Vici")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Text(message.text)
                    .padding(10)
                    .background(message.isUser ? Color.blue : Color(.systemGray5))
                    .foregroundColor(message.isUser ? .white : .primary)
                    .cornerRadius(16)
                
                if let suggestion = message.suggestion, !message.isUser {
                    Text("Would you like me to \(suggestion.description)?")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .padding(.top, 4)
                    
                    HStack {
                        Button(action: {
                            // Accept suggestion logic
                        }) {
                            Text("Yes, please")
                                .font(.caption)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(Color.green.opacity(0.2))
                                .foregroundColor(.green)
                                .cornerRadius(14)
                        }
                        
                        Button(action: {
                            // Reject suggestion logic
                        }) {
                            Text("No thanks")
                                .font(.caption)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(Color.gray.opacity(0.2))
                                .foregroundColor(.gray)
                                .cornerRadius(14)
                        }
                    }
                }
            }
            
            if !message.isUser {
                Spacer()
            }
        }
    }
}

struct SuggestionChipsView: View {
    let onSelect: (String) -> Void
    
    private let suggestions = [
        "How should I adapt my training if I'm feeling tired?",
        "What's a good pre-race meal?",
        "How can I improve my running form?",
        "How should I deal with side stitches?",
        "What's the best way to prevent injuries?"
    ]
    
    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(suggestions, id: \.self) { suggestion in
                    Button(action: {
                        onSelect(suggestion)
                    }) {
                        Text(suggestion)
                            .font(.caption)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 8)
                            .background(Color(.systemGray6))
                            .foregroundColor(.primary)
                            .cornerRadius(16)
                    }
                }
            }
            .padding(.horizontal)
        }
        .padding(.vertical, 8)
    }
}

struct AskViciView_Previews: PreviewProvider {
    static var previews: some View {
        AskViciView()
    }
} 