# Strava Integration Implementation Plan

This document outlines the steps to integrate the StravaConnectView with the real StravaService and implement the OAuth flow for Strava connection.

## Current Status Analysis

The StravaConnectView and StravaConnectViewModel are already well-structured for integration with the real StravaService:

✅ The view uses a proper ViewModel architecture  
✅ The ViewModel is properly injected with StravaServiceProtocol  
✅ The OAuth flow is already implemented with appropriate methods  
✅ Notification handling for OAuth callbacks is in place  
✅ Error handling is already configured  

However, there are a few areas that need attention:

⚠️ The `AuthViewModel.shared` reference in StravaConnectView may be problematic  
⚠️ Need to ensure the StravaService implementation handles all required methods  
⚠️ OAuth URL handling may need adjustment for real API endpoints  
⚠️ Loading and error states need thorough testing  

## Implementation Steps

### 1. Fix ViewModel Initialization (High Priority)

1. Update StravaConnectView to use the environmentObject AuthViewModel instead of accessing a shared instance:

```swift
init() {
    // Remove dependency on AuthViewModel.shared
    _viewModel = StateObject(wrappedValue: StravaConnectViewModel(
        stravaService: StravaService.shared
    ))
}

// Then pass the environment object in onAppear
.onAppear {
    setupNotificationObservers()
    viewModel.setAuthViewModel(authViewModel) // Add this method to ViewModel
    viewModel.checkStravaConnection()
}
```

2. Update StravaConnectViewModel to set the AuthViewModel instead of requiring it in init:

```swift
private var authViewModel: AuthViewModel?

func setAuthViewModel(_ viewModel: AuthViewModel) {
    self.authViewModel = viewModel
    self.isStravaConnected = viewModel.isStravaConnected
}
```

### 2. Verify API Endpoints (High Priority)

1. Review the StravaService implementation to ensure all endpoints match the backend API:
   - `/strava/connection/{userId}`
   - `/strava/auth-url/{userId}`
   - `/strava/exchange-token`
   - `/strava/activities/{userId}`

2. Update any mismatched endpoints to ensure compatibility with the backend.

### 3. Implement the OAuth Flow (High Priority)

1. Verify the app's URL scheme is properly configured in Info.plist for callback handling:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleTypeRole</key>
        <string>Editor</string>
        <key>CFBundleURLName</key>
        <string>com.vici.app</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>vici</string>
        </array>
    </dict>
</array>
```

2. Ensure AppDelegate properly handles URL callbacks and posts the appropriate notifications:

```swift
func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
    // Parse the URL to extract code and state
    if url.scheme == "vici" && url.host == "strava-callback" {
        let components = URLComponents(url: url, resolvingAgainstBaseURL: false)
        let queryItems = components?.queryItems ?? []
        
        if let error = queryItems.first(where: { $0.name == "error" })?.value {
            // Handle error case
            NotificationCenter.default.post(
                name: .stravaCallbackFailed,
                object: nil,
                userInfo: ["error": error, "url": url]
            )
        } else if let code = queryItems.first(where: { $0.name == "code" })?.value {
            // Handle success case
            let state = queryItems.first(where: { $0.name == "state" })?.value ?? ""
            NotificationCenter.default.post(
                name: .stravaCallbackReceived,
                object: nil,
                userInfo: ["code": code, "state": state, "url": url]
            )
        }
        
        return true
    }
    
    return false
}
```

### 4. Add Comprehensive Error Handling (Medium Priority)

1. Enhance error handling in StravaConnectViewModel:

```swift
private func handleStravaError(_ error: Error) {
    if let stravaError = error as? StravaError {
        switch stravaError {
        case .connectionFailed(let reason):
            handleError(stravaError, message: "Connection failed: \(reason)")
        case .tokenExchangeFailed(let reason):
            handleError(stravaError, message: "Authorization failed: \(reason)")
        case .offlineError:
            handleError(stravaError, message: "Network connection unavailable. Please check your connection and try again.")
        case .userNotAuthenticated:
            handleError(stravaError, message: "You must be logged in to connect with Strava")
        default:
            handleError(stravaError)
        }
    } else {
        handleError(error)
    }
}
```

2. Update the error handling in all relevant methods to use this enhanced method.

### 5. Implement Loading Indicators (Medium Priority)

1. Add more granular loading states to ViewModel:

```swift
@Published var isCheckingConnection = false
@Published var isConnecting = false
@Published var isDisconnecting = false
@Published var isSyncing = false
```

2. Update the UI to show appropriate loading indicators based on these states.

### 6. Add Testing Code (Medium Priority)

1. Create test cases in the StravaConnectView for simulating different states:

```swift
#if DEBUG
// Add a button in debug builds to simulate different states
Button("Simulate Error") {
    viewModel.handleError(StravaError.connectionFailed(reason: "Test error"))
}
.padding()
.background(Color.red.opacity(0.3))
.foregroundColor(.white)
.cornerRadius(8)
.padding(.top, 20)
#endif
```

## Testing Plan

### 1. Integration Testing

1. Test the OAuth flow with actual Strava credentials
2. Verify connection status updates correctly after connecting
3. Test disconnection functionality and verify status updates
4. Test activity synchronization with real Strava account

### 2. Error Handling Testing

1. Test with network disconnected
2. Test with invalid authorization code
3. Test with expired tokens
4. Test with server errors (may require mock implementation for some scenarios)

### 3. UI Testing

1. Verify loading indicators display correctly during operations
2. Verify error messages are clear and actionable
3. Test layout on different device sizes
4. Verify disabled states are correct based on login status

## Completion Criteria

The implementation will be considered complete when:

1. Users can successfully connect their Strava account
2. Connection status persists across app restarts
3. Activities can be synchronized from Strava
4. Error states are properly handled with clear user feedback
5. All operations work with the real API endpoints

## Timeline

- Day 1: Fix ViewModel initialization and verify API endpoints
- Day 2: Implement and test the OAuth flow
- Day 3: Enhance error handling and add loading indicators
- Day 4: Comprehensive testing and bug fixes 