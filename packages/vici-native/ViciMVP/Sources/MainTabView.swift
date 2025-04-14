import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var userAuth: UserAuthentication
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            TrainingPlanView()
                .tabItem {
                    Label("Training", systemImage: "figure.run")
                }
                .tag(0)
            
            TrainingLogView()
                .tabItem {
                    Label("Log", systemImage: "list.bullet.clipboard")
                }
                .tag(1)
            
            AskViciView()
                .tabItem {
                    Label("Ask Vici", systemImage: "bubble.left.and.bubble.right")
                }
                .tag(2)
            
            ProfileView()
                .tabItem {
                    Label("Profile", systemImage: "person")
                }
                .tag(3)
        }
    }
}

// Training Plan View
struct TrainingPlanView: View {
    @State private var viewMode: ViewMode = .thisWeek
    
    enum ViewMode {
        case thisWeek, overview
    }
    
    var body: some View {
        NavigationView {
            VStack {
                Picker("View", selection: $viewMode) {
                    Text("This Week").tag(ViewMode.thisWeek)
                    Text("Overview").tag(ViewMode.overview)
                }
                .pickerStyle(SegmentedPickerStyle())
                .padding()
                
                if viewMode == .thisWeek {
                    ThisWeekView()
                } else {
                    OverviewView()
                }
                
                Spacer()
            }
            .navigationTitle("Training Plan")
        }
    }
}

// This Week View Component
struct ThisWeekView: View {
    let mockWeekPlan = TrainingPlan.mockCurrentPlan.currentWeekWorkouts
    
    var body: some View {
        ScrollView {
            VStack(spacing: 15) {
                ForEach(mockWeekPlan) { workout in
                    WorkoutCard(workout: workout)
                }
            }
            .padding()
        }
    }
}

// Overview View Component
struct OverviewView: View {
    let mockPlan = TrainingPlan.mockCurrentPlan
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text("Goal: \(mockPlan.goalDescription)")
                    .font(.headline)
                
                Text("Race Date: \(mockPlan.endDate.formatted(date: .long, time: .omitted))")
                    .font(.subheadline)
                
                Text("Plan Duration: \(mockPlan.durationInWeeks) weeks")
                    .font(.subheadline)
                
                Divider()
                
                Text("Weekly Overview")
                    .font(.title2)
                    .padding(.bottom, 5)
                
                ForEach(Array(mockPlan.weeklyOverviews.enumerated()), id: \.1.id) { index, week in
                    WeekSummaryCard(week: week, weekNumber: index + 1)
                }
            }
            .padding()
        }
    }
}

// Workout Card Component
struct WorkoutCard: View {
    let workout: Workout
    
    var body: some View {
        VStack(alignment: .leading) {
            HStack {
                Text(workout.date.formatted(date: .abbreviated, time: .omitted))
                    .font(.headline)
                Spacer()
                Text(workout.type.rawValue)
                    .font(.subheadline)
                    .padding(5)
                    .background(Color.blue.opacity(0.2))
                    .cornerRadius(5)
            }
            
            Divider()
            
            Text(workout.title)
                .font(.subheadline)
                .bold()
            
            Text(workout.description)
                .font(.body)
                .padding(.vertical, 5)
            
            if let distance = workout.targetDistance {
                Text("Distance: \(String(format: "%.1f", distance)) km")
                    .font(.caption)
            }
            
            if let duration = workout.targetDuration {
                Text("Duration: \(duration.formatted())")
                    .font(.caption)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(10)
        .shadow(radius: 2)
    }
}

// Week Summary Card Component
struct WeekSummaryCard: View {
    let week: WeekSummary
    let weekNumber: Int
    
    var body: some View {
        VStack(alignment: .leading) {
            Text("Week \(weekNumber)")
                .font(.headline)
            
            Text("Focus: \(week.focus)")
                .font(.subheadline)
                .padding(.bottom, 2)
            
            Text("Distance: \(String(format: "%.1f", week.totalDistance)) km")
                .font(.caption)
            
            LinearProgressView(value: week.progressPercentage)
                .frame(height: 8)
                .padding(.vertical, 5)
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(10)
    }
}

// Linear Progress View
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
    @StateObject private var viewModel = TrainingLogViewModel()
    
    var body: some View {
        NavigationView {
            VStack {
                if viewModel.isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle())
                } else if viewModel.activities.isEmpty {
                    emptyStateView
                } else {
                    activityListView
                }
            }
            .navigationTitle("Training Log")
            .onAppear {
                viewModel.loadActivities()
            }
            .alert(isPresented: $viewModel.hasError) {
                Alert(
                    title: Text("Error"),
                    message: Text(viewModel.errorMessage),
                    dismissButton: .default(Text("OK"))
                )
            }
        }
    }
    
