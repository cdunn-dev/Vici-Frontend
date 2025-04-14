import SwiftUI

struct MainTabView: View {
    @EnvironmentObject private var authViewModel: AuthViewModel
    
    var body: some View {
        TabView {
            TrainingPlanView()
                .tabItem {
                    Label("Training", systemImage: "figure.run")
                }
            
            AskViciView()
                .tabItem {
                    Label("Ask Vici", systemImage: "message.fill")
                }
            
            ProfileView()
                .tabItem {
                    Label("Profile", systemImage: "person")
                }
        }
    }
}

// Enhanced Training Plan View (Home Screen)
struct TrainingPlanView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var viewModel = TrainingPlanViewModel()
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
                if viewModel.isLoading {
                    ProgressView("Loading your plan...")
                } else if let _ = viewModel.activePlan {
                    // Has active plan
                    ScrollView {
                        VStack(spacing: 20) {
                            // Today's workout section
                            TodayWorkoutSection(workout: viewModel.todaysWorkout)
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
                                ThisWeekView(workouts: viewModel.thisWeekWorkouts, completeWorkout: { id, notes in
                                    Task {
                                        await viewModel.completeWorkout(id: id, notes: notes)
                                    }
                                })
                            } else {
                                OverviewView(plan: viewModel.activePlan, workouts: viewModel.workouts)
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
                
                // Error message banner (if any)
                if let errorMessage = viewModel.errorMessage {
                    VStack {
                        Spacer()
                        Text(errorMessage)
                            .foregroundColor(.white)
                            .padding()
                            .background(Color.red)
                            .cornerRadius(8)
                            .padding()
                    }
                }
            }
            .navigationTitle("Training Plan")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    if viewModel.activePlan != nil {
                        Button(action: {
                            showingNewPlanSheet = true
                        }) {
                            Image(systemName: "plus")
                        }
                    }
                }
            }
            .sheet(isPresented: $showingNewPlanSheet) {
                NewPlanView(isPresented: $showingNewPlanSheet, createPlan: { preferences in
                    viewModel.createPlanPreview(withRequest: preferences) { result in
                        // Handle the result
                    }
                })
            }
            .refreshable {
                // Pull-to-refresh
                viewModel.loadActivePlan()
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
                        Text(workout.name)
                            .font(.headline)
                            .fontWeight(.bold)
                        
                        Spacer()
                        
                        WorkoutStatusBadge(completed: workout.completed)
                    }
                    
                    if let description = workout.description {
                        Text(description)
                            .font(.body)
                    }
                    
                    HStack {
                        if let distance = workout.distance {
                            HStack {
                                Image(systemName: "ruler")
                                    .foregroundColor(.secondary)
                                Text("\(String(format: "%.1f km", distance / 1000))")
                                    .font(.subheadline)
                            }
                            .padding(.trailing, 10)
                        }
                        
                        if let duration = workout.duration {
                            HStack {
                                Image(systemName: "clock")
                                    .foregroundColor(.secondary)
                                Text("\(duration) min")
                                    .font(.subheadline)
                            }
                        }
                        
                        Spacer()
                        
                        if !workout.completed {
                            Button(action: {
                                // CompleteWorkout action would be handled in a separate view
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
}

// Workout Status Badge
struct WorkoutStatusBadge: View {
    let completed: Bool
    
    var body: some View {
        Text(completed ? "Completed" : "Upcoming")
            .font(.caption2)
            .fontWeight(.medium)
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(completed ? Color.green.opacity(0.15) : Color.blue.opacity(0.15))
            .foregroundColor(completed ? .green : .blue)
            .cornerRadius(4)
    }
}

// This Week View
struct ThisWeekView: View {
    let workouts: [Workout]
    let completeWorkout: (String, String?) -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 15) {
            Text("THIS WEEK")
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundColor(.secondary)
                .padding(.horizontal)
            
            if workouts.isEmpty {
                Text("No workouts scheduled for this week")
                    .foregroundColor(.secondary)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding()
            } else {
                ForEach(workouts) { workout in
                    WorkoutCard(workout: workout, completeWorkout: completeWorkout)
                        .padding(.horizontal)
                }
            }
        }
    }
}

// Overview View
struct OverviewView: View {
    let plan: TrainingPlan?
    let workouts: [Workout]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 15) {
            Text("PLAN OVERVIEW")
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundColor(.secondary)
                .padding(.horizontal)
            
            if let plan = plan {
                VStack(alignment: .leading, spacing: 10) {
                    Text(plan.name)
                        .font(.headline)
                    
                    if let description = plan.description {
                        Text(description)
                            .font(.body)
                            .foregroundColor(.secondary)
                    }
                    
                    HStack {
                        VStack(alignment: .leading) {
                            Text("Start Date:")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            if let startDate = plan.startDate {
                                Text(formatDate(startDate))
                                    .font(.body)
                            }
                        }
                        
                        Spacer()
                        
                        VStack(alignment: .leading) {
                            Text("End Date:")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            if let endDate = plan.endDate {
                                Text(formatDate(endDate))
                                    .font(.body)
                            }
                        }
                    }
                    .padding(.vertical, 5)
                    
                    // Plan progress bar
                    VStack(alignment: .leading, spacing: 5) {
                        Text("Progress:")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        
                        ProgressView(value: calculateProgress())
                            .accentColor(.blue)
                        
                        Text("\(completedWorkoutCount()) of \(workouts.count) workouts completed")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(12)
                .padding(.horizontal)
            } else {
                Text("No active plan found")
                    .foregroundColor(.secondary)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding()
            }
        }
    }
    
    // Helper functions
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        return formatter.string(from: date)
    }
    
    private func calculateProgress() -> Double {
        guard !workouts.isEmpty else { return 0.0 }
        let completed = workouts.filter { $0.completed }.count
        return Double(completed) / Double(workouts.count)
    }
    
    private func completedWorkoutCount() -> Int {
        return workouts.filter { $0.completed }.count
    }
}

