import SwiftUI
import UIKit
import Combine
import Foundation

// Handle URL callbacks for OAuth flow
class AppDelegate: NSObject, UIApplicationDelegate {
    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
        // Check if this is a Strava callback
        if url.scheme == "vici" && url.host == "strava-callback" {
            // Post notification for the SafariViewController to handle
            NotificationCenter.default.post(name: NSNotification.Name("StravaSafariCallbackURL"), object: url)
            return true
        }
        return false
    }
}

@main
struct ViciMVPApp: App {
    // Set to true to use mock services for testing
    private let useMockServices = true
    
    @StateObject private var authViewModel: AuthViewModel
    
    // Register app delegate for custom URL scheme handling
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    
    init() {
        if useMockServices {
            // Use mock services for testing
            let mockAuthService = MockAuthService()
            let mockKeychainService = MockKeychainService()
            let mockStravaService = StravaService.shared // We'll continue to use the real one for now
            
            let viewModel = AuthViewModel(
                authService: mockAuthService,
                keychainService: mockKeychainService,
                stravaService: mockStravaService
            )
            _authViewModel = StateObject(wrappedValue: viewModel)
        } else {
            // Use real services
            let viewModel = AuthViewModel()
            _authViewModel = StateObject(wrappedValue: viewModel)
        }
    }
    
    var body: some Scene {
        WindowGroup {
            if authViewModel.isLoading {
                LoadingView()
                    .environmentObject(authViewModel)
            } else if authViewModel.isLoggedIn {
                MainTabView()
                    .environmentObject(authViewModel)
            } else {
                AuthenticationView()
                    .environmentObject(authViewModel)
            }
        }
    }
}

struct LoadingView: View {
    var body: some View {
        VStack {
            ProgressView("Loading...")
                .progressViewStyle(CircularProgressViewStyle())
                .padding()
        }
    }
}
