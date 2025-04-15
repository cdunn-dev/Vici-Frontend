import SwiftUI
import SafariServices
import class ViciMVP.AuthViewModel_Fixed
import class ViciMVP.StravaService

/// View for connecting user's Strava account
struct StravaConnectView: View {
    @EnvironmentObject var authViewModel: AuthViewModel_Fixed
    @State private var isConnecting = false
    @State private var error: Error?
    @State private var isShowingAuthWebView = false
    @State private var authURL: URL?
    
    // For Safari view controller presentation
    @State private var safariVC: SFSafariViewController?
    
    var body: some View {
        ZStack {
            ScrollView {
                VStack(alignment: .center, spacing: 20) {
                    // Header
                    Text("Connect to Strava")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .padding(.top, 30)
                    
                    // Strava logo
                    Image("strava-logo")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 120, height: 120)
                        .padding(.vertical, 20)
                    
                    // Description
                    VStack(alignment: .leading, spacing: 15) {
                        Text("Sync your workouts with Strava")
                            .font(.headline)
                        
                        Text("Connecting to Strava allows Vici to:")
                            .font(.subheadline)
                            .padding(.top, 5)
                        
                        VStack(alignment: .leading, spacing: 10) {
                            FeatureRow(icon: "arrow.down", text: "Import your past activities")
                            FeatureRow(icon: "arrow.up", text: "Export completed workouts to Strava")
                            FeatureRow(icon: "clock", text: "Keep your training history in sync")
                            FeatureRow(icon: "chart.bar", text: "Improve training recommendations")
                        }
                        .padding(.leading)
                    }
                    .padding(.horizontal)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    
                    // Connection status
                    Group {
                        if let user = authViewModel.currentUser, user.isStravaConnected {
                            // Already connected view
                            VStack(spacing: 15) {
                                Text("Your Strava account is connected")
                                    .font(.headline)
                                    .foregroundColor(.green)
                                
                                Button(action: disconnectStrava) {
                                    Text("Disconnect from Strava")
                                        .fontWeight(.semibold)
                                        .padding()
                                        .frame(maxWidth: .infinity)
                                        .background(Color.red.opacity(0.8))
                                        .foregroundColor(.white)
                                        .cornerRadius(10)
                                }
                                .buttonStyle(PlainButtonStyle())
                            }
                        } else {
                            // Connect button
                            Button(action: connectToStrava) {
                                HStack {
                                    if isConnecting {
                                        ProgressView()
                                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                            .padding(.trailing, 5)
                                    }
                                    
                                    Text(isConnecting ? "Connecting..." : "Connect with Strava")
                                        .fontWeight(.semibold)
                                }
                                .padding()
                                .frame(maxWidth: .infinity)
                                .background(Color.orange)
                                .foregroundColor(.white)
                                .cornerRadius(10)
                            }
                            .buttonStyle(PlainButtonStyle())
                            .disabled(isConnecting)
                        }
                    }
                    .padding(.top, 30)
                    .padding(.horizontal, 25)
                    
                    // Error message
                    if let error = error {
                        Text("Error: \(error.localizedDescription)")
                            .font(.footnote)
                            .foregroundColor(.red)
                            .padding()
                            .multilineTextAlignment(.center)
                    }
                    
                    Spacer()
                }
                .padding()
            }
            
            // Safari view for authentication
            if isShowingAuthWebView, let authURL = authURL {
                Color.black.opacity(0.3)
                    .edgesIgnoringSafeArea(.all)
                    .onTapGesture {
                        isShowingAuthWebView = false
                    }
                
                VStack {
                    HStack {
                        Spacer()
                        Button(action: { isShowingAuthWebView = false }) {
                            Image(systemName: "xmark.circle.fill")
                                .font(.title)
                                .foregroundColor(.gray)
                        }
                        .padding()
                    }
                    
                    SafariView(url: authURL)
                        .cornerRadius(20)
                        .padding(.horizontal)
                        .edgesIgnoringSafeArea(.bottom)
                }
            }
        }
        .onOpenURL { url in
            handleStravaCallback(url: url)
        }
    }
    
    // MARK: - Actions
    
    private func connectToStrava() {
        guard let userId = authViewModel.currentUser?.id else {
            error = NSError(domain: "StravaConnect", code: 1, userInfo: [NSLocalizedDescriptionKey: "User not logged in"])
            return
        }
        
        isConnecting = true
        error = nil
        
        Task {
            do {
                let url = try await StravaService.shared.getAuthorizationURL(userId: userId)
                DispatchQueue.main.async {
                    self.authURL = url
                    self.isShowingAuthWebView = true
                    self.isConnecting = false
                }
            } catch {
                DispatchQueue.main.async {
                    self.error = error
                    self.isConnecting = false
                }
            }
        }
    }
    
    private func disconnectStrava() {
        guard let userId = authViewModel.currentUser?.id else {
            error = NSError(domain: "StravaConnect", code: 1, userInfo: [NSLocalizedDescriptionKey: "User not logged in"])
            return
        }
        
        isConnecting = true
        error = nil
        
        Task {
            do {
                try await StravaService.shared.disconnectAccount(userId: userId)
                
                DispatchQueue.main.async {
                    self.isConnecting = false
                    // Update user's Strava connection status
                    self.authViewModel.refreshUserProfile()
                }
            } catch {
                DispatchQueue.main.async {
                    self.error = error
                    self.isConnecting = false
                }
            }
        }
    }
    
    private func handleStravaCallback(url: URL) {
        guard url.scheme == "vici", url.host == "strava-callback",
              let components = URLComponents(url: url, resolvingAgainstBaseURL: true),
              let queryItems = components.queryItems,
              let code = queryItems.first(where: { $0.name == "code" })?.value else {
            error = NSError(domain: "StravaConnect", code: 2, userInfo: [NSLocalizedDescriptionKey: "Invalid callback URL"])
            return
        }
        
        // Get state parameter if present
        let state = queryItems.first(where: { $0.name == "state" })?.value
        
        guard let userId = authViewModel.currentUser?.id else {
            error = NSError(domain: "StravaConnect", code: 3, userInfo: [NSLocalizedDescriptionKey: "User not logged in"])
            return
        }
        
        isConnecting = true
        
        Task {
            do {
                try await StravaService.shared.exchangeCodeForToken(userId: userId, code: code, state: state)
                
                DispatchQueue.main.async {
                    self.isConnecting = false
                    self.isShowingAuthWebView = false
                    // Update user's Strava connection status
                    self.authViewModel.refreshUserProfile()
                }
            } catch {
                DispatchQueue.main.async {
                    self.error = error
                    self.isConnecting = false
                }
            }
        }
    }
}

// MARK: - Helper Views

struct FeatureRow: View {
    let icon: String
    let text: String
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundColor(.orange)
                .frame(width: 25)
            
            Text(text)
                .font(.body)
            
            Spacer()
        }
    }
}

struct SafariView: UIViewControllerRepresentable {
    let url: URL
    
    func makeUIViewController(context: Context) -> SFSafariViewController {
        return SFSafariViewController(url: url)
    }
    
    func updateUIViewController(_ uiViewController: SFSafariViewController, context: Context) {}
}

// MARK: - Preview
struct StravaConnectView_Previews: PreviewProvider {
    static var previews: some View {
        StravaConnectView()
            .environmentObject(AuthViewModel_Fixed())
    }
} 