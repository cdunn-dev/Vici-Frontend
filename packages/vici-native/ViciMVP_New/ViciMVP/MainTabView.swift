import SwiftUI

struct MainTabView: View {
    var body: some View {
        TabView {
            Text("Home")
                .tabItem {
                    Label("Home", systemImage: "house")
                }
            
            Text("Training")
                .tabItem {
                    Label("Training", systemImage: "figure.run")
                }
            
            Text("Profile")
                .tabItem {
                    Label("Profile", systemImage: "person")
                }
        }
    }
}

// Enhanced Training Plan View (Home Screen)
struct TrainingPlanView: View {
    @EnvironmentObject var userAuth: UserAuthentication
    @EnvironmentObject var trainingPlanService: TrainingPlanService
    @State private var viewMode: ViewMode = .thisWeek
    @State private var showingNewPlanSheet = false
    
    enum ViewMode {
        case thisWeek, overview
    }
    
    var body: some View {
        NavigationView {
            ZStack {
                // Background color
                Color(.systemGroupedBackground)
                    .ignoresSafeArea()
                
                // Content
                if trainingPlanService.isLoading {
                    ProgressView("Loading your plan...")
                } else if let _ = trainingPlanService.currentPlan {
                    // Has active plan
                    ScrollView {
                        VStack(spacing: 20) {
                            // Today's workout section
                            TodayWorkoutSection(workout: trainingPlanService.todaysWorkout)
                                .padding(.horizontal)
                            
                            // Tab selection
                            Picker("View", selection: $viewMode) {
                                Text("This Week").tag(ViewMode.thisWeek)
                                Text("Overview").tag(ViewMode.overview)
                            }
                            .pickerStyle(SegmentedPickerStyle())
                            .padding(.horizontal)
                            
                            // Tab content
                            if viewMode == .thisWeek {
                                ThisWeekView()
                            } else {
                                OverviewView()
                            }
                            
                            Spacer(minLength: 20)
                        }
                        .padding(.top)
                    }
                } else {
                    // No active plan
                    VStack(spacing: 20) {
                        Image(systemName: "figure.run")
                            .font(.system(size: 50))
                            .foregroundColor(.blue)
                        
                        Text("No Active Training Plan")
                            .font(.title2)
                            .fontWeight(.bold)
                        
                        Text("Create your personalized training plan to get started on your running journey.")
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 30)
                            .foregroundColor(.secondary)
                        
                        Button(action: {
                            showingNewPlanSheet = true
                        }) {
                            Text("Create Training Plan")
                                .fontWeight(.bold)
                                .frame(width: 240, height: 50)
                                .background(Color.blue)
                                .foregroundColor(.white)
                                .cornerRadius(10)
                        }
                        .padding(.top, 10)
                    }
                    .padding()
                }
            }
            .navigationTitle("Training Plan")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    if trainingPlanService.currentPlan != nil {
                        Button(action: {
                            showingNewPlanSheet = true
                        }) {
                            Image(systemName: "plus")
                        }
                    }
                }
            }
            .sheet(isPresented: $showingNewPlanSheet) {
                NewPlanView(isPresented: $showingNewPlanSheet)
            }
            .refreshable {
                // Pull-to-refresh
                trainingPlanService.fetchCurrentPlan()
                trainingPlanService.fetchTodaysWorkout()
            }
        }
    }
}

// Today's Workout Section
struct TodayWorkoutSection: View {
    let workout: Workout?
    
    var body: some View {
        VStack(alignment: .leading, spacing: 15) {
            Text("TODAY'S WORKOUT")
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundColor(.secondary)
            
            if let workout = workout {
                // Has workout for today
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        Text(workout.type.rawValue)
                            .font(.headline)
                            .fontWeight(.bold)
                        
                        Spacer()
                        
                        WorkoutStatusBadge(status: workout.status)
                    }
                    
                    Text(workout.description)
                        .font(.body)
                    
                    HStack {
                        if let distance = workout.targetDistance {
                            HStack {
                                Image(systemName: "ruler")
                                    .foregroundColor(.secondary)
                                Text("\(String(format: "%.1f km", distance))")
                                    .font(.subheadline)
                            }
                            .padding(.trailing, 10)
                        }
                        
                        if let duration = workout.targetDuration {
                            HStack {
                                Image(systemName: "clock")
                                    .foregroundColor(.secondary)
                                Text(formatDuration(duration))
                                    .font(.subheadline)
                            }
                        }
                        
                        Spacer()
                        
                        Button(action: {
                            // Log workout action
                        }) {
                            Text("Log Workout")
                                .font(.footnote)
                                .fontWeight(.medium)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(Color.blue)
                                .foregroundColor(.white)
                                .cornerRadius(5)
                        }
                    }
                    .padding(.top, 5)
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(12)
                .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
            } else {
                // No workout today
                VStack {
                    Text("No workout scheduled for today")
                        .font(.body)
                    Text("Enjoy your rest day!")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(12)
            }
        }
    }
    
