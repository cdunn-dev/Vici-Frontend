import Foundation
import Combine

class TrainingPlanViewModel: ObservableObject {
    // MARK: - Published Properties
    
    @Published var activePlan: TrainingPlan?
    @Published var todaysWorkout: Workout?
    @Published var currentWeekWorkouts: [Workout] = []
    @Published var isLoading = false
    @Published var error: String?
    @Published var showCreatePlan = false
    @Published var showEditPlan = false
    
    // MARK: - Private Properties
    
    private let trainingService = TrainingService.shared
    private var cancellables = Set<AnyCancellable>()
    
    // MARK: - Lifecycle
    
    init() {
        // Initial data load happens on view appear
    }
    
    // MARK: - Public Methods
    
    /// Load the user's active training plan
    func loadActivePlan() {
        isLoading = true
        error = nil
        
        Task {
            do {
                // Get the active plan from the API
                let plan = try await trainingService.getActivePlan()
                
                DispatchQueue.main.async {
                    self.activePlan = plan
                    self.isLoading = false
                    
                    // If we have a plan, load its workouts
                    if plan != nil {
                        self.loadWorkouts()
                    }
                }
            } catch {
                DispatchQueue.main.async {
                    self.isLoading = false
                    self.error = error.localizedDescription
                    self.activePlan = nil
                }
            }
        }
    }
    
    /// Load workouts for the active plan
    func loadWorkouts() {
        guard let plan = activePlan else { return }
        
        Task {
            do {
                // Get all workouts for the plan
                let workouts = try await trainingService.getWorkouts(planId: plan.id)
                
                DispatchQueue.main.async {
                    // Find today's workout
                    self.todaysWorkout = self.findTodaysWorkout(from: workouts)
                    
                    // Find this week's workouts
                    self.currentWeekWorkouts = self.findCurrentWeekWorkouts(from: workouts)
                }
            } catch {
                DispatchQueue.main.async {
                    self.error = "Failed to load workouts: \(error.localizedDescription)"
                }
            }
        }
    }
    
    /// Mark a workout as completed
    func completeWorkout(_ workout: Workout) {
        guard let planId = activePlan?.id else { return }
        
        Task {
            do {
                // Mark the workout as completed
                let updatedWorkout = try await trainingService.completeWorkout(
                    id: workout.id,
                    completionDate: Date(),
                    planId: planId
                )
                
                DispatchQueue.main.async {
                    // Update the workout in our lists
                    self.updateWorkoutInLists(updatedWorkout)
                }
            } catch {
                DispatchQueue.main.async {
                    self.error = "Failed to mark workout as completed: \(error.localizedDescription)"
                }
            }
        }
    }
    
    // MARK: - Private Methods
    
    /// Find the workout scheduled for today
    private func findTodaysWorkout(from workouts: [Workout]) -> Workout? {
        let today = Calendar.current.startOfDay(for: Date())
        
        return workouts.first { workout in
            guard let workoutDate = workout.date else { return false }
            return Calendar.current.isDate(workoutDate, inSameDayAs: today)
        }
    }
    
    /// Find workouts scheduled for the current week
    private func findCurrentWeekWorkouts(from workouts: [Workout]) -> [Workout] {
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())
        
        // Find the start and end of the current week
        guard let weekStart = calendar.date(from: calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: today)),
              let weekEnd = calendar.date(byAdding: .day, value: 6, to: weekStart) else {
            return []
        }
        
        // Filter workouts that fall within this week
        return workouts.filter { workout in
            guard let workoutDate = workout.date else { return false }
            return workoutDate >= weekStart && workoutDate <= weekEnd
        }
        .sorted { (workout1, workout2) in
            guard let date1 = workout1.date, let date2 = workout2.date else { return false }
            return date1 < date2
        }
    }
    
    /// Update a workout in both the today and this week lists
    private func updateWorkoutInLists(_ updatedWorkout: Workout) {
        // Update today's workout if it matches
        if todaysWorkout?.id == updatedWorkout.id {
            todaysWorkout = updatedWorkout
        }
        
        // Update in the week's workouts
        if let index = currentWeekWorkouts.firstIndex(where: { $0.id == updatedWorkout.id }) {
            currentWeekWorkouts[index] = updatedWorkout
        }
    }
} 