// Workout Card
struct WorkoutCard: View {
    let workout: Workout
    let completeWorkout: (String, String?) -> Void
    @State private var showingCompleteSheet = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                VStack(alignment: .leading) {
                    Text(formatDate(workout.scheduledDate))
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Text(workout.name)
                        .font(.headline)
                        .fontWeight(.bold)
                }
                
                Spacer()
                
                WorkoutStatusBadge(completed: workout.completed)
            }
            
            if let description = workout.description {
                Text(description)
                    .font(.body)
                    .lineLimit(3)
            }
            
            HStack {
                if let distance = workout.distance {
                    HStack {
                        Image(systemName: "ruler")
                            .foregroundColor(.secondary)
                        Text("\(String(format: "%.1f km", distance / 1000))")
                            .font(.subheadline)
                    }
                    .padding(.trailing, 10)
                }
                
                if let duration = workout.duration {
                    HStack {
                        Image(systemName: "clock")
                            .foregroundColor(.secondary)
                        Text("\(duration) min")
                            .font(.subheadline)
                    }
                }
                
                Spacer()
                
                if !workout.completed {
                    Button(action: {
                        showingCompleteSheet = true
                    }) {
                        Text("Complete")
                            .font(.footnote)
                            .fontWeight(.medium)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(Color.blue)
                            .foregroundColor(.white)
                            .cornerRadius(5)
                    }
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
        .sheet(isPresented: $showingCompleteSheet) {
            CompleteWorkoutView(workout: workout, completeWorkout: completeWorkout)
        }
    }
    
    // Helper function
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE, MMM d"
        return formatter.string(from: date)
    }
}

// Complete Workout View
struct CompleteWorkoutView: View {
    let workout: Workout
    let completeWorkout: (String, String?) -> Void
    @State private var notes: String = ""
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Workout Details")) {
                    Text(workout.name)
                        .font(.headline)
                    
