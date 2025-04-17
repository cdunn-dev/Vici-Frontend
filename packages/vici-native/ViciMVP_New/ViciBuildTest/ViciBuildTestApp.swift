import SwiftUI
import UIKit
import Combine
import Foundation
import os.log

// Handle URL callbacks for OAuth flow
class AppDelegate: NSObject, UIApplicationDelegate {
    private let logger = Logger(subsystem: "com.vici.app", category: "AppDelegate")
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
        print("Application did finish launching")
        return true
    }
    
    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
        print("Received URL: \(url.absoluteString)")
        
        // Check if this is a Strava callback
        if url.scheme == "vici" && url.host == "strava-callback" {
            print("Processing Strava callback")
            handleStravaCallback(url: url)
            return true
        }
        return false
    }
    
    // Process Strava callback
    private func handleStravaCallback(url: URL) {
        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: true),
              let queryItems = components.queryItems,
              let code = queryItems.first(where: { $0.name == "code" })?.value else {
            print("Invalid Strava callback: missing required parameters")
            // Post notification of failure
            NotificationCenter.default.post(
                name: .stravaCallbackFailed,
                object: nil,
                userInfo: ["error": "Missing required parameters"]
            )
            return
        }
        
        // Get state parameter (used for CSRF protection)
        let state = queryItems.first(where: { $0.name == "state" })?.value
        
        // Post notification with the auth code
        NotificationCenter.default.post(
            name: .stravaCallbackReceived,
            object: nil,
            userInfo: [
                "code": code,
                "state": state ?? ""
            ]
        )
        
        print("Dispatched Strava callback notification")
    }
}

// Notification names for Strava callbacks
extension Notification.Name {
    static let stravaCallbackReceived = Notification.Name("com.vici.app.stravaCallbackReceived")
    static let stravaCallbackFailed = Notification.Name("com.vici.app.stravaCallbackFailed")
}

// Removed unnecessary import as Models are compiled directly
// import ViciModels

@main
struct ViciMVPApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    // Explicitly provide all dependencies since keychainService no longer has a default
    @StateObject private var authViewModel = AuthViewModel(
        keychainService: KeychainService.shared
        // authService and stravaService still use their defaults
    )
    
    init() {
        // Remove the forced login state - let the AuthViewModel determine it
        // authViewModel.isLoggedIn = true
        print("App initialized with real AuthViewModel")
    }
    
    var body: some Scene {
        WindowGroup {
            // Use a Content view that handles the loading/auth/main logic
            ContentView()
                .environmentObject(authViewModel)
        }
    }
}

// Create a ContentView to manage the root view based on AuthViewModel state
struct ContentView: View {
    @EnvironmentObject var authViewModel: AuthViewModel

    var body: some View {
        // Show loading view while checking auth status initially
        if authViewModel.isLoading && authViewModel.currentUser == nil {
             LoadingView()
        } else if authViewModel.isLoggedIn {
             // If logged in, show the main tab view
             MainTabView()
        } else {
             // If not logged in, show the AuthView
             AuthView() 
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