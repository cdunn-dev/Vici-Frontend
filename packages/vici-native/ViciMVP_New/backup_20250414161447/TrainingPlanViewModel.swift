import Foundation
import Combine

class TrainingPlanViewModel: ObservableObject {
    @Published var activePlan: TrainingPlan?
    @Published var workouts: [Workout] = []
    @Published var todaysWorkout: Workout?
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var showCreatePlan = false
    @Published var showEditPlan = false
    
    private var trainingService: TrainingService
    private var cancellables = Set<AnyCancellable>()
    
    init(trainingService: TrainingService = TrainingService.shared) {
        self.trainingService = trainingService
        
        // Load data on init
        loadActivePlan()
    }
    
    /// Loads the active training plan for the current user
    func loadActivePlan() {
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                let plan = try await trainingService.getActivePlan()
                
                DispatchQueue.main.async { [weak self] in
                    guard let self = self else { return }
                    self.activePlan = plan
                    self.isLoading = false
                    
                    // If we have a plan, load its workouts
                    if let planId = plan?.id {
                        self.loadWorkouts(for: planId)
                    }
                    
                    // Also load today's workout
                    self.loadTodaysWorkout()
                }
            } catch {
                DispatchQueue.main.async { [weak self] in
                    self?.isLoading = false
                    self?.errorMessage = "Failed to load training plan: \(error.localizedDescription)"
                    print("Error loading plan: \(error)")
                }
            }
        }
    }
    
    /// Loads workouts for a specific plan
    func loadWorkouts(for planId: String) {
        isLoading = true
        
        Task {
            do {
                let fetchedWorkouts = try await trainingService.getWorkouts(planId: planId)
                
                DispatchQueue.main.async { [weak self] in
                    self?.workouts = fetchedWorkouts
                    self?.isLoading = false
                }
            } catch {
                DispatchQueue.main.async { [weak self] in
                    self?.isLoading = false
                    self?.errorMessage = "Failed to load workouts: \(error.localizedDescription)"
                    print("Error loading workouts: \(error)")
                }
            }
        }
    }
    
    /// Loads today's workout
    func loadTodaysWorkout() {
        Task {
            do {
                let workout = try await trainingService.getTodaysWorkout()
                
                DispatchQueue.main.async { [weak self] in
                    self?.todaysWorkout = workout
                }
            } catch {
                print("Error loading today's workout: \(error)")
                // We don't show error for this as it's not critical
            }
        }
    }
    
    /// Marks a workout as completed
    func completeWorkout(id: String, notes: String? = nil) async {
        do {
            let planId = activePlan?.id
            try await trainingService.completeWorkout(id: id, completionDate: Date(), notes: notes, planId: planId)
            
            // Refresh the workouts list
            if let planId = planId {
                loadWorkouts(for: planId)
            }
            
            // Also refresh today's workout if needed
            loadTodaysWorkout()
        } catch {
            DispatchQueue.main.async { [weak self] in
                self?.errorMessage = "Failed to complete workout: \(error.localizedDescription)"
                print("Error completing workout: \(error)")
            }
        }
    }
    
    /// Creates a plan preview based on user preferences
    func createPlanPreview(withRequest request: [String: Any], completion: @escaping (Result<TrainingPlan, Error>) -> Void) {
        Task {
            do {
                let plan = try await trainingService.createPlanPreview(request)
                DispatchQueue.main.async {
                    completion(.success(plan))
                }
            } catch {
                DispatchQueue.main.async {
                    completion(.failure(error))
                }
            }
        }
    }
    
    /// Approves a plan preview
    func approvePlan(id: String, completion: @escaping (Bool) -> Void) {
        Task {
            do {
                try await trainingService.approvePlan(id)
                
                // Refresh active plan
                let plan = try await trainingService.getActivePlan()
                
                DispatchQueue.main.async { [weak self] in
                    guard let self = self else { return }
                    self.activePlan = plan
                    if let planId = plan?.id {
                        self.loadWorkouts(for: planId)
                    }
                    completion(true)
                }
            } catch {
                DispatchQueue.main.async {
                    print("Error approving plan: \(error)")
                    completion(false)
                }
            }
        }
    }
    
    /// Creates a new training plan
    func createTrainingPlan(name: String, description: String?, goal: String?, startDate: Date, endDate: Date) async throws -> TrainingPlan {
        // This is a placeholder - actual implementation would call the API
        let plan = try await trainingService.createTrainingPlan(name: name, description: description, goal: goal, startDate: startDate, endDate: endDate)
        
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            self.activePlan = plan
            if let planId = plan.id {
                self.loadWorkouts(for: planId)
            }
        }
        
        return plan
    }
    
    // MARK: - Helper Methods
    
    /// Get workouts for the current week
    var thisWeekWorkouts: [Workout] {
        let calendar = Calendar.current
        let today = Date()
        let startOfWeek = calendar.date(from: calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: today))!
        let endOfWeek = calendar.date(byAdding: .day, value: 7, to: startOfWeek)!
        
        return workouts.filter { workout in
            guard let date = workout.scheduledDate else { return false }
            return date >= startOfWeek && date < endOfWeek
        }
    }
    
    /// Get today's workout from the workouts array
    var todayWorkoutFromList: Workout? {
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())
        
        return workouts.first { workout in
            guard let date = workout.scheduledDate else { return false }
            return calendar.isDate(calendar.startOfDay(for: date), inSameDayAs: today)
        }
    }
} 