    private var emptyStateView: some View {
        VStack(spacing: 20) {
            Image(systemName: "clock.arrow.circlepath")
                .font(.system(size: 60))
                .foregroundColor(.gray)
                .padding()
            
            Text("No Activities Yet")
                .font(.title)
            
            Text("Your completed activities will appear here. Connect with Strava to sync your runs.")
                .multilineTextAlignment(.center)
                .foregroundColor(.secondary)
                .padding(.horizontal)
            
            NavigationLink(destination: ProfileView()) {
                Text("Go to Strava Connection")
                    .font(.headline)
                    .foregroundColor(.white)
                    .padding()
                    .background(Color.blue)
                    .cornerRadius(10)
            }
            .padding()
            
            Spacer()
        }
        .padding()
    }
    
    private var activityListView: some View {
        List {
            ForEach(viewModel.activities) { activity in
                NavigationLink(destination: ActivityDetailView(activity: activity)) {
                    ActivityRow(activity: activity)
                }
            }
            
            if viewModel.hasMorePages {
                Button(action: {
                    viewModel.loadMoreActivities()
                }) {
                    HStack {
                        Spacer()
                        Text(viewModel.isLoadingMore ? "Loading..." : "Load More")
                        if viewModel.isLoadingMore {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle())
                                .padding(.leading, 5)
                        }
                        Spacer()
                    }
                    .padding(.vertical, 10)
                }
                .disabled(viewModel.isLoadingMore)
            }
        }
    }
}

