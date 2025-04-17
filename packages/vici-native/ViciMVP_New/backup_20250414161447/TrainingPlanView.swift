import SwiftUI

// Import our fixed implementations
@_exported import struct ViciMVP.TrainingPlanViewModel_Fixed

struct TrainingPlanView: View {
    @StateObject private var viewModel = TrainingPlanViewModel_Fixed()
    @State private var selectedSegment = 0
    
    var body: some View {
        NavigationView {
            ZStack {
                // Background
                Color(.systemGroupedBackground)
                    .edgesIgnoringSafeArea(.all)
                
                // Main content
                if viewModel.isLoading {
                    LoadingView()
                } else if let error = viewModel.errorMessage {
                    ErrorView(message: error) {
                        viewModel.loadActivePlan()
                    }
                } else if let plan = viewModel.activePlan {
                    // Plan exists, show plan content
                    ScrollView {
                        VStack(spacing: 16) {
                            // Plan header
                            PlanHeaderView(plan: plan)
                            
                            // Segment control for Today/Week/Plan
                            Picker("View", selection: $selectedSegment) {
                                Text("Today").tag(0)
                                Text("This Week").tag(1)
                                Text("Plan").tag(2)
                            }
                            .pickerStyle(SegmentedPickerStyle())
                            .padding(.horizontal)
                            
                            // Content based on selected segment
                            if selectedSegment == 0 {
                                TodayWorkoutView(workout: viewModel.todaysWorkout)
                            } else if selectedSegment == 1 {
                                ThisWeekView(workouts: viewModel.thisWeekWorkouts)
                            } else {
                                PlanOverviewView(plan: plan)
                            }
                        }
                        .padding(.bottom, 20)
                    }
                } else {
                    // No plan, show empty state with create button
                    EmptyPlanView {
                        viewModel.showCreatePlan = true
                    }
                }
            }
            .navigationTitle("Training")
            .navigationBarItems(trailing:
                Menu {
                    Button(action: {
                        viewModel.showCreatePlan = true
                    }) {
                        Label("Create New Plan", systemImage: "plus")
                    }
                    
                    if viewModel.activePlan != nil {
                        Button(action: {
                            viewModel.showEditPlan = true
                        }) {
                            Label("Edit Plan", systemImage: "pencil")
                        }
                    }
                } label: {
                    Image(systemName: "ellipsis.circle")
                }
            )
            .sheet(isPresented: $viewModel.showCreatePlan) {
                CreatePlanView { newPlan in
                    viewModel.activePlan = newPlan
                    if let planId = newPlan.id {
                        viewModel.loadWorkouts(for: planId)
                    }
                }
            }
            .sheet(isPresented: $viewModel.showEditPlan) {
                if let plan = viewModel.activePlan {
                    EditPlanView(plan: plan) { updatedPlan in
                        viewModel.activePlan = updatedPlan
                        if let planId = updatedPlan.id {
                            viewModel.loadWorkouts(for: planId)
                        }
                    }
                }
            }
            .onAppear {
                viewModel.loadActivePlan()
            }
            .refreshable {
                viewModel.loadActivePlan()
            }
        }
    }
}

// MARK: - Sub Views

struct PlanHeaderView: View {
    let plan: TrainingPlan
    
