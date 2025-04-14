import SwiftUI

struct TrainingPlanView: View {
    @StateObject private var viewModel = TrainingPlanViewModel()
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
                } else if let error = viewModel.error {
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
                                ThisWeekView(workouts: viewModel.currentWeekWorkouts)
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
                    viewModel.loadWorkouts()
                }
            }
            .sheet(isPresented: $viewModel.showEditPlan) {
                if let plan = viewModel.activePlan {
                    EditPlanView(plan: plan) { updatedPlan in
                        viewModel.activePlan = updatedPlan
                        viewModel.loadWorkouts()
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
                    Text(plan.startDate?.formatted(date: .abbreviated, time: .omitted) ?? "")
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
                        
                        Text(workout.date?.formatted(date: .abbreviated, time: .omitted) ?? "")
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
                    
                    Text(plan.startDate?.formatted(date: .long, time: .omitted) ?? "Not set")
                        .foregroundColor(.secondary)
                }
                
                HStack {
                    Text("End Date:")
                        .fontWeight(.medium)
                    
                    Spacer()
                    
                    Text(plan.endDate?.formatted(date: .long, time: .omitted) ?? "Not set")
                        .foregroundColor(.secondary)
                }
                
                HStack {
                    Text("Duration:")
                        .fontWeight(.medium)
                    
                    Spacer()
                    
                    Text("\(plan.duration ?? 0) days")
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
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(workout.name)
                    .font(.title3)
                    .fontWeight(.bold)
                
                Spacer()
                
                Text(formatDuration(workout.duration))
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
                
                Label(
                    workout.intensity ?? "Medium",
                    systemImage: "speedometer"
                )
                .font(.subheadline)
            }
            .foregroundColor(.secondary)
            
            Button(action: {
                // Mark as completed action
            }) {
                Text("Mark as Completed")
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.green)
                    .cornerRadius(10)
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
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

struct WorkoutRow: View {
    let workout: Workout
    
    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                Text(workout.date?.formatted(date: .abbreviated, time: .omitted) ?? "")
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
                Text(formatDuration(workout.duration))
                    .font(.headline)
                    .foregroundColor(.blue)
                
                if workout.completed == true {
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

struct TrainingPlanView_Previews: PreviewProvider {
    static var previews: some View {
        TrainingPlanView()
    }
} 