                    if let description = workout.description {
                        Text(description)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    
                    HStack {
                        Text("Date:")
                        Spacer()
                        Text(formatDate(workout.scheduledDate))
                            .foregroundColor(.secondary)
                    }
                    
                    if let distance = workout.distance {
                        HStack {
                            Text("Distance:")
                            Spacer()
                            Text("\(String(format: "%.1f km", distance / 1000))")
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    if let duration = workout.duration {
                        HStack {
                            Text("Duration:")
                            Spacer()
                            Text("\(duration) min")
                                .foregroundColor(.secondary)
                        }
                    }
                }
                
                Section(header: Text("Completion Notes")) {
                    TextEditor(text: $notes)
                        .frame(minHeight: 100)
                        .overlay(
                            RoundedRectangle(cornerRadius: 5)
                                .stroke(Color.secondary.opacity(0.2), lineWidth: 1)
                        )
                }
                
                Section {
                    Button(action: {
                        completeWorkout(workout.id, notes.isEmpty ? nil : notes)
                        presentationMode.wrappedValue.dismiss()
                    }) {
                        Text("Mark as Completed")
                            .frame(maxWidth: .infinity, alignment: .center)
                            .foregroundColor(.white)
                    }
                    .listRowBackground(Color.blue)
                }
            }
            .navigationTitle("Complete Workout")
            .navigationBarItems(trailing: Button("Cancel") {
                presentationMode.wrappedValue.dismiss()
            })
        }
    }
    
    // Helper function
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        return formatter.string(from: date)
    }
}

// New Plan View (Simplified implementation that integrates with TrainingPlanViewModel)
struct NewPlanView: View {
    @Binding var isPresented: Bool
    @State private var selectedGoalType = "Race"
    @State private var raceName = ""
    @State private var raceDistance = "Half Marathon"
    @State private var raceDate = Date().addingTimeInterval(60*24*60*60)
    @State private var experienceLevel = "Intermediate"
    @State private var runningDaysPerWeek = 4
    
    let createPlan: ([String: Any]) -> Void
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Goal")) {
                    Picker("Goal Type", selection: $selectedGoalType) {
                        Text("Race").tag("Race")
                        Text("General Fitness").tag("General Fitness")
                    }
                    .pickerStyle(SegmentedPickerStyle())
                    
                    if selectedGoalType == "Race" {
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
                        Text("Beginner").tag("Beginner")
                        Text("Intermediate").tag("Intermediate")
                        Text("Advanced").tag("Advanced")
                    }
                    
                    Stepper("Running Days: \(runningDaysPerWeek)", value: $runningDaysPerWeek, in: 3...6)
                }
                
                Section {
                    Button(action: {
                        createPlanFromPreferences()
                        isPresented = false
                    }) {
                        Text("Generate Plan")
                            .frame(maxWidth: .infinity)
                            .foregroundColor(.white)
                    }
                    .listRowBackground(Color.blue)
                }
            }
            .navigationTitle("Create Training Plan")
            .navigationBarItems(trailing: Button("Cancel") {
                isPresented = false
            })
        }
    }
    
    private func createPlanFromPreferences() {
        // Build request body based on form inputs
        var preferences: [String: Any] = [
            "goalType": selectedGoalType,
            "experienceLevel": experienceLevel,
            "runningDaysPerWeek": runningDaysPerWeek
        ]
        
        if selectedGoalType == "Race" {
            preferences["raceName"] = raceName
            preferences["raceDistance"] = raceDistance
            preferences["raceDate"] = ISO8601DateFormatter().string(from: raceDate)
        }
        
        createPlan(preferences)
    }
}

// Ask Vici View
struct AskViciView: View {
    @State private var question = ""
    @State private var conversations: [ViciConversation] = []
    @State private var isLoading = false
    @FocusState private var isFocused: Bool
    @StateObject private var viewModel = AskViciViewModel()
    
    var body: some View {
        NavigationView {
            VStack {
                // Conversation list
                ScrollViewReader { scrollView in
                    List {
                        ForEach(viewModel.conversations) { conversation in
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
                                    
                                    Text(conversation.timestamp.formatted(date: .numeric, time: .shortened))
                                        .font(.caption2)
                                        .foregroundColor(.secondary)
                                }
                            }
                            .padding(.vertical, 5)
                            .id(conversation.id)
                        }
                    }
                    .listStyle(PlainListStyle())
                    .onChange(of: viewModel.conversations) { _ in
                        if let lastId = viewModel.conversations.first?.id {
                            withAnimation {
                                scrollView.scrollTo(lastId, anchor: .top)
                            }
                        }
                    }
                }
                
                // Suggestion chips
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack {
                        ForEach(viewModel.suggestions, id: \.self) { suggestion in
                            Button(action: {
                                question = suggestion
                                sendQuestion()
                            }) {
                                Text(suggestion)
                                    .font(.footnote)
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 8)
                                    .background(Color.blue.opacity(0.1))
                                    .foregroundColor(.blue)
                                    .cornerRadius(16)
                            }
                        }
                    }
                    .padding(.horizontal)
                }
                .padding(.vertical, 8)
                
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
                            if viewModel.isLoading {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle())
                            } else {
                                Image(systemName: "paperplane.fill")
                                    .foregroundColor(.blue)
                            }
                        }
                        .disabled(question.isEmpty || viewModel.isLoading)
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
            .onAppear {
                viewModel.loadConversations()
            }
            .overlay(
                viewModel.error != nil ?
                    VStack {
                        Spacer()
                        Text(viewModel.error ?? "")
                            .foregroundColor(.white)
                            .padding()
                            .background(Color.red)
                            .cornerRadius(8)
                            .padding()
                    } : nil
            )
        }
    }
    
    private func sendQuestion() {
        guard !question.isEmpty else { return }
        
        let userQuestion = question
        question = ""
        
        Task {
            await viewModel.sendQuestion(userQuestion)
        }
    }
}

