#!/usr/bin/env ruby

# This script creates a simplified version of the app with all the core functionality

# Create directory structure
system('mkdir -p ViciMVP_Simple/Models ViciMVP_Simple/ViewModels ViciMVP_Simple/Services')

# Create simplified models
File.open('ViciMVP_Simple/Models/Models.swift', 'w') do |f|
  f.puts <<-CODE
import Foundation
import SwiftUI
import Combine

// Simple User model
struct User: Identifiable, Codable {
    var id: String
    var email: String
    var name: String
    var profileImageUrl: String?
    var isStravaConnected: Bool = false
    
    static let preview = User(id: "user123", email: "test@example.com", name: "Test User")
}

// Simple TrainingPlan model
struct TrainingPlan: Identifiable, Codable {
    var id: String
    var title: String
    var description: String
    var startDate: Date
    var endDate: Date
    var workouts: [Workout]
    var userId: String
    
    static let preview = TrainingPlan(
        id: "plan123",
        title: "10K Training Plan", 
        description: "A plan to prepare for a 10K race",
        startDate: Date(),
        endDate: Date().addingTimeInterval(60*60*24*30),
        workouts: [Workout.preview],
        userId: "user123"
    )
}

// Simple Workout model
struct Workout: Identifiable, Codable {
    var id: String
    var title: String
    var description: String
    var scheduledDate: Date
    var duration: Int
    var distance: Double?
    var completed: Bool
    var trainingPlanId: String
    
    static let preview = Workout(
        id: "workout123",
        title: "Easy Run",
        description: "30 minute easy pace run",
        scheduledDate: Date(),
        duration: 30,
        distance: 5.0,
        completed: false,
        trainingPlanId: "plan123"
    )
}

// Simple Activity model
struct Activity: Identifiable, Codable {
    var id: String
    var type: String
    var startDate: Date
    var endDate: Date
    var duration: Int
    var distance: Double
    var userId: String
    
    static let preview = Activity(
        id: "activity123",
        type: "Run",
        startDate: Date().addingTimeInterval(-3600),
        endDate: Date(),
        duration: 60,
        distance: 10.0,
        userId: "user123"
    )
}

// Simple ViciResponse model
struct ViciResponse: Identifiable, Codable {
    var id: String
    var message: String
    var date: Date
    var userId: String
    
    static let preview = ViciResponse(
        id: "response123",
        message: "Keep up the good work!",
        date: Date(),
        userId: "user123"
    )
}
CODE
end

# Create simplified AuthViewModel
File.open('ViciMVP_Simple/ViewModels/AuthViewModel.swift', 'w') do |f|
  f.puts <<-CODE
import Foundation
import SwiftUI
import Combine

class AuthViewModel: ObservableObject {
    @Published var isLoggedIn: Bool = false
    @Published var currentUser: User?
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    @Published var isStravaConnected: Bool = false
    
    init() {
        // For demo purposes
        self.currentUser = User.preview
        self.isLoggedIn = true
    }
    
    func login(email: String, password: String) {
        isLoading = true
        
        // Simulate login
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            self.currentUser = User.preview
            self.isLoggedIn = true
            self.isLoading = false
        }
    }
    
    func register(email: String, password: String, name: String) {
        isLoading = true
        
        // Simulate registration
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            self.currentUser = User(id: "new_user", email: email, name: name)
            self.isLoggedIn = true
            self.isLoading = false
        }
    }
    
    func logout() {
        isLoading = true
        
        // Simulate logout
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            self.currentUser = nil
            self.isLoggedIn = false
            self.isLoading = false
        }
    }
    
    func updateStravaConnectionStatus(isConnected: Bool) {
        self.isStravaConnected = isConnected
        if var user = currentUser {
            user.isStravaConnected = isConnected
            self.currentUser = user
        }
    }
    
    func refreshUserProfile() {
        // Just a placeholder for now
    }
}
CODE
end

# Create simplified TrainingPlanViewModel
File.open('ViciMVP_Simple/ViewModels/TrainingPlanViewModel.swift', 'w') do |f|
  f.puts <<-CODE
import Foundation
import SwiftUI
import Combine

class TrainingPlanViewModel: ObservableObject {
    @Published var currentPlan: TrainingPlan?
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    @Published var thisWeekWorkouts: [Workout] = []
    
    init() {
        // For demo purposes
        self.currentPlan = TrainingPlan.preview
        self.thisWeekWorkouts = [Workout.preview]
    }
    
    func loadPlan(userId: String) {
        isLoading = true
        
        // Simulate loading
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            self.currentPlan = TrainingPlan.preview
            self.thisWeekWorkouts = [Workout.preview]
            self.isLoading = false
        }
    }
    
    func createPlan(title: String, description: String, userId: String) {
        isLoading = true
        
        // Simulate creation
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            self.currentPlan = TrainingPlan.preview
            self.isLoading = false
        }
    }
}
CODE
end

