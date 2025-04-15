import Foundation
import Combine
import SwiftUI

/// Mock implementation of AuthServiceProtocol for testing
class MockAuthService: AuthServiceProtocol {
    // MARK: - Properties
    
    /// Authentication state publisher
    private let authStateSubject = CurrentValueSubject<AuthState, Never>(.loggedOut)
    var authStatePublisher: AnyPublisher<AuthState, Never> {
        authStateSubject.eraseToAnyPublisher()
    }
    
    /// Mock user for simulating login/registration
    private var mockUser: User = User.preview
    
    /// Flag to simulate API errors
    var shouldSimulateErrors: Bool = false
    
    /// Delay to simulate network latency (in seconds)
    var simulatedDelay: Double = 0.5
    
    // MARK: - Methods
    
    /// Check the current authentication status
    func checkAuthStatus() {
        // Simulate a delay
        DispatchQueue.main.asyncAfter(deadline: .now() + simulatedDelay) { [weak self] in
            guard let self = self else { return }
            
            // If there's a stored mock token, consider the user logged in
            if KeychainService.shared.getAccessToken() != nil {
                self.authStateSubject.send(.loggedIn(self.mockUser))
            } else {
                self.authStateSubject.send(.loggedOut)
            }
        }
    }
    
    /// Login with email and password
    func login(email: String, password: String, completion: @escaping (Result<User, Error>) -> Void) {
        // Simulate a delay
        DispatchQueue.main.asyncAfter(deadline: .now() + simulatedDelay) { [weak self] in
            guard let self = self else { return }
            
            if self.shouldSimulateErrors {
                // Simulate an error
                let error = NSError(domain: "MockAuthService", code: 401, userInfo: [
                    NSLocalizedDescriptionKey: "Invalid credentials"
                ])
                completion(.failure(error))
                return
            }
            
            // Validate credentials (simple check for testing)
            if email == "test@example.com" && password == "password123" {
                // Store mock tokens
                KeychainService.shared.saveAccessToken("mock_access_token")
                KeychainService.shared.saveRefreshToken("mock_refresh_token")
                
                // Update auth state
                self.authStateSubject.send(.loggedIn(self.mockUser))
                
                // Return success
                completion(.success(self.mockUser))
            } else {
                // Return error for invalid credentials
                let error = NSError(domain: "MockAuthService", code: 401, userInfo: [
                    NSLocalizedDescriptionKey: "Invalid credentials"
                ])
                completion(.failure(error))
            }
        }
    }
    
    /// Register a new user
    func register(email: String, password: String, name: String, completion: @escaping (Result<User, Error>) -> Void) {
        // Simulate a delay
        DispatchQueue.main.asyncAfter(deadline: .now() + simulatedDelay) { [weak self] in
            guard let self = self else { return }
            
            if self.shouldSimulateErrors {
                // Simulate an error
                let error = NSError(domain: "MockAuthService", code: 400, userInfo: [
                    NSLocalizedDescriptionKey: "Email already in use"
                ])
                completion(.failure(error))
                return
            }
            
            // Create a new mock user
            var newUser = self.mockUser
            newUser.name = name
            newUser.email = email
            
            // Store the new user
            self.mockUser = newUser
            
            // Store mock tokens
            KeychainService.shared.saveAccessToken("mock_access_token")
            KeychainService.shared.saveRefreshToken("mock_refresh_token")
            
            // Update auth state
            self.authStateSubject.send(.loggedIn(self.mockUser))
            
            // Return success
            completion(.success(self.mockUser))
        }
    }
    
    /// Logout the current user
    func logout(completion: @escaping (Result<Void, Error>) -> Void) {
        // Simulate a delay
        DispatchQueue.main.asyncAfter(deadline: .now() + simulatedDelay) { [weak self] in
            guard let self = self else { return }
            
            if self.shouldSimulateErrors {
                // Simulate an error
                let error = NSError(domain: "MockAuthService", code: 500, userInfo: [
                    NSLocalizedDescriptionKey: "Server error during logout"
                ])
                completion(.failure(error))
                return
            }
            
            // Clear mock tokens
            KeychainService.shared.clearTokens()
            
            // Update auth state
            self.authStateSubject.send(.loggedOut)
            
            // Return success
            completion(.success(()))
        }
    }
    
    /// Get the current user's profile
    func getUserProfile(completion: @escaping (Result<User, Error>) -> Void) {
        // Simulate a delay
        DispatchQueue.main.asyncAfter(deadline: .now() + simulatedDelay) { [weak self] in
            guard let self = self else { return }
            
            if self.shouldSimulateErrors {
                // Simulate an error
                let error = NSError(domain: "MockAuthService", code: 500, userInfo: [
                    NSLocalizedDescriptionKey: "Server error when fetching profile"
                ])
                completion(.failure(error))
                return
            }
            
            // Return the mock user
            completion(.success(self.mockUser))
        }
    }
    
    /// Check if a user has connected their Strava account
    func checkStravaConnection(userId: String, completion: @escaping (Result<Bool, Error>) -> Void) {
        // Simulate a delay
        DispatchQueue.main.asyncAfter(deadline: .now() + simulatedDelay) { [weak self] in
            guard let self = self else { return }
            
            if self.shouldSimulateErrors {
                // Simulate an error
                let error = NSError(domain: "MockAuthService", code: 500, userInfo: [
                    NSLocalizedDescriptionKey: "Error checking Strava connection"
                ])
                completion(.failure(error))
                return
            }
            
            // Return the Strava connection status from the mock user
            let isConnected = self.mockUser.stravaConnection != nil
            completion(.success(isConnected))
        }
    }
    
    /// Connect a user's Strava account
    func connectStrava(userId: String, completion: @escaping (Result<Void, Error>) -> Void) {
        // Simulate a delay
        DispatchQueue.main.asyncAfter(deadline: .now() + simulatedDelay) { [weak self] in
            guard let self = self else { return }
            
            if self.shouldSimulateErrors {
                // Simulate an error
                let error = NSError(domain: "MockAuthService", code: 500, userInfo: [
                    NSLocalizedDescriptionKey: "Error connecting to Strava"
                ])
                completion(.failure(error))
                return
            }
            
            // Update the mock user with a Strava connection
            var updatedUser = self.mockUser
            updatedUser.stravaConnection = UserConnection(
                id: "strava_connection_id",
                userId: userId,
                providerName: "strava",
                providerId: "strava_user_123",
                active: true
            )
            
            // Store the updated user
            self.mockUser = updatedUser
            
            // Update auth state
            self.authStateSubject.send(.loggedIn(self.mockUser))
            
            // Return success
            completion(.success(()))
        }
    }
    
    /// Disconnect a user's Strava account
    func disconnectStrava(userId: String, completion: @escaping (Result<Void, Error>) -> Void) {
        // Simulate a delay
        DispatchQueue.main.asyncAfter(deadline: .now() + simulatedDelay) { [weak self] in
            guard let self = self else { return }
            
            if self.shouldSimulateErrors {
                // Simulate an error
                let error = NSError(domain: "MockAuthService", code: 500, userInfo: [
                    NSLocalizedDescriptionKey: "Error disconnecting from Strava"
                ])
                completion(.failure(error))
                return
            }
            
            // Update the mock user by removing the Strava connection
            var updatedUser = self.mockUser
            updatedUser.stravaConnection = nil
            
            // Store the updated user
            self.mockUser = updatedUser
            
            // Update auth state
            self.authStateSubject.send(.loggedIn(self.mockUser))
            
            // Return success
            completion(.success(()))
        }
    }
} 