// Vici Conversation model for UI
struct ViciConversation: Identifiable {
    let id: String
    let question: String
    let answer: String
    let timestamp: Date
    let hasStructuredChanges: Bool
    
    init(id: String, question: String, answer: String, timestamp: Date, hasStructuredChanges: Bool = false) {
        self.id = id
        self.question = question
        self.answer = answer
        self.timestamp = timestamp
        self.hasStructuredChanges = hasStructuredChanges
    }
    
    // Create a conversation from a ViciResponse
    init(questionText: String, response: ViciResponse) {
        self.id = UUID().uuidString
        self.question = questionText
        self.answer = response.answerText
        self.timestamp = Date()
        self.hasStructuredChanges = response.hasStructuredChanges
    }
}

// ViewModel for Ask Vici feature
class AskViciViewModel: ObservableObject {
    @Published var conversations: [ViciConversation] = []
    @Published var isLoading = false
    @Published var error: String?
    
    private let trainingService = TrainingService.shared
    
    // Common questions that users might ask
    let suggestions = [
        "How can I improve my running pace?",
        "Should I do a long run today?",
        "I'm feeling tired, what should I do?",
        "What's a good stretching routine?",
        "How to prepare for a 10K race?"
    ]
    
    // Load conversations history
    func loadConversations() {
        // In a real implementation, we'd load from persistent storage
        if conversations.isEmpty {
            conversations = [
                ViciConversation(
                    id: "welcome",
                    question: "Hello",
                    answer: "Welcome to Vici! I'm your AI running coach. How can I help with your training today?",
                    timestamp: Date().addingTimeInterval(-3600),
                    hasStructuredChanges: false
                )
            ]
        }
    }
    
    // Send a question to the AI coach
    func sendQuestion(_ question: String) async {
        await MainActor.run {
            isLoading = true
            error = nil
        }
        
        do {
            // Get the active plan ID if available
            let activePlan = try? await trainingService.getActivePlan()
            let planId = activePlan?.id
            
            // Send the question to the API
            let response = try await trainingService.askVici(question: question, planId: planId)
            
            // Create a new conversation entry
            let newConversation = ViciConversation(questionText: question, response: response)
            
            await MainActor.run {
                // Add to the beginning of the list (newest first)
                conversations.insert(newConversation, at: 0)
                isLoading = false
            }
            
            // Handle structured changes if present
            if response.hasStructuredChanges, let changes = response.proposedChanges {
                // Here we would process the structured changes
                // For example, updating the training plan
                print("Structured changes available: \(changes)")
            }
            
        } catch {
            await MainActor.run {
                self.error = "Failed to get response: \(error.localizedDescription)"
                self.isLoading = false
                
                // Add a fallback conversation entry
                let fallbackConversation = ViciConversation(
                    id: UUID().uuidString,
                    question: question,
                    answer: "I'm sorry, I couldn't process your question right now. Please try again later.",
                    timestamp: Date()
                )
                conversations.insert(fallbackConversation, at: 0)
            }
        }
    }
}

// Preview for AskViciView
struct AskViciView_Previews: PreviewProvider {
    static var previews: some View {
        AskViciView()
    }
}