    private func formatDuration(_ seconds: TimeInterval) -> String {
        let hours = Int(seconds) / 3600
        let minutes = (Int(seconds) % 3600) / 60
        
        if hours > 0 {
            return "\(hours)h \(minutes)m"
        } else {
            return "\(minutes) min"
        }
    }
}

// Workout Status Badge
struct WorkoutStatusBadge: View {
    let status: WorkoutStatus
    
    var body: some View {
        Text(status.rawValue)
            .font(.caption2)
            .fontWeight(.medium)
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(backgroundColor)
            .foregroundColor(foregroundColor)
            .cornerRadius(4)
    }
    
    private var backgroundColor: Color {
        switch status {
        case .upcoming:
            return .blue.opacity(0.15)
        case .completed:
            return .green.opacity(0.15)
        case .missed:
            return .red.opacity(0.15)
        case .skipped:
            return .orange.opacity(0.15)
        }
    }
    
    private var foregroundColor: Color {
        switch status {
        case .upcoming:
            return .blue
        case .completed:
            return .green
        case .missed:
            return .red
        case .skipped:
            return .orange
        }
    }
}

// New Plan View (Placeholder)
struct NewPlanView: View {
    @Binding var isPresented: Bool
    @State private var selectedGoalType = GoalType.race
    @State private var raceName = ""
    @State private var raceDistance = "Half Marathon"
    @State private var raceDate = Date().addingTimeInterval(60*24*60*60)
    @State private var experienceLevel = ExperienceLevel.intermediate
    @State private var runningDaysPerWeek = 4
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Goal")) {
                    Picker("Goal Type", selection: $selectedGoalType) {
                        Text("Race").tag(GoalType.race)
                        Text("General Fitness").tag(GoalType.nonRace)
                    }
                    .pickerStyle(SegmentedPickerStyle())
                    
                    if selectedGoalType == .race {
                        TextField("Race Name", text: $raceName)
                        
                        Picker("Distance", selection: $raceDistance) {
                            Text("5K").tag("5K")
                            Text("10K").tag("10K")
                            Text("Half Marathon").tag("Half Marathon")
                            Text("Marathon").tag("Marathon")
                        }
                        
                        DatePicker("Race Date", selection: $raceDate, displayedComponents: .date)
                    }
                }
                
                Section(header: Text("Your Experience")) {
                    Picker("Experience Level", selection: $experienceLevel) {
                        ForEach(ExperienceLevel.allCases) { level in
                            Text(level.rawValue).tag(level)
                        }
                    }
                    
                    Stepper("Running Days: \(runningDaysPerWeek)", value: $runningDaysPerWeek, in: 3...6)
                }
                
                Section {
                    Button(action: {
                        createPlan()
                        isPresented = false
                    }) {
                        Text("Generate Plan")
                            .frame(maxWidth: .infinity)
                            .foregroundColor(.white)
                    }
                    .listRowBackground(Color.blue)
                }
            }
            .navigationTitle("New Training Plan")
            .navigationBarItems(trailing: Button("Cancel") {
                isPresented = false
            })
        }
    }
    
    private func createPlan() {
        // In real app this would call the API to generate a plan
        // For MVP we just use the mock plan
    }
}

// This Week View Component
struct ThisWeekView: View {
    @EnvironmentObject var trainingPlanService: TrainingPlanService
    
    var body: some View {
        VStack(alignment: .leading, spacing: 15) {
            Text("THIS WEEK'S WORKOUTS")
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundColor(.secondary)
                .padding(.horizontal)
            
            ForEach(weekWorkouts) { workout in
                WorkoutCard(workout: workout)
                    .padding(.horizontal)
            }
        }
    }
    
