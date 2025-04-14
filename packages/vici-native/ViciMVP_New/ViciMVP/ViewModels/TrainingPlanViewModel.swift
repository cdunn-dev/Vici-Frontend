import Foundation
import Combine

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
    
    // MARK: - Initialization
    
    /// Initialize with a training service and optionally preview data
    init(trainingService: TrainingService = .shared, usePreviewData: Bool = false) {
        self.trainingService = trainingService
        
        // Use preview data if requested or if in SwiftUI previews
        if usePreviewData || ProcessInfo.processInfo.environment["XCODE_RUNNING_FOR_PREVIEWS"] == "1" {
            self.activePlan = TrainingPlan.samplePlan
            self.workouts = Workout.previewWeek
            self.todaysWorkout = Workout.previewTodaysWorkout
        }
    }
    
    // MARK: - Public Methods
    
    /// Load the active training plan from the backend
    func loadActivePlan() {
        isLoading = true
        errorMessage = nil
        
        trainingService.getTrainingPlans()
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { [weak self] completion in
                self?.isLoading = false
                if case .failure(let error) = completion {
                    self?.errorMessage = error.localizedDescription
                }
            }, receiveValue: { [weak self] plans in
                guard let self = self else { return }
                // Find the active plan
                if let activePlan = plans.first(where: { $0.isActive }) {
                    self.activePlan = activePlan
                    self.loadWorkouts(for: activePlan.id)
                } else {
                    // No active plan found
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
        
        trainingService.getWorkouts(planId: planId)
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { [weak self] completion in
                self?.isLoading = false
                if case .failure(let error) = completion {
                    self?.errorMessage = error.localizedDescription
                }
            }, receiveValue: { [weak self] workouts in
                guard let self = self else { return }
                self.workouts = workouts
                self.updateTodaysWorkout()
            })
            .store(in: &cancellables)
    }
    
    /// Mark a workout as completed
    func completeWorkout(id: String, notes: String? = nil) async {
        isLoading = true
        errorMessage = nil
        
        do {
            let publisher = trainingService.completeWorkout(id: id, notes: notes)
            let workout = try await publisher.async()
            
            // Update in our local lists
            DispatchQueue.main.async { [weak self] in
                guard let self = self else { return }
                self.isLoading = false
                
                // Update the workout in our list
                if let index = self.workouts.firstIndex(where: { $0.id == id }) {
                    self.workouts[index] = workout
                }
                
                // Update today's workout if it's the same one
                if self.todaysWorkout?.id == id {
                    self.todaysWorkout = workout
                }
            }
        } catch {
            DispatchQueue.main.async { [weak self] in
                self?.isLoading = false
                self?.errorMessage = error.localizedDescription
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
    }
    
    // MARK: - Computed Properties
    
    /// Get workouts for the current week
    var thisWeekWorkouts: [Workout] {
        let calendar = Calendar.current
        let today = Date()
        
        // Get start and end of week
        guard let weekStart = calendar.date(from: calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: today)) else {
            return workouts
        }
        
        guard let weekEnd = calendar.date(byAdding: .day, value: 7, to: weekStart) else {
            return workouts
        }
        
        // Filter workouts to current week
        return workouts.filter { workout in
            let date = workout.scheduledDate
            return date >= weekStart && date < weekEnd
        }.sorted { $0.scheduledDate < $1.scheduledDate }
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