// ProfileView using real UserViewModel
struct ProfileView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var viewModel = UserViewModel()
    @State private var isEditingProfile = false
    @State private var showingLogoutConfirmation = false
    @State private var showingStravaConnect = false
    
    var body: some View {
        NavigationView {
            ZStack {
                Color(.systemGroupedBackground)
                    .ignoresSafeArea()
                
                if viewModel.isLoading {
                    ProgressView("Loading profile...")
                } else if let user = viewModel.currentUser {
                    ScrollView {
                        VStack(spacing: 20) {
                            // Profile header
                            VStack(spacing: 15) {
                                // Profile picture or initials avatar
                                ZStack {
                                    Circle()
                                        .fill(Color.blue.opacity(0.2))
                                        .frame(width: 100, height: 100)
                                    
                                    if let url = user.profileImageUrl, !url.isEmpty {
                                        // In a real app, load the image from URL
                                        AsyncImage(url: URL(string: url)) { image in
                                            image
                                                .resizable()
                                                .scaledToFill()
                                        } placeholder: {
                                            Text(getInitials(from: user.name))
                                                .font(.system(size: 40, weight: .semibold))
                                                .foregroundColor(.blue)
                                        }
                                        .frame(width: 100, height: 100)
                                        .clipShape(Circle())
                                    } else {
                                        Text(getInitials(from: user.name))
                                            .font(.system(size: 40, weight: .semibold))
                                            .foregroundColor(.blue)
                                    }
                                }
                                
                                Text(user.name)
                                    .font(.title2)
                                    .fontWeight(.bold)
                                
                                Text(user.email)
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                            }
                            .padding(.top, 20)
                            
                            // Account information section
                            VStack(alignment: .leading, spacing: 0) {
                                Text("ACCOUNT INFORMATION")
                                    .font(.footnote)
                                    .fontWeight(.semibold)
                                    .foregroundColor(.secondary)
                                    .padding(.horizontal)
                                    .padding(.bottom, 5)
                                
                                VStack(spacing: 0) {
                                    // Running Experience
                                    infoRow(icon: "figure.run", title: "Experience", value: user.experienceLevel?.capitalized ?? "Not specified")
                                    
                                    Divider()
                                        .padding(.leading, 50)
                                    
                                    // Height
                                    if let height = user.formattedHeight {
                                        infoRow(icon: "ruler", title: "Height", value: height)
                                        
                                        Divider()
                                            .padding(.leading, 50)
                                    }
                                    
                                    // Weight
                                    if let weight = user.formattedWeight {
                                        infoRow(icon: "scalemass", title: "Weight", value: weight)
                                        
                                        Divider()
                                            .padding(.leading, 50)
                                    }
                                    
                                    // Age
                                    if let age = user.formattedAge {
                                        infoRow(icon: "calendar", title: "Age", value: "\(age) years")
                                    }
                                }
                                .background(Color(.systemBackground))
                                .cornerRadius(10)
                            }
                            .padding(.horizontal)
                            
                            // Integrations section
                            VStack(alignment: .leading, spacing: 0) {
                                Text("INTEGRATIONS")
                                    .font(.footnote)
                                    .fontWeight(.semibold)
                                    .foregroundColor(.secondary)
                                    .padding(.horizontal)
                                    .padding(.bottom, 5)
                                
                                VStack(spacing: 0) {
                                    // Strava integration
                                    Button(action: {
                                        showingStravaConnect = true
                                    }) {
                                        HStack {
                                            Image("strava-icon")
                                                .resizable()
                                                .frame(width: 24, height: 24)
                                                .padding(.leading)
                                            
                                            Text("Strava")
                                                .fontWeight(.medium)
                                            
                                            Spacer()
                                            
                                            Text(user.stravaConnected ? "Connected" : "Connect")
                                                .font(.subheadline)
                                                .foregroundColor(user.stravaConnected ? .secondary : .blue)
                                            
                                            Image(systemName: "chevron.right")
                                                .font(.footnote)
                                                .foregroundColor(.secondary)
                                                .padding(.trailing)
                                        }
                                        .padding(.vertical, 12)
                                        .background(Color(.systemBackground))
                                        .cornerRadius(10)
                                    }
                                    .foregroundColor(.primary)
                                    
                                    Divider()
                                        .padding(.leading, 50)
                                    
                                    // Garmin integration
                                    Button(action: {
                                        // Garmin connect action
                                    }) {
                                        HStack {
                                            Image("garmin-icon")
                                                .resizable()
                                                .frame(width: 24, height: 24)
                                                .padding(.leading)
                                            
                                            Text("Garmin")
                                                .fontWeight(.medium)
                                            
                                            Spacer()
                                            
                                            Text(user.garminConnected ? "Connected" : "Connect")
                                                .font(.subheadline)
                                                .foregroundColor(user.garminConnected ? .secondary : .blue)
                                            
                                            Image(systemName: "chevron.right")
                                                .font(.footnote)
                                                .foregroundColor(.secondary)
                                                .padding(.trailing)
                                        }
                                        .padding(.vertical, 12)
                                        .background(Color(.systemBackground))
                                        .cornerRadius(10)
                                    }
                                    .foregroundColor(.primary)
                                }
                                .background(Color(.systemBackground))
                                .cornerRadius(10)
                            }
                            .padding(.horizontal)
                            
                            // Settings section
                            VStack(alignment: .leading, spacing: 0) {
                                Text("SETTINGS")
                                    .font(.footnote)
                                    .fontWeight(.semibold)
                                    .foregroundColor(.secondary)
                                    .padding(.horizontal)
                                    .padding(.bottom, 5)
                                
                                VStack(spacing: 0) {
                                    // Units setting
                                    Button(action: {
                                        // Toggle units
                                        viewModel.toggleUnits()
                                    }) {
                                        HStack {
                                            Image(systemName: "ruler")
                                                .frame(width: 24, height: 24)
                                                .foregroundColor(.blue)
                                                .padding(.leading)
                                            
                                            Text("Units")
                                                .fontWeight(.medium)
                                            
                                            Spacer()
                                            
                                            Text(user.preferredUnits == "imperial" ? "Imperial" : "Metric")
                                                .font(.subheadline)
                                                .foregroundColor(.secondary)
                                                .padding(.trailing)
                                        }
                                        .padding(.vertical, 12)
                                        .background(Color(.systemBackground))
                                        .cornerRadius(10)
                                    }
                                    .foregroundColor(.primary)
                                    
                                    Divider()
                                        .padding(.leading, 50)
                                    
                                    // Edit Profile
                                    Button(action: {
                                        isEditingProfile = true
                                    }) {
                                        HStack {
                                            Image(systemName: "person")
                                                .frame(width: 24, height: 24)
                                                .foregroundColor(.blue)
                                                .padding(.leading)
                                            
                                            Text("Edit Profile")
                                                .fontWeight(.medium)
                                            
                                            Spacer()
                                            
                                            Image(systemName: "chevron.right")
                                                .font(.footnote)
                                                .foregroundColor(.secondary)
                                                .padding(.trailing)
                                        }
                                        .padding(.vertical, 12)
                                        .background(Color(.systemBackground))
                                        .cornerRadius(10)
                                    }
                                    .foregroundColor(.primary)
                                    
                                    Divider()
                                        .padding(.leading, 50)
                                    
                                    // Logout
                                    Button(action: {
                                        showingLogoutConfirmation = true
                                    }) {
                                        HStack {
                                            Image(systemName: "rectangle.portrait.and.arrow.right")
                                                .frame(width: 24, height: 24)
                                                .foregroundColor(.red)
                                                .padding(.leading)
                                            
                                            Text("Log Out")
                                                .fontWeight(.medium)
                                                .foregroundColor(.red)
                                            
                                            Spacer()
                                        }
                                        .padding(.vertical, 12)
                                        .background(Color(.systemBackground))
                                        .cornerRadius(10)
                                    }
                                }
                                .background(Color(.systemBackground))
                                .cornerRadius(10)
                            }
                            .padding(.horizontal)
                        }
                        .padding(.bottom, 30)
                    }
                } else {
                    // No user - show login prompt or error
                    VStack(spacing: 20) {
                        Text("Profile Unavailable")
                            .font(.title)
                            .fontWeight(.bold)
                        
                        Text("Please log in to view your profile")
                            .foregroundColor(.secondary)
                        
                        Button(action: {
                            authViewModel.logout() // This will take user to login screen
                        }) {
                            Text("Return to Login")
                                .fontWeight(.medium)
                                .frame(width: 200, height: 44)
                                .background(Color.blue)
                                .foregroundColor(.white)
                                .cornerRadius(10)
                        }
                    }
                    .padding()
                }
                
                // Error message banner if any
                if let errorMessage = viewModel.errorMessage {
                    VStack {
                        Spacer()
                        Text(errorMessage)
                            .foregroundColor(.white)
                            .padding()
                            .background(Color.red)
                            .cornerRadius(8)
                            .padding()
                    }
                }
            }
            .navigationTitle("Profile")
            .onAppear {
                viewModel.loadUserProfile()
            }
            .sheet(isPresented: $showingStravaConnect) {
                if let user = viewModel.currentUser {
                    StravaConnectView(userId: user.id)
                }
            }
            .sheet(isPresented: $isEditingProfile) {
                if let user = viewModel.currentUser {
                    EditProfileView(user: user) { updatedUser in
                        viewModel.updateUserProfile(updatedUser)
                        isEditingProfile = false
                    }
                }
            }
            .alert(isPresented: $showingLogoutConfirmation) {
                Alert(
                    title: Text("Log Out"),
                    message: Text("Are you sure you want to log out?"),
                    primaryButton: .destructive(Text("Log Out")) {
                        authViewModel.logout()
                    },
                    secondaryButton: .cancel()
                )
            }
        }
    }
    
    // Helper for rendering info rows
    private func infoRow(icon: String, title: String, value: String) -> some View {
        HStack {
            Image(systemName: icon)
                .frame(width: 24, height: 24)
                .foregroundColor(.blue)
                .padding(.leading)
            
            Text(title)
                .fontWeight(.medium)
            
            Spacer()
            
            Text(value)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .padding(.trailing)
        }
        .padding(.vertical, 12)
    }
    
    // Helper for extracting initials from name
    private func getInitials(from name: String) -> String {
        let components = name.components(separatedBy: " ")
        if components.count > 1, 
           let first = components.first?.first,
           let last = components.last?.first {
            return "\(first)\(last)".uppercased()
        } else if let first = name.first {
            return String(first).uppercased()
        }
        return "?"
    }
}

