import SwiftUI

struct TrainingLogView: View {
    @State private var activities: [Activity] = Activity.sampleActivities
    @State private var selectedActivityType: ActivityType? = nil
    @State private var selectedActivity: Activity? = nil
    @State private var showingDetailView = false
    @State private var showingFilterView = false
    @State private var showingCreateActivityView = false
    
    private var filteredActivities: [Activity] {
        if let selectedType = selectedActivityType {
            return activities.filter { $0.activityType == selectedType }
        } else {
            return activities
        }
    }
    
    private var groupedActivities: [String: [Activity]] {
        Dictionary(grouping: filteredActivities) { activity in
            let formatter = DateFormatter()
            formatter.dateFormat = "MMMM yyyy"
            return formatter.string(from: activity.startTime)
        }
    }
    
    private var sortedMonths: [String] {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMMM yyyy"
        
        return groupedActivities.keys.sorted { month1, month2 in
            if let date1 = formatter.date(from: month1), let date2 = formatter.date(from: month2) {
                return date1 > date2
            }
            return month1 > month2
        }
    }
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Activity type filter ribbon
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 12) {
                        FilterButton(
                            title: "All",
                            isSelected: selectedActivityType == nil,
                            action: { selectedActivityType = nil }
                        )
                        
                        FilterButton(
                            title: "Runs",
                            isSelected: selectedActivityType == .run,
                            action: { selectedActivityType = .run }
                        )
                        
                        FilterButton(
                            title: "Rides",
                            isSelected: selectedActivityType == .ride,
                            action: { selectedActivityType = .ride }
                        )
                        
                        FilterButton(
                            title: "Swims",
                            isSelected: selectedActivityType == .swim,
                            action: { selectedActivityType = .swim }
                        )
                        
                        FilterButton(
                            title: "Walks",
                            isSelected: selectedActivityType == .walk,
                            action: { selectedActivityType = .walk }
                        )
                        
                        FilterButton(
                            title: "Other",
                            isSelected: selectedActivityType == .other,
                            action: { selectedActivityType = .other }
                        )
                    }
                    .padding(.horizontal)
                    .padding(.vertical, 8)
                }
                .background(Color(.systemGroupedBackground))
                
                if filteredActivities.isEmpty {
                    ContentUnavailableView(
                        "No Activities",
                        systemImage: "figure.run",
                        description: Text("You don't have any activities of this type.")
                    )
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    List {
                        ForEach(sortedMonths, id: \.self) { month in
                            Section(header: Text(month)) {
                                ForEach(groupedActivities[month] ?? []) { activity in
                                    ActivityRow(activity: activity)
                                        .contentShape(Rectangle())
                                        .onTapGesture {
                                            selectedActivity = activity
                                            showingDetailView = true
                                        }
                                }
                            }
                        }
                    }
                    .listStyle(.insetGrouped)
                }
            }
            .navigationTitle("Training Log")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showingCreateActivityView = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
                
                ToolbarItem(placement: .navigationBarLeading) {
                    Button {
                        showingFilterView = true
                    } label: {
                        Image(systemName: "line.3.horizontal.decrease.circle")
                            .foregroundColor(selectedActivityType != nil ? .accentColor : .primary)
                    }
                }
            }
            .sheet(isPresented: $showingFilterView) {
                FilterView(selectedActivityType: $selectedActivityType)
            }
            .sheet(isPresented: $showingCreateActivityView) {
                CreateActivityView(isPresented: $showingCreateActivityView, onSave: { newActivity in
                    activities.append(newActivity)
                })
            }
            .sheet(item: $selectedActivity) { activity in
                NavigationStack {
                    ActivityDetailView(activity: activity)
                        .toolbar {
                            ToolbarItem(placement: .navigationBarLeading) {
                                Button("Close") {
                                    selectedActivity = nil
                                }
                            }
                        }
                }
            }
        }
    }
}

// MARK: - ActivityRow
struct ActivityRow: View {
    let activity: Activity
    
    private var activityIcon: String {
        switch activity.activityType {
        case .run:
            return "figure.run"
        case .ride:
            return "figure.outdoor.cycle"
        case .swim:
            return "figure.pool.swim"
        case .walk:
            return "figure.walk"
        case .other:
            return "figure.strengthtraining.traditional"
        }
    }
    
    private var activityColor: Color {
        switch activity.activityType {
        case .run:
            return .blue
        case .ride:
            return .orange
        case .swim:
            return .cyan
        case .walk:
            return .green
        case .other:
            return .purple
        }
    }
    
