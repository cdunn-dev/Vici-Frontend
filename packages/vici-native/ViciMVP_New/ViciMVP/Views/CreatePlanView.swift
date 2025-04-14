import SwiftUI

struct CreatePlanView: View {
    @Environment(\.presentationMode) var presentationMode
    @StateObject private var viewModel = CreatePlanViewModel()
    @State private var currentStep = 0
    
    // Callback to pass the created plan back to the parent view
    var onPlanCreated: (TrainingPlan) -> Void
    
    var body: some View {
        NavigationView {
            ZStack {
                // Background
                Color(.systemGroupedBackground)
                    .edgesIgnoringSafeArea(.all)
                
                // Main content
                if viewModel.isLoading {
                    LoadingView(message: "Creating your personalized training plan...\nOur AI coach is working on it")
                } else if let error = viewModel.error {
                    ErrorView(message: error) {
                        viewModel.error = nil
                    }
                } else if let previewPlan = viewModel.previewPlan {
                    // Show plan preview
                    PlanPreviewView(
                        plan: previewPlan,
                        onApprove: {
                            viewModel.approvePlan()
                        },
                        onEdit: {
                            viewModel.previewPlan = nil
                            currentStep = 0
                        }
                    )
                } else {
                    // Show form steps
                    VStack(spacing: 0) {
                        // Progress indicator
                        StepProgressView(currentStep: currentStep, totalSteps: 3)
                            .padding(.vertical)
                        
                        // Step content
                        ScrollView {
                            VStack(alignment: .leading, spacing: 20) {
                                switch currentStep {
                                case 0:
                                    GoalSelectionView(
                                        selectedGoalType: $viewModel.goalType,
                                        raceDistance: $viewModel.raceDistance,
                                        raceDate: $viewModel.targetDate,
                                        targetTime: $viewModel.targetTime,
                                        generalGoal: $viewModel.generalGoal
                                    )
                                case 1:
                                    RunnerProfileView(
                                        experienceLevel: $viewModel.experienceLevel,
                                        weeklyFrequency: $viewModel.weeklyRunningDays,
                                        weeklyDistance: $viewModel.weeklyRunningDistanceKm,
                                        typicalPace: $viewModel.typicalPaceMinPerKm,
                                        recentInjury: $viewModel.hasRecentInjury,
                                        injuryDetails: $viewModel.injuryDetails
                                    )
                                case 2:
                                    PreferencesView(
                                        planName: $viewModel.planName,
                                        preferredRunDays: $viewModel.preferredRunDays,
                                        longRunDay: $viewModel.longRunDay,
                                        includeSpeedwork: $viewModel.includeSpeedwork,
                                        preferredWorkoutTypes: $viewModel.preferredWorkoutTypes
                                    )
                                default:
                                    Text("Invalid step")
                                }
                            }
                            .padding()
                        }
                        
                        // Navigation buttons
                        NavigationButtonsView(
                            currentStep: $currentStep,
                            totalSteps: 3,
                            isNextEnabled: isCurrentStepValid(),
                            onNext: {
                                if currentStep < 2 {
                                    currentStep += 1
                                } else {
                                    // Final step, create plan
                                    viewModel.createPlan()
                                }
                            },
                            onBack: {
                                if currentStep > 0 {
                                    currentStep -= 1
                                }
                            }
                        )
                    }
                }
            }
            .navigationTitle(navigationTitle)
            .navigationBarItems(leading: Button("Cancel") {
                presentationMode.wrappedValue.dismiss()
            })
            .onChange(of: viewModel.activePlan) { newPlan in
                if let plan = newPlan {
                    onPlanCreated(plan)
                    presentationMode.wrappedValue.dismiss()
                }
            }
        }
    }
    
    // MARK: - Helper Properties
    
    private var navigationTitle: String {
        if viewModel.previewPlan != nil {
            return "Plan Preview"
        }
        
        switch currentStep {
        case 0: return "Your Goal"
        case 1: return "Your Profile"
        case 2: return "Preferences"
        default: return "Create Plan"
        }
    }
    
