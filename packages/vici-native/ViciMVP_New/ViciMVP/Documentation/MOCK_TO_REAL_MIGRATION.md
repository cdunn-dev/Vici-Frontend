# Mock to Real Data Migration Guide

This document provides guidance for transitioning from mock data models to real API-backed models in the ViciMVP project.

## Background

The project initially used mock data during early development but is now transitioning to real API implementations. This transition is causing compilation issues due to ambiguous type references between mock models and real models.

## Key Model Transitions

### Workout

**Migration Path:**
- Use `Workout` instead of `MockWorkout`
- For UI previews, use the preview extensions in `Models/Workout+Preview.swift`
  - `Workout.sampleWorkout`: Single workout sample 
  - `Workout.previewWeek`: Collection of workouts for a week
  - `Workout.previewTodaysWorkout`: Workout for today

**API Access:**
- Access via `TrainingService.shared.getWorkouts()` or `TrainingViewModel`

### TrainingPlan

**Migration Path:**
- Use `TrainingPlan` instead of `MockTrainingPlan`
- For UI previews, use the preview extensions in `Models/TrainingPlan+Preview.swift`
  - `TrainingPlan.samplePlan`: Single plan sample
  - `TrainingPlan.samplePlanWithWorkouts`: Plan with workouts
  - `TrainingPlan.previewPlans`: Collection of plans

**API Access:**
- Access via `TrainingService.shared.getActivePlan()` or `TrainingViewModel`

### Activity

**Migration Path:**
- Use `Activity` instead of `MockActivity`
- For UI previews, use the preview extensions in `Models/Activity+Preview.swift`
  - `Activity.sampleActivity`: Single activity sample
  - `Activity.previewActivities`: Collection of activities

**API Access:**
- Activities are included in workout responses or accessed through activity-specific endpoints

### User

**Migration Path:**
- Use `User` instead of mock user implementations
- For UI previews, use the preview extensions in `Models/User+Preview.swift`
  - `User.previewUser`: Sample user with complete profile
  - `User.previewNewUser`: Newly registered user

**API Access:**
- Access via `AuthService.shared.getCurrentUser()` or `AuthViewModel`

## Common Migration Steps

1. **Update Imports**: Ensure you're importing the correct model files
2. **Update References**: Change references from mock models to real models
3. **Use ViewModels**: The ViewModels are already configured to work with real API data:
   - `TrainingPlanViewModel` for training plan-related data
   - `AuthViewModel` for user-related data
4. **For UI Previews**: 
   - Use the new preview extensions instead of mock data
   - Use `.environmentObject(YourViewModel())` in preview providers

## Example Migration

### Before:
```swift
import SwiftUI

struct MyWorkoutView: View {
    let workout: MockWorkout
    
    var body: some View {
        Text(workout.name)
        // Rest of the view...
    }
}

struct MyWorkoutView_Previews: PreviewProvider {
    static var previews: some View {
        MyWorkoutView(workout: MockWorkout.exampleWeek[0])
    }
}
```

### After:
```swift
import SwiftUI

struct MyWorkoutView: View {
    let workout: Workout
    
    var body: some View {
        Text(workout.name)
        // Rest of the view...
    }
}

struct MyWorkoutView_Previews: PreviewProvider {
    static var previews: some View {
        MyWorkoutView(workout: Workout.previewWeek[0])
    }
}
```

## Handling Optional Properties

Note that real API models often have optional properties to accommodate various response scenarios. Always check for nil values or provide default values as needed:

```swift
// Good practice
Text(workout.description ?? "No description available")

// Or use nil coalescing with empty string
Text(workout.name ?? "")
```

## Reporting Issues

If you encounter issues during migration, please:

1. Document the specific error and context
2. Note which mock model is causing the issue
3. File an issue in the project tracker

## Completion Criteria

The migration is complete when:

1. No references to `MockWorkout`, `MockTrainingPlan`, or `MockActivity` exist in the codebase
2. All views use the real API models
3. The app successfully builds with no ambiguous type reference errors
4. The `MockData.swift` file is removed

The completion of this work is tracked in the MVP Project Tracker under:
"Remove unnecessary mock implementations" 