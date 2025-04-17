import Foundation
import Combine
import os.log

/// Custom error types for TrainingPlanViewModel
enum TrainingPlanViewModelError: Error, LocalizedError {
    case networkError(String)
    case noActivePlan
    case serverError(String)
    case authenticationError
    case unknownError(String)
    
    var errorDescription: String? {
        switch self {
        case .networkError(let message):
            return "Network error: \(message)"
        case .noActivePlan:
            return "No active training plan found"
        case .serverError(let message):
            return "Server error: \(message)"
        case .authenticationError:
            return "Authentication error. Please log in again."
        case .unknownError(let message):
            return "Unknown error: \(message)"
        }
    }
}

/// ViewModel for handling training plan data and interactions.
/// Connects TrainingPlanView with backend services.
class TrainingPlanViewModel: BaseViewModel {
    // MARK: - Published Properties
    @Published var activePlan: TrainingPlan?
    @Published var workouts: [Workout] = []
    @Published var todaysWorkout: Workout?
    @Published var showCreatePlan = false
    @Published var showEditPlan = false
    @Published var isOffline = false
    
    // MARK: - Private Properties
    private let trainingService: TrainingService
    
    // MARK: - Initialization
    
    /// Initialize with a training service and optionally preview data
    init(trainingService: TrainingService = .shared, usePreviewData: Bool = false) {
        self.trainingService = trainingService
        
        // Initialize the base class with the proper log category
        super.init(logCategory: "TrainingPlanViewModel")
        
        // Preview data references can be set up if needed
        if usePreviewData || ProcessInfo.processInfo.environment["XCODE_RUNNING_FOR_PREVIEWS"] == "1" {
            logger.info("Using preview data for TrainingPlanViewModel")
            // Setup preview data if available
        } else {
            logger.info("Initialized TrainingPlanViewModel with real data source")
        }
        
        // Check for internet connectivity
        checkConnectivity()
    }
    
    // MARK: - Public Methods
    
    /// Load the active training plan from the backend
    func loadActivePlan() {
        // Skip loading if offline and fall back to cached/preview data
        if isOffline {
            logger.warning("Device is offline, skipping API call")
            handleError(NetworkError.notConnectedToInternet)
            return
        }
        
        // Using handlePublisher from BaseViewModel
        handlePublisher(
            trainingService.getTrainingPlans(),
            operation: "Load active training plan"
        ) { [weak self] plans in
            guard let self = self else { return }
            self.logger.info("Received \(plans.count) training plans from API")
            
            // Find the active plan
            if let activePlan = plans.first(where: { $0.isActive }) {
                self.logger.info("Found active plan: \(activePlan.name)")
                self.activePlan = activePlan
                self.loadWorkouts(for: activePlan.id)
            } else {
                // No active plan found
                self.logger.notice("No active plan found among \(plans.count) plans")
                self.activePlan = nil
                self.workouts = []
                self.todaysWorkout = nil
                
                if plans.isEmpty {
                    self.handleError(TrainingPlanError.noActivePlan)
                } else {
                    self.handleError(
                        TrainingPlanError.noActivePlan,
                        message: "You have \(plans.count) plans, but none are active."
                    )
                }
            }
        }
    }
    
    /// Load workouts for a specific plan ID
    func loadWorkouts(for planId: String) {
        // Skip loading if offline and fall back to cached/preview data
        if isOffline {
            logger.warning("Device is offline, skipping API call")
            return
        }
        
        // Using handlePublisher from BaseViewModel
        handlePublisher(
            trainingService.getWorkouts(planId: planId),
            operation: "Load workouts for plan \(planId)"
        ) { [weak self] workouts in
            guard let self = self else { return }
            self.logger.info("Received \(workouts.count) workouts from API")
            self.workouts = workouts
            self.updateTodaysWorkout()
            
            // Update workouts in the active plan if it exists
            if self.activePlan != nil {
                var updatedPlan = self.activePlan!
                updatedPlan.workouts = workouts
                self.activePlan = updatedPlan
            }
        }
    }
    
    /// Mark a workout as completed
    func completeWorkout(id: String, notes: String? = nil) async {
        // Skip API call if offline
        if isOffline {
            logger.warning("Device is offline, skipping API call")
            handleError(NetworkError.notConnectedToInternet)
            return
        }
        
        let workout = await runTask(operation: "Complete workout \(id)") {
            let workout = try await trainingService.completeWorkout(id: id, notes: notes).async()
            
            // Update in our local lists
            if let index = self.workouts.firstIndex(where: { $0.id == id }) {
                self.workouts[index] = workout
                self.logger.debug("Updated workout in local list at index \(index)")
            }
            
            // Update today's workout if it's the same one
            if self.todaysWorkout?.id == id {
                self.todaysWorkout = workout
                self.logger.debug("Updated today's workout reference")
            }
            
            return workout
        }
    }
    
    /// Create a new training plan
    func createPlan(request: TrainingPlanRequest) async {
        if isOffline {
            logger.warning("Device is offline, skipping API call")
            handleError(NetworkError.notConnectedToInternet)
            return
        }
        
        let plan = await runTask(operation: "Create training plan") {
            let plan = try await trainingService.createPlan(request: request).async()
            self.activePlan = plan
            self.loadWorkouts(for: plan.id)
            return plan
        }
    }
    
    /// Update the training plan settings
    func updatePlan(id: String, updates: [String: Any]) async {
        if isOffline {
            logger.warning("Device is offline, skipping API call")
            handleError(NetworkError.notConnectedToInternet)
            return
        }
        
        let plan = await runTask(operation: "Update training plan \(id)") {
            let plan = try await trainingService.updatePlan(id: id, updates: updates).async()
            self.activePlan = plan
            return plan
        }
    }
    
    // MARK: - Private Methods
    
    /// Updates the today's workout reference
    private func updateTodaysWorkout() {
        let today = Date()
        let calendar = Calendar.current
        
        // Find today's workout
        todaysWorkout = workouts.first { workout in
            guard let scheduledDate = workout.scheduledDate else { return false }
            return calendar.isDate(scheduledDate, inSameDayAs: today)
        }
        
        if todaysWorkout != nil {
            logger.debug("Found today's workout: \(todaysWorkout!.id)")
        } else {
            logger.debug("No workout scheduled for today")
        }
    }
    
    /// Check the device's connectivity status
    private func checkConnectivity() {
        // A more robust implementation would use NWPathMonitor
        // For now, just assume we're online unless proven otherwise by a network error
        isOffline = false
    }
    
    /// Handle a network error that might indicate offline status
    private func checkIfOffline(error: Error) {
        if let error = error as? NetworkError, error == NetworkError.notConnectedToInternet {
            isOffline = true
            logger.notice("Device appears to be offline. Setting offline mode.")
        }
    }
}

// MARK: - Publisher Extension
extension Publisher {
    /// Convert a publisher to an async function
    func async() async throws -> Output {
        try await withCheckedThrowingContinuation { continuation in
            var cancellable: AnyCancellable?
            
            cancellable = self.sink(
                receiveCompletion: { completion in
                    switch completion {
                    case .finished:
                        break
                    case .failure(let error):
                        continuation.resume(throwing: error)
                    }
                    cancellable?.cancel()
                },
                receiveValue: { value in
                    continuation.resume(returning: value)
                    cancellable?.cancel()
                }
            )
        }
    }
} 