    // MARK: - Helper Methods
    
    private func isCurrentStepValid() -> Bool {
        switch currentStep {
        case 0:
            if viewModel.goalType == .race {
                return !viewModel.raceDistance.isEmpty && viewModel.targetDate != nil
            } else {
                return !viewModel.generalGoal.isEmpty
            }
        case 1:
            return !viewModel.experienceLevel.isEmpty && viewModel.weeklyRunningDays > 0
        case 2:
            return !viewModel.planName.isEmpty && !viewModel.preferredRunDays.isEmpty
        default:
            return false
        }
    }
}

// MARK: - Step Views

struct GoalSelectionView: View {
    @Binding var selectedGoalType: GoalType
    @Binding var raceDistance: String
    @Binding var raceDate: Date?
    @Binding var targetTime: String
    @Binding var generalGoal: String
    
    private let raceDistances = ["5K", "10K", "Half Marathon", "Marathon", "Other"]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("What's your main running goal?")
                .font(.headline)
            
            Picker("Goal Type", selection: $selectedGoalType) {
                Text("Race").tag(GoalType.race)
                Text("General Fitness").tag(GoalType.general)
            }
            .pickerStyle(SegmentedPickerStyle())
            
            if selectedGoalType == .race {
                // Race goal fields
                VStack(alignment: .leading, spacing: 15) {
                    Text("What distance are you training for?")
                        .font(.subheadline)
                    
                    Picker("Race Distance", selection: $raceDistance) {
                        ForEach(raceDistances, id: \.self) { distance in
                            Text(distance).tag(distance)
                        }
                    }
                    .pickerStyle(MenuPickerStyle())
                    .padding(.horizontal)
                    .padding(.vertical, 8)
                    .background(Color(.systemBackground))
                    .cornerRadius(8)
                    
                    Text("When is your race?")
                        .font(.subheadline)
                    
                    DatePicker(
                        "Race Date",
                        selection: Binding(
                            get: { raceDate ?? Date().addingTimeInterval(60*60*24*30*3) },
                            set: { raceDate = $0 }
                        ),
                        in: Date()...,
                        displayedComponents: .date
                    )
                    .datePickerStyle(DefaultDatePickerStyle())
                    .padding(.horizontal)
                    .padding(.vertical, 8)
                    .background(Color(.systemBackground))
                    .cornerRadius(8)
                    
                    Text("What's your target finish time? (optional)")
                        .font(.subheadline)
                    
                    TextField("e.g., 4:30:00 or 25:00", text: $targetTime)
                        .padding()
                        .background(Color(.systemBackground))
                        .cornerRadius(8)
                        .keyboardType(.decimalPad)
                }
            } else {
                // General fitness goals
                VStack(alignment: .leading, spacing: 15) {
                    Text("What's your general running goal?")
                        .font(.subheadline)
                    
                    TextField("e.g., Run 5K without stopping, Improve endurance", text: $generalGoal)
                        .padding()
                        .background(Color(.systemBackground))
                        .cornerRadius(8)
                        .autocapitalization(.none)
                    
                    Text("When would you like to achieve this goal?")
                        .font(.subheadline)
                    
                    DatePicker(
                        "Target Date",
                        selection: Binding(
                            get: { raceDate ?? Date().addingTimeInterval(60*60*24*30*2) },
                            set: { raceDate = $0 }
                        ),
                        in: Date()...,
                        displayedComponents: .date
                    )
                    .datePickerStyle(DefaultDatePickerStyle())
                    .padding(.horizontal)
                    .padding(.vertical, 8)
                    .background(Color(.systemBackground))
                    .cornerRadius(8)
                }
            }
        }
    }
}

struct RunnerProfileView: View {
    @Binding var experienceLevel: String
    @Binding var weeklyFrequency: Int
    @Binding var weeklyDistance: Int
    @Binding var typicalPace: Int
    @Binding var hasRecentInjury: Bool
    @Binding var injuryDetails: String
    
