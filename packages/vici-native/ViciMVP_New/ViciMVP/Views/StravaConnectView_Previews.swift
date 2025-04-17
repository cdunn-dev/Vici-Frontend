import SwiftUI
import class ViciMVP.AuthViewModel

/// Preview provider for StravaConnectView with different states
struct StravaConnectView_PreviewProvider: PreviewProvider {
    
    /// Creates a demo view with different Strava error states
    struct StravaDemoView: View {
        @State private var selectedError: StravaError?
        @State private var showSheet = false
        
        // List of possible errors to demonstrate
        let errorExamples: [(String, StravaError)] = [
            ("Network Error", .networkError(underlying: NSError(domain: "Network", code: -1009, userInfo: [NSLocalizedDescriptionKey: "The Internet connection appears to be offline."]))),
            ("Rate Limited", .rateLimitExceeded(resetTime: Date(timeIntervalSinceNow: 600))),
            ("Authentication Failed", .authorizationFailed(reason: "User declined access to Strava account")),
            ("Connection Failed", .connectionFailed(reason: "Could not connect to Strava servers")),
            ("Token Exchange Failed", .tokenExchangeFailed(reason: "Invalid authorization code")),
            ("Invalid Callback", .invalidCallback(reason: "Missing required parameters")),
            ("Server Error", .serverError(statusCode: 503, message: "Strava API is currently unavailable")),
            ("User Not Authenticated", .userNotAuthenticated),
            ("Offline", .offlineError),
            ("Access Denied", .accessDenied(scope: "activity:read_all")),
            ("Resource Not Found", .resourceNotFound(resourceType: "activity", id: "12345")),
        ]
        
        var body: some View {
            NavigationView {
                VStack {
                    // Display the error view for the selected error
                    if let error = selectedError {
                        StravaErrorView(error: error, onRetry: {
                            selectedError = nil
                        })
                        .padding()
                    }
                    
                    // Button to show error selection sheet
                    Button("Show Error Examples") {
                        showSheet = true
                    }
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(8)
                    
                    // Show the full StravaConnectView
                    Button("Show Full Connect View") {
                        showSheet = false
                        selectedError = nil
                    }
                    .padding()
                }
                .navigationTitle("Strava Errors")
                .sheet(isPresented: $showSheet) {
                    NavigationView {
                        List {
                            ForEach(errorExamples, id: \.0) { errorExample in
                                Button(action: {
                                    selectedError = errorExample.1
                                    showSheet = false
                                }) {
                                    Text(errorExample.0)
                                }
                            }
                        }
                        .navigationTitle("Select Error Type")
                        .toolbar {
                            ToolbarItem(placement: .navigationBarTrailing) {
                                Button("Close") {
                                    showSheet = false
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Define preview configurations
    static var previews: some View {
        Group {
            // Demo view showing different error states
            StravaDemoView()
                .environmentObject(AuthViewModel.loggedInPreview())
                .previewDisplayName("Error State Examples")
            
            // Full view with normal state
            StravaConnectView()
                .environmentObject(AuthViewModel.loggedInPreview())
                .previewDisplayName("Normal State")
            
            // Full view with network error
            StravaErrorView(
                error: .networkError(underlying: NSError(domain: "Network", code: -1009, userInfo: [NSLocalizedDescriptionKey: "The Internet connection appears to be offline."])),
                onRetry: {}
            )
            .previewDisplayName("Network Error")
            
            // Full view with server error
            StravaErrorView(
                error: .serverError(statusCode: 500, message: "Internal Server Error"),
                onRetry: {}
            )
            .previewDisplayName("Server Error")
        }
    }
} 