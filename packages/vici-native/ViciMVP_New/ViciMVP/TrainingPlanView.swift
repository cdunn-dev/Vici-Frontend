import SwiftUI

struct TrainingPlanView: View {
    @EnvironmentObject var userAuth: UserAuthentication
    @StateObject private var trainingPlanService = TrainingPlanService()
    @State private var showingCreatePlanSheet = false
    
    var body: some View {
        NavigationView {
            ZStack {
                // Background
                Color(.systemGroupedBackground)
                    .ignoresSafeArea()
                
                if trainingPlanService.isLoading {
                    // Loading state
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle())
                        .scaleEffect(1.5)
                } else if let currentPlan = trainingPlanService.currentPlan {
                    // Plan exists - show plan details
                    ScrollView {
                        VStack(spacing: 16) {
                            // Today's workout card
                            TodaysWorkoutCard(
                                workout: trainingPlanService.todaysWorkout, 
                                trainingPlanService: trainingPlanService
                            )
                            
                            // Plan progress card
                            PlanProgressCard(plan: currentPlan)
                            
                            // Weekly overview
                            WeeklyOverviewCard(
                                weekWorkouts: currentPlan.currentWeekWorkouts,
                                trainingPlanService: trainingPlanService
                            )
                            
                            // Stats cards
                            HStack(spacing: 10) {
                                StatisticCard(
                                    title: "Week",
                                    value: "\(currentPlan.currentWeek)/\(currentPlan.totalWeeks)",
                                    icon: "calendar",
                                    color: .blue
                                )
                                
                                StatisticCard(
                                    title: "Weekly Distance",
                                    value: "\(Int(currentPlan.currentWeekDistance/1000)) km",
                                    icon: "figure.walk",
                                    color: .green
                                )
                            }
                            
                            // Notes section
                            if let notes = currentPlan.notes, !notes.isEmpty {
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Coach Notes")
                                        .font(.headline)
                                        .padding(.horizontal)
                                    
                                    Text(notes)
                                        .font(.body)
                                        .foregroundColor(.secondary)
                                        .padding()
                                        .background(Color(.systemBackground))
                                        .cornerRadius(12)
                                        .padding(.horizontal)
                                }
                            }
                        }
                        .padding()
                    }
                } else {
                    // No plan exists - show empty state
                    VStack(spacing: 20) {
                        Image(systemName: "figure.run.circle")
                            .font(.system(size: 60))
                            .foregroundColor(.blue)
                        
                        Text("No Training Plan")
                            .font(.title2)
                            .fontWeight(.bold)
                        
                        Text("Create a training plan to reach your running goals with personalized workouts.")
                            .multilineTextAlignment(.center)
                            .foregroundColor(.secondary)
                            .padding(.horizontal, 40)
                        
                        Button {
                            showingCreatePlanSheet = true
                        } label: {
                            Text("Create Training Plan")
                                .fontWeight(.semibold)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.blue)
                                .foregroundColor(.white)
                                .cornerRadius(12)
                                .padding(.horizontal, 40)
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
                        NavigationLink(destination: PlanDetailView(
                            plan: trainingPlanService.currentPlan!,
                            trainingPlanService: trainingPlanService
                        )) {
                            Image(systemName: "list.bullet")
                        }
                    }
                }
            }
            .sheet(isPresented: $showingCreatePlanSheet) {
                CreatePlanView(trainingPlanService: trainingPlanService)
            }
            .onAppear {
                trainingPlanService.initialize()
            }
        }
    }
}

// Today's Workout card component
struct TodaysWorkoutCard: View {
    let workout: Workout?
    let trainingPlanService: TrainingPlanService
    @State private var showingWorkoutDetail = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Header
            Text("TODAY'S WORKOUT")
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundColor(.secondary)
            
