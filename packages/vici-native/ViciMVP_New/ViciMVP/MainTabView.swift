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
            StravaConnectView()
                .environmentObject(authViewModel)
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
            Text("Profile")
                .font(.title)
                .padding()
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
            .environmentObject(AuthViewModel.loggedInPreview())
    }
}
