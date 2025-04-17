import SwiftUI
import SafariServices
import class ViciMVP.AuthViewModel
import class ViciMVP.StravaService
import os.log

/// A view that allows users to connect their Strava account to Vici
struct StravaConnectView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var viewModel: StravaConnectViewModel
    private let logger = Logger(subsystem: "com.vici.app", category: "StravaConnectView")
    
    init() {
        // Use _StateObject to initialize the property wrapper with a new instance
        // Will only be called once when the view is created
        _viewModel = StateObject(wrappedValue: StravaConnectViewModel(
            stravaService: StravaService.shared
        ))
    }
    
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
                
                // DEBUG ONLY - Error simulation in debug builds
                #if DEBUG
                Group {
                    Divider().padding(.vertical)
                    
                    Text("Debug Controls")
                        .font(.headline)
                        .padding(.bottom, 8)
                    
                    HStack(spacing: 12) {
                        Button("Connection Error") {
                            viewModel.handleStravaError(StravaError.connectionFailed(reason: "Test error"))
                        }
                        .padding(8)
                        .background(Color.red.opacity(0.3))
                        .foregroundColor(.white)
                        .cornerRadius(8)
                        
                        Button("Auth Error") {
                            viewModel.handleStravaError(StravaError.userNotAuthenticated)
                        }
                        .padding(8)
                        .background(Color.orange.opacity(0.3))
                        .foregroundColor(.white)
                        .cornerRadius(8)
                        
                        Button("Network Error") {
                            viewModel.handleStravaError(StravaError.offlineError)
                        }
                        .padding(8)
                        .background(Color.blue.opacity(0.3))
                        .foregroundColor(.white)
                        .cornerRadius(8)
                    }
                }
                .padding(.horizontal)
                #endif
                
                Spacer()
            }
            .padding()
            .loadingFullscreen(isLoading: viewModel.isLoading, message: "Processing...")
            .errorToast(error: viewModel.appError) {
                viewModel.clearError()
            }
        }
        .navigationTitle("Strava Integration")
        .onAppear {
            setupNotificationObservers()
            viewModel.setAuthViewModel(authViewModel)
            viewModel.checkStravaConnection()
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
                Image(systemName: viewModel.isStravaConnected ? "checkmark.circle.fill" : "xmark.circle.fill")
                    .font(.system(size: 32))
                    .foregroundColor(viewModel.isStravaConnected ? .green : .gray)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(viewModel.isStravaConnected ? "Connected" : "Not Connected")
                        .font(.headline)
                    
                    Text(viewModel.isStravaConnected 
                         ? "Your Strava account is linked to Vici"
                         : "Connect to import your activities")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                // Show loading indicator for status check
                if viewModel.isCheckingConnection {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle())
                }
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
            if viewModel.isStravaConnected {
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
                .disabled(viewModel.isLoading || viewModel.isDisconnecting)
                .opacity(viewModel.isDisconnecting ? 0.7 : 1.0)
                .overlay(
                    Group {
                        if viewModel.isDisconnecting {
                            HStack {
                                Spacer()
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                Spacer()
                            }
                        }
                    }
                )
                
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
                .disabled(viewModel.isLoading || viewModel.isSyncing)
                .opacity(viewModel.isSyncing ? 0.7 : 1.0)
                .overlay(
                    Group {
                        if viewModel.isSyncing {
                            HStack {
                                Spacer()
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                Spacer()
                            }
                        }
                    }
                )
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
                .disabled(viewModel.isLoading || viewModel.isConnecting || !authViewModel.isLoggedIn)
                .opacity(viewModel.isConnecting ? 0.7 : 1.0)
                .overlay(
                    Group {
                        if viewModel.isConnecting {
                            HStack {
                                Spacer()
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                Spacer()
                            }
                        }
                    }
                )
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
            viewModel.handleError(AuthError.unauthorized, message: "Invalid callback data received")
            return
        }
        
        logger.debug("Received Strava callback with code")
        
        // Use StravaConnectViewModel to handle the callback
        if let url = notification.userInfo?["url"] as? URL {
            viewModel.handleStravaCallback(url: url)
        } else {
            // Fallback to code/state if URL not provided
            processStravaCallback(code: code, state: state)
        }
    }
    
    private func handleCallbackFailure(_ notification: Notification) {
        guard let userInfo = notification.userInfo,
              let error = userInfo["error"] as? String else {
            viewModel.handleError(AuthError.unauthorized, message: "Unknown error processing Strava callback")
            return
        }
        
        logger.error("Strava callback failed: \(error)")
        viewModel.handleStravaError(StravaError.connectionFailed(reason: error))
    }
    
    private func processStravaCallback(code: String, state: String) {
        guard let userId = authViewModel.currentUser?.id else {
            viewModel.handleStravaError(StravaError.userNotAuthenticated)
            return
        }
        
        Task {
            let stravaService = StravaService.shared
            do {
                try await stravaService.exchangeCodeForToken(userId: userId, code: code, state: state)
                viewModel.isStravaConnected = true
                authViewModel.updateStravaConnectionStatus(isConnected: true)
            } catch {
                if let stravaError = error as? StravaError {
                    viewModel.handleStravaError(stravaError)
                } else {
                    viewModel.handleError(error)
                }
            }
        }
    }
    
    // MARK: - Actions
    
    /// Initiates the OAuth flow to connect to Strava
    private func connectToStrava() {
        viewModel.initiateStravaConnection()
    }
    
    /// Disconnects the user's Strava account
    private func disconnectFromStrava() {
        viewModel.disconnectStrava()
    }
    
    /// Syncs latest activities from Strava
    private func syncStravaData() {
        guard let userId = authViewModel.currentUser?.id else {
            viewModel.handleStravaError(StravaError.userNotAuthenticated)
            return
        }
        
        Task {
            await viewModel.syncStravaActivities(userId: userId)
        }
    }
}

// MARK: - Preview
#Preview("Connected") {
    NavigationView {
        StravaConnectView()
            .environmentObject(previewAuthViewModel(isConnected: true))
    }
}

#Preview("Not Connected") {
    NavigationView {
        StravaConnectView()
            .environmentObject(previewAuthViewModel(isConnected: false))
    }
}

private func previewAuthViewModel(isConnected: Bool) -> AuthViewModel {
    let viewModel = AuthViewModel.loggedInPreview()
    viewModel.isStravaConnected = isConnected
    return viewModel
} 