            if let workout = workout {
                // Workout exists for today
                VStack(alignment: .leading, spacing: 12) {
                    // Title and type
                    HStack {
                        Image(systemName: workoutTypeIcon(workout.workoutType))
                            .foregroundColor(workoutTypeColor(workout.workoutType))
                            .font(.headline)
                        
                        Text(workout.title)
                            .font(.headline)
                        
                        Spacer()
                        
                        WorkoutStatusBadge(status: workout.status)
                    }
                    
                    // Details
                    Text(workout.description)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .lineLimit(2)
                    
                    Divider()
                    
                    // Stats
                    HStack {
                        WorkoutStat(
                            icon: "ruler",
                            value: "\(String(format: "%.1f", workout.plannedDistance / 1000)) km"
                        )
                        
                        Spacer()
                        
                        WorkoutStat(
                            icon: "clock",
                            value: "\(Int(workout.estimatedDuration / 60)) min"
                        )
                        
                        Spacer()
                        
                        WorkoutStat(
                            icon: "heart.fill",
                            value: workout.intensityLevel.rawValue
                        )
                    }
                    
                    // Action buttons
                    HStack {
                        Button(action: {
                            // Start workout
                            showingWorkoutDetail = true
                        }) {
                            HStack {
                                Image(systemName: "play.fill")
                                Text("View Details")
                            }
                            .fontWeight(.medium)
                            .padding(.vertical, 8)
                            .padding(.horizontal, 12)
                            .background(Color.blue)
                            .foregroundColor(.white)
                            .cornerRadius(8)
                        }
                        
                        Spacer()
                        
                        if workout.status == .scheduled {
                            // Only show these buttons for scheduled workouts
                            Button(action: {
                                // Complete workout
                                completeWorkout()
                            }) {
                                Text("Complete")
                                    .fontWeight(.medium)
                                    .padding(.vertical, 8)
                                    .padding(.horizontal, 12)
                                    .background(Color.green.opacity(0.1))
                                    .foregroundColor(.green)
                                    .cornerRadius(8)
                            }
                            
                            Button(action: {
                                // Skip workout
                                skipWorkout()
                            }) {
                                Text("Skip")
                                    .fontWeight(.medium)
                                    .padding(.vertical, 8)
                                    .padding(.horizontal, 12)
                                    .background(Color.orange.opacity(0.1))
                                    .foregroundColor(.orange)
                                    .cornerRadius(8)
                            }
                        }
                    }
                }
                .sheet(isPresented: $showingWorkoutDetail) {
                    WorkoutDetailView(workout: workout, trainingPlanService: trainingPlanService)
                }
            } else {
                // No workout for today
                VStack(spacing: 12) {
                    Image(systemName: "calendar.badge.checkmark")
                        .font(.largeTitle)
                        .foregroundColor(.green)
                    
                    Text("Rest Day")
                        .font(.title3)
                        .fontWeight(.semibold)
                    
                    Text("Enjoy your rest day! Remember that recovery is an essential part of your training.")
                        .font(.body)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 20)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
    }
    
    // Helper functions for workout types
    private func workoutTypeIcon(_ type: WorkoutType) -> String {
        switch type {
        case .easy:
            return "figure.walk"
        case .tempo:
            return "figure.run"
        case .interval:
            return "stopwatch"
        case .longRun:
            return "figure.hiking"
        case .recovery:
            return "heart.circle"
        case .fartlek:
            return "waveform.path"
        case .hillRepeats:
            return "mountain.2"
        }
    }
    
    private func workoutTypeColor(_ type: WorkoutType) -> Color {
        switch type {
        case .easy:
            return .green
        case .tempo:
            return .orange
        case .interval:
            return .red
        case .longRun:
            return .purple
        case .recovery:
            return .blue
        case .fartlek:
            return .pink
        case .hillRepeats:
            return .yellow
        }
    }
    
    // Action functions
    private func completeWorkout() {
        if let workout = workout {
            trainingPlanService.updateWorkoutStatus(workoutId: workout.id, status: .completed) { _ in
                // Success feedback could be added here
            }
        }
    }
    
    private func skipWorkout() {
        if let workout = workout {
            trainingPlanService.updateWorkoutStatus(workoutId: workout.id, status: .skipped) { _ in
                // Success feedback could be added here
            }
        }
    }
}

// Workout Status Badge component
struct WorkoutStatusBadge: View {
    let status: WorkoutStatus
    
    var body: some View {
        Text(status.rawValue)
            .font(.caption)
            .fontWeight(.medium)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(statusColor.opacity(0.15))
            .foregroundColor(statusColor)
            .cornerRadius(6)
    }
    
    private var statusColor: Color {
        switch status {
        case .scheduled:
            return .blue
        case .completed:
            return .green
        case .skipped:
            return .orange
        case .missed:
            return .red
        }
    }
}

// Workout Stat component
struct WorkoutStat: View {
    let icon: String
    let value: String
    
    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: icon)
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            Text(value)
                .font(.subheadline)
                .fontWeight(.medium)
        }
    }
}

// Plan Progress Card component
struct PlanProgressCard: View {
    let plan: TrainingPlan
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Header
            Text("PLAN PROGRESS")
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundColor(.secondary)
            
