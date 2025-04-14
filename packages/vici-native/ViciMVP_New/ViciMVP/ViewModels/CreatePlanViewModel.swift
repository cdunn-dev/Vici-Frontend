import Foundation
import Combine

/// Goal types for training plan
enum GoalType {
    case race
    case general
}

class CreatePlanViewModel: ObservableObject {
    // MARK: - Published Properties
    
    // Common properties
    @Published var isLoading = false
    @Published var error: String?
    @Published var previewPlan: TrainingPlan?
    @Published var activePlan: TrainingPlan?
    
    // Step 1: Goal settings
    @Published var goalType: GoalType = .race
    @Published var raceDistance = "5K"
    @Published var targetDate: Date? = Calendar.current.date(byAdding: .month, value: 3, to: Date())
    @Published var targetTime = ""
    @Published var generalGoal = ""
    
    // Step 2: Runner profile
    @Published var experienceLevel = "Intermediate"
    @Published var weeklyRunningDays = 3
    @Published var weeklyRunningDistanceKm = 20
    @Published var typicalPaceMinPerKm = 6 * 60  // 6:00 min/km in seconds
    @Published var hasRecentInjury = false
    @Published var injuryDetails = ""
    
    // Step 3: Preferences
    @Published var planName = ""
    @Published var preferredRunDays: Set<Int> = [1, 3, 5]  // Mon, Wed, Fri by default
    @Published var longRunDay = 5  // Friday by default
    @Published var includeSpeedwork = true
    @Published var preferredWorkoutTypes: Set<String> = ["Intervals", "Tempo", "Long Run"]
    
    // MARK: - Private Properties
    
    private let trainingService = TrainingService.shared
    private var cancellables = Set<AnyCancellable>()
    
    // MARK: - Lifecycle
    
    init() {
        // Initialize form fields with default values if needed
        setupDefaults()
    }
    
    // MARK: - Public Methods
    
    /// Create a training plan based on user inputs
    func createPlan() {
        isLoading = true
        error = nil
        
        // Build the plan request from form data
        let planRequest = buildPlanRequest()
        
        Task {
            do {
                // Get AI-generated plan preview from the API
                let generatedPlan = try await trainingService.createPlanPreview(planRequest)
                
                DispatchQueue.main.async {
                    self.isLoading = false
                    self.previewPlan = generatedPlan
                }
            } catch {
                DispatchQueue.main.async {
                    self.isLoading = false
                    self.error = "Failed to create plan: \(error.localizedDescription)"
                }
            }
        }
    }
    
    /// Approve the preview plan to make it active
    func approvePlan() {
        guard let planId = previewPlan?.id else {
            error = "No plan to approve"
            return
        }
        
        isLoading = true
        
        Task {
            do {
                // Approve the plan in the backend
                let approvedPlan = try await trainingService.approvePlan(planId)
                
                DispatchQueue.main.async {
                    self.isLoading = false
                    self.activePlan = approvedPlan
                }
            } catch {
                DispatchQueue.main.async {
                    self.isLoading = false
                    self.error = "Failed to approve plan: \(error.localizedDescription)"
                }
            }
        }
    }
    
    // MARK: - Private Methods
    
    /// Set up default values for form fields
    private func setupDefaults() {
        // Set default plan name based on goal
        if planName.isEmpty {
            planName = goalType == .race ? "\(raceDistance) Training Plan" : "Running Plan"
        }
        
        // Set default preferred run days if empty
        if preferredRunDays.isEmpty {
            preferredRunDays = [1, 3, 5]  // Mon, Wed, Fri
        }
        
        // Set default workout types if empty
        if preferredWorkoutTypes.isEmpty && includeSpeedwork {
            preferredWorkoutTypes = ["Intervals", "Tempo", "Long Run"]
        }
    }
    
    /// Build the plan request from form data
    private func buildPlanRequest() -> [String: Any] {
        var request: [String: Any] = [
            "name": planName,
            "goalType": goalType == .race ? "race" : "general"
        ]
        
        // Add goal-specific fields
        if goalType == .race {
            request["raceDistance"] = raceDistance
            if !targetTime.isEmpty {
                request["targetTime"] = targetTime
            }
        } else {
            request["generalGoal"] = generalGoal
        }
        
        // Add target date
        if let date = targetDate {
            let formatter = ISO8601DateFormatter()
            request["targetDate"] = formatter.string(from: date)
        }
        
        // Add runner profile
        request["runnerProfile"] = [
            "experienceLevel": experienceLevel,
            "weeklyRunningFrequency": weeklyRunningDays,
            "weeklyRunningDistanceKm": weeklyRunningDistanceKm,
            "typicalPaceMinPerKm": typicalPaceMinPerKm / 60 + (typicalPaceMinPerKm % 60) / 100  // Convert to decimal minutes
        ]
        
        // Add injury info if applicable
        if hasRecentInjury && !injuryDetails.isEmpty {
            request["injuries"] = [
                "hasRecentInjury": true,
                "description": injuryDetails
            ]
        }
        
        // Add preferences
        request["preferences"] = [
            "preferredRunDays": Array(preferredRunDays),
            "longRunDay": longRunDay,
            "includeSpeedwork": includeSpeedwork,
            "preferredWorkoutTypes": Array(preferredWorkoutTypes)
        ]
        
        return request
    }
} 