// ViewModel for User Profile
class UserViewModel: ObservableObject {
    @Published var currentUser: User?
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let authService = AuthService.shared
    
    func loadUserProfile() {
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                let user = try await authService.getCurrentUser()
                
                DispatchQueue.main.async { [weak self] in
                    self?.currentUser = user
                    self?.isLoading = false
                }
            } catch {
                DispatchQueue.main.async { [weak self] in
                    self?.errorMessage = "Failed to load profile: \(error.localizedDescription)"
                    self?.isLoading = false
                }
            }
        }
    }
    
    func updateUserProfile(_ user: User) {
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                let updatedUser = try await authService.updateProfile(
                    name: user.name,
                    gender: user.gender,
                    dateOfBirth: user.dateOfBirth,
                    weight: user.weight,
                    height: user.height,
                    experienceLevel: user.experienceLevel,
                    preferredUnits: user.preferredUnits,
                    goals: user.goals
                )
                
                DispatchQueue.main.async { [weak self] in
                    self?.currentUser = updatedUser
                    self?.isLoading = false
                }
            } catch {
                DispatchQueue.main.async { [weak self] in
                    self?.errorMessage = "Failed to update profile: \(error.localizedDescription)"
                    self?.isLoading = false
                }
            }
        }
    }
    
    func toggleUnits() {
        guard var user = currentUser else { return }
        
        // Toggle between metric and imperial
        let newUnits = user.preferredUnits == "metric" ? "imperial" : "metric"
        
        Task {
            do {
                let updatedUser = try await authService.updateProfile(preferredUnits: newUnits)
                
                DispatchQueue.main.async { [weak self] in
                    self?.currentUser = updatedUser
                }
            } catch {
                DispatchQueue.main.async { [weak self] in
                    self?.errorMessage = "Failed to update units: \(error.localizedDescription)"
                }
            }
        }
    }
}