            // Plan name and objective
            VStack(alignment: .leading, spacing: 8) {
                Text(plan.name)
                    .font(.headline)
                
                if let objective = plan.objective {
                    Text(objective)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
            }
            
            // Progress bar
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text("\(Int(progressPercentage))% Complete")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    
                    Spacer()
                    
                    Text("Week \(plan.currentWeek) of \(plan.totalWeeks)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                ProgressBar(value: progressPercentage / 100)
                    .frame(height: 8)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
    }
    
    private var progressPercentage: Double {
        return min(Double(plan.currentWeek) / Double(plan.totalWeeks) * 100, 100.0)
    }
}

// Progress Bar component
struct ProgressBar: View {
    var value: Double // Between 0 and 1
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .leading) {
                Rectangle()
                    .frame(width: geometry.size.width, height: geometry.size.height)
                    .opacity(0.1)
                    .foregroundColor(.blue)
                
                Rectangle()
                    .frame(width: CGFloat(self.value) * geometry.size.width, height: geometry.size.height)
                    .foregroundColor(.blue)
                    .animation(.linear, value: value)
            }
            .cornerRadius(45)
        }
    }
}

// Weekly Overview Card component
struct WeeklyOverviewCard: View {
    let weekWorkouts: [Workout]
    let trainingPlanService: TrainingPlanService
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Header
            Text("THIS WEEK")
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundColor(.secondary)
            
            // Day pills
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 10) {
                    ForEach(sortedWeekDays(), id: \.date) { day in
                        let workoutsForDay = workoutsOn(date: day.date)
                        let isToday = Calendar.current.isDateInToday(day.date)
                        
                        VStack(spacing: 6) {
                            // Day name
                            Text(day.shortName)
                                .font(.caption)
                                .fontWeight(isToday ? .bold : .regular)
                            
                            // Day number
                            ZStack {
                                Circle()
                                    .fill(isToday ? Color.blue : Color.clear)
                                    .frame(width: 32, height: 32)
                                
                                Text("\(day.dayNumber)")
                                    .font(.subheadline)
                                    .fontWeight(isToday ? .bold : .regular)
                                    .foregroundColor(isToday ? .white : .primary)
                            }
                            
                            // Workout indicator
                            if !workoutsForDay.isEmpty {
                                ForEach(workoutsForDay) { workout in
                                    Circle()
                                        .fill(workoutStatusColor(workout.status))
                                        .frame(width: 8, height: 8)
                                }
                            } else {
                                Circle()
                                    .fill(Color.gray.opacity(0.3))
                                    .frame(width: 8, height: 8)
                            }
                        }
                        .frame(width: 40)
                    }
                }
            }
            
            Divider()
            
            // Workout list for the week
            VStack(spacing: 12) {
                ForEach(weekWorkouts.sorted(by: { $0.date < $1.date })) { workout in
                    NavigationLink(destination: WorkoutDetailView(workout: workout, trainingPlanService: trainingPlanService)) {
                        WeeklyWorkoutRow(workout: workout)
                    }
                    .buttonStyle(PlainButtonStyle())
                    
                    if workout.id != weekWorkouts.sorted(by: { $0.date < $1.date }).last?.id {
                        Divider()
                    }
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
    }
    
    // Get workouts for a specific date
    private func workoutsOn(date: Date) -> [Workout] {
        return weekWorkouts.filter { workout in
            Calendar.current.isDate(workout.date, inSameDayAs: date)
        }
    }
    
    // Get workout status color
    private func workoutStatusColor(_ status: WorkoutStatus) -> Color {
        switch status {
        case .scheduled:
            return .blue
        case .completed:
            return .green
        case .skipped:
            return .orange
        case .missed:
            return .red
        }
    }
    
    // Calculate day objects for current week
    private func sortedWeekDays() -> [(date: Date, shortName: String, dayNumber: Int)] {
        let calendar = Calendar.current
        let today = Date()
        let weekday = calendar.component(.weekday, from: today)
        let days = (1...7).map { day -> Date in
            let dayDifference = day - weekday
            return calendar.date(byAdding: .day, value: dayDifference, to: today)!
        }
        
        return days.map { date in
            let formatter = DateFormatter()
            formatter.dateFormat = "EEE"
            let shortName = formatter.string(from: date)
            let dayNumber = calendar.component(.day, from: date)
            return (date: date, shortName: shortName, dayNumber: dayNumber)
        }
    }
}

// Weekly Workout Row component
struct WeeklyWorkoutRow: View {
    let workout: Workout
    
