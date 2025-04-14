import Foundation
import SwiftUI

/// Utility for validating models and their preview extensions
struct ModelValidation {
    
    /// Run validation checks on models and preview extensions
    static func validateModels() {
        print("Starting model validation...")
        
        // Validate Workout model
        print("\n--- Validating Workout model ---")
        validateWorkoutModel()
        
        // Validate TrainingPlan model
        print("\n--- Validating TrainingPlan model ---")
        validateTrainingPlanModel()
        
        // Validate Activity model
        print("\n--- Validating Activity model ---")
        validateActivityModel()
        
        // Validate User model
        print("\n--- Validating User model ---")
        validateUserModel()
        
        print("\nModel validation complete!")
    }
    
    /// Validate the Workout model and its preview extensions
    private static func validateWorkoutModel() {
        // Check that we can create a sample workout
        let sampleWorkout = Workout.sampleWorkout
        print("Created sample workout: \(sampleWorkout.name)")
        
        // Check that we can access preview week workouts
        let weekWorkouts = Workout.previewWeek
        print("Created \(weekWorkouts.count) workouts for preview week")
        
        // Check that we can get today's workout
        if let todayWorkout = Workout.previewTodaysWorkout {
            print("Today's workout: \(todayWorkout.name)")
        } else {
            print("No workout scheduled for today")
        }
    }
    
    /// Validate the TrainingPlan model and its preview extensions
    private static func validateTrainingPlanModel() {
        // Check that we can create a sample plan
        let samplePlan = TrainingPlan.samplePlan
        print("Created sample plan: \(samplePlan.name)")
        
        // Check that we can get a plan with workouts
        let planWithWorkouts = TrainingPlan.samplePlanWithWorkouts
        print("Plan with workouts has \(planWithWorkouts.workouts?.count ?? 0) workouts")
        
        // Check that we can get preview plans
        let previewPlans = TrainingPlan.previewPlans
        print("Created \(previewPlans.count) preview plans")
        
        // Check computed properties
        let plan = TrainingPlan.samplePlan
        print("Plan duration: \(plan.durationInWeeks) weeks")
        print("Date range: \(plan.formattedDateRange)")
    }
    
    /// Validate the Activity model and its preview extensions
    private static func validateActivityModel() {
        // Check that we can create a sample activity
        let sampleActivity = Activity.sampleActivity
        print("Created sample activity: \(sampleActivity.name)")
        
        // Check that we can get preview activities
        let previewActivities = Activity.previewActivities
        print("Created \(previewActivities.count) preview activities")
        
        // Check that we can generate coordinates
        let coordinates = Activity.previewCoordinates()
        print("Generated \(coordinates.count) GPS coordinates")
        
        // Check computed properties
        let activity = Activity.sampleActivity
        print("Duration: \(activity.formattedDuration)")
        if let distance = activity.formattedDistance {
            print("Distance: \(distance)")
        }
    }
    
    /// Validate the User model and its preview extensions
    private static func validateUserModel() {
        // Check that we can create sample users
        let user = User.previewUser
        print("Created sample user: \(user.name)")
        
        let newUser = User.previewNewUser
        print("Created new user: \(newUser.name)")
        
        // Check that we can get preview users
        let previewUsers = User.previewUsers
        print("Created \(previewUsers.count) preview users")
        
        // Check computed properties
        let sampleUser = User.previewUser
        if let age = sampleUser.formattedAge {
            print("Age: \(age)")
        }
        if let height = sampleUser.formattedHeight {
            print("Height: \(height)")
        }
    }
}

// For SwiftUI preview
struct ModelValidator: View {
    var body: some View {
        VStack {
            Text("Model Validation")
                .font(.title)
                .padding()
            
            Button("Validate Models") {
                ModelValidation.validateModels()
            }
            .padding()
            .background(Color.blue)
            .foregroundColor(.white)
            .cornerRadius(8)
        }
        .padding()
        .onAppear {
            // Uncomment to run validation automatically when previewing
            // ModelValidation.validateModels()
        }
    }
}

#Preview {
    ModelValidator()
} 