# Create simplified app file
File.open('ViciMVP_Simple/ViciMVPApp.swift', 'w') do |f|
  f.puts <<-CODE
import SwiftUI

@main
struct ViciMVPApp: App {
    @StateObject private var authViewModel = AuthViewModel()
    
    var body: some Scene {
        WindowGroup {
            if authViewModel.isLoggedIn {
                MainTabView()
                    .environmentObject(authViewModel)
            } else {
                AuthenticationView()
                    .environmentObject(authViewModel)
            }
        }
    }
}

struct MainTabView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var trainingPlanViewModel = TrainingPlanViewModel()
    
    var body: some View {
        TabView {
            // Home tab
            VStack {
                Text("Home")
                    .font(.title)
                    .padding()
            }
            .tabItem {
                Label("Home", systemImage: "house.fill")
            }
            
            // Training Plan tab
            VStack {
                Text("Training Plan")
                    .font(.title)
                    .padding()
                
                if let plan = trainingPlanViewModel.currentPlan {
                    Text(plan.title)
                        .font(.headline)
                    Text(plan.description)
                        .font(.body)
                }
            }
            .tabItem {
                Label("Training Plan", systemImage: "figure.run")
            }
            
            // Strava tab
            VStack {
                Text("Strava Connect")
                    .font(.title)
                    .padding()
                
                Button(action: {
                    authViewModel.updateStravaConnectionStatus(!authViewModel.isStravaConnected)
                }) {
                    Text(authViewModel.isStravaConnected ? "Disconnect Strava" : "Connect with Strava")
                        .padding()
                        .background(Color.orange)
                        .foregroundColor(.white)
                        .cornerRadius(8)
                }
            }
            .tabItem {
                Label("Strava", systemImage: "arrow.triangle.2.circlepath")
            }
            
            // Ask Vici tab
            VStack {
                Text("Ask Vici")
                    .font(.title)
                    .padding()
            }
            .tabItem {
                Label("Ask Vici", systemImage: "message.fill")
            }
            
            // Profile tab
            VStack {
                Text("Profile")
                    .font(.title)
                    .padding()
                
                if let user = authViewModel.currentUser {
                    Text(user.name)
                        .font(.headline)
                    Text(user.email)
                        .font(.body)
                }
                
                Button(action: {
                    authViewModel.logout()
                }) {
                    Text("Logout")
                        .padding()
                        .background(Color.red)
                        .foregroundColor(.white)
                        .cornerRadius(8)
                }
                .padding()
            }
            .tabItem {
                Label("Profile", systemImage: "person.fill")
            }
        }
        .onAppear {
            if let userId = authViewModel.currentUser?.id {
                trainingPlanViewModel.loadPlan(userId: userId)
            }
        }
    }
}

struct AuthenticationView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    
    @State private var email = ""
    @State private var password = ""
    @State private var name = ""
    @State private var isRegistering = false
    
    var body: some View {
        VStack {
            Text(isRegistering ? "Create Account" : "Login")
                .font(.largeTitle)
                .padding()
            
            TextField("Email", text: $email)
                .textContentType(.emailAddress)
                .autocapitalization(.none)
                .padding()
                .background(Color.gray.opacity(0.2))
                .cornerRadius(8)
                .padding(.horizontal)
            
            SecureField("Password", text: $password)
                .padding()
                .background(Color.gray.opacity(0.2))
                .cornerRadius(8)
                .padding(.horizontal)
            
            if isRegistering {
                TextField("Full Name", text: $name)
                    .textContentType(.name)
                    .padding()
                    .background(Color.gray.opacity(0.2))
                    .cornerRadius(8)
                    .padding(.horizontal)
            }
            
            if let error = authViewModel.errorMessage {
                Text(error)
                    .foregroundColor(.red)
                    .padding()
            }
            
            Button(action: {
                if isRegistering {
                    authViewModel.register(email: email, password: password, name: name)
                } else {
                    authViewModel.login(email: email, password: password)
                }
            }) {
                Text(isRegistering ? "Register" : "Login")
                    .foregroundColor(.white)
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(Color.blue)
                    .cornerRadius(8)
                    .padding(.horizontal)
            }
            .disabled(authViewModel.isLoading)
            .opacity(authViewModel.isLoading ? 0.5 : 1.0)
            .overlay(
                Group {
                    if authViewModel.isLoading {
                        ProgressView()
                    }
                }
            )
            
            Button(action: {
                isRegistering.toggle()
            }) {
                Text(isRegistering ? "Already have an account? Login" : "Don't have an account? Register")
                    .foregroundColor(.blue)
                    .padding()
            }
        }
    }
}
CODE
end

puts "Created simplified app in ViciMVP_Simple directory"
puts "You can use this app to test and build upon without the complex project issues"
puts "To open in Xcode: xed ViciMVP_Simple" 