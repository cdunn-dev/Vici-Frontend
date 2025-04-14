import SwiftUI
import SafariServices

// Profile View with Strava connection
struct ProfileView: View {
    @EnvironmentObject var userAuth: UserAuthentication
    @StateObject private var viewModel = ProfileViewModel()
    
    var body: some View {
        NavigationView {
            List {
                Section(header: Text("Personal Info")) {
                    HStack {
                        Text("Name")
                        Spacer()
                        Text(userAuth.currentUser?.name ?? "Not available")
                            .foregroundColor(.secondary)
                    }
                    
                    HStack {
                        Text("Email")
                        Spacer()
                        Text(userAuth.currentUser?.email ?? "Not available")
                            .foregroundColor(.secondary)
                    }
                    
                    if let experienceLevel = userAuth.currentUser?.experienceLevel {
                        HStack {
                            Text("Experience Level")
                            Spacer()
                            Text(experienceLevel.rawValue)
                                .foregroundColor(.secondary)
                        }
                    }
                }
                
                Section(header: Text("Integrations")) {
                    Button(action: {
                        viewModel.connectToStrava()
                    }) {
                        HStack {
                            Text(viewModel.isStravaConnected ? "Disconnect Strava" : "Connect with Strava")
                            Spacer()
                            if viewModel.isLoading {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle())
                            } else if viewModel.isStravaConnected {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundColor(.green)
                            } else {
                                Image(systemName: "link")
                                    .foregroundColor(.blue)
                            }
                        }
                    }
                    .disabled(viewModel.isLoading)
                    
                    if viewModel.showStravaStatus {
                        Text(viewModel.stravaStatusMessage)
                            .font(.footnote)
                            .foregroundColor(viewModel.isStravaError ? .red : .green)
                            .padding(.top, 5)
                    }
                }
                
                if let user = userAuth.currentUser, viewModel.isStravaConnected {
                    Section(header: Text("Running Profile")) {
                        if let fitnessLevel = user.currentFitnessLevel {
                            HStack {
                                Text("Current Fitness Level")
                                Spacer()
                                Text(String(format: "%.1f", fitnessLevel))
                                    .foregroundColor(.secondary)
                            }
                        }
                        
                        if let personalBests = user.personalBests, !personalBests.isEmpty {
                            NavigationLink(destination: PersonalBestsView(personalBests: personalBests)) {
                                Text("Personal Bests")
                            }
                        }
                    }
                }
                
                Section {
                    Button(action: {
                        userAuth.logout()
                    }) {
                        Text("Sign Out")
                            .foregroundColor(.red)
                    }
                }
            }
            .navigationTitle("Profile")
            .sheet(isPresented: $viewModel.showStravaWebView, onDismiss: {
                // Handle dismissal if needed
            }) {
                if let urlString = viewModel.stravaAuthURL, let url = URL(string: urlString) {
                    SafariView(url: url)
                } else {
                    Text("Unable to load Strava authentication page")
                        .padding()
                }
            }
            .onAppear {
                viewModel.checkStravaConnection()
                Task {
                    await userAuth.refreshProfile()
                }
            }
        }
    }
}

// View Model for Profile
class ProfileViewModel: ObservableObject {
    @Published var isStravaConnected = false
    @Published var isLoading = false
    @Published var showStravaWebView = false
    @Published var stravaAuthURL: String?
    @Published var showStravaStatus = false
    @Published var stravaStatusMessage = ""
    @Published var isStravaError = false
    
    private let apiClient = APIClient()
    
    func checkStravaConnection() {
        // TODO: Check if user has a valid Strava connection
        // For now, we'll just use a placeholder
        isStravaConnected = false
    }
    
    func connectToStrava() {
        showStravaStatus = false
        isLoading = true
        
        Task {
            do {
                let authURL = try await apiClient.getStravaConnectURL()
                
                await MainActor.run {
                    self.stravaAuthURL = authURL
                    self.isLoading = false
                    self.showStravaWebView = true
                }
            } catch {
                await MainActor.run {
                    self.isLoading = false
                    self.showStravaStatus = true
                    self.stravaStatusMessage = "Failed to connect to Strava: \(error.localizedDescription)"
                    self.isStravaError = true
                }
            }
        }
    }
    
    func handleStravaCallback(url: URL) {
        // Handle the callback from Strava OAuth
        // This will be called when the user is redirected back to the app
        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: true),
              let queryItems = components.queryItems else {
            return
        }
        
        // Check for error
        if let error = queryItems.first(where: { $0.name == "error" })?.value {
            showStravaStatus = true
            stravaStatusMessage = "Strava connection failed: \(error)"
            isStravaError = true
            return
        }
        
        // Check for success
        if let success = queryItems.first(where: { $0.name == "strava_success" })?.value, success == "true" {
            isStravaConnected = true
            showStravaStatus = true
            stravaStatusMessage = "Successfully connected to Strava"
            isStravaError = false
        }
    }
}

// Safari View Controller wrapper for SwiftUI
struct SafariView: UIViewControllerRepresentable {
    let url: URL
    
    func makeUIViewController(context: UIViewControllerRepresentableContext<SafariView>) -> SFSafariViewController {
        return SFSafariViewController(url: url)
    }
    
    func updateUIViewController(_ uiViewController: SFSafariViewController, context: UIViewControllerRepresentableContext<SafariView>) {
        // No updates needed
    }
}

// Personal Bests View
struct PersonalBestsView: View {
    let personalBests: [PersonalBest]
    
    var body: some View {
        List(personalBests) { pb in
            VStack(alignment: .leading, spacing: 5) {
                Text(pb.formattedDistance)
                    .font(.headline)
                
                HStack {
                    Text(pb.formattedTime)
                    Spacer()
                    Text(pb.formattedPace)
                }
                .font(.subheadline)
                
                if let date = pb.date {
                    Text("Achieved: \(date.formatted(date: .medium, time: .omitted))")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .padding(.vertical, 5)
        }
        .navigationTitle("Personal Bests")
    }
} 