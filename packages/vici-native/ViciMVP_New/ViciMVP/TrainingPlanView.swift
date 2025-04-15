import SwiftUI
import Foundation
import Combine

// MARK: - Training Plan View
/// The main view for displaying and interacting with training plans
/// This is currently a placeholder that will be enhanced with real functionality
/// 
/// Requirements:
/// - Display current training plan details
/// - Show weekly schedule and today's workout
/// - Allow interaction with workouts (complete, reschedule)
/// - Provide insights and progress tracking
struct TrainingPlanView: View {
    // MARK: - Properties
    @StateObject private var viewModel = TrainingPlanViewModel()
    @State private var selectedTab = 0
    @State private var showCompleteWorkoutSheet = false
    @State private var selectedWorkout: Workout?
    @State private var completionNotes = ""
    @State private var isRefreshing = false
    
    // MARK: - Body
    var body: some View {
        NavigationView {
            ZStack {
                if viewModel.isLoading && !isRefreshing {
                    ProgressView("Loading your plan...")
                } else if let errorMessage = viewModel.errorMessage {
                    VStack {
                        Text("Something went wrong")
                            .font(.title)
                            .padding(.bottom, 8)
                        
                        Text(errorMessage)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                        
                        Button("Try Again") {
                            viewModel.loadActivePlan()
                        }
                        .padding(.top, 16)
                    }
                    .padding()
                } else {
                    mainContentView
                }
            }
            .navigationTitle("My Plan")
            .sheet(isPresented: $viewModel.showCreatePlan) {
                // Create Plan sheet is out of scope for this implementation
                Text("Create Plan View")
                    .padding()
            }
            .sheet(isPresented: $viewModel.showEditPlan) {
                // Edit Plan sheet is out of scope for this implementation
                Text("Edit Plan View")
                    .padding()
            }
            .sheet(isPresented: $showCompleteWorkoutSheet) {
                CompleteWorkoutView(workout: selectedWorkout, notes: $completionNotes) { notes in
                    if let workout = selectedWorkout {
                        Task {
                            await viewModel.completeWorkout(id: workout.id, notes: notes)
                            completionNotes = ""
                            selectedWorkout = nil
                        }
                    }
                }
            }
            .onAppear {
                viewModel.loadActivePlan()
            }
            .refreshable {
                await refreshData()
            }
        }
    }
    
    // MARK: - Main Content View
    private var mainContentView: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Plan Header
                if let plan = viewModel.activePlan {
                    PlanHeaderView(plan: plan)
                }
                
                // Tab selection for Today/This Week/Overview
                Picker("View", selection: $selectedTab) {
                    Text("Today").tag(0)
                    Text("This Week").tag(1)
                    Text("Overview").tag(2)
                }
                .pickerStyle(SegmentedPickerStyle())
                .padding(.horizontal)
                
                // Content based on selected tab
                switch selectedTab {
                case 0:
                    TodayWorkoutView(todaysWorkout: viewModel.todaysWorkout) { workout in
                        selectedWorkout = workout
                        showCompleteWorkoutSheet = true
                    }
                case 1:
                    ThisWeekView(weekWorkouts: viewModel.thisWeekWorkouts) { workout in
                        selectedWorkout = workout
                        showCompleteWorkoutSheet = true
                    }
                case 2:
                    PlanOverviewView(plan: viewModel.activePlan)
                default:
                    EmptyView()
                }
            }
            .padding()
            .opacity(viewModel.isLoading && isRefreshing ? 0.6 : 1.0)
            .overlay {
                if viewModel.isLoading && isRefreshing {
                    ProgressView()
                        .scaleEffect(1.5)
                        .frame(width: 50, height: 50)
                        .background(Color.secondary.opacity(0.1))
                        .cornerRadius(10)
                }
            }
        }
        // Bottom toolbar with action buttons
        .safeAreaInset(edge: .bottom) {
            HStack {
                Button {
                    viewModel.showCreatePlan = true
                } label: {
                    Label("Create Plan", systemImage: "plus.circle")
                }
                .buttonStyle(.borderedProminent)
                
                Spacer()
                
                // Manual refresh button
                Button {
                    Task {
                        await refreshData()
                    }
                } label: {
                    Label("Refresh", systemImage: "arrow.clockwise")
                }
                .buttonStyle(.bordered)
                
                if viewModel.activePlan != nil {
                    Button {
                        viewModel.showEditPlan = true
                    } label: {
                        Label("Edit Plan", systemImage: "pencil.circle")
                    }
                    .buttonStyle(.bordered)
                }
            }
            .padding()
            .background(.ultraThinMaterial)
        }
    }
    
    // MARK: - Refresh Helper
    private func refreshData() async {
        isRefreshing = true
        viewModel.refreshAll()
        
        // Simulate a minimum refresh time for better UX
        try? await Task.sleep(nanoseconds: 1_000_000_000) // 1 second
        isRefreshing = false
    }
    
    // MARK: - Helper Components
    
    /// A simple bullet point text view
    struct BulletPoint: View {
        let text: String
        
        var body: some View {
            HStack(alignment: .top) {
                Text("•")
                    .font(.body)
                    .foregroundColor(.blue)
                Text(text)
                    .font(.body)
            }
        }
    }
}