    var body: some View {
        HStack(spacing: 12) {
            // Activity icon
            ZStack {
                Circle()
                    .fill(activityColor.opacity(0.2))
                    .frame(width: 44, height: 44)
                
                Image(systemName: activityIcon)
                    .font(.system(size: 20))
                    .foregroundColor(activityColor)
            }
            
            // Activity details
            VStack(alignment: .leading, spacing: 4) {
                Text(activity.name)
                    .font(.headline)
                    .foregroundColor(.primary)
                
                Text(formatDate(activity.startTime))
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                HStack(spacing: 12) {
                    // Distance
                    if activity.distance > 0 {
                        StatView(
                            value: formatDistance(activity.distance),
                            label: "Distance"
                        )
                    }
                    
                    // Time
                    StatView(
                        value: formatDuration(activity.movingTimeSeconds),
                        label: "Time"
                    )
                    
                    // Pace (only for run, walk)
                    if [ActivityType.run, ActivityType.walk].contains(activity.activityType) && activity.distance > 0 {
                        StatView(
                            value: formatPace(activity.averagePaceSecondsPerKm),
                            label: "Pace"
                        )
                    }
                    
                    // Speed (only for bike, swim)
                    if [ActivityType.ride, ActivityType.swim].contains(activity.activityType) && activity.distance > 0 {
                        StatView(
                            value: String(format: "%.1f km/h", activity.averageSpeedKph),
                            label: "Speed"
                        )
                    }
                }
            }
            
            Spacer()
            
            Image(systemName: "chevron.right")
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(.secondary)
        }
        .padding(.vertical, 4)
    }
    
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "E, MMM d · h:mm a"
        return formatter.string(from: date)
    }
    
    private func formatDistance(_ distanceMeters: Double) -> String {
        if distanceMeters >= 1000 {
            return String(format: "%.1f km", distanceMeters / 1000)
        } else {
            return String(format: "%d m", Int(distanceMeters))
        }
    }
    
    private func formatDuration(_ seconds: Int) -> String {
        let hours = seconds / 3600
        let minutes = (seconds % 3600) / 60
        
        if hours > 0 {
            return String(format: "%d:%02d h", hours, minutes)
        } else {
            return String(format: "%d min", minutes)
        }
    }
    
    private func formatPace(_ secondsPerKm: Int) -> String {
        let minutes = secondsPerKm / 60
        let seconds = secondsPerKm % 60
        return String(format: "%d:%02d /km", minutes, seconds)
    }
}

// MARK: - StatView
struct StatView: View {
    let value: String
    let label: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(value)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.primary)
            
            Text(label)
                .font(.system(size: 12))
                .foregroundColor(.secondary)
        }
    }
}

// MARK: - FilterButton
struct FilterButton: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 14, weight: isSelected ? .semibold : .regular))
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(
                    Capsule()
                        .fill(isSelected ? Color.accentColor : Color.gray.opacity(0.1))
                )
                .foregroundColor(isSelected ? .white : .primary)
        }
    }
}

// MARK: - FilterView
struct FilterView: View {
    @Binding var selectedActivityType: ActivityType?
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationStack {
            List {
                Section {
                    Button {
                        selectedActivityType = nil
                        dismiss()
                    } label: {
                        HStack {
                            Text("All Activities")
                            Spacer()
                            if selectedActivityType == nil {
                                Image(systemName: "checkmark")
                                    .foregroundColor(.accentColor)
                            }
                        }
                    }
                    
                    Button {
                        selectedActivityType = .run
                        dismiss()
                    } label: {
                        HStack {
                            Label("Runs", systemImage: "figure.run")
                            Spacer()
                            if selectedActivityType == .run {
                                Image(systemName: "checkmark")
                                    .foregroundColor(.accentColor)
                            }
                        }
                    }
                    
                    Button {
                        selectedActivityType = .ride
                        dismiss()
                    } label: {
                        HStack {
                            Label("Rides", systemImage: "figure.outdoor.cycle")
                            Spacer()
                            if selectedActivityType == .ride {
                                Image(systemName: "checkmark")
                                    .foregroundColor(.accentColor)
                            }
                        }
                    }
                    
                    Button {
                        selectedActivityType = .swim
                        dismiss()
                    } label: {
                        HStack {
                            Label("Swims", systemImage: "figure.pool.swim")
                            Spacer()
                            if selectedActivityType == .swim {
                                Image(systemName: "checkmark")
                                    .foregroundColor(.accentColor)
                            }
                        }
                    }
                    
                    Button {
                        selectedActivityType = .walk
                        dismiss()
                    } label: {
                        HStack {
                            Label("Walks", systemImage: "figure.walk")
                            Spacer()
                            if selectedActivityType == .walk {
                                Image(systemName: "checkmark")
                                    .foregroundColor(.accentColor)
                            }
                        }
                    }
                    
                    Button {
                        selectedActivityType = .other
                        dismiss()
                    } label: {
                        HStack {
                            Label("Other", systemImage: "figure.strengthtraining.traditional")
                            Spacer()
                            if selectedActivityType == .other {
                                Image(systemName: "checkmark")
                                    .foregroundColor(.accentColor)
                            }
                        }
                    }
                } header: {
                    Text("Filter by Activity Type")
                }
            }
            .navigationTitle("Filters")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
        .presentationDetents([.medium])
    }
}

// MARK: - Previews
struct TrainingLogView_Previews: PreviewProvider {
    static var previews: some View {
        TrainingLogView()
    }
} 