    private let experienceLevels = ["Beginner", "Intermediate", "Advanced", "Elite"]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("Tell us about your running experience")
                .font(.headline)
            
            VStack(alignment: .leading, spacing: 15) {
                Text("Experience level")
                    .font(.subheadline)
                
                Picker("Experience Level", selection: $experienceLevel) {
                    ForEach(experienceLevels, id: \.self) { level in
                        Text(level).tag(level)
                    }
                }
                .pickerStyle(MenuPickerStyle())
                .padding(.horizontal)
                .padding(.vertical, 8)
                .background(Color(.systemBackground))
                .cornerRadius(8)
                
                Text("How many days per week do you currently run?")
                    .font(.subheadline)
                
                Picker("Running Days", selection: $weeklyFrequency) {
                    ForEach(1...7, id: \.self) { days in
                        Text("\(days) day\(days > 1 ? "s" : "")").tag(days)
                    }
                }
                .pickerStyle(SegmentedPickerStyle())
                
                Text("Approximately how many kilometers do you run per week?")
                    .font(.subheadline)
                
                Stepper("\(weeklyDistance) km", value: $weeklyDistance, in: 1...250, step: 5)
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(8)
                
                Text("What's your typical pace for an easy run? (min/km)")
                    .font(.subheadline)
                
                HStack {
                    let minutes = typicalPace / 60
                    let seconds = typicalPace % 60
                    
                    Picker("Minutes", selection: Binding(
                        get: { minutes },
                        set: { typicalPace = ($0 * 60) + seconds }
                    )) {
                        ForEach(3...15, id: \.self) { min in
                            Text("\(min)").tag(min)
                        }
                    }
                    .pickerStyle(WheelPickerStyle())
                    .frame(width: 100)
                    .clipped()
                    
                    Text("min")
                    
                    Picker("Seconds", selection: Binding(
                        get: { seconds },
                        set: { typicalPace = (minutes * 60) + $0 }
                    )) {
                        ForEach(0...59, id: \.self) { sec in
                            Text(String(format: "%02d", sec)).tag(sec)
                        }
                    }
                    .pickerStyle(WheelPickerStyle())
                    .frame(width: 100)
                    .clipped()
                    
                    Text("sec")
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(8)
                
                Toggle("Do you have any recent injuries?", isOn: $hasRecentInjury)
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(8)
                
                if hasRecentInjury {
                    Text("Please describe your injury")
                        .font(.subheadline)
                    
                    TextEditor(text: $injuryDetails)
                        .frame(minHeight: 100)
                        .padding(5)
                        .background(Color(.systemBackground))
                        .cornerRadius(8)
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                        )
                }
            }
        }
    }
}

struct PreferencesView: View {
    @Binding var planName: String
    @Binding var preferredRunDays: Set<Int>
    @Binding var longRunDay: Int
    @Binding var includeSpeedwork: Bool
    @Binding var preferredWorkoutTypes: Set<String>
    
    private let daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    private let workoutTypes = ["Intervals", "Tempo", "Hills", "Fartlek", "Long Run", "Easy Run"]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("Customize your training plan")
                .font(.headline)
            