// MARK: - Helper Components

// Plan Header component
struct PlanHeaderView: View {
    let plan: TrainingPlan
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(plan.name)
                .font(.title)
                .fontWeight(.bold)
            
            if let description = plan.description {
                Text(description)
                    .foregroundColor(.secondary)
            }
            
            HStack {
                Label(plan.formattedDateRange, systemImage: "calendar")
                    .font(.subheadline)
                
                Spacer()
                
                Text("\(plan.durationInWeeks) weeks")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            
            // Progress bar
            ProgressView(value: plan.progressPercentage / 100)
                .progressViewStyle(LinearProgressViewStyle())
                .padding(.top, 4)
            
            HStack {
                Text("Progress: \(Int(plan.progressPercentage))%")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Spacer()
                
                if let workouts = plan.workouts {
                    Text("\(workouts.filter { $0.completed }.count)/\(workouts.count) workouts completed")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding()
        .background(Color.gray.opacity(0.1))
        .cornerRadius(10)
    }
}

// Today's workout component
struct TodayWorkoutView: View {
    let todaysWorkout: Workout?
    let onComplete: (Workout) -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Today's Workout")
                .font(.title2)
                .fontWeight(.bold)
            
            if let workout = todaysWorkout {
                VStack(alignment: .leading, spacing: 12) {
                    Text(workout.name)
                        .font(.headline)
                    
                    if let description = workout.description {
                        Text(description)
                            .foregroundColor(.secondary)
                    }
                    
                    HStack {
                        if let distance = workout.distance {
                            Label(formatDistance(distance), systemImage: "figure.walk")
                                .padding(.trailing)
                        }
                        
                        Label(formatDuration(workout.duration), systemImage: "clock")
                    }
                    .font(.subheadline)
                    
                    if !workout.completed {
                        Button {
                            onComplete(workout)
                        } label: {
                            Text("Mark as Completed")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.borderedProminent)
                        .padding(.top, 8)
                    } else {
                        HStack {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(.green)
                            Text("Completed")
                                .foregroundColor(.green)
                        }
                        .padding(.top, 8)
                    }
                }
                .padding()
                .background(Color.blue.opacity(0.1))
                .cornerRadius(10)
            } else {
                Text("No workout scheduled for today")
                    .foregroundColor(.secondary)
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .center)
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(10)
            }
        }
    }
}

// This week's workouts component
struct ThisWeekView: View {
    let weekWorkouts: [Workout]
    let onComplete: (Workout) -> Void
    
    private var workoutsByDay: [Date: Workout] {
        var dict = [Date: Workout]()
        let calendar = Calendar.current
        
        for workout in weekWorkouts {
            let date = calendar.startOfDay(for: workout.scheduledDate)
            dict[date] = workout
        }
        
        return dict
    }
    
    private var weekDays: [Date] {
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())
        let weekday = calendar.component(.weekday, from: today)
        let weekdayOrdinal = calendar.component(.weekdayOrdinal, from: today)
        
        var startOfWeek = calendar.date(from: DateComponents(
            calendar: calendar,
            weekday: calendar.firstWeekday,
            weekdayOrdinal: weekdayOrdinal
        ))!
        
        if weekday < calendar.firstWeekday {
            startOfWeek = calendar.date(byAdding: .day, value: -7, to: startOfWeek)!
        }
        