    private var weekWorkouts: [Workout] {
        guard let plan = trainingPlanService.currentPlan else {
            return []
        }
        
        return plan.currentWeekWorkouts
    }
}

// Overview View Component
struct OverviewView: View {
    @EnvironmentObject var trainingPlanService: TrainingPlanService
    
    var body: some View {
        VStack(alignment: .leading, spacing: 15) {
            Text("PLAN OVERVIEW")
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundColor(.secondary)
                .padding(.horizontal)
            
            if let plan = trainingPlanService.currentPlan {
                VStack(alignment: .leading, spacing: 15) {
                    PlanInfoCard(plan: plan)
                        .padding(.horizontal)
                    
                    Text("WEEKLY BREAKDOWN")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundColor(.secondary)
                        .padding(.horizontal)
                        .padding(.top, 5)
                    
                    ForEach(Array(plan.weeklyOverviews.enumerated()), id: \.1.id) { index, week in
                        WeekSummaryCard(week: week, weekNumber: index + 1)
                            .padding(.horizontal)
                    }
                }
            }
        }
    }
}

// Plan Info Card
struct PlanInfoCard: View {
    let plan: TrainingPlan
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Goal: \(plan.goalDescription)")
                .font(.headline)
            
            Divider()
            
            HStack(spacing: 16) {
                InfoItem(label: "Weeks", value: "\(plan.durationInWeeks)")
                InfoItem(label: "Start Date", value: plan.startDate.formatted(date: .abbreviated, time: .omitted))
                InfoItem(label: "Race Date", value: plan.endDate.formatted(date: .abbreviated, time: .omitted))
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
    }
}

// Small info display component
struct InfoItem: View {
    let label: String
    let value: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)
            
            Text(value)
                .font(.callout)
                .fontWeight(.medium)
        }
    }
}

// Workout Card Component - Enhanced
struct WorkoutCard: View {
    let workout: Workout
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(isDayToday(workout.date) ? "TODAY" : formatDayOfWeek(workout.date))
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundColor(isDayToday(workout.date) ? .blue : .secondary)
                
                Spacer()
                
                WorkoutStatusBadge(status: workout.status)
            }
            
            Text(workout.title)
                .font(.headline)
                .fontWeight(.bold)
            
            if !workout.description.isEmpty {
                Text(workout.description)
                    .font(.body)
                    .lineLimit(2)
            }
            
            HStack {
                if let distance = workout.targetDistance {
                    HStack {
                        Image(systemName: "ruler")
                            .foregroundColor(.secondary)
                            .font(.footnote)
                        Text("\(String(format: "%.1f km", distance))")
                            .font(.footnote)
                    }
                    .padding(.trailing, 10)
                }
                
                if let duration = workout.targetDuration {
                    HStack {
                        Image(systemName: "clock")
                            .foregroundColor(.secondary)
                            .font(.footnote)
                        Text(formatDuration(duration))
                            .font(.footnote)
                    }
                }
                
                Spacer()
            }
        }
        .padding()
        .background(
            Color(.systemBackground)
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(isDayToday(workout.date) ? Color.blue.opacity(0.5) : Color.clear, lineWidth: 2)
                )
        )
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
    }
    
    private func isDayToday(_ date: Date) -> Bool {
        Calendar.current.isDateInToday(date)
    }
    
    private func formatDayOfWeek(_ date: Date) -> String {
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "EEEE"
        return dateFormatter.string(from: date).uppercased()
    }
    
    private func formatDuration(_ seconds: TimeInterval) -> String {
        let hours = Int(seconds) / 3600
        let minutes = (Int(seconds) % 3600) / 60
        
        if hours > 0 {
            return "\(hours)h \(minutes)m"
        } else {
            return "\(minutes) min"
        }
    }
}

// Week Summary Card Component - Enhanced
struct WeekSummaryCard: View {
    let week: WeekSummary
    let weekNumber: Int
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("Week \(weekNumber)")
                    .font(.headline)
                    .fontWeight(.semibold)
                
                Spacer()
                
