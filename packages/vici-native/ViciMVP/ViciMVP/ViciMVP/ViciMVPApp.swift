import SwiftUI

// User authentication model
class UserAuthentication: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    let authService = AuthenticationService()
    
    init() {
        // Set up observers for the auth service
        authService.$isAuthenticated
            .assign(to: &$isAuthenticated)
        
        authService.$currentUser
            .assign(to: &$currentUser)
            
        authService.$isLoading
            .assign(to: &$isLoading)
            
        authService.$errorMessage
            .assign(to: &$errorMessage)
    }
    
    func login(email: String, password: String) {
        authService.login(email: email, password: password)
    }
    
    func register(email: String, password: String, name: String = "") {
        authService.register(email: email, password: password, name: name)
    }
    
    func logout() {
        authService.logout()
    }
}

@main
struct ViciMVPApp: App {
    @StateObject private var userAuth = UserAuthentication()
    @StateObject private var trainingPlanService = TrainingPlanService()
    
    var body: some Scene {
        WindowGroup {
            if userAuth.isAuthenticated {
                MainTabView()
                    .environmentObject(userAuth)
                    .environmentObject(trainingPlanService)
            } else {
                AuthenticationView()
                    .environmentObject(userAuth)
            }
        }
    }
} 