        return (0...6).map { day in
            calendar.date(byAdding: .day, value: day, to: startOfWeek)!
        }
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("This Week")
                .font(.title2)
                .fontWeight(.bold)
            
            ForEach(weekDays, id: \.self) { day in
                let isToday = Calendar.current.isDateInToday(day)
                let workout = workoutsByDay[day]
                
                HStack {
                    VStack(alignment: .leading) {
                        Text(formatDay(day))
                            .font(.subheadline)
                            .foregroundColor(isToday ? .blue : .primary)
                            .fontWeight(isToday ? .bold : .regular)
                        
                        if let workout = workout {
                            Text(workout.name)
                                .foregroundColor(isToday ? .blue : .primary)
                                .fontWeight(isToday ? .bold : .regular)
                        } else {
                            Text("Rest day")
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    Spacer()
                    
                    if let workout = workout {
                        if workout.completed {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(.green)
                        } else if isToday {
                            Button {
                                onComplete(workout)
                            } label: {
                                Text("Complete")
                                    .font(.caption)
                            }
                            .buttonStyle(.bordered)
                        }
                    }
                }
                .padding()
                .background(isToday ? Color.blue.opacity(0.1) : Color.gray.opacity(0.1))
                .cornerRadius(10)
            }
        }
    }
    
    private func formatDay(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE, MMM d"
        return formatter.string(from: date)
    }
}

// Plan overview component
struct PlanOverviewView: View {
    let plan: TrainingPlan?
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Plan Overview")
                .font(.title2)
                .fontWeight(.bold)
            
            if let plan = plan {
                VStack(alignment: .leading, spacing: 12) {
                    if let goal = plan.goal {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Goal:")
                                .font(.headline)
                            Text(goal)
                        }
                        .padding(.bottom, 8)
                    }
                    
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Duration:")
                            .font(.headline)
                        Text("\(plan.durationInWeeks) weeks (\(plan.formattedDateRange))")
                    }
                    .padding(.bottom, 8)
                    
                    if let workouts = plan.workouts {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Workouts:")
                                .font(.headline)
                            Text("\(workouts.count) total workouts")
                            Text("\(workouts.filter { $0.completed }.count) completed")
                            Text("\(workouts.filter { !$0.completed }.count) remaining")
                        }
                    }
                }
                .padding()
                .background(Color.gray.opacity(0.1))
                .cornerRadius(10)
            } else {
                Text("No active training plan")
                    .foregroundColor(.secondary)
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .center)
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(10)
            }
        }
    }
}

// Complete workout sheet
struct CompleteWorkoutView: View {
    let workout: Workout?
    @Binding var notes: String
    let onComplete: (String?) -> Void
    
    var body: some View {
        NavigationView {
            VStack(alignment: .leading, spacing: 16) {
                if let workout = workout {
                    Text("Complete \(workout.name)")
                        .font(.headline)
                    
                    Text("Add any notes about how the workout went:")
                        .font(.subheadline)
                    
                    TextEditor(text: $notes)
                        .frame(minHeight: 150)
                        .padding(4)
                        .background(Color.gray.opacity(0.1))
                        .cornerRadius(8)
                    
                    Button {
                        onComplete(notes.isEmpty ? nil : notes)
                    } label: {
                        Text("Save & Complete Workout")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                    .padding(.top, 8)
                } else {
                    Text("No workout selected")
                }
                
                Spacer()
            }
            .padding()
            .navigationTitle("Complete Workout")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        onComplete(nil)
                    }
                }
            }
        }
    }
}

// Helper functions
func formatDuration(_ minutes: Int?) -> String {
    guard let minutes = minutes else { return "N/A" }
    
    let hours = minutes / 60
    let mins = minutes % 60
    
    if hours > 0 {
        return String(format: "%dh %dm", hours, mins)
    } else {
        return String(format: "%d min", mins)
    }
}

func formatDistance(_ meters: Double?) -> String {
    guard let meters = meters else { return "N/A" }
    
    if meters >= 1000 {
        return String(format: "%.2f km", meters / 1000)
    } else {
        return String(format: "%.0f m", meters)
    }
}

// MARK: - Preview
struct TrainingPlanView_Previews: PreviewProvider {
    static var previews: some View {
        TrainingPlanView()
    }
} 