// Strava Connect View
struct StravaConnectView: View {
    let userId: String
    @State private var isConnecting = false
    @State private var errorMessage: String?
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        NavigationView {
            VStack(spacing: 30) {
                Image("strava-logo")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 120, height: 120)
                
                Text("Connect Your Strava Account")
                    .font(.title2)
                    .fontWeight(.bold)
                
                Text("Link your Strava account to automatically import your running activities and training data.")
                    .multilineTextAlignment(.center)
                    .foregroundColor(.secondary)
                    .padding(.horizontal)
                
                Button(action: {
                    connectToStrava()
                }) {
                    HStack {
                        Image("strava-icon")
                            .resizable()
                            .frame(width: 24, height: 24)
                        
                        Text("Connect with Strava")
                            .fontWeight(.medium)
                    }
                    .frame(width: 250, height: 50)
                    .background(Color.orange)
                    .foregroundColor(.white)
                    .cornerRadius(10)
                }
                .padding(.top)
                
                if isConnecting {
                    ProgressView("Connecting to Strava...")
                }
                
                if let error = errorMessage {
                    Text(error)
                        .foregroundColor(.red)
                        .padding()
                }
                
                Spacer()
            }
            .padding()
            .navigationTitle("Strava Integration")
            .navigationBarItems(trailing: Button("Close") {
                presentationMode.wrappedValue.dismiss()
            })
        }
    }
    
    private func connectToStrava() {
        isConnecting = true
        errorMessage = nil
        
        // This would normally redirect to Strava OAuth
        // For the MVP, we'll simulate the connection process
        
        Task {
            do {
                // Call the Strava service to initiate OAuth flow
                // In a real app, this would open a web view or redirect to Strava
                try await Task.sleep(nanoseconds: 2_000_000_000) // Simulate 2 second delay
                
                // Successful connection would update the user model
                DispatchQueue.main.async {
                    isConnecting = false
                    // Show success and dismiss
                    presentationMode.wrappedValue.dismiss()
                }
            } catch {
                DispatchQueue.main.async {
                    isConnecting = false
                    errorMessage = "Connection failed: \(error.localizedDescription)"
                }
            }
        }
    }
}