            VStack(alignment: .leading, spacing: 15) {
                Text("Plan name")
                    .font(.subheadline)
                
                TextField("e.g., My Marathon Plan", text: $planName)
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(8)
                    .autocapitalization(.words)
                
                Text("Which days of the week do you prefer to run?")
                    .font(.subheadline)
                
                VStack {
                    ForEach(0..<7) { index in
                        Button(action: {
                            if preferredRunDays.contains(index) {
                                preferredRunDays.remove(index)
                            } else {
                                preferredRunDays.insert(index)
                            }
                        }) {
                            HStack {
                                Text(daysOfWeek[index])
                                    .font(.body)
                                
                                Spacer()
                                
                                Image(systemName: preferredRunDays.contains(index) ? "checkmark.square.fill" : "square")
                                    .foregroundColor(preferredRunDays.contains(index) ? .blue : .gray)
                            }
                            .padding(.vertical, 5)
                        }
                        .buttonStyle(PlainButtonStyle())
                        
                        if index < 6 {
                            Divider()
                        }
                    }
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(8)
                
                if preferredRunDays.count > 0 {
                    Text("Which day do you prefer for your long run?")
                        .font(.subheadline)
                    
                    Picker("Long Run Day", selection: $longRunDay) {
                        ForEach(Array(preferredRunDays).sorted(), id: \.self) { day in
                            Text(daysOfWeek[day]).tag(day)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                    .padding(.vertical, 5)
                }
                
                Toggle("Include speed workouts in my plan", isOn: $includeSpeedwork)
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(8)
                
                if includeSpeedwork {
                    Text("Which types of workouts do you prefer?")
                        .font(.subheadline)
                    
                    VStack {
                        ForEach(workoutTypes, id: \.self) { type in
                            Button(action: {
                                if preferredWorkoutTypes.contains(type) {
                                    preferredWorkoutTypes.remove(type)
                                } else {
                                    preferredWorkoutTypes.insert(type)
                                }
                            }) {
                                HStack {
                                    Text(type)
                                        .font(.body)
                                    
                                    Spacer()
                                    
                                    Image(systemName: preferredWorkoutTypes.contains(type) ? "checkmark.square.fill" : "square")
                                        .foregroundColor(preferredWorkoutTypes.contains(type) ? .blue : .gray)
                                }
                                .padding(.vertical, 5)
                            }
                            .buttonStyle(PlainButtonStyle())
                            
                            if type != workoutTypes.last {
                                Divider()
                            }
                        }
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(8)
                }
            }
        }
    }
}

// MARK: - Helper Views

struct StepProgressView: View {
    let currentStep: Int
    let totalSteps: Int
    
    var body: some View {
        HStack(spacing: 0) {
            ForEach(0..<totalSteps, id: \.self) { step in
                StepDot(isFilled: step <= currentStep, isLast: step == totalSteps - 1)
            }
        }
        .padding(.horizontal)
    }
}

struct StepDot: View {
    let isFilled: Bool
    let isLast: Bool
    
    var body: some View {
        HStack(spacing: 0) {
            Circle()
                .fill(isFilled ? Color.blue : Color.gray.opacity(0.3))
                .frame(width: 12, height: 12)
            
            if !isLast {
                Rectangle()
                    .fill(isFilled ? Color.blue : Color.gray.opacity(0.3))
                    .frame(height: 2)
            }
        }
        .frame(maxWidth: .infinity)
    }
}

struct NavigationButtonsView: View {
    @Binding var currentStep: Int
    let totalSteps: Int
    let isNextEnabled: Bool
    let onNext: () -> Void
    let onBack: () -> Void
    
    var body: some View {
        HStack {
            Button(action: onBack) {
                HStack {
                    Image(systemName: "chevron.left")
                    Text("Back")
                }
                .padding()
                .foregroundColor(currentStep > 0 ? .blue : .gray)
            }
            .disabled(currentStep == 0)
            
            Spacer()
            
            Button(action: onNext) {
                HStack {
                    Text(currentStep < totalSteps - 1 ? "Next" : "Create Plan")
                    Image(systemName: "chevron.right")
                }
                .padding()
                .foregroundColor(isNextEnabled ? .white : .gray)
                .background(isNextEnabled ? Color.blue : Color.gray.opacity(0.3))
                .cornerRadius(8)
            }
            .disabled(!isNextEnabled)
        }
        .padding()
        .background(Color(.systemBackground))
        .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: -2)
    }
}

struct PlanPreviewView: View {
    let plan: TrainingPlan
    let onApprove: () -> Void
    let onEdit: () -> Void
    
