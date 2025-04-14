# Vici Native iOS App Implementation

This directory contains a native iOS implementation of the Vici MVP, created as an alternative approach after encountering build issues with the React Native setup.

## Overview

The native iOS app is implemented using:
- Swift language
- SwiftUI framework
- Mock data for all backend interactions
- Simulated login/registration
- Self-contained implementation with no external dependencies

## Directory Structure

- `/ios/` - Contains all iOS-specific code
  - `MockData.swift` - Comprehensive mock data models and sample data
  - `ViciApp.swift` - Main application code with all views and logic
  - `README.md` - Setup instructions
  - `ViciApp.xcodeproj.README` - Guide for setting up the Xcode project

## Features Implemented

The native implementation covers all core MVP requirements:

1. **User Authentication**
   - Login screen
   - Registration screen
   - Mock authentication logic

2. **Training Plan Management**
   - View active training plan
   - View weekly workout schedule
   - View workout details
   - View plan overview and stats

3. **Training Log**
   - View completed activities
   - View activity details
   - Activity reconciliation with plan

4. **"Ask Vici" AI Coach**
   - Simple chat interface
   - Mock responses based on keywords
   - Simulated plan adjustments

5. **User Profile**
   - View runner profile
   - View badges and achievements
   - Connect with Strava (simulated)

## Implementation Notes

- All data is mock-based with no actual backend integration
- The app demonstrates the complete user experience without requiring any backend services
- The implementation focuses on the core MVP functionality and user flows
- UI is designed to be clean and functional, prioritizing feature completeness over aesthetics

## Next Steps

After successfully testing this native implementation, the team can:

1. Refine the UI to better match the project style guide
2. Replace mock data services with real API integrations when they're available
3. Continue fixing the React Native build issues in parallel
4. Migrate to the cross-platform solution once it's stable

## Getting Started

See the `/ios/README.md` file for detailed setup instructions to build and run the native iOS app. 