# Vici Native iOS App

This directory contains the native iOS implementation of the Vici MVP. This approach was chosen after encountering build issues with the React Native setup.

## Setup Instructions

1. Open Xcode and create a new iOS App:
   - File > New > Project...
   - Select iOS > App
   - Name: ViciApp
   - Team: Your Apple Developer Team
   - Organization Identifier: com.yourcompany.vici
   - Interface: SwiftUI
   - Language: Swift
   - Save it in this directory (/packages/vici-native/ios)

2. Implement the core MVP features:
   - User Registration/Login
   - Basic Strava Connection Prompt (mock implementation)
   - AI Training Plan Preview/Approval (using mock data)
   - Basic Dynamic Adjustments ("Ask Vici" interaction with mock)
   - Training Log viewing (mock data)
   - Basic Gamification (streaks display)

3. Use Swift and SwiftUI for the implementation
   - Create mock data services to simulate backend functionality
   - Implement UI according to the MVP wireframes
   - Focus on getting the core functionality working

## Notes

- This is a temporary approach to get the MVP working quickly
- Once the React Native issues are resolved, we can migrate back to the cross-platform solution
- Refer to the main project documentation for feature requirements

## Key Files (To Be Created)

- Models/
  - User.swift
  - TrainingPlan.swift
  - Workout.swift
  - Activity.swift
- Views/
  - LoginView.swift
  - RegistrationView.swift
  - TrainingPlanView.swift
  - WorkoutView.swift
  - TrainingLogView.swift
  - ProfileView.swift
- Services/
  - MockDataService.swift
  - UserService.swift
  - TrainingService.swift