    @State private var selectedWeek = 0
    
    var body: some View {
        VStack(spacing: 16) {
            // Plan header
            VStack(spacing: 8) {
                Text(plan.name)
                    .font(.title2)
                    .fontWeight(.bold)
                
                Text(plan.goal ?? "Custom training plan")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                HStack {
                    VStack {
                        Text("\(plan.duration ?? 0)")
                            .font(.headline)
                        Text("Days")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    Divider()
                        .frame(height: 24)
                    
                    VStack {
                        Text("\(plan.workoutsCount ?? 0)")
                            .font(.headline)
                        Text("Workouts")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    Divider()
                        .frame(height: 24)
                    
                    VStack {
                        Text("\(plan.weeks?.count ?? 0)")
                            .font(.headline)
                        Text("Weeks")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(10)
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(12)
            .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
            .padding(.horizontal)
            
            // Week selector
            if let weeks = plan.weeks, !weeks.isEmpty {
                Picker("Select Week", selection: $selectedWeek) {
                    ForEach(0..<weeks.count, id: \.self) { index in
                        Text("Week \(index + 1)").tag(index)
                    }
                }
                .pickerStyle(SegmentedPickerStyle())
                .padding(.horizontal)
                
                // Workouts for selected week
                if selectedWeek < plan.weeks?.count ?? 0, 
                   let workouts = plan.weeks?[selectedWeek].workouts {
                    List {
                        ForEach(workouts) { workout in
                            VStack(alignment: .leading, spacing: 5) {
                                HStack {
                                    Text(dayOfWeek(from: workout.date))
                                        .font(.headline)
                                    
                                    Spacer()
                                    
                                    Text(formatDuration(workout.duration))
                                        .foregroundColor(.blue)
                                }
                                
                                Text(workout.name)
                                    .font(.subheadline)
                                
                                Text(workout.description ?? "")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                    .lineLimit(2)
                            }
                            .padding(.vertical, 5)
                        }
                    }
                    .listStyle(InsetGroupedListStyle())
                }
            }
            
            // Action buttons
            HStack(spacing: 20) {
                Button(action: onEdit) {
                    Text("Edit")
                        .font(.headline)
                        .foregroundColor(.blue)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.white)
                        .cornerRadius(10)
                        .overlay(
                            RoundedRectangle(cornerRadius: 10)
                                .stroke(Color.blue, lineWidth: 1)
                        )
                }
                
                Button(action: onApprove) {
                    Text("Approve Plan")
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.green)
                        .cornerRadius(10)
                }
            }
            .padding()
        }
    }
    
    private func dayOfWeek(from date: Date?) -> String {
        guard let date = date else { return "N/A" }
        
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE"
        return formatter.string(from: date)
    }
    
    private func formatDuration(_ seconds: Int?) -> String {
        guard let seconds = seconds else { return "N/A" }
        
        let hours = seconds / 3600
        let minutes = (seconds % 3600) / 60
        
        if hours > 0 {
            return "\(hours)h \(minutes)m"
        } else {
            return "\(minutes)m"
        }
    }
}

struct LoadingView: View {
    let message: String
    
    var body: some View {
        VStack(spacing: 20) {
            ProgressView()
                .scaleEffect(1.5)
                .padding()
            
            Text(message)
                .font(.headline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
        }
    }
}

struct ErrorView: View {
    let message: String
    let onRetry: () -> Void
    
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 50))
                .foregroundColor(.orange)
            
            Text("Something went wrong")
                .font(.title3)
                .fontWeight(.bold)
            
            Text(message)
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
            
            Button(action: onRetry) {
                Text("Try Again")
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(width: 120, height: 40)
                    .background(Color.blue)
                    .cornerRadius(10)
            }
            .padding(.top, 10)
        }
        .padding()
    }
}

struct CreatePlanView_Previews: PreviewProvider {
    static var previews: some View {
        CreatePlanView { _ in }
    }
} 