// Activity Detail View
struct ActivityDetailView: View {
    let activity: Activity
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Activity Header
                VStack(alignment: .leading, spacing: 10) {
                    Text(activity.name)
                        .font(.title)
                        .bold()
                    
                    Text(activity.startTime.formatted(date: .long, time: .shortened))
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .padding(.horizontal)
                
                // Stats Summary
                GroupBox {
                    VStack(alignment: .leading, spacing: 15) {
                        // Top Stats Row
                        HStack {
                            StatView(
                                title: "Distance",
                                value: String(format: "%.2f", activity.distance / 1000),
                                unit: "km"
                            )
                            
                            Divider()
                            
                            StatView(
                                title: "Time",
                                value: formatDuration(activity.movingTimeSeconds),
                                unit: ""
                            )
                            
                            Divider()
                            
                            StatView(
                                title: "Pace",
                                value: formatPace(activity.averagePaceSecondsPerKm),
                                unit: "/km"
                            )
                        }
                        
                        Divider()
                        
                        // Bottom Stats Row
                        HStack {
                            if let hr = activity.averageHeartRate {
                                StatView(
                                    title: "Heart Rate",
                                    value: String(format: "%.0f", hr),
                                    unit: "bpm"
                                )
                                
                                Divider()
                            }
                            
                            if let elevation = activity.totalElevationGainMeters {
                                StatView(
                                    title: "Elevation",
                                    value: String(format: "%.0f", elevation),
                                    unit: "m"
                                )
                                
                                Divider()
                            }
                            
                            StatView(
                                title: "Source",
                                value: activity.source.rawValue,
                                unit: ""
                            )
                        }
                    }
                    .padding(.vertical)
                }
                .padding(.horizontal)
                
                // Map (Placeholder)
                if activity.mapThumbnailUrl != nil {
                    Rectangle()
                        .fill(Color.gray.opacity(0.2))
                        .frame(height: 200)
                        .overlay(
                            Image(systemName: "map")
                                .font(.system(size: 40))
                                .foregroundColor(.gray)
                        )
                        .padding(.horizontal)
                }
                
                // Laps
                if let laps = activity.laps, !laps.isEmpty {
                    GroupBox(label: Text("Laps").bold()) {
                        VStack(alignment: .leading) {
                            ForEach(Array(laps.enumerated()), id: \.element.id) { index, lap in
                                HStack {
                                    Text("\(index + 1)")
                                        .font(.headline)
                                        .frame(width: 30)
                                    
                                    Text(String(format: "%.2f km", lap.distanceMeters / 1000))
                                    
                                    Spacer()
                                    
                                    Text(formatPace(lap.averagePaceSecondsPerKm ?? 0))
                                    
                                    if let hr = lap.averageHeartRate {
                                        Text(String(format: "%.0f bpm", hr))
                                    }
                                }
                                .padding(.vertical, 5)
                                
                                if index < laps.count - 1 {
                                    Divider()
                                }
                            }
                        }
                        .padding(.vertical, 5)
                    }
                    .padding(.horizontal)
                }
                
                // Reconciliation status
                if activity.isReconciled {
                    GroupBox {
                        HStack {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(.green)
                            
                            Text("This activity is matched to a workout in your training plan")
                                .font(.callout)
                            
                            Spacer()
                        }
                        .padding(.vertical, 5)
                    }
                    .padding(.horizontal)
                }
            }
            .padding(.vertical)
        }
        .navigationTitle("Activity Details")
        .navigationBarTitleDisplayMode(.inline)
    }
    
    private func formatDuration(_ seconds: TimeInterval) -> String {
        let hours = Int(seconds) / 3600
        let minutes = (Int(seconds) % 3600) / 60
        let secs = Int(seconds) % 60
        
        if hours > 0 {
            return String(format: "%d:%02d:%02d", hours, minutes, secs)
        } else {
            return String(format: "%d:%02d", minutes, secs)
        }
    }
    
    private func formatPace(_ secondsPerKm: Double) -> String {
        let minutes = Int(secondsPerKm) / 60
        let seconds = Int(secondsPerKm) % 60
        return String(format: "%d:%02d", minutes, seconds)
    }
}

// Activity Row Component
struct ActivityRow: View {
    let activity: Activity
    
    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                Text(activity.name)
                    .font(.headline)
                Text(activity.startTime.formatted(date: .abbreviated, time: .shortened))
                    .font(.caption)
            }
            
            Spacer()
            
            VStack(alignment: .trailing) {
                Text("\(String(format: "%.1f", activity.distance/1000)) km")
                    .font(.subheadline)
                
                Text(formatPace(activity.averagePaceSecondsPerKm))
                    .font(.caption)
            }
        }
        .padding(.vertical, 5)
    }
    
    private func formatPace(_ secondsPerKm: Double) -> String {
        let minutes = Int(secondsPerKm) / 60
        let seconds = Int(secondsPerKm) % 60
        return String(format: "%d:%02d/km", minutes, seconds)
    }
}

// Stat View Component
struct StatView: View {
    let title: String
    let value: String
    let unit: String
    