                Text("\(week.startDate.formatted(date: .abbreviated, time: .omitted)) - \(week.endDate.formatted(date: .abbreviated, time: .omitted))")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Text("Focus: \(week.focus)")
                .font(.subheadline)
                .foregroundColor(.blue)
            
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Total")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Text("\(String(format: "%.1f", week.totalDistance)) km")
                        .font(.callout)
                        .fontWeight(.medium)
                }
                
                Spacer()
                
                VStack(alignment: .leading, spacing: 4) {
                    Text("Completed")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Text("\(String(format: "%.1f", week.completedDistance)) km")
                        .font(.callout)
                        .fontWeight(.medium)
                }
                
                Spacer()
                
                VStack(alignment: .leading, spacing: 4) {
                    Text("Progress")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Text("\(Int(week.progressPercentage * 100))%")
                        .font(.callout)
                        .fontWeight(.medium)
                }
            }
            
            LinearProgressView(value: week.progressPercentage)
                .frame(height: 6)
                .padding(.top, 5)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
    }
}

// Linear Progress View - Enhanced
struct LinearProgressView: View {
    let value: Double
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .leading) {
                Rectangle()
                    .foregroundColor(Color(.systemGray5))
                    .frame(width: geometry.size.width, height: geometry.size.height)
                    .cornerRadius(5)
                
                Rectangle()
                    .foregroundColor(.blue)
                    .frame(width: min(CGFloat(self.value) * geometry.size.width, geometry.size.width), height: geometry.size.height)
                    .cornerRadius(5)
            }
        }
    }
}

// Training Log View
struct TrainingLogView: View {
    @State private var activities = Activity.mockActivities
    @State private var isFilteringActive = false
    @State private var selectedActivityTypes: Set<String> = []
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Filter chip row
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        FilterChip(
                            title: "All",
                            isSelected: selectedActivityTypes.isEmpty,
                            action: { selectedActivityTypes.removeAll() }
                        )
                        
                        FilterChip(
                            title: "Runs",
                            isSelected: selectedActivityTypes.contains("Run"),
                            action: { toggleType("Run") }
                        )
                        
                        FilterChip(
                            title: "Long Runs",
                            isSelected: selectedActivityTypes.contains("Long Run"),
                            action: { toggleType("Long Run") }
                        )
                        
                        FilterChip(
                            title: "Workouts",
                            isSelected: selectedActivityTypes.contains("Workout"),
                            action: { toggleType("Workout") }
                        )
                    }
                    .padding(.horizontal)
                    .padding(.vertical, 8)
                }
                .background(Color(.systemBackground))
                
                // Activity list
                List {
                    ForEach(filteredActivities) { activity in
                        NavigationLink(destination: ActivityDetailView(activity: activity)) {
                            ActivityRow(activity: activity)
                        }
                    }
                }
                .listStyle(InsetGroupedListStyle())
            }
            .navigationTitle("Training Log")
        }
    }
    
    private var filteredActivities: [Activity] {
        if selectedActivityTypes.isEmpty {
            return activities
        } else {
            return activities.filter { activity in
                if activity.name.lowercased().contains("workout") || activity.name.lowercased().contains("interval") {
                    return selectedActivityTypes.contains("Workout")
                } else if activity.distance > 15000 {
                    return selectedActivityTypes.contains("Long Run")
                } else {
                    return selectedActivityTypes.contains("Run")
                }
            }
        }
    }
    
    private func toggleType(_ type: String) {
        if selectedActivityTypes.contains(type) {
            selectedActivityTypes.remove(type)
        } else {
            selectedActivityTypes.insert(type)
        }
    }
}

// Filter Chip Component
struct FilterChip: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.footnote)
                .fontWeight(isSelected ? .semibold : .regular)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(isSelected ? Color.blue : Color(.systemGray6))
                .foregroundColor(isSelected ? .white : .primary)
                .cornerRadius(16)
        }
    }
}

// Activity Detail View
struct ActivityDetailView: View {
    let activity: Activity
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Header
                VStack(alignment: .leading, spacing: 5) {
                    Text(activity.name)
                        .font(.title2)
                        .fontWeight(.bold)
                    
                    Text(activity.startTime.formatted(date: .long, time: .shortened))
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                // Stats cards
                LazyVGrid(columns: [
                    GridItem(.flexible()),
                    GridItem(.flexible())
                ], spacing: 15) {
                    StatCard(label: "Distance", value: String(format: "%.2f km", activity.distance/1000))
                    StatCard(label: "Duration", value: formatDuration(activity.elapsedTimeSeconds))
                    StatCard(label: "Avg. Pace", value: formatPace(activity.averagePaceSecondsPerKm))
                    
                    if let avgHR = activity.averageHeartRate {
                        StatCard(label: "Avg. HR", value: "\(Int(avgHR)) bpm")
                    } else {
                        StatCard(label: "Elevation", value: "\(Int(activity.totalElevationGainMeters ?? 0))m")
                    }
                }
                
                // Description
                if let description = activity.description, !description.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Notes")
                            .font(.headline)
                        
                        Text(description)
                            .font(.body)
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                }
                
