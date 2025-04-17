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
class TrainingPlanViewModel: ObservableObject {
    // MARK: - Published Properties
    @Published var activePlan: TrainingPlan?
    @Published var workouts: [Workout] = []
    @Published var todaysWorkout: Workout?
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var errorType: TrainingPlanViewModelError?
    @Published var showCreatePlan = false
    @Published var showEditPlan = false
    @Published var isOffline = false
    
    // MARK: - Private Properties
    private let trainingService: TrainingService
    private var cancellables = Set<AnyCancellable>()
    private let logger = Logger(subsystem: "com.vici.ViciMVP", category: "TrainingPlanViewModel")
    
    // MARK: - Initialization
    
    /// Initialize with a training service and optionally preview data
    init(trainingService: TrainingService = .shared, usePreviewData: Bool = false) {
        self.trainingService = trainingService
        
        // Preview data references seem invalid, remove them
        // Rely on usePreviewData being false for normal operation
        // If preview data is truly needed, re-add valid preview extensions to Models
        if usePreviewData || ProcessInfo.processInfo.environment["XCODE_RUNNING_FOR_PREVIEWS"] == "1" {
            logger.info("Attempting to use preview data (ensure preview extensions exist and are valid)")
            // self.activePlan = TrainingPlan.samplePlan // REMOVED
            // self.workouts = Workout.previewWeek // REMOVED
            // self.todaysWorkout = Workout.previewTodaysWorkout // REMOVED
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
            errorType = .networkError("You're offline. Showing cached data.")
            errorMessage = errorType?.localizedDescription
            return
        }
        
        isLoading = true
        errorMessage = nil
        errorType = nil
        
        logger.info("Requesting active training plans from API")
        trainingService.getTrainingPlans()
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { [weak self] completion in
                self?.isLoading = false
                if case .failure(let error) = completion {
                    self?.handleError(error)
                } else {
                    self?.logger.info("Successfully completed training plans request")
                }
            }, receiveValue: { [weak self] plans in
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
                        self.errorType = .noActivePlan
                        self.errorMessage = "No training plans found. Create a new plan to get started!"
                    } else {
                        self.errorType = .noActivePlan
                        self.errorMessage = "You have \(plans.count) plans, but none are active."
                    }
                }
            })
            .store(in: &cancellables)
    }
    
    /// Load workouts for a specific plan ID
    func loadWorkouts(for planId: String) {
        // Skip loading if offline and fall back to cached/preview data
        if isOffline {
            logger.warning("Device is offline, skipping API call")
            return
        }
        
        isLoading = true
        errorMessage = nil
        errorType = nil
        
        logger.info("Requesting workouts for plan: \(planId)")
        trainingService.getWorkouts(planId: planId)
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { [weak self] completion in
                self?.isLoading = false
                if case .failure(let error) = completion {
                    self?.handleError(error)
                } else {
                    self?.logger.info("Successfully completed workouts request")
                }
            }, receiveValue: { [weak self] workouts in
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
            })
            .store(in: &cancellables)
    }
    
    /// Mark a workout as completed
    func completeWorkout(id: String, notes: String? = nil) {
        // Skip API call if offline
        if isOffline {
            logger.warning("Device is offline, skipping API call")
            DispatchQueue.main.async {
                self.errorType = .networkError("Cannot complete workout while offline")
                self.errorMessage = self.errorType?.localizedDescription
            }
            return
        }
        
        isLoading = true
        errorMessage = nil
        errorType = nil
        
        logger.info("Marking workout as completed: \(id), notes: \(notes ?? "none")")
        
        // Publisher needs to be handled within a Task for async context
        Task { @MainActor [weak self] in // Use @MainActor Task
             guard let self = self else { return }
             do {
                 let publisher = self.trainingService.completeWorkout(id: id, notes: notes)
                 let workout = try await publisher.async()
            
                 // Update in our local lists
                 self.isLoading = false // Set loading false inside task on completion
                 self.logger.info("Successfully completed workout: \(id)")
                
                 // Update the workout in our list
                 if let index = self.workouts.firstIndex(where: { $0.id == id }) {
                     self.workouts[index] = workout
                     self.logger.debug("Updated workout in local list at index \(index)")
                 }
                 
                 // Update today's workout if it's the same one
                 if self.todaysWorkout?.id == id {
                     self.todaysWorkout = workout
                     self.logger.debug("Updated today's workout reference")
                 }
                 
                 // Update workout in the active plan if it exists
                 if var plan = self.activePlan, var planWorkouts = plan.workouts {
                     if let index = planWorkouts.firstIndex(where: { $0.id == id }) {
                         planWorkouts[index] = workout
                         plan.workouts = planWorkouts
                         self.activePlan = plan
                     }
                 }
             } catch {
                 self.isLoading = false // Set loading false inside task on error
                 self.handleError(error)
             }
         }
    }
    
    // MARK: - Helper Methods
    
    /// Update today's workout based on current date
    private func updateTodaysWorkout() {
        let calendar = Calendar.current
        let today = Date()
        
        todaysWorkout = workouts.first(where: { workout in
            calendar.isDate(calendar.startOfDay(for: workout.scheduledDate), 
                           inSameDayAs: calendar.startOfDay(for: today))
        })
        
        if let todaysWorkout = todaysWorkout {
            logger.info("Found today's workout: \(todaysWorkout.name)")
        } else {
            logger.notice("No workout scheduled for today")
        }
    }
    
    /// Handle API errors and categorize them
    private func handleError(_ error: Error) {
        logger.error("API Error: \(error.localizedDescription)")
        
        // Categorize the error type
        if let apiError = error as? APIError {
            switch apiError {
            case .networkError(let message):
                self.errorType = .networkError(message)
                self.isOffline = true
            case .invalidResponse:
                self.errorType = .serverError("Invalid response from server")
            case .decodingError(let message):
                self.errorType = .serverError("Failed to decode data: \(message)")
            case .unauthorized:
                self.errorType = .authenticationError
            case .serverError(let code, let message):
                self.errorType = .serverError("Server error \(code): \(message)")
            case .httpError(let statusCode, let details): // Correct tuple pattern
                let message = details ?? "No details provided"
                self.errorType = .serverError("Server error \(statusCode): \(message)")
            default:
                // Convert generic error to string for display
                self.errorType = .unknownError(error.localizedDescription) 
            }
        } else {
            // Convert generic error to string for display
            self.errorType = .unknownError(error.localizedDescription) 
        }
        
        self.errorMessage = self.errorType?.localizedDescription
    }
    
    /// Check for internet connectivity
    private func checkConnectivity() {
        // In a real app, this would check for actual network connectivity
        // For now, we'll just assume we're online for testing
        isOffline = false
        
        // For testing offline mode, uncomment this line:
        // isOffline = true
    }
    
    // MARK: - Computed Properties
    
    /// Get workouts for the current week
    var thisWeekWorkouts: [Workout] {
        let calendar = Calendar.current
        let today = Date()
        
        // Get start and end of week
        guard let weekStart = calendar.date(from: calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: today)) else {
            logger.warning("Could not determine start of week")
            return workouts
        }
        
        guard let weekEnd = calendar.date(byAdding: .day, value: 7, to: weekStart) else {
            logger.warning("Could not determine end of week")
            return workouts
        }
        
        // Filter workouts to current week
        let weekWorkouts = workouts.filter { workout in
            let date = workout.scheduledDate
            return date >= weekStart && date < weekEnd
        }.sorted { $0.scheduledDate < $1.scheduledDate }
        
        logger.debug("Found \(weekWorkouts.count) workouts for current week")
        return weekWorkouts
    }
    
    /// Force refresh all data
    func refreshAll() {
        logger.info("Performing full data refresh")
        
        // Check connectivity before refreshing
        checkConnectivity()
        loadActivePlan()
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