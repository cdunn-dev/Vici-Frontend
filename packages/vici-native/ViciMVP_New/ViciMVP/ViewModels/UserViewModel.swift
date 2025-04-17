import Foundation
import Combine

class UserViewModel: ObservableObject {
    @Published var currentUser: User?
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private var authService: AuthService
    private var cancellables = Set<AnyCancellable>()
    
    init(authService: AuthService = AuthService.shared) {
        self.authService = authService
        
        // Load user data on init
        loadCurrentUser()
    }
    
    /// Loads the current user from the auth service
    func loadCurrentUser() {
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                let user = try await authService.getCurrentUser()
                
                DispatchQueue.main.async { [weak self] in
                    self?.currentUser = user
                    self?.isLoading = false
                }
            } catch {
                DispatchQueue.main.async { [weak self] in
                    self?.isLoading = false
                    self?.errorMessage = "Failed to load user profile: \(error.localizedDescription)"
                    print("Error loading user: \(error)")
                }
            }
        }
    }
    
    /// Updates the current user's profile
    func updateProfile(name: String, email: String, completion: @escaping (Bool) -> Void) {
        guard let userId = currentUser?.id else {
            completion(false)
            return
        }
        
        isLoading = true
        
        Task {
            do {
                let updatedUser = try await authService.updateUser(userId: userId, name: name, email: email)
                
                DispatchQueue.main.async { [weak self] in
                    self?.currentUser = updatedUser
                    self?.isLoading = false
                    completion(true)
                }
            } catch {
                DispatchQueue.main.async { [weak self] in
                    self?.isLoading = false
                    self?.errorMessage = "Failed to update profile: \(error.localizedDescription)"
                    print("Error updating user: \(error)")
                    completion(false)
                }
            }
        }
    }
    
    /// Logs the user out
    func logout(completion: @escaping (Bool) -> Void) {
        Task {
            do {
                try await authService.logout()
                
                DispatchQueue.main.async {
                    self.currentUser = nil
                    completion(true)
                }
            } catch {
                DispatchQueue.main.async { [weak self] in
                    self?.errorMessage = "Failed to logout: \(error.localizedDescription)"
                    print("Error logging out: \(error)")
                    completion(false)
                }
            }
        }
    }
} 