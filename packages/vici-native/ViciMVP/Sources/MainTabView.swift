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
    let mockActivities = Activity.mockActivities
    
    var body: some View {
        NavigationView {
            List {
                ForEach(mockActivities) { activity in
                    ActivityRow(activity: activity)
                }
            }
            .navigationTitle("Training Log")
        }
    }
}

// Activity Row Component
struct ActivityRow: View {
    let activity: Activity
    
    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                Text(activity.title)
                    .font(.headline)
                Text(activity.date.formatted(date: .abbreviated, time: .shortened))
                    .font(.caption)
            }
            
            Spacer()
            
            VStack(alignment: .trailing) {
                Text("\(String(format: "%.1f", activity.distance/1000)) km")
                    .font(.subheadline)
                
                Text(activity.duration.formatted())
                    .font(.caption)
            }
        }
        .padding(.vertical, 5)
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