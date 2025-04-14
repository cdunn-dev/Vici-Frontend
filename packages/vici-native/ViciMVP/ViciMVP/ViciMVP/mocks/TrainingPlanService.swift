import Foundation
import SwiftUI
import Combine

// MARK: - Training Plan Service
class TrainingPlanService: ObservableObject {
    // Published state
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var currentPlan: TrainingPlan?
    @Published var todaysWorkout: Workout?
    
    // Called when app starts
    func initialize() {
        fetchCurrentPlan()
        fetchTodaysWorkout()
    }
    
    // Fetch the current active training plan
    func fetchCurrentPlan() {
        isLoading = true
        errorMessage = nil
        
        // Simulate network request
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
            // For the MVP we'll just use mock data
            self.currentPlan = TrainingPlan.mockCurrentPlan
            self.isLoading = false
        }
    }
    
    // Fetch today's scheduled workout
    func fetchTodaysWorkout() {
        isLoading = true
        errorMessage = nil
        
        // Simulate network request
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            // Find today's workout from the plan
            if let plan = self.currentPlan {
                let today = Date()
                self.todaysWorkout = plan.currentWeekWorkouts.first(where: { 
                    Calendar.current.isDate($0.date, inSameDayAs: today)
                })
            } else {
                self.todaysWorkout = nil
            }
            self.isLoading = false
        }
    }
    
    // Create a new training plan
    func createPlan(goalType: GoalType, raceDistance: String?, raceDate: Date?, experienceLevel: ExperienceLevel, daysPerWeek: Int, completion: @escaping (Bool) -> Void) {
        isLoading = true
        errorMessage = nil
        
        // Simulate network request
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            // For MVP, we'll just set the mock plan
            self.currentPlan = TrainingPlan.mockCurrentPlan
            self.fetchTodaysWorkout()
            self.isLoading = false
            completion(true)
        }
    }
    
    // Update a workout's status
    func updateWorkoutStatus(workoutId: String, status: WorkoutStatus, completion: @escaping (Bool) -> Void) {
        isLoading = true
        errorMessage = nil
        
        // Simulate network request
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.7) {
            if var plan = self.currentPlan {
                // Find the workout and update its status
                for i in 0..<plan.currentWeekWorkouts.count {
                    if plan.currentWeekWorkouts[i].id == workoutId {
                        plan.currentWeekWorkouts[i].status = status
                        break
                    }
                }
                
                // Update the today's workout if needed
                if let todaysWorkout = self.todaysWorkout, todaysWorkout.id == workoutId {
                    self.todaysWorkout?.status = status
                }
                
                self.currentPlan = plan
                self.isLoading = false
                completion(true)
            } else {
                self.errorMessage = "No active plan found"
                self.isLoading = false
                completion(false)
            }
        }
    }
} 