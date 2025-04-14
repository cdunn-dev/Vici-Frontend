import SwiftUI

// User authentication model
class UserAuthentication: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    @Published var isLoading = false
    
    private let apiClient = APIClient()
    
    // Check for existing auth token in keychain
    init() {
        // TODO: Load saved token from KeychainService
        // If token exists, validate it and set isAuthenticated = true
    }
    
    func login(email: String, password: String) async throws {
        isLoading = true
        
        do {
            let user = try await apiClient.login(email: email, password: password)
            
            await MainActor.run {
                self.currentUser = user
                self.isAuthenticated = true
                self.isLoading = false
            }
            
            // TODO: Save token to KeychainService
        } catch {
            await MainActor.run {
                self.isLoading = false
            }
            throw error
        }
    }
    
    func register(email: String, password: String, name: String) async throws {
        isLoading = true
        
        do {
            let user = try await apiClient.register(email: email, password: password, name: name)
            
            await MainActor.run {
                self.currentUser = user
                self.isAuthenticated = true
                self.isLoading = false
            }
            
            // TODO: Save token to KeychainService
        } catch {
            await MainActor.run {
                self.isLoading = false
            }
            throw error
        }
    }
    
    func logout() {
        isAuthenticated = false
        currentUser = nil
        
        // TODO: Remove token from KeychainService
    }
    
    func refreshProfile() async {
        guard isAuthenticated else { return }
        
        do {
            let user = try await apiClient.getUserProfile()
            await MainActor.run {
                self.currentUser = user
            }
        } catch {
            print("Error refreshing profile: \(error)")
        }
    }
}

@main
struct ViciMVPApp: App {
    @StateObject private var userAuth = UserAuthentication()
    
    var body: some Scene {
        WindowGroup {
            if userAuth.isAuthenticated {
                MainTabView()
                    .environmentObject(userAuth)
            } else {
                AuthenticationView()
                    .environmentObject(userAuth)
            }
        }
    }
} 