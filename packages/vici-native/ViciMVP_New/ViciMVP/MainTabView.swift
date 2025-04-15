import SwiftUI
import Foundation

// Import necessary views
import UIKit

// No import needed - using AuthViewModel from AuthenticationView

struct MainTabView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var selectedTab = 0
    @State private var showStravaConnectView = false
    
    var body: some View {
        TabView(selection: $selectedTab) {
            // Home tab
            Text("Home View")
                .tabItem {
                    Label("Home", systemImage: "house.fill")
                }
                .tag(0)
            
            // Training Plan tab
            Text("Training Plan")
                .tabItem {
                    Label("Training", systemImage: "figure.run")
                }
                .tag(1)
            
            // Ask Vici tab
            Text("Ask Vici")
                .tabItem {
                    Label("Vici", systemImage: "message.fill")
                }
                .tag(2)
            
            // Profile tab
            Text("Profile")
                .tabItem {
                    Label("Profile", systemImage: "person.fill")
                }
                .tag(3)
            
            // Strava Connect tab
            Text("Strava Connect")
                .tabItem {
                    Label("Strava", systemImage: "link")
                }
                .tag(4)
        }
        .sheet(isPresented: $showStravaConnectView) {
            StravaConnectView(showView: $showStravaConnectView)
        }
    }
}

// Simple StravaConnectView
struct StravaConnectView: View {
    @Binding var showView: Bool
    @State private var isConnecting = false
    @State private var connectionError: String? = nil
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Strava Connect")
                .font(.title)
                .bold()
            
            Text("Link your Strava account to sync your activities")
                .font(.body)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
            
            if isConnecting {
                ProgressView()
                    .padding()
            } else {
                Button(action: connectToStrava) {
                    Text("Connect")
                        .font(.headline)
                        .foregroundColor(.white)
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color.orange)
                        .cornerRadius(10)
                }
                .padding(.horizontal)
            }
            
            if let error = connectionError {
                Text(error)
                    .foregroundColor(.red)
                    .font(.caption)
                    .padding()
            }
            
            Button("Cancel") {
                showView = false
            }
            .padding()
        }
        .padding()
    }
    
    func connectToStrava() {
        isConnecting = true
        connectionError = nil
        
        // Simulate OAuth connection process
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            // Randomly succeed or fail for testing
            let success = Bool.random()
            
            if success {
                // Connection successful
                isConnecting = false
                showView = false
            } else {
                // Connection failed
                isConnecting = false
                connectionError = "Failed to connect to Strava. Please try again."
            }
        }
    }
}

struct MainTabView_Previews: PreviewProvider {
    static var previews: some View {
        MainTabView()
            .environmentObject(AuthViewModel())
    }
}
