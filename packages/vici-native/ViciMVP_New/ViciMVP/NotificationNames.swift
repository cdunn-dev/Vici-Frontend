import Foundation

// Notification names for Strava callbacks
extension Notification.Name {
    static let stravaCallbackReceived = Notification.Name("com.vici.app.stravaCallbackReceived")
    static let stravaCallbackFailed = Notification.Name("com.vici.app.stravaCallbackFailed")
} 