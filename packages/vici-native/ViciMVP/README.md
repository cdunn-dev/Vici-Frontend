# Vici iOS MVP App

This is a native iOS implementation of the Vici training app MVP, created as a clean-slate approach after facing build issues with the React Native implementation.

## Features
- **Authentication**: Login and registration with simulated backend
- **Training Plan View**: View this week's workouts and overall plan
- **Training Log**: View past activities
- **Ask Vici**: Interact with the AI coach (mocked responses)
- **Profile**: View user info and connect to Strava

## Setup Instructions

1. **Open Xcode** (13.0 or newer)
2. **Create a new project**:
   - Template: iOS App
   - Name: ViciMVP
   - Interface: SwiftUI
   - Language: Swift
   - No Core Data or tests needed

3. **Add the source files** to your project:
   - Right-click on your project in the Project Navigator
   - Select "Add Files to 'ViciMVP'..."
   - Navigate to the `/Sources` directory
   - Select all files (MockData.swift, ViciMVPApp.swift, AuthenticationView.swift, MainTabView.swift)
   - Make sure "Copy items if needed" is NOT checked
   - Click "Add"

4. **Delete default auto-generated files**:
   - Delete the automatically created ContentView.swift
   - Delete the automatically created app file (likely called ViciMVPApp.swift)
   - Make sure our custom ViciMVPApp.swift is being used

5. **Run the app** by clicking the Run button or pressing ⌘R

## Implementation Notes
- All data is mocked within the application, no backend connection is required
- Testing of the functionality can be done with any valid inputs
- The login/registration flow accepts any email/password combination 