// EditProfileView for updating user profile
struct EditProfileView: View {
    let user: User
    @Binding var isPresented: Bool
    let onSave: (User) -> Void
    
    @State private var name: String
    @State private var email: String
    
    init(user: User, isPresented: Binding<Bool>, onSave: @escaping (User) -> Void) {
        self.user = user
        self._isPresented = isPresented
        self.onSave = onSave
        self._name = State(initialValue: user.name ?? "")
        self._email = State(initialValue: user.email)
    }
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Profile Information")) {
                    TextField("Name", text: $name)
                    TextField("Email", text: $email)
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                }
                
                Section {
                    Button("Save Changes") {
                        let updatedUser = User(
                            id: user.id,
                            name: name,
                            email: email,
                            experienceLevel: user.experienceLevel,
                            gender: user.gender,
                            dateOfBirth: user.dateOfBirth,
                            weight: user.weight,
                            height: user.height,
                            preferredUnits: user.preferredUnits,
                            goals: user.goals,
                            stravaConnected: user.stravaConnected,
                            garminConnected: user.garminConnected,
                            profileImageUrl: user.profileImageUrl,
                            formattedHeight: user.formattedHeight,
                            formattedWeight: user.formattedWeight,
                            formattedAge: user.formattedAge
                        )
                        onSave(updatedUser)
                        isPresented = false
                    }
                }
            }
            .navigationTitle("Edit Profile")
            .navigationBarItems(leading: Button("Cancel") {
                isPresented = false
            })
        }
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

// Preview
struct MainTabView_Previews: PreviewProvider {
    static var previews: some View {
        MainTabView()
            .environmentObject(AuthViewModel())
            .environmentObject(TrainingPlanViewModel())
    }
}

// Preview for Today's Workout Section
struct TodayWorkoutSection_Previews: PreviewProvider {
    static var previews: some View {
        VStack {
            TodayWorkoutSection(workout: Workout.previewTodaysWorkout)
            TodayWorkoutSection(workout: nil)
        }
        .padding()
        .background(Color(.systemGroupedBackground))
    }
}

// Preview for This Week View
struct ThisWeekView_Previews: PreviewProvider {
    static var previews: some View {
        ThisWeekView(workouts: Workout.previewWeek, completeWorkout: { _, _ in })
            .padding()
            .background(Color(.systemGroupedBackground))
    }
}

// Preview for Overview View
struct OverviewView_Previews: PreviewProvider {
    static var previews: some View {
        OverviewView(plan: TrainingPlan.samplePlan, workouts: Workout.previewWeek)
            .padding()
            .background(Color(.systemGroupedBackground))
    }
} 