//
//  ViciAppApp.swift
//  ViciApp
//
//  Created by Chris Dunn on 11/04/2025.
//

import SwiftUI
import SwiftData

// User authentication model
class UserAuthentication: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    
    func login(email: String, password: String) {
        // In a real app, this would validate credentials with a backend
        // For the MVP, we'll just simulate success
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            self.isAuthenticated = true
            self.currentUser = User.current
        }
    }
    
    func register(email: String, password: String, name: String = "") {
        // In a real app, this would register a new user with a backend
        // For the MVP, we'll just simulate success
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            self.isAuthenticated = true
            self.currentUser = User.current
        }
    }
    
    func logout() {
        isAuthenticated = false
        currentUser = nil
    }
}

@main
struct ViciAppApp: App {
    @StateObject private var userAuth = UserAuthentication()
    
    var sharedModelContainer: ModelContainer = {
        let schema = Schema([
            // No models needed for the MVP since we're using mock data
        ])
        let modelConfiguration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: true)

        do {
            return try ModelContainer(for: schema, configurations: [modelConfiguration])
        } catch {
            fatalError("Could not create ModelContainer: \(error)")
        }
    }()

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
        .modelContainer(sharedModelContainer)
    }
}