    var body: some View {
        VStack(spacing: 8) {
            Text(plan.name)
                .font(.title)
                .fontWeight(.bold)
            
            Text(plan.goal ?? "Custom training plan")
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            HStack(spacing: 20) {
                VStack {
                    let days = Calendar.current.dateComponents([.day], from: plan.startDate, to: plan.endDate).day ?? 0
                    Text("\(days)")
                        .font(.headline)
                    Text("Days")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Divider()
                    .frame(height: 24)
                
                VStack {
                    Text("\(plan.workouts?.count ?? 0)")
                        .font(.headline)
                    Text("Workouts")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Divider()
                    .frame(height: 24)
                
                VStack {
                    Text(plan.startDate.formatted(date: .abbreviated, time: .omitted))
                        .font(.headline)
                    Text("Start")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(10)
            .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.05), radius: 8, x: 0, y: 3)
        .padding(.horizontal)
    }
}

struct TodayWorkoutView: View {
    let workout: Workout?
    
    var body: some View {
        VStack {
            if let workout = workout {
                VStack(alignment: .leading, spacing: 16) {
                    HStack {
                        Text("Today's Workout")
                            .font(.headline)
                        
                        Spacer()
                        
                        Text(workout.scheduledDate.formatted(date: .abbreviated, time: .omitted))
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    
                    // Workout card
                    WorkoutCard(workout: workout)
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(12)
                .shadow(color: Color.black.opacity(0.05), radius: 8, x: 0, y: 3)
                .padding(.horizontal)
            } else {
                VStack(spacing: 8) {
                    Text("Rest Day")
                        .font(.title2)
                        .fontWeight(.bold)
                    
                    Text("No workout scheduled for today")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    
                    Image(systemName: "moon.zzz.fill")
                        .font(.system(size: 50))
                        .foregroundColor(.blue)
                        .padding()
                }
                .padding()
                .frame(maxWidth: .infinity)
                .background(Color(.systemBackground))
                .cornerRadius(12)
                .shadow(color: Color.black.opacity(0.05), radius: 8, x: 0, y: 3)
                .padding(.horizontal)
            }
        }
    }
}

struct ThisWeekView: View {
    let workouts: [Workout]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("This Week")
                .font(.headline)
                .padding(.horizontal)
            
            ForEach(workouts) { workout in
                WorkoutRow(workout: workout)
            }
            
            if workouts.isEmpty {
                Text("No workouts scheduled for this week")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding()
            }
        }
    }
}

struct PlanOverviewView: View {
    let plan: TrainingPlan
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Plan Overview")
                .font(.headline)
                .padding(.horizontal)
            
            VStack(alignment: .leading, spacing: 4) {
                Text("Description")
                    .font(.subheadline)
                    .fontWeight(.semibold)
                
                Text(plan.description ?? "No description")
                    .font(.body)
                    .foregroundColor(.secondary)
            }
            .padding()
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color(.systemBackground))
            .cornerRadius(12)
            .shadow(color: Color.black.opacity(0.05), radius: 8, x: 0, y: 3)
            .padding(.horizontal)
            
            VStack(alignment: .leading, spacing: 4) {
                Text("Schedule")
                    .font(.subheadline)
                    .fontWeight(.semibold)
                
                HStack {
                    Text("Start Date:")
                        .fontWeight(.medium)
                    
                    Spacer()
                    
                    Text(plan.startDate.formatted(date: .long, time: .omitted))
                        .foregroundColor(.secondary)
                }
                
                HStack {
                    Text("End Date:")
                        .fontWeight(.medium)
                    
                    Spacer()
                    
                    Text(plan.endDate.formatted(date: .long, time: .omitted))
                        .foregroundColor(.secondary)
                }
                
                HStack {
                    Text("Duration:")
                        .fontWeight(.medium)
                    
                    Spacer()
                    
                    let days = Calendar.current.dateComponents([.day], from: plan.startDate, to: plan.endDate).day ?? 0
                    Text("\(days) days")
                        .foregroundColor(.secondary)
                }
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(12)
            .shadow(color: Color.black.opacity(0.05), radius: 8, x: 0, y: 3)
            .padding(.horizontal)
        }
    }
}

struct WorkoutCard: View {
    let workout: Workout
    @State private var showingCompleteSheet = false
    @StateObject private var viewModel = TrainingPlanViewModel_Fixed()
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(workout.name)
                    .font(.title3)
                    .fontWeight(.bold)
                
                Spacer()
                
                Text(formatDuration(workout.duration ?? 0))
                    .font(.headline)
                    .foregroundColor(.blue)
            }
            
            Text(workout.description ?? "No description")
                .font(.body)
                .foregroundColor(.secondary)
                .lineLimit(3)
            
            HStack {
                Label(
                    workout.type ?? "Run",
                    systemImage: "figure.run"
                )
                .font(.subheadline)
                
                Spacer()
                
                // This would be better with a real intensity field in the model
                Label(
                    "Medium",
                    systemImage: "speedometer"
                )
                .font(.subheadline)
            }
            .foregroundColor(.secondary)
            
            if !workout.completed {
                Button(action: {
                    showingCompleteSheet = true
                }) {
                    Text("Mark as Completed")
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.green)
                        .cornerRadius(10)
                }
                .sheet(isPresented: $showingCompleteSheet) {
                    CompleteWorkoutView(workout: workout) { notes in
                        Task {
                            await viewModel.completeWorkout(id: workout.id, notes: notes)
                        }
                        showingCompleteSheet = false
                    }
                }
            } else {
                HStack {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                    Text("Completed")
                        .foregroundColor(.green)
                    
                    if let completedDate = workout.completedDate {
                        Spacer()
                        Text(completedDate.formatted(date: .abbreviated, time: .omitted))
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                .padding(.vertical, 8)
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
    
    private func formatDuration(_ minutes: Int) -> String {
        let hours = minutes / 60
        let mins = minutes % 60
        
        if hours > 0 {
            return "\(hours)h \(mins)m"
        } else {
            return "\(mins)m"
        }
    }
}

struct CompleteWorkoutView: View {
    let workout: Workout
    let onComplete: (String?) -> Void
    @State private var notes = ""
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Workout Details")) {
                    Text(workout.name)
                        .font(.headline)
                    
                    Text(workout.description ?? "No description")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                Section(header: Text("Completion Notes")) {
                    TextEditor(text: $notes)
                        .frame(minHeight: 100)
                }
            }
            .navigationTitle("Complete Workout")
            .navigationBarItems(
                leading: Button("Cancel") {
                    presentationMode.wrappedValue.dismiss()
                },
                trailing: Button("Complete") {
                    onComplete(notes.isEmpty ? nil : notes)
                }
                .fontWeight(.bold)
            )
        }
    }
}

