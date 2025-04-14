import SwiftUI
import WebKit
import AuthenticationServices

struct StravaConnectionView: View {
    @Environment(\.presentationMode) var presentationMode
    @ObservedObject private var authViewModel = AuthViewModel.shared
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showWebView = false
    @State private var authURL: String?
    
    var body: some View {
        NavigationView {
            VStack {
                // Header
                VStack(alignment: .leading, spacing: 10) {
                    Text("Connect with Strava")
                        .font(.title)
                        .bold()
                    
                    Text("Connect your Strava account to automatically sync your runs and track your progress.")
                        .font(.body)
                        .foregroundColor(.secondary)
                }
                .padding()
                .frame(maxWidth: .infinity, alignment: .leading)
                
                // Strava logo and info
                VStack(spacing: 20) {
                    Image("strava-logo") // Add this to Assets.xcassets
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(width: 120, height: 60)
                    
                    VStack(alignment: .leading, spacing: 8) {
                        FeatureRow(icon: "arrow.triangle.2.circlepath", text: "Automatically import your runs")
                        FeatureRow(icon: "chart.bar.fill", text: "Track your progress over time")
                        FeatureRow(icon: "calendar", text: "Match completed runs to your training plan")
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                    .padding(.horizontal)
                }
                .padding()
                
                Spacer()
                
                // Connect button
                Button(action: {
                    connectStrava()
                }) {
                    if isLoading {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    } else {
                        Text("Connect with Strava")
                            .font(.headline)
                            .foregroundColor(.white)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.orange)
                .cornerRadius(12)
                .padding()
                .disabled(isLoading)
                
                // Error message
                if let errorMessage = errorMessage {
                    Text(errorMessage)
                        .foregroundColor(.red)
                        .padding()
                }
            }
            .navigationBarTitle("", displayMode: .inline)
            .navigationBarItems(leading: Button(action: {
                presentationMode.wrappedValue.dismiss()
            }) {
                Text("Cancel")
            })
            .fullScreenCover(isPresented: $showWebView) {
                if let urlString = authURL, let url = URL(string: urlString) {
                    SafariView(url: url, callbackURLScheme: "vici-app") { callbackURL in
                        self.showWebView = false
                        handleCallback(callbackURL)
                    }
                } else {
                    Text("Loading...")
                        .onAppear {
                            self.showWebView = false
                            self.errorMessage = "Failed to load authorization page"
                        }
                }
            }
        }
    }
    
    private func connectStrava() {
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                // Get the authorization URL from our backend
                authURL = try await StravaService.shared.getStravaAuthURL()
                
                // Show the web view for user to authorize on Strava
                DispatchQueue.main.async {
                    self.isLoading = false
                    self.showWebView = true
                }
            } catch {
                DispatchQueue.main.async {
                    self.isLoading = false
                    self.errorMessage = "Failed to start Strava connection: \(error.localizedDescription)"
                }
            }
        }
    }
    
    private func handleCallback(_ callbackURL: URL) {
        // Extract the authorization code from the callback URL
        guard let components = URLComponents(url: callbackURL, resolvingAgainstBaseURL: true),
              let queryItems = components.queryItems else {
            errorMessage = "Invalid callback URL"
            return
        }
        
        // Find the authorization code and state parameter
        guard let code = queryItems.first(where: { $0.name == "code" })?.value,
              let state = queryItems.first(where: { $0.name == "state" })?.value else {
            errorMessage = "Authorization code not found"
            return
        }
        
        isLoading = true
        
        // Exchange the code for tokens
        Task {
            do {
                let success = try await StravaService.shared.connectStrava(code: code)
                
                DispatchQueue.main.async {
                    self.isLoading = false
                    if success {
                        // Connection successful, dismiss the view
                        self.presentationMode.wrappedValue.dismiss()
                    } else {
                        self.errorMessage = "Failed to connect Strava account"
                    }
                }
            } catch {
                DispatchQueue.main.async {
                    self.isLoading = false
                    self.errorMessage = "Error connecting to Strava: \(error.localizedDescription)"
                }
            }
        }
    }
}

// Helper view for feature rows
struct FeatureRow: View {
    let icon: String
    let text: String
    
    var body: some View {
        HStack(spacing: 15) {
            Image(systemName: icon)
                .foregroundColor(.orange)
                .font(.system(size: 20))
            
            Text(text)
                .font(.subheadline)
        }
    }
}

// Safari view controller wrapper for OAuth web flow
struct SafariView: UIViewControllerRepresentable {
    let url: URL
    let callbackURLScheme: String
    let onCallback: (URL) -> Void
    
    func makeUIViewController(context: Context) -> ASWebAuthenticationSession {
        let session = ASWebAuthenticationSession(
            url: url,
            callbackURLScheme: callbackURLScheme,
            completionHandler: { callbackURL, error in
                if let callbackURL = callbackURL {
                    onCallback(callbackURL)
                }
            }
        )
        
        session.presentationContextProvider = context.coordinator
        session.prefersEphemeralWebBrowserSession = true
        session.start()
        
        return session
    }
    
    func updateUIViewController(_ uiViewController: ASWebAuthenticationSession, context: Context) {
        // No updates needed
    }
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, ASWebAuthenticationPresentationContextProviding {
        let parent: SafariView
        
        init(_ parent: SafariView) {
            self.parent = parent
        }
        
        func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
            return ASPresentationAnchor()
        }
    }
}

struct StravaConnectionView_Previews: PreviewProvider {
    static var previews: some View {
        StravaConnectionView()
    }
} 