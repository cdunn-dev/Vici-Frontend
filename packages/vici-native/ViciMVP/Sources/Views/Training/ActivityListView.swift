import SwiftUI

struct ActivityListView: View {
    @State private var activities: [Activity] = []
    @State private var showingCreateActivity = false
    @State private var searchText = ""
    @State private var selectedFilter: ActivityType? = nil
    
    private var filteredActivities: [Activity] {
        var filtered = activities
        
        // Apply search filter
        if !searchText.isEmpty {
            filtered = filtered.filter { 
                $0.name.localizedCaseInsensitiveContains(searchText) ||
                ($0.description?.localizedCaseInsensitiveContains(searchText) ?? false)
            }
        }
        
        // Apply activity type filter
        if let selectedFilter = selectedFilter {
            filtered = filtered.filter { $0.activityType == selectedFilter }
        }
        
        return filtered.sorted { $0.startTime > $1.startTime }
    }
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Filter pills
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 10) {
                        FilterPill(
                            title: "All",
                            isSelected: selectedFilter == nil,
                            action: { selectedFilter = nil }
                        )
                        
                        ForEach(ActivityType.allCases, id: \.self) { type in
                            FilterPill(
                                title: String(describing: type).capitalized,
                                icon: type.icon,
                                isSelected: selectedFilter == type,
                                action: { 
                                    selectedFilter = selectedFilter == type ? nil : type 
                                }
                            )
                        }
                    }
                    .padding(.horizontal)
                    .padding(.vertical, 10)
                }
                
                if filteredActivities.isEmpty {
                    VStack(spacing: 20) {
                        Image(systemName: "figure.run")
                            .font(.system(size: 60))
                            .foregroundColor(.gray)
                        
                        Text("No activities yet")
                            .font(.title2)
                            .fontWeight(.medium)
                        
                        Text("Add your first workout to track your progress")
                            .font(.subheadline)
                            .foregroundColor(.gray)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                        
                        Button(action: { showingCreateActivity = true }) {
                            HStack {
                                Image(systemName: "plus.circle.fill")
                                Text("Add Activity")
                            }
                            .padding()
                            .background(Color.blue)
                            .foregroundColor(.white)
                            .cornerRadius(8)
                        }
                        .padding(.top, 10)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(Color(.systemGroupedBackground))
                } else {
                    List {
                        ForEach(filteredActivities) { activity in
                            NavigationLink(destination: ActivityDetailView(activity: activity)) {
                                ActivityRow(activity: activity)
                            }
                        }
                    }
                    .listStyle(InsetGroupedListStyle())
                }
            }
            .navigationTitle("Activities")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingCreateActivity = true }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .searchable(text: $searchText, prompt: "Search activities")
            .sheet(isPresented: $showingCreateActivity) {
                CreateActivityView()
            }
            .onAppear(perform: loadActivities)
        }
    }
    
    private func loadActivities() {
        // In a real app, you would load activities from persistent storage or API
        activities = [
            Activity.sampleRun,
            Activity.sampleCycle,
            Activity.sampleSwim
        ]
    }
}

struct FilterPill: View {
    var title: String
    var icon: String? = nil
    var isSelected: Bool
    var action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 4) {
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.subheadline)
                }
                Text(title)
                    .font(.subheadline)
                    .fontWeight(isSelected ? .semibold : .regular)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(isSelected ? Color.blue.opacity(0.15) : Color(.systemGray6))
            .foregroundColor(isSelected ? .blue : .primary)
            .cornerRadius(20)
        }
    }
}

struct ActivityRow: View {
    let activity: Activity
    
    var body: some View {
        NavigationLink(destination: ActivityDetailView(activity: activity)) {
            HStack(spacing: 16) {
                Circle()
                    .fill(activityTypeColor(activity.activityType))
                    .frame(width: 40, height: 40)
                    .overlay(
                        Image(systemName: activity.activityType.icon)
                            .font(.system(size: 18))
                            .foregroundColor(.white)
                    )
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(activity.name)
                        .font(.headline)
                    
                    HStack(spacing: 12) {
                        HStack(spacing: 4) {
                            Image(systemName: "calendar")
                                .font(.caption)
                                .foregroundColor(.gray)
                            Text(formatDate(activity.startTime))
                                .font(.caption)
                                .foregroundColor(.gray)
                        }
                        
                        HStack(spacing: 4) {
                            Image(systemName: "ruler")
                                .font(.caption)
                                .foregroundColor(.gray)
                            Text(formatDistance(activity.distance))
                                .font(.caption)
                                .foregroundColor(.gray)
                        }
                        
                        HStack(spacing: 4) {
                            Image(systemName: "clock")
                                .font(.caption)
                                .foregroundColor(.gray)
                            Text(formatDuration(activity.movingTimeSeconds))
                                .font(.caption)
                                .foregroundColor(.gray)
                        }
                    }
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.gray)
            }
            .padding(.vertical, 12)
        }
        .buttonStyle(PlainButtonStyle())
    }
    
    private func activityTypeColor(_ type: ActivityType) -> Color {
        switch type {
        case .run:
            return .green
        case .cycle:
            return .orange
        case .swim:
            return .blue
        case .hike:
            return .brown
        case .walk:
            return .purple
        case .yoga:
            return .cyan
        case .strength:
            return .red
        }
    }
    
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d, h:mm a"
        return formatter.string(from: date)
    }
    
    private func formatDistance(_ distanceMeters: Double) -> String {
        let distanceKm = distanceMeters / 1000
        return String(format: "%.1f km", distanceKm)
    }
    
    private func formatDuration(_ seconds: Int) -> String {
        let hours = seconds / 3600
        let minutes = (seconds % 3600) / 60
        
        if hours > 0 {
            return "\(hours)h \(minutes)m"
        } else {
            return "\(minutes)m"
        }
    }
}

// Sample Activities
extension Activity {
    static var sampleRun: Activity {
        Activity(
            id: "1",
            name: "Morning Run",
            description: "Easy morning run around the park",
            activityType: .run,
            startTime: Date().addingTimeInterval(-24 * 3600),
            movingTimeSeconds: 1800,
            distance: 5000,
            calories: 350,
            elevationGain: 45,
            averageHeartRate: 145,
            weather: Weather(condition: .partlyCloudy, temperatureCelsius: 18)
        )
    }
    
    static var sampleCycle: Activity {
        Activity(
            id: "2",
            name: "Weekend Ride",
            description: "Long ride through the countryside",
            activityType: .cycle,
            startTime: Date().addingTimeInterval(-48 * 3600),
            movingTimeSeconds: 5400,
            distance: 30000,
            calories: 750,
            elevationGain: 320,
            averageHeartRate: 150,
            weather: Weather(condition: .clear, temperatureCelsius: 22)
        )
    }
    
    static var sampleSwim: Activity {
        Activity(
            id: "3",
            name: "Pool Laps",
            description: "Technique focused swim session",
            activityType: .swim,
            startTime: Date().addingTimeInterval(-72 * 3600),
            movingTimeSeconds: 2700,
            distance: 2000,
            calories: 450,
            elevationGain: 0,
            averageHeartRate: 135,
            weather: nil
        )
    }
}

struct ActivityListView_Previews: PreviewProvider {
    static var previews: some View {
        ActivityListView()
    }
} 