struct WorkoutRow: View {
    let workout: Workout
    
    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                Text(workout.scheduledDate.formatted(date: .abbreviated, time: .omitted))
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                Text(workout.name)
                    .font(.headline)
                
                Text(workout.type ?? "Run")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            VStack(alignment: .trailing) {
                Text(formatDuration(workout.duration ?? 0))
                    .font(.headline)
                    .foregroundColor(.blue)
                
                if workout.completed {
                    Text("Completed")
                        .font(.caption)
                        .foregroundColor(.green)
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
        .padding(.horizontal)
    }
    
    private func formatDuration(_ minutes: Int) -> String {
        let hours = minutes / 60
        let mins = minutes % 60
        
        if hours > 0 {
            return "\(hours)h \(mins)m"
        } else {
            return "\(mins)m"
        }
    }
}

struct EmptyPlanView: View {
    let onCreatePlan: () -> Void
    
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "figure.run")
                .font(.system(size: 70))
                .foregroundColor(.blue)
            
            Text("No Active Training Plan")
                .font(.title2)
                .fontWeight(.bold)
            
            Text("Create a training plan to start tracking your workouts and progress")
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
            
            Button(action: onCreatePlan) {
                Text("Create Training Plan")
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(width: 220, height: 50)
                    .background(Color.blue)
                    .cornerRadius(10)
            }
            .padding(.top, 10)
        }
        .padding()
    }
}

struct LoadingView: View {
    var body: some View {
        VStack(spacing: 20) {
            ProgressView()
                .scaleEffect(1.5)
            
            Text("Loading your training plan...")
                .font(.headline)
                .foregroundColor(.secondary)
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
            
            Text("Oops! Something went wrong")
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

// MARK: - Preview Providers

struct CreatePlanView: View {
    let onCreatePlan: (TrainingPlan) -> Void
    @Environment(\.presentationMode) var presentationMode
    @State private var showingCreationSuccess = false
    
    var body: some View {
        // This is a placeholder - the actual implementation would include a multi-step form
        VStack(spacing: 20) {
            Text("Create Training Plan")
                .font(.largeTitle)
                .fontWeight(.bold)
            
            Text("This is a placeholder for the plan creation interface.")
                .multilineTextAlignment(.center)
                .padding()
            
            Button("Create Demo Plan") {
                // Create a sample plan for demo purposes
                onCreatePlan(TrainingPlan.samplePlan)
                showingCreationSuccess = true
            }
            .padding()
            .background(Color.blue)
            .foregroundColor(.white)
            .cornerRadius(10)
        }
        .padding()
        .alert(isPresented: $showingCreationSuccess) {
            Alert(
                title: Text("Plan Created"),
                message: Text("Your new training plan has been created successfully."),
                dismissButton: .default(Text("OK")) {
                    presentationMode.wrappedValue.dismiss()
                }
            )
        }
    }
}

struct EditPlanView: View {
    let plan: TrainingPlan
    let onUpdatePlan: (TrainingPlan) -> Void
    @Environment(\.presentationMode) var presentationMode
    @State private var updatedPlan: TrainingPlan
    
    init(plan: TrainingPlan, onUpdatePlan: @escaping (TrainingPlan) -> Void) {
        self.plan = plan
        self.onUpdatePlan = onUpdatePlan
        _updatedPlan = State(initialValue: plan)
    }
    
    var body: some View {
        // This is a placeholder - the actual implementation would include a form
        VStack(spacing: 20) {
            Text("Edit Training Plan")
                .font(.largeTitle)
                .fontWeight(.bold)
            
            Text("This is a placeholder for the plan editing interface.")
                .multilineTextAlignment(.center)
                .padding()
            
            Button("Save Changes") {
                onUpdatePlan(updatedPlan)
                presentationMode.wrappedValue.dismiss()
            }
            .padding()
            .background(Color.blue)
            .foregroundColor(.white)
            .cornerRadius(10)
        }
        .padding()
    }
}

struct TrainingPlanView_Previews: PreviewProvider {
    static var previews: some View {
        let viewModel = TrainingPlanViewModel()
        viewModel.activePlan = TrainingPlan.samplePlanWithWorkouts
        
        return Group {
            // Active plan view
            TrainingPlanView()
                .previewDisplayName("With Active Plan")
                .onAppear {
                    // Inject mock data for preview
                    viewModel.activePlan = TrainingPlan.samplePlanWithWorkouts
                    viewModel.workouts = Workout.previewWeek
                }
            
            // Empty state view
            TrainingPlanView()
                .previewDisplayName("No Active Plan")
        }
    }
} 