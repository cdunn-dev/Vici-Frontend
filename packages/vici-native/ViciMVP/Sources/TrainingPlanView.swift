import SwiftUI

struct TrainingPlanView: View {
    @StateObject private var viewModel = TrainingPlanViewModel()
    @State private var viewMode: ViewMode = .thisWeek
    
    enum ViewMode {
        case thisWeek, overview
    }
    
    var body: some View {
        NavigationView {
            VStack {
                if viewModel.activePlan == nil && viewModel.planCreationState == .notStarted {
                    noPlanView
                } else if viewModel.planCreationState == .generating {
                    generatingPlanView
                } else if viewModel.planCreationState == .preview {
                    planPreviewView
                } else if viewModel.activePlan != nil && (viewModel.planCreationState == .active || viewModel.activePlan?.status == .active) {
                    activePlanView
                } else {
                    noPlanView
                }
            }
            .navigationTitle("Training Plan")
            .alert(isPresented: $viewModel.hasError) {
                Alert(
                    title: Text("Error"),
                    message: Text(viewModel.error ?? "An unknown error occurred"),
                    dismissButton: .default(Text("OK"))
                )
            }
        }
    }
    
    // No Active Plan View
    private var noPlanView: some View {
        VStack(spacing: 30) {
            Spacer()
            
            Image(systemName: "figure.run")
                .font(.system(size: 60))
                .foregroundColor(.blue)
            
            Text("Ready to start training?")
                .font(.title)
                .bold()
            
            Text("Create a personalized training plan tailored to your goals and preferences.")
                .multilineTextAlignment(.center)
                .padding(.horizontal)
            
            NavigationLink(destination: CreatePlanView(viewModel: viewModel)) {
                Text("Create Training Plan")
                    .font(.headline)
                    .foregroundColor(.white)
                    .padding()
                    .frame(minWidth: 250)
                    .background(Color.blue)
                    .cornerRadius(10)
            }
            
            Spacer()
        }
        .padding()
    }
    
    // Generating Plan View
    private var generatingPlanView: some View {
        VStack(spacing: 20) {
            Spacer()
            
            ProgressView()
                .progressViewStyle(CircularProgressViewStyle())
                .scaleEffect(2)
                .padding()
            
            Text("Generating Your Plan")
                .font(.title)
                .bold()
                .padding(.top, 30)
            
            Text("Vici is creating a personalized training plan based on your goals and preferences.")
                .multilineTextAlignment(.center)
                .padding(.horizontal)
            
            ProgressView(value: 0.6)
                .padding(.horizontal, 50)
                .padding(.top, 20)
            
            Spacer()
        }
        .padding()
    }
    
    // Plan Preview View
    private var planPreviewView: some View {
        VStack {
            if let plan = viewModel.activePlan {
                ScrollView {
                    VStack(alignment: .leading, spacing: 15) {
                        // Plan Overview
                        GroupBox(label: Text("Plan Overview").bold()) {
                            VStack(alignment: .leading, spacing: 10) {
                                Text("Goal: \(plan.goal.type == .race ? "Race - \(plan.goal.raceName ?? "")" : "General Fitness")")
                                
                                if plan.goal.type == .race, let date = plan.goal.date {
                                    Text("Race Date: \(date.formatted(date: .long, time: .omitted))")
                                }
                                
                                Text("Duration: \(plan.summary.durationWeeks) weeks")
                                Text("Total Distance: \(String(format: "%.1f", plan.summary.totalDistance / 1000)) km")
                            }
                            .padding(.vertical, 5)
                        }
                        .padding(.horizontal)
                        
                        // Weekly Overview
                        Text("Weekly Plan")
                            .font(.title2)
                            .bold()
                            .padding(.horizontal)
                            .padding(.top, 10)
                        
                        ForEach(plan.weeklyOverviews) { week in
                            GroupBox {
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Week \(week.weekNumber): \(week.focus)")
                                        .font(.headline)
                                    
                                    Text("Distance: \(String(format: "%.1f", week.totalDistance)) km")
                                        .font(.subheadline)
                                }
                                .padding(.vertical, 5)
                            }
                            .padding(.horizontal)
                        }
                    }
                    .padding(.vertical)
                }
                
                // Approve Button
                Button(action: {
                    viewModel.approvePlan()
                }) {
                    Text("Approve Training Plan")
                        .font(.headline)
                        .foregroundColor(.white)
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color.green)
                        .cornerRadius(10)
                }
                .padding()
            } else {
                Text("No plan preview available")
                    .font(.headline)
                    .foregroundColor(.secondary)
                    .padding()
            }
        }
    }
    
    // Active Plan View
    private var activePlanView: some View {
        VStack {
            Picker("View", selection: $viewMode) {
                Text("This Week").tag(ViewMode.thisWeek)
                Text("Overview").tag(ViewMode.overview)
            }
            .pickerStyle(SegmentedPickerStyle())
            .padding()
            
            if viewMode == .thisWeek {
                ThisWeekView(plan: viewModel.activePlan)
            } else {
                OverviewView(plan: viewModel.activePlan)
            }
            
            Spacer()
        }
    }
}

