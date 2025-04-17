import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    
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
            Text("Training Plan")
                .font(.title)
                .padding()
                .tabItem {
                    Label("Training Plan", systemImage: "figure.run")
                }
            
            // Strava tab
            NavigationView {
                VStack {
                    Text("Strava Connect")
                        .font(.title)
                        .padding()
                    
                    // Display connection status
                    if authViewModel.isStravaConnected {
                        Text("Connected to Strava")
                            .foregroundColor(.green)
                    } else {
                        Text("Not connected to Strava")
                            .foregroundColor(.red)
                    }
                    
                    // Add connect/disconnect button
                    Button(action: {
                        authViewModel.updateStravaConnectionStatus(isConnected: !authViewModel.isStravaConnected)
                    }) {
                        Text(authViewModel.isStravaConnected ? "Disconnect" : "Connect")
                            .padding()
                            .background(authViewModel.isStravaConnected ? Color.red : Color.blue)
                            .foregroundColor(.white)
                            .cornerRadius(8)
                    }
                    .padding()
                }
            }
            .tabItem {
                Label("Strava", systemImage: "arrow.triangle.2.circlepath")
            }
            
            // Ask Vici tab
            Text("Ask Vici")
                .font(.title)
                .padding()
                .tabItem {
                    Label("Ask Vici", systemImage: "message.fill")
                }
            
            // Profile tab
            VStack {
                Text("Profile")
                    .font(.title)
                    .padding()
                
                if let user = authViewModel.currentUser {
                    Text("Welcome, \(user.name ?? "User")")
                        .font(.headline)
                } else {
                    Text("No user logged in")
                        .foregroundColor(.secondary)
                }
                
                Button("Logout") {
                    authViewModel.logout()
                }
                .padding()
                .background(Color.red)
                .foregroundColor(.white)
                .cornerRadius(8)
                .padding()
            }
            .tabItem {
                Label("Profile", systemImage: "person.fill")
            }
        }
    }
}

// MARK: - Preview
struct MainTabView_Previews: PreviewProvider {
    static var previews: some View {
        MainTabView()
            .environmentObject(AuthViewModel(keychainService: KeychainService.shared))
    }
}