                // Map placeholder
                if activity.mapThumbnailUrl != nil {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Route")
                            .font(.headline)
                        
                        ZStack {
                            Color(.systemGray5)
                                .frame(height: 200)
                                .cornerRadius(12)
                            
                            Image(systemName: "map")
                                .font(.system(size: 50))
                                .foregroundColor(.secondary)
                        }
                    }
                }
                
                Spacer()
            }
            .padding()
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("Activity Details")
        .navigationBarTitleDisplayMode(.inline)
    }
    
    private var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .long
        formatter.timeStyle = .short
        return formatter.string(from: activity.startTime)
    }
    
    private func formatDuration(_ seconds: TimeInterval) -> String {
        let hours = Int(seconds) / 3600
        let minutes = (Int(seconds) % 3600) / 60
        let remainingSeconds = Int(seconds) % 60
        
        if hours > 0 {
            return String(format: "%d:%02d:%02d", hours, minutes, remainingSeconds)
        } else {
            return String(format: "%d:%02d", minutes, remainingSeconds)
        }
    }
    
    private func formatPace(_ secondsPerKm: Double) -> String {
        let minutes = Int(secondsPerKm) / 60
        let seconds = Int(secondsPerKm) % 60
        return String(format: "%d:%02d /km", minutes, seconds)
    }
}

// Stat Card Component
struct StatCard: View {
    let label: String
    let value: String
    
    var body: some View {
        VStack(spacing: 5) {
            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)
            
            Text(value)
                .font(.title3)
                .fontWeight(.semibold)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
    }
}

// Activity Row Component - FIXED VERSION
struct ActivityRow: View {
    let activity: Activity
    
