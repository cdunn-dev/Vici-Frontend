import Foundation
import Combine

class TrainingPlanViewModel: ObservableObject {
    // MARK: - Published Properties
    
    @Published var activePlan: TrainingPlan?
    @Published var isLoadingPlan = false
    @Published var planCreationState: PlanCreationState = .notStarted
    @Published var error: String?
    @Published var hasError = false
    
    // Goal selection properties
    @Published var goalType: GoalType = .race
    @Published var raceName: String = ""
    @Published var raceDistance: Double = 10000 // 10K in meters
    @Published var raceDate = Calendar.current.date(byAdding: .month, value: 3, to: Date()) ?? Date()
    @Published var previousPbTime: String = ""
    @Published var goalTime: String = ""
    @Published var generalGoal: String = "Improve overall fitness"
    
    // Preferences selection properties
    @Published var targetWeeklyDistance: Double = 40000 // 40km in meters
    @Published var runningDaysPerWeek: Int = 4
    @Published var qualityWorkoutsPerWeek: Int = 2
    @Published var preferredLongRunDay: WeekDay = .sunday
    @Published var coachingStyle: CoachingStyle = .balanced
    
    // "Ask Vici" properties
    @Published var question: String = ""
    @Published var isAskingVici = false
    @Published var viciResponse: ViciResponse?
    
    // MARK: - Private Properties
    
    private let apiClient = APIClient()
    private var cancellables = Set<AnyCancellable>()
    
    // MARK: - Lifecycle
    
    init() {
        // Load active plan when initialized
        loadActivePlan()
    }
    
    // MARK: - Public Methods
    
    /// Loads the user's active training plan from the API
    func loadActivePlan() {
        guard !isLoadingPlan else { return }
        
        isLoadingPlan = true
        hasError = false
        
        Task {
            do {
                let plan = try await apiClient.getActivePlan()
                
                await MainActor.run {
                    self.activePlan = plan
                    self.isLoadingPlan = false
                }
            } catch {
                await MainActor.run {
                    self.error = "Failed to load training plan: \(error.localizedDescription)"
                    self.hasError = true
                    self.isLoadingPlan = false
                }
            }
        }
    }
    
    /// Creates a new training plan preview based on user input
    func createTrainingPlan() {
        guard validatePlanInputs() else { return }
        
        planCreationState = .generating
        hasError = false
        
        let goal = createGoalObject()
        let preferences = createPreferencesObject()
        
        Task {
            do {
                let plan = try await apiClient.createTrainingPlan(goal: goal, preferences: preferences)
                
                await MainActor.run {
                    self.activePlan = plan
                    self.planCreationState = .preview
                }
            } catch {
                await MainActor.run {
                    self.error = "Failed to create training plan: \(error.localizedDescription)"
                    self.hasError = true
                    self.planCreationState = .failed
                }
            }
        }
    }
    
    /// Approves a training plan preview to make it active
    func approvePlan() {
        guard let planId = activePlan?.id else { return }
        
        planCreationState = .approving
        hasError = false
        
        Task {
            do {
                let approvedPlan = try await apiClient.approvePlan(planId: planId)
                
                await MainActor.run {
                    self.activePlan = approvedPlan
                    self.planCreationState = .active
                }
            } catch {
                await MainActor.run {
                    self.error = "Failed to approve plan: \(error.localizedDescription)"
                    self.hasError = true
                    self.planCreationState = .failed
                }
            }
        }
    }
    
    /// Sends a question to the "Ask Vici" endpoint
    func askVici() {
        guard let planId = activePlan?.id, !question.isEmpty else { return }
        
        isAskingVici = true
        hasError = false
        
        Task {
            do {
                let response = try await apiClient.askVici(planId: planId, query: question)
                
                await MainActor.run {
                    self.viciResponse = response
                    self.isAskingVici = false
                    self.question = "" // Clear the question field
                }
            } catch {
                await MainActor.run {
                    self.error = "Failed to get response from Vici: \(error.localizedDescription)"
                    self.hasError = true
                    self.isAskingVici = false
                }
            }
        }
    }
    
    // MARK: - Helper Methods
    
    /// Creates a Goal object from the current input values
    private func createGoalObject() -> Goal {
        let previousPbSeconds = parseTimeStringToSeconds(previousPbTime)
        let goalTimeSeconds = parseTimeStringToSeconds(goalTime)
        
        return Goal(
            type: goalType,
            raceName: goalType == .race ? raceName : nil,
            distance: goalType == .race ? raceDistance : nil,
            date: goalType == .race ? raceDate : nil,
            previousPb: previousPbSeconds,
            goalTime: goalTimeSeconds
        )
    }
    
    /// Creates a PlanPreferences object from the current input values
    private func createPreferencesObject() -> PlanPreferences {
        return PlanPreferences(
            targetWeeklyDistance: targetWeeklyDistance,
            runningDaysPerWeek: runningDaysPerWeek,
            qualityWorkoutsPerWeek: qualityWorkoutsPerWeek,
            preferredLongRunDay: preferredLongRunDay,
            coachingStyle: coachingStyle
        )
    }
    
    /// Parses a time string (e.g., "1:45:30" or "45:30") to seconds
    private func parseTimeStringToSeconds(_ timeString: String) -> TimeInterval? {
        guard !timeString.isEmpty else { return nil }
        
        let components = timeString.components(separatedBy: ":")
        var seconds: TimeInterval = 0
        
        if components.count == 3 {
            // Format: "h:mm:ss"
            if let hours = Double(components[0]),
               let minutes = Double(components[1]),
               let secs = Double(components[2]) {
                seconds = hours * 3600 + minutes * 60 + secs
            }
        } else if components.count == 2 {
            // Format: "mm:ss"
            if let minutes = Double(components[0]),
               let secs = Double(components[1]) {
                seconds = minutes * 60 + secs
            }
        } else {
            // Invalid format
            return nil
        }
        
        return seconds > 0 ? seconds : nil
    }
    
    /// Validates plan inputs before submission
    private func validatePlanInputs() -> Bool {
        if goalType == .race {
            if raceName.isEmpty {
                error = "Please enter a race name"
                hasError = true
                return false
            }
            
            if raceDate < Date() {
                error = "Race date must be in the future"
                hasError = true
                return false
            }
            
            // Goal time is optional, but if provided, validate format
            if !goalTime.isEmpty {
                if parseTimeStringToSeconds(goalTime) == nil {
                    error = "Please enter a valid goal time (format: hh:mm:ss or mm:ss)"
                    hasError = true
                    return false
                }
            }
            
            // Previous PB is optional, but if provided, validate format
            if !previousPbTime.isEmpty {
                if parseTimeStringToSeconds(previousPbTime) == nil {
                    error = "Please enter a valid previous PB time (format: hh:mm:ss or mm:ss)"
                    hasError = true
                    return false
                }
            }
        } else {
            if generalGoal.isEmpty {
                error = "Please enter a general goal"
                hasError = true
                return false
            }
        }
        
        return true
    }
}

// MARK: - Supporting Types

enum PlanCreationState {
    case notStarted
    case generating
    case preview
    case approving
    case active
    case failed
} 