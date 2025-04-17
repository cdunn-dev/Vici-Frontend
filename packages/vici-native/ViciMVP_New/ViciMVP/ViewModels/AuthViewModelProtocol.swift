import Foundation
import Combine
import SwiftUI

/// Protocol defining the interface for authentication view models
/// Add @MainActor here to ensure conforming types are also main actor isolated
@MainActor 
protocol AuthViewModelProtocol: ObservableObject {
    /// Whether the user is currently logged in
    var isLoggedIn: Bool { get }
    
    /// The currently authenticated user
    var currentUser: User? { get }
    
    /// Whether authentication operations are in progress
    var isLoading: Bool { get }
    
    /// Current error message, if any
    var errorMessage: String? { get set }
    
    /// Whether the user has connected their Strava account
    var isStravaConnected: Bool { get }
    
    /// Log in with email and password
    /// - Parameters:
    ///   - email: User's email address
    ///   - password: User's password
    func login(email: String, password: String)
    
    /// Register a new user
    /// - Parameters:
    ///   - email: User's email address
    ///   - password: User's password
    ///   - name: User's full name
    func register(email: String, password: String, name: String)
    
    /// Log out the current user
    func logout()
    
    /// Refresh the current user's profile
    func refreshUserProfile()
    
    /// Update the Strava connection status
    /// - Parameter isConnected: Whether the user is connected to Strava
    func updateStravaConnectionStatus(isConnected: Bool)
    
    /// Check if the user has connected their Strava account
    func checkStravaConnection()
    
    /// Connect to Strava
    func connectToStrava()
    
    /// Disconnect from Strava
    func disconnectStrava()
} 