    var body: some View {
        HStack(spacing: 12) {
            // Date
            VStack(alignment: .center, spacing: 0) {
                Text(dayName)
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(.secondary)
                
                Text(dayNumber)
                    .font(.title3)
                    .fontWeight(.bold)
            }
            .frame(width: 40)
            
            // Divider with color indicator
            Rectangle()
                .fill(workoutTypeColor(workout.workoutType))
                .frame(width: 4)
                .cornerRadius(2)
                .padding(.vertical, 4)
            
            // Workout details
            VStack(alignment: .leading, spacing: 4) {
                Text(workout.title)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                
                HStack(spacing: 8) {
                    WorkoutStat(
                        icon: "ruler",
                        value: "\(String(format: "%.1f", workout.plannedDistance / 1000)) km"
                    )
                    
                    WorkoutStat(
                        icon: "heart.fill",
                        value: workout.intensityLevel.rawValue
                    )
                }
            }
            
            Spacer()
            
            // Status badge
            WorkoutStatusBadge(status: workout.status)
        }
    }
    
    private var dayName: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEE"
        return formatter.string(from: workout.date)
    }
    
    private var dayNumber: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "d"
        return formatter.string(from: workout.date)
    }
    
    private func workoutTypeColor(_ type: WorkoutType) -> Color {
        switch type {
        case .easy:
            return .green
        case .tempo:
            return .orange
        case .interval:
            return .red
        case .longRun:
            return .purple
        case .recovery:
            return .blue
        case .fartlek:
            return .pink
        case .hillRepeats:
            return .yellow
        }
    }
}

// Statistic Card component
struct StatisticCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(color)
                
                Spacer()
            }
            
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .frame(maxWidth: .infinity)
    }
}

// Detail views for Plan and Workout would be implemented here
struct PlanDetailView: View {
    let plan: TrainingPlan
    let trainingPlanService: TrainingPlanService
    
    var body: some View {
        Text("Plan Details - Full implementation for Phase 4")
            .navigationTitle(plan.name)
    }
}

struct WorkoutDetailView: View {
    let workout: Workout
    let trainingPlanService: TrainingPlanService
    
    var body: some View {
        Text("Workout Details - Full implementation for Phase 4")
            .navigationTitle(workout.title)
    }
}

// Create Plan View
struct CreatePlanView: View {
    let trainingPlanService: TrainingPlanService
    @Environment(\.presentationMode) var presentationMode
    
    @State private var goalType: GoalType = .general
    @State private var raceDistance: String = ""
    @State private var raceDate: Date = Date().addingTimeInterval(12 * 7 * 24 * 60 * 60) // 12 weeks from now
    @State private var experienceLevel: ExperienceLevel = .intermediate
    @State private var daysPerWeek: Int = 4
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("GOAL TYPE")) {
                    Picker("Goal", selection: $goalType) {
                        ForEach(GoalType.allCases, id: \.self) { goal in
                            Text(goal.rawValue).tag(goal)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                }
                
                if goalType == .race {
                    Section(header: Text("RACE DETAILS")) {
                        TextField("Race Distance", text: $raceDistance)
                            .keyboardType(.decimalPad)
                        
                        DatePicker("Race Date", selection: $raceDate, displayedComponents: .date)
                    }
                }
                
                Section(header: Text("EXPERIENCE")) {
                    Picker("Experience Level", selection: $experienceLevel) {
                        ForEach(ExperienceLevel.allCases, id: \.self) { level in
                            Text(level.rawValue).tag(level)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                }
                
                Section(header: Text("TRAINING SCHEDULE")) {
                    Picker("Training Days per Week", selection: $daysPerWeek) {
                        ForEach(3..<7) { number in
                            Text("\(number) days").tag(number)
                        }
                    }
                }
                
                Section {
                    Button(action: createPlan) {
                        if trainingPlanService.isLoading {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle())
                        } else {
                            Text("Create Plan")
                                .fontWeight(.semibold)
                                .frame(maxWidth: .infinity)
                                .foregroundColor(.white)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(Color.blue)
                    .cornerRadius(10)
                    .disabled(trainingPlanService.isLoading)
                }
            }
            .navigationTitle("Create Training Plan")
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        presentationMode.wrappedValue.dismiss()
                    }
                }
            }
        }
    }
    
    private func createPlan() {
        trainingPlanService.createPlan(
            goalType: goalType,
            raceDistance: raceDistance.isEmpty ? nil : raceDistance,
            raceDate: goalType == .race ? raceDate : nil,
            experienceLevel: experienceLevel,
            daysPerWeek: daysPerWeek
        ) { success in
            if success {
                presentationMode.wrappedValue.dismiss()
            }
        }
    }
} 