// Create Plan View
struct CreatePlanView: View {
    @ObservedObject var viewModel: TrainingPlanViewModel
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Goal Type Section
                GroupBox(label: Text("What are you training for?").bold()) {
                    VStack(alignment: .leading, spacing: 15) {
                        Picker("Goal Type", selection: $viewModel.goalType) {
                            Text("Race").tag(GoalType.race)
                            Text("General Fitness").tag(GoalType.nonRace)
                        }
                        .pickerStyle(SegmentedPickerStyle())
                        
                        if viewModel.goalType == .race {
                            TextField("Race Name", text: $viewModel.raceName)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                            
                            // Race Distance Picker
                            HStack {
                                Text("Distance:")
                                Picker("Distance", selection: $viewModel.raceDistance) {
                                    Text("5K").tag(5000.0)
                                    Text("10K").tag(10000.0)
                                    Text("Half Marathon").tag(21097.5)
                                    Text("Marathon").tag(42195.0)
                                }
                                .pickerStyle(MenuPickerStyle())
                            }
                            
                            // Race Date Picker
                            DatePicker("Race Date", selection: $viewModel.raceDate, in: Date()..., displayedComponents: .date)
                            
                            // Previous PB Time
                            TextField("Previous PB (e.g. 45:30)", text: $viewModel.previousPbTime)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                                .keyboardType(.numberPad)
                            
                            // Goal Time
                            TextField("Goal Time (e.g. 42:15)", text: $viewModel.goalTime)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                                .keyboardType(.numberPad)
                        } else {
                            TextField("Goal Description", text: $viewModel.generalGoal)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                        }
                    }
                    .padding(.vertical, 10)
                }
                .padding(.horizontal)
                
                // Training Preferences Section
                GroupBox(label: Text("Training Preferences").bold()) {
                    VStack(alignment: .leading, spacing: 15) {
                        // Weekly Distance
                        HStack {
                            Text("Target Weekly Distance:")
                            Picker("Weekly Distance", selection: $viewModel.targetWeeklyDistance) {
                                Text("20km").tag(20000.0)
                                Text("30km").tag(30000.0)
                                Text("40km").tag(40000.0)
                                Text("50km").tag(50000.0)
                                Text("60km").tag(60000.0)
                            }
                            .pickerStyle(MenuPickerStyle())
                        }
                        
                        // Running Days Per Week
                        Stepper(value: $viewModel.runningDaysPerWeek, in: 3...6) {
                            Text("Running Days: \(viewModel.runningDaysPerWeek) days/week")
                        }
                        
                        // Quality Workouts Per Week
                        Stepper(value: $viewModel.qualityWorkoutsPerWeek, in: 1...3) {
                            Text("Quality Workouts: \(viewModel.qualityWorkoutsPerWeek) per week")
                        }
                        
                        // Preferred Long Run Day
                        HStack {
                            Text("Long Run Day:")
                            Picker("Long Run Day", selection: $viewModel.preferredLongRunDay) {
                                ForEach(WeekDay.allCases, id: \.self) { day in
                                    Text(day.rawValue).tag(day)
                                }
                            }
                            .pickerStyle(MenuPickerStyle())
                        }
                        
                        // Coaching Style
                        HStack {
                            Text("Coaching Style:")
                            Picker("Coaching Style", selection: $viewModel.coachingStyle) {
                                ForEach(CoachingStyle.allCases, id: \.self) { style in
                                    Text(style.rawValue).tag(style)
                                }
                            }
                            .pickerStyle(MenuPickerStyle())
                        }
                    }
                    .padding(.vertical, 10)
                }
                .padding(.horizontal)
                
