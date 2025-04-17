import SwiftUI
import UIKit

// Handle URL callbacks for OAuth flow
class AppDelegate: NSObject, UIApplicationDelegate {
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
        print("Application did finish launching")
        return true
    }
    
    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
        print("Received URL: \(url.absoluteString)")
        return false
    }
}

// Notification names for Strava callbacks
extension Notification.Name {
    static let stravaCallbackReceived = Notification.Name("com.vici.app.stravaCallbackReceived")
    static let stravaCallbackFailed = Notification.Name("com.vici.app.stravaCallbackFailed")
}

@main
struct ViciMVPApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    @StateObject private var authViewModel = SimpleAuthViewModel()
    
    var body: some Scene {
        WindowGroup {
            if authViewModel.isLoggedIn {
                MainTabView()
                .environmentObject(authViewModel)
            } else {
                SimpleAuthView()
                .environmentObject(authViewModel)
            }
        }
    }
}
