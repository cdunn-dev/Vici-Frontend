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
    @StateObject private var authViewModel = AuthViewModel_Fixed()
    
    // Register app delegate for custom URL scheme handling
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    
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
