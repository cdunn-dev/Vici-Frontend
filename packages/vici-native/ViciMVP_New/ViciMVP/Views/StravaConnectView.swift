import SwiftUI
import SafariServices
import class ViciMVP.AuthViewModel
import class ViciMVP.StravaService
import os.log

/// A view that allows users to connect their Strava account to Vici
struct StravaConnectView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var isConnecting = false
    @State private var showError = false
    @State private var errorMessage: String = ""
    private let logger = Logger(subsystem: "com.vici.app", category: "StravaConnectView")
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header section
                VStack(spacing: 16) {
                    Image("strava-logo")
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(height: 60)
                        .padding(.top, 30)
                    
                    Text("Connect with Strava")
                        .font(.title)
                        .fontWeight(.bold)
                    
                    Text("Link your Strava account to import your workouts and training history")
                        .font(.body)
                        .multilineTextAlignment(.center)
                        .foregroundColor(.secondary)
                        .padding(.horizontal)
                }
                .padding(.bottom, 20)
                
                // Connection status
                connectionStatusView
                
                // Benefits section
                VStack(alignment: .leading, spacing: 16) {
                    Text("Benefits of connecting")
                        .font(.headline)
                        .padding(.leading)
                    
                    benefitRow(icon: "clock.arrow.circlepath", title: "Training history", description: "Import your past activities")
                    benefitRow(icon: "chart.bar.fill", title: "Performance insights", description: "Get personalized training recommendations")
                    benefitRow(icon: "calendar", title: "Workout sync", description: "Keep your training calendar up to date")
                }
                .padding()
                .background(Color(.secondarySystemBackground))
                .cornerRadius(12)
                .padding(.horizontal)
                
                // Action buttons
                actionButtonsView
                
                Spacer()
            }
            .padding()
        }
        .navigationTitle("Strava Integration")
        .alert(isPresented: $showError) {
            Alert(
                title: Text("Connection Error"),
                message: Text(errorMessage),
                dismissButton: .default(Text("OK"))
            )
        }
        .onAppear {
            setupNotificationObservers()
            refreshConnectionStatus()
        }
        .onDisappear {
            removeNotificationObservers()
        }
    }
    
    // MARK: - Subviews
    
    /// View showing the current connection status
    private var connectionStatusView: some View {
        VStack(spacing: 16) {
            HStack(spacing: 16) {
                Image(systemName: authViewModel.isStravaConnected ? "checkmark.circle.fill" : "xmark.circle.fill")
                    .font(.system(size: 32))
                    .foregroundColor(authViewModel.isStravaConnected ? .green : .gray)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(authViewModel.isStravaConnected ? "Connected" : "Not Connected")
                        .font(.headline)
                    
                    Text(authViewModel.isStravaConnected 
                         ? "Your Strava account is linked to Vici"
                         : "Connect to import your activities")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
            }
            .padding()
            .background(Color(.secondarySystemBackground))
            .cornerRadius(12)
            .padding(.horizontal)
        }
    }
    
    /// View containing action buttons based on connection state
    private var actionButtonsView: some View {
        VStack(spacing: 16) {
            if authViewModel.isStravaConnected {
                // Disconnect button
                Button(action: disconnectFromStrava) {
                    HStack {
                        Image(systemName: "link.badge.minus")
                        Text("Disconnect from Strava")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.red)
                    .foregroundColor(.white)
                    .cornerRadius(10)
                }
                
                // Sync button
                Button(action: syncStravaData) {
                    HStack {
                        Image(systemName: "arrow.triangle.2.circlepath")
                        Text("Sync Latest Activities")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(10)
                }
            } else {
                // Connect button
                Button(action: connectToStrava) {
                    HStack {
                        Image(systemName: "link.badge.plus")
                        Text("Connect to Strava")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.orange)
                    .foregroundColor(.white)
                    .cornerRadius(10)
                }
                .disabled(isConnecting || !authViewModel.isLoggedIn)
            }
            
            if isConnecting {
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle())
                    .scaleEffect(1.5)
                    .padding()
            }
            
            if !authViewModel.isLoggedIn {
                Text("You need to be logged in to connect Strava")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .padding(.top)
            }
        }
        .padding(.horizontal)
    }
    
    // MARK: - Helper Views
    
    /// Creates a benefit row with icon, title and description
    private func benefitRow(icon: String, title: String, description: String) -> some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .font(.title2)
                .frame(width: 32, height: 32)
                .foregroundColor(.blue)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.headline)
                
                Text(description)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
        }
        .padding(.vertical, 8)
        .padding(.horizontal)
    }
    
    // MARK: - Notification Handling
    
    private func setupNotificationObservers() {
        // Listen for OAuth callback success
        NotificationCenter.default.addObserver(
            forName: .stravaCallbackReceived,
            object: nil,
            queue: .main
        ) { notification in
            handleCallbackNotification(notification)
        }
        
        // Listen for OAuth callback failure
        NotificationCenter.default.addObserver(
            forName: .stravaCallbackFailed,
            object: nil,
            queue: .main
        ) { notification in
            handleCallbackFailure(notification)
        }
    }
    
    private func removeNotificationObservers() {
        NotificationCenter.default.removeObserver(self, name: .stravaCallbackReceived, object: nil)
        NotificationCenter.default.removeObserver(self, name: .stravaCallbackFailed, object: nil)
    }
    
    private func handleCallbackNotification(_ notification: Notification) {
        guard let userInfo = notification.userInfo,
              let code = userInfo["code"] as? String,
              let state = userInfo["state"] as? String else {
            logger.error("Invalid callback notification: missing data")
            showError(message: "Invalid callback data received")
            return
        }
        
        logger.debug("Received Strava callback with code")
        processStravaCallback(code: code, state: state)
    }
    
    private func handleCallbackFailure(_ notification: Notification) {
        guard let userInfo = notification.userInfo,
              let error = userInfo["error"] as? String else {
            showError(message: "Unknown error processing Strava callback")
            return
        }
        
        logger.error("Strava callback failed: \(error)")
        showError(message: "Failed to connect: \(error)")
    }
    
    private func processStravaCallback(code: String, state: String) {
        guard let userId = authViewModel.currentUser?.id else {
            showError(message: "You need to be logged in to connect Strava")
            return
        }
        
        isConnecting = true
        
        Task {
            do {
                let stravaService = StravaService()
                try await stravaService.exchangeCodeForToken(userId: userId, code: code, state: state)
                
                await MainActor.run {
                    authViewModel.updateStravaConnectionStatus(isConnected: true)
                    isConnecting = false
                    refreshConnectionStatus()
                }
            } catch let error as StravaError {
                await MainActor.run {
                    showError(message: error.errorDescription ?? "Failed to exchange Strava token")
                    isConnecting = false
                }
            } catch {
                await MainActor.run {
                    showError(message: "An unexpected error occurred: \(error.localizedDescription)")
                    isConnecting = false
                }
            }
        }
    }
    
    // MARK: - Actions
    
    /// Refreshes the Strava connection status
    private func refreshConnectionStatus() {
        Task {
            await authViewModel.refreshUserProfile()
        }
    }
    
    /// Initiates the OAuth flow to connect to Strava
    private func connectToStrava() {
        guard let userId = authViewModel.currentUser?.id else {
            showError(message: "You need to be logged in to connect Strava")
            return
        }
        
        isConnecting = true
        
        Task {
            do {
                let stravaService = StravaService()
                let authURL = try await stravaService.getAuthorizationURL(userId: userId)
                
                // Open the URL in Safari
                if UIApplication.shared.canOpenURL(authURL) {
                    await MainActor.run {
                        UIApplication.shared.open(authURL)
                        // The app will handle the callback via URL scheme
                    }
                } else {
                    throw StravaError.connectionFailed(reason: "Unable to open Safari")
                }
                
                await MainActor.run {
                    isConnecting = false
                }
            } catch let error as StravaError {
                await MainActor.run {
                    showError(message: error.errorDescription ?? "Failed to connect to Strava")
                    isConnecting = false
                }
            } catch {
                await MainActor.run {
                    showError(message: "An unexpected error occurred: \(error.localizedDescription)")
                    isConnecting = false
                }
            }
        }
    }
    
    /// Disconnects the user's Strava account
    private func disconnectFromStrava() {
        guard let userId = authViewModel.currentUser?.id else {
            showError(message: "You need to be logged in to disconnect Strava")
            return
        }
        
        isConnecting = true
        
        Task {
            do {
                let stravaService = StravaService()
                try await stravaService.disconnectStrava(userId: userId)
                
                await MainActor.run {
                    authViewModel.updateStravaConnectionStatus(isConnected: false)
                    isConnecting = false
                }
            } catch let error as StravaError {
                await MainActor.run {
                    showError(message: error.errorDescription ?? "Failed to disconnect from Strava")
                    isConnecting = false
                }
            } catch {
                await MainActor.run {
                    showError(message: "An unexpected error occurred: \(error.localizedDescription)")
                    isConnecting = false
                }
            }
        }
    }
    
    /// Syncs latest activities from Strava
    private func syncStravaData() {
        guard let userId = authViewModel.currentUser?.id else {
            showError(message: "You need to be logged in to sync Strava data")
            return
        }
        
        isConnecting = true
        
        Task {
            do {
                let stravaService = StravaService()
                try await stravaService.syncActivities(userId: userId)
                
                await MainActor.run {
                    isConnecting = false
                    // You might want to show a success message or update a lastSynced property
                }
            } catch let error as StravaError {
                await MainActor.run {
                    showError(message: error.errorDescription ?? "Failed to sync Strava data")
                    isConnecting = false
                }
            } catch {
                await MainActor.run {
                    showError(message: "An unexpected error occurred: \(error.localizedDescription)")
                    isConnecting = false
                }
            }
        }
    }
    
    /// Shows an error message
    private func showError(message: String) {
        errorMessage = message
        showError = true
    }
}

// MARK: - Preview
struct StravaConnectView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationView {
            StravaConnectView()
                .environmentObject(previewAuthViewModel(isConnected: false))
        }
        .previewDisplayName("Not Connected")
        
        NavigationView {
            StravaConnectView()
                .environmentObject(previewAuthViewModel(isConnected: true))
        }
        .previewDisplayName("Connected")
    }
    
    static func previewAuthViewModel(isConnected: Bool) -> AuthViewModel {
        let viewModel = AuthViewModel(
            authService: AuthService(),
            keychainService: KeychainService()
        )
        viewModel.isStravaConnected = isConnected
        viewModel.isLoggedIn = true
        viewModel.currentUser = User(id: "test-user", name: "Test User", email: "test@example.com")
        return viewModel
    }
} 