                // Generate Button
                Button(action: {
                    viewModel.createTrainingPlan()
                    presentationMode.wrappedValue.dismiss()
                }) {
                    Text("Generate Training Plan")
                        .font(.headline)
                        .foregroundColor(.white)
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color.blue)
                        .cornerRadius(10)
                }
                .padding()
            }
            .padding(.vertical)
        }
        .navigationTitle("Create Plan")
    }
}

// This Week View
struct ThisWeekView: View {
    let plan: TrainingPlan?
    
    var body: some View {
        if let plan = plan, let weekWorkouts = plan.currentWeekWorkouts {
            ScrollView {
                VStack(spacing: 15) {
                    ForEach(weekWorkouts) { workout in
                        WorkoutCard(workout: workout)
                    }
                }
                .padding()
            }
        } else {
            Text("No workouts found for this week")
                .font(.headline)
                .foregroundColor(.secondary)
                .padding()
        }
    }
}

// Workout Card
struct WorkoutCard: View {
    let workout: Workout
    
    var body: some View {
        VStack(alignment: .leading) {
            HStack {
                Text(workout.date.formatted(date: .abbreviated, time: .omitted))
                    .font(.headline)
                Spacer()
                Text(workout.workoutType.rawValue)
                    .font(.subheadline)
                    .padding(5)
                    .background(Color.blue.opacity(0.2))
                    .cornerRadius(5)
            }
            
            Divider()
            
            Text(workout.description)
                .font(.body)
                .padding(.vertical, 5)
            
            if let distance = workout.targetDistance {
                Text("Distance: \(String(format: "%.1f", distance)) km")
                    .font(.caption)
            }
            
            if let duration = workout.targetDuration {
                Text("Duration: \(formatDuration(duration))")
                    .font(.caption)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(10)
        .shadow(radius: 2)
    }
    
    private func formatDuration(_ duration: TimeInterval) -> String {
        let hours = Int(duration) / 3600
        let minutes = (Int(duration) % 3600) / 60
        
        if hours > 0 {
            return "\(hours)h \(minutes)m"
        } else {
            return "\(minutes) minutes"
        }
    }
}

// Overview View
struct OverviewView: View {
    let plan: TrainingPlan?
    
    var body: some View {
        if let plan = plan {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    if plan.goal.type == .race {
                        Text("Goal: \(plan.goal.raceName ?? "Race")")
                            .font(.headline)
                        
                        if let date = plan.goal.date {
                            Text("Race Date: \(date.formatted(date: .long, time: .omitted))")
                                .font(.subheadline)
                        }
                    } else {
                        Text("Goal: General Fitness")
                            .font(.headline)
                    }
                    
                    Text("Plan Duration: \(plan.summary.durationWeeks) weeks")
                        .font(.subheadline)
                    
                    Divider()
                    
                    Text("Weekly Overview")
                        .font(.title2)
                        .padding(.bottom, 5)
                    
                    ForEach(plan.weeklyOverviews) { week in
                        WeekSummaryCard(week: week)
                    }
                }
                .padding()
            }
        } else {
            Text("No plan details available")
                .font(.headline)
                .foregroundColor(.secondary)
                .padding()
        }
    }
}

// Week Summary Card
struct WeekSummaryCard: View {
    let week: WeekSummary
    
    var body: some View {
        VStack(alignment: .leading) {
            Text("Week \(week.weekNumber)")
                .font(.headline)
            
            Text("Focus: \(week.focus)")
                .font(.subheadline)
                .padding(.bottom, 2)
            
            Text("Distance: \(String(format: "%.1f", week.totalDistance)) km")
                .font(.caption)
            
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    Rectangle()
                        .foregroundColor(Color(.systemGray5))
                        .frame(width: geometry.size.width, height: 8)
                        .cornerRadius(4)
                    
                    Rectangle()
                        .foregroundColor(.blue)
                        .frame(width: min(CGFloat(week.progressPercentage) * geometry.size.width, geometry.size.width), height: 8)
                        .cornerRadius(4)
                }
            }
            .frame(height: 8)
            .padding(.vertical, 5)
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(10)
    }
} 