    var body: some View {
        HStack {
            // Activity icon
            ZStack {
                Circle()
                    .fill(activityTypeColor.opacity(0.2))
                    .frame(width: 40, height: 40)
                
                Image(systemName: activityTypeIcon)
                    .foregroundColor(activityTypeColor)
            }
            .padding(.trailing, 5)
            
            // Activity details
            VStack(alignment: .leading, spacing: 3) {
                Text(activity.name)
                    .font(.headline)
                
                Text(activity.startTime.formatted(date: .abbreviated, time: .shortened))
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            // Stats
            VStack(alignment: .trailing, spacing: 3) {
                // FIXED: Using direct property access instead of conditional binding
                Text("\(String(format: "%.1f", activity.distance/1000)) km")
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                // Pace display
                Text(formatPace(activity.averagePaceSecondsPerKm))
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 5)
    }
    
    // Activity type icon
    private var activityTypeIcon: String {
        if activity.name.lowercased().contains("workout") || activity.name.lowercased().contains("interval") {
            return "stopwatch"
        } else if activity.distance > 15000 {
            return "figure.hiking"
        } else {
            return "figure.run"
        }
    }
    
    // Activity type color
    private var activityTypeColor: Color {
        if activity.name.lowercased().contains("workout") || activity.name.lowercased().contains("interval") {
            return .orange
        } else if activity.distance > 15000 {
            return .purple
        } else {
            return .blue
        }
    }
    
    private func formatPace(_ secondsPerKm: Double) -> String {
        let minutes = Int(secondsPerKm) / 60
        let seconds = Int(secondsPerKm) % 60
        return String(format: "%d:%02d/km", minutes, seconds)
    }
}

// Ask Vici View
struct AskViciView: View {
    @State private var question = ""
    @State private var conversations: [ViciConversation] = ViciConversation.mockConversations
    @State private var isLoading = false
    @FocusState private var isFocused: Bool
    
    var body: some View {
        NavigationView {
            VStack {
                // Conversation list
                ScrollViewReader { scrollView in
                    List {
                        ForEach(conversations) { conversation in
                            VStack(alignment: .leading, spacing: 10) {
                                // User question
                                HStack {
                                    Spacer()
                                    
                                    Text(conversation.question)
                                        .padding()
                                        .background(Color.blue.opacity(0.2))
                                        .foregroundColor(.primary)
                                        .cornerRadius(16)
                                        .multilineTextAlignment(.trailing)
                                }
                                
                                // Vici answer
                                HStack {
                                    VStack(alignment: .leading, spacing: 5) {
                                        HStack(alignment: .top, spacing: 8) {
                                            Image(systemName: "figure.run.circle.fill")
                                                .foregroundColor(.blue)
                                                .font(.title2)
                                            
                                            Text("Vici")
                                                .fontWeight(.bold)
                                                .foregroundColor(.blue)
                                        }
                                        
                                        Text(conversation.answer)
                                            .padding()
                                            .background(Color(.systemGray6))
                                            .cornerRadius(16)
                                    }
                                    
                                    Spacer()
                                }
                                
                                // Timestamp
                                HStack {
                                    Spacer()
                                    
                                    Text(conversation.date.formatted(date: .numeric, time: .shortened))
                                        .font(.caption2)
                                        .foregroundColor(.secondary)
                                }
                            }
                            .padding(.vertical, 5)
                            .id(conversation.id)
                        }
                    }
                    .listStyle(PlainListStyle())
                    .onChange(of: conversations) { _ in
                        if let lastId = conversations.first?.id {
                            withAnimation {
                                scrollView.scrollTo(lastId, anchor: .top)
                            }
                        }
                    }
                }
                
                // Input field
                VStack(spacing: 0) {
                    Divider()
                    
                    HStack {
                        TextField("Ask Vici about your training...", text: $question)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                            .focused($isFocused)
                        
                        Button(action: {
                            sendQuestion()
                        }) {
                            if isLoading {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle())
                            } else {
                                Image(systemName: "paperplane.fill")
                                    .foregroundColor(.blue)
                            }
                        }
                        .disabled(question.isEmpty || isLoading)
                        .padding(.horizontal, 10)
                    }
                    .padding()
                    .background(Color(.systemBackground))
                }
            }
            .navigationTitle("Ask Vici")
            .onTapGesture {
                // Dismiss keyboard when tapping outside the input field
                isFocused = false
            }
        }
    }
    
    private func sendQuestion() {
        guard !question.isEmpty else { return }
        
        let userQuestion = question
        question = ""
        isLoading = true
        
        // Simulate network delay for the mock API
        DispatchQueue.main.asyncAfter(deadline: .now() + Double.random(in: 1.0...2.0)) {
            let responses = [
                "Based on your recent training data, I suggest focusing on recovery for the next 2 days. Your heart rate variability shows signs of fatigue.",
                "Looking at your running history, you're making great progress! Consider adding one more easy run per week to build endurance.",
                "Your training load has been consistent. For your upcoming race, I recommend a 2-week taper with reduced volume but maintained intensity.",
                "I've analyzed your pace data and noticed you tend to start too fast. Try negative splitting your next long run - start slower and gradually increase pace.",
                "Your training consistency is excellent! To avoid plateauing, consider adding some hill repeats to your routine next week."
            ]
            
            let newConversation = ViciConversation(
                id: UUID().uuidString,
                question: userQuestion,
                answer: responses.randomElement() ?? "I'm sorry, I don't have enough training data to provide a recommendation yet.",
                date: Date()
            )
            
            conversations.insert(newConversation, at: 0)
            isLoading = false
        }
    }
}

// Profile View
struct ProfileView: View {
    @EnvironmentObject var userAuth: UserAuthentication
    let mockUser = User.current
    @State private var isStravaConnected = false
    @State private var showingLogoutConfirmation = false
    