    var body: some View {
        VStack {
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
            
            Text(value)
                .font(.headline)
            
            if !unit.isEmpty {
                Text(unit)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .frame(maxWidth: .infinity)
    }
}

// ViewModel for Training Log
class TrainingLogViewModel: ObservableObject {
    @Published var activities: [Activity] = []
    @Published var isLoading = false
    @Published var isLoadingMore = false
    @Published var hasError = false
    @Published var errorMessage = ""
    @Published var currentPage = 1
    @Published var hasMorePages = false
    
    private let apiClient = APIClient()
    
    func loadActivities() {
        guard !isLoading else { return }
        
        isLoading = true
        currentPage = 1
        
        Task {
            do {
                let fetchedActivities = try await apiClient.getActivities(limit: 20, page: 1)
                
                await MainActor.run {
                    self.activities = fetchedActivities
                    self.isLoading = false
                    self.hasMorePages = fetchedActivities.count >= 20 // Assume more if we got a full page
                }
            } catch {
                await MainActor.run {
                    self.isLoading = false
                    self.hasError = true
                    self.errorMessage = "Failed to load activities: \(error.localizedDescription)"
                }
            }
        }
    }
    
    func loadMoreActivities() {
        guard !isLoadingMore && hasMorePages else { return }
        
        isLoadingMore = true
        currentPage += 1
        
        Task {
            do {
                let nextActivities = try await apiClient.getActivities(limit: 20, page: currentPage)
                
                await MainActor.run {
                    self.activities.append(contentsOf: nextActivities)
                    self.isLoadingMore = false
                    self.hasMorePages = nextActivities.count >= 20 // Assume more if we got a full page
                }
            } catch {
                await MainActor.run {
                    self.isLoadingMore = false
                    self.hasError = true
                    self.errorMessage = "Failed to load more activities: \(error.localizedDescription)"
                }
            }
        }
    }
}

// Ask Vici View
struct AskViciView: View {
    @State private var question = ""
    @State private var conversations: [ViciConversation] = ViciConversation.mockConversations
    
    var body: some View {
        NavigationView {
            VStack {
                List {
                    ForEach(conversations) { conversation in
                        VStack(alignment: .leading, spacing: 10) {
                            Text(conversation.question)
                                .font(.headline)
                            
                            Text(conversation.answer)
                                .font(.body)
                                .padding(.vertical, 5)
                            
                            Text(conversation.date.formatted())
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        .padding(.vertical, 5)
                    }
                }
                
                HStack {
                    TextField("Ask Vici about your training...", text: $question)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                    
                    Button(action: {
                        if !question.isEmpty {
                            // In a real app, we would call an AI service here
                            let newConversation = ViciConversation(
                                id: UUID().uuidString,
                                question: question,
                                answer: "Based on your recent training and recovery metrics, I suggest [mock AI response]",
                                date: Date()
                            )
                            conversations.insert(newConversation, at: 0)
                            question = ""
                        }
                    }) {
                        Image(systemName: "paperplane.fill")
                            .foregroundColor(.blue)
                    }
                    .padding(.horizontal, 10)
                }
                .padding()
            }
            .navigationTitle("Ask Vici")
        }
    }
}

// Profile View
struct ProfileView: View {
    @EnvironmentObject var userAuth: UserAuthentication
    let mockUser = User.current
    @State private var isStravaConnected = false
    
    var body: some View {
        NavigationView {
            List {
                Section(header: Text("Personal Info")) {
                    HStack {
                        Text("Name")
                        Spacer()
                        Text(mockUser.name)
                            .foregroundColor(.secondary)
                    }
                    
                    HStack {
                        Text("Email")
                        Spacer()
                        Text(mockUser.email)
                            .foregroundColor(.secondary)
                    }
                    
                    HStack {
                        Text("Experience Level")
                        Spacer()
                        Text(mockUser.experienceLevel.rawValue)
                            .foregroundColor(.secondary)
                    }
                }
                
                Section(header: Text("Integrations")) {
                    Button(action: {
                        isStravaConnected.toggle()
                    }) {
                        HStack {
                            Text("Connect Strava")
                            Spacer()
                            if isStravaConnected {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundColor(.green)
                            } else {
                                Image(systemName: "link")
                                    .foregroundColor(.blue)
                            }
                        }
                    }
                }
                
                Section {
                    Button(action: {
                        userAuth.logout()
                    }) {
                        Text("Sign Out")
                            .foregroundColor(.red)
                    }
                }
            }
            .navigationTitle("Profile")
        }
    }
} 