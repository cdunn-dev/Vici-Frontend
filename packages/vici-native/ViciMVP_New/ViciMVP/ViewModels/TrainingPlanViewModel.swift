import Foundation
import Combine
import os.log

/// ViewModel for handling training plan data and interactions.
/// Connects TrainingPlanView with backend services.
class TrainingPlanViewModel: ObservableObject {
    // MARK: - Published Properties
    @Published var activePlan: TrainingPlan?
    @Published var workouts: [Workout] = []
    @Published var todaysWorkout: Workout?
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var showCreatePlan = false
    @Published var showEditPlan = false
    
    // MARK: - Private Properties
    private let trainingService: TrainingService
    private var cancellables = Set<AnyCancellable>()
    private let logger = Logger(subsystem: "com.vici.ViciMVP", category: "TrainingPlanViewModel")
    
    // MARK: - Initialization
    
    /// Initialize with a training service and optionally preview data
    init(trainingService: TrainingService = .shared, usePreviewData: Bool = false) {
        self.trainingService = trainingService
        
        // Use preview data if requested or if in SwiftUI previews
        if usePreviewData || ProcessInfo.processInfo.environment["XCODE_RUNNING_FOR_PREVIEWS"] == "1" {
            logger.info("Using preview data for TrainingPlanViewModel")
            self.activePlan = TrainingPlan.samplePlan
            self.workouts = Workout.previewWeek
            self.todaysWorkout = Workout.previewTodaysWorkout
        } else {
            logger.info("Initialized TrainingPlanViewModel with real data source")
        }
    }
    
    // MARK: - Public Methods
    
    /// Load the active training plan from the backend
    func loadActivePlan() {
        isLoading = true
        errorMessage = nil
        
        logger.info("Requesting active training plans from API")
        trainingService.getTrainingPlans()
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { [weak self] completion in
                self?.isLoading = false
                if case .failure(let error) = completion {
                    self?.errorMessage = error.localizedDescription
                    self?.logger.error("Failed to load training plans: \(error.localizedDescription)")
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
                }
            })
            .store(in: &cancellables)
    }
    
    /// Load workouts for a specific plan ID
    func loadWorkouts(for planId: String) {
        isLoading = true
        errorMessage = nil
        
        logger.info("Requesting workouts for plan: \(planId)")
        trainingService.getWorkouts(planId: planId)
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { [weak self] completion in
                self?.isLoading = false
                if case .failure(let error) = completion {
                    self?.errorMessage = error.localizedDescription
                    self?.logger.error("Failed to load workouts: \(error.localizedDescription)")
                } else {
                    self?.logger.info("Successfully completed workouts request")
                }
            }, receiveValue: { [weak self] workouts in
                guard let self = self else { return }
                self.logger.info("Received \(workouts.count) workouts from API")
                self.workouts = workouts
                self.updateTodaysWorkout()
            })
            .store(in: &cancellables)
    }
    
    /// Mark a workout as completed
    func completeWorkout(id: String, notes: String? = nil) async {
        isLoading = true
        errorMessage = nil
        
        logger.info("Marking workout as completed: \(id), notes: \(notes ?? "none")")
        
        do {
            let publisher = trainingService.completeWorkout(id: id, notes: notes)
            let workout = try await publisher.async()
            
            // Update in our local lists
            DispatchQueue.main.async { [weak self] in
                guard let self = self else { return }
                self.isLoading = false
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
            }
        } catch {
            DispatchQueue.main.async { [weak self] in
                self?.isLoading = false
                self?.errorMessage = error.localizedDescription
                self?.logger.error("Failed to complete workout: \(error.localizedDescription)")
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