    var body: some View {
        NavigationView {
            List {
                // Profile header
                Section {
                    HStack(spacing: 15) {
                        // Profile image
                        ZStack {
                            Circle()
                                .fill(Color.blue.opacity(0.1))
                                .frame(width: 80, height: 80)
                            
                            Text(initials)
                                .font(.title)
                                .fontWeight(.semibold)
                                .foregroundColor(.blue)
                        }
                        
                        // User info
                        VStack(alignment: .leading, spacing: 5) {
                            Text(mockUser.name)
                                .font(.title2)
                                .fontWeight(.bold)
                            
                            Text(mockUser.email)
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                        
                        Spacer()
                    }
                    .padding(.vertical, 10)
                }
                
                // Stats
                Section(header: Text("YOUR STATS")) {
                    StatsRow(
                        icon: "figure.run",
                        color: .blue,
                        title: "Experience",
                        value: mockUser.experienceLevel.rawValue
                    )
                    
                    StatsRow(
                        icon: "flame.fill",
                        color: .orange,
                        title: "Fitness Level",
                        value: "\(Int(mockUser.currentFitnessLevel))/100"
                    )
                    
                    NavigationLink(destination: PersonalBestsView(personalBests: mockUser.personalBests)) {
                        StatsRow(
                            icon: "trophy.fill",
                            color: .yellow,
                            title: "Personal Bests",
                            value: "\(mockUser.personalBests.count) records"
                        )
                    }
                }
                
                // Integrations
                Section(header: Text("INTEGRATIONS")) {
                    Button(action: {
                        isStravaConnected.toggle()
                    }) {
                        HStack {
                            // Strava icon (simplified)
                            Image(systemName: "figure.outdoor.cycle")
                                .foregroundColor(.orange)
                            
                            Text("Connect Strava")
                            
                            Spacer()
                            
                            if isStravaConnected {
                                Text("Connected")
                                    .font(.caption)
                                    .foregroundColor(.green)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 4)
                                    .background(Color.green.opacity(0.1))
                                    .cornerRadius(8)
                            } else {
                                Text("Connect")
                                    .font(.caption)
                                    .foregroundColor(.blue)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 4)
                                    .background(Color.blue.opacity(0.1))
                                    .cornerRadius(8)
                            }
                        }
                    }
                }
                
                // Settings
                Section(header: Text("SETTINGS")) {
                    NavigationLink(destination: Text("Notifications Settings")) {
                        SettingsRow(icon: "bell.fill", color: .red, title: "Notifications")
                    }
                    
                    NavigationLink(destination: Text("Account Settings")) {
                        SettingsRow(icon: "person.fill", color: .blue, title: "Account")
                    }
                    
                    NavigationLink(destination: Text("App Settings")) {
                        SettingsRow(icon: "gearshape.fill", color: .gray, title: "Preferences")
                    }
                }
                
                // Sign out
                Section {
                    Button(action: {
                        showingLogoutConfirmation = true
                    }) {
                        HStack {
                            Text("Sign Out")
                                .foregroundColor(.red)
                            Spacer()
                            Image(systemName: "arrow.right.square")
                                .foregroundColor(.red)
                        }
                    }
                }
            }
            .listStyle(InsetGroupedListStyle())
            .navigationTitle("Profile")
            .alert(isPresented: $showingLogoutConfirmation) {
                Alert(
                    title: Text("Sign Out"),
                    message: Text("Are you sure you want to sign out?"),
                    primaryButton: .destructive(Text("Sign Out")) {
                        userAuth.logout()
                    },
                    secondaryButton: .cancel()
                )
            }
        }
    }
    
    private var initials: String {
        let components = mockUser.name.split(separator: " ")
        if components.count >= 2 {
            return "\(components[0].prefix(1))\(components[1].prefix(1))"
        } else if components.count == 1 {
            return "\(components[0].prefix(1))"
        }
        return "?"
    }
}

// Stats Row Component
struct StatsRow: View {
    let icon: String
    let color: Color
    let title: String
    let value: String
    
    var body: some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(color)
                .font(.system(size: 18))
                .frame(width: 24, height: 24)
            
            Text(title)
            
            Spacer()
            
            Text(value)
                .foregroundColor(.secondary)
        }
    }
}

// Settings Row Component
struct SettingsRow: View {
    let icon: String
    let color: Color
    let title: String
    
    var body: some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(color)
                .font(.system(size: 18))
                .frame(width: 24, height: 24)
            
            Text(title)
        }
    }
}

// Personal Bests View
struct PersonalBestsView: View {
    let personalBests: [PersonalBest]
    
    var body: some View {
        List {
            ForEach(personalBests) { pb in
                VStack(alignment: .leading, spacing: 5) {
                    HStack {
                        Text(pb.formattedDistance)
                            .font(.headline)
                        
                        Spacer()
                        
                        Text(pb.formattedTime)
                            .font(.headline)
                            .foregroundColor(.blue)
                    }
                    
                    HStack {
                        Text("Pace: \(pb.formattedPace)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        
                        Spacer()
                        
                        Text(pb.date.formatted(date: .abbreviated, time: .omitted))
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                .padding(.vertical, 5)
            }
        }
        .navigationTitle("Personal Bests")
    }
} 