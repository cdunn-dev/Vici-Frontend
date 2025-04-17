import UIKit
import SwiftUI
import os.log

class AppDelegate: NSObject, UIApplicationDelegate {
    private let logger = Logger(subsystem: "com.vici.app", category: "AppDelegate")
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
        logger.debug("Application did finish launching")
        return true
    }
    
    // Handle incoming URLs (for OAuth callbacks)
    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        logger.debug("Received URL: \(url.absoluteString)")
        
        // Handle Strava OAuth callback
        if url.scheme == "vici" && url.host == "strava-callback" {
            logger.debug("Processing Strava callback")
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
            logger.error("Invalid Strava callback: missing required parameters")
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
        
        logger.debug("Dispatched Strava callback notification")
    }
}

// Removed Notification.Name extension - moved to NotificationNames.swift 