import SwiftUI
import MapKit
import Charts

struct ActivityDetailView: View {
    let activity: Activity
    @Environment(\.dismiss) private var dismiss
    @State private var showingShareSheet = false
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Header
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text(activity.name)
                            .font(.title)
                            .fontWeight(.bold)
                        
                        Spacer()
                        
                        Button(action: { showingShareSheet = true }) {
                            Image(systemName: "square.and.arrow.up")
                                .font(.title3)
                        }
                    }
                    
                    Text(formatDate(activity.startTime))
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    
                    if let description = activity.description, !description.isEmpty {
                        Text(description)
                            .font(.body)
                            .padding(.top, 4)
                    }
                }
                .padding(.horizontal)
                
                // Activity Type Badge
                HStack {
                    Label(
                        String(describing: activity.activityType).capitalized,
                        systemImage: activity.activityType.icon
                    )
                    .font(.subheadline)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(activityTypeColor(activity.activityType).opacity(0.2))
                    .foregroundColor(activityTypeColor(activity.activityType))
                    .cornerRadius(20)
                    
                    if let weather = activity.weather {
                        Label(
                            "\(Int(weather.temperatureCelsius))°C",
                            systemImage: weather.condition.icon
                        )
                        .font(.subheadline)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(Color.blue.opacity(0.1))
                        .foregroundColor(.blue)
                        .cornerRadius(20)
                    }
                    
                    Spacer()
                }
                .padding(.horizontal)
                
                // Stats Cards
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                    StatCard(title: "Distance", value: formatDistance(activity.distance), icon: "ruler")
                    StatCard(title: "Duration", value: formatDuration(activity.movingTimeSeconds), icon: "clock")
                    StatCard(title: "Calories", value: "\(activity.calories) kcal", icon: "flame")
                    
                    if let heartRate = activity.averageHeartRate {
                        StatCard(title: "Heart Rate", value: "\(heartRate) bpm", icon: "heart")
                    }
                    
                    if let elevation = activity.elevationGain {
                        StatCard(title: "Elevation", value: "\(Int(elevation)) m", icon: "mountain.2")
                    }
                    
                    StatCard(title: "Pace", value: formatPace(activity.movingTimeSeconds, activity.distance), icon: "speedometer")
                }
                .padding(.horizontal)
                
                // Heart Rate Chart (Mock data)
                VStack(alignment: .leading, spacing: 12) {
                    Text("Heart Rate")
                        .font(.headline)
                    
                    if activity.averageHeartRate != nil {
                        Chart {
                            ForEach(mockHeartRateData(), id: \.time) { dataPoint in
                                LineMark(
                                    x: .value("Time", dataPoint.time),
                                    y: .value("BPM", dataPoint.bpm)
                                )
                                .foregroundStyle(Color.red)
                                .interpolationMethod(.catmullRom)
                            }
                        }
                        .frame(height: 200)
                        .chartYScale(domain: 60...190)
                    } else {
                        Text("No heart rate data available")
                            .foregroundColor(.secondary)
                            .frame(maxWidth: .infinity, minHeight: 100)
                            .background(Color(.systemGray6))
                            .cornerRadius(12)
                    }
                }
                .padding(.horizontal)
                
                // Pace Chart (Mock data)
                VStack(alignment: .leading, spacing: 12) {
                    Text("Pace")
                        .font(.headline)
                    
                    Chart {
                        ForEach(mockPaceData(), id: \.km) { dataPoint in
                            BarMark(
                                x: .value("Kilometer", "Km \(dataPoint.km)"),
                                y: .value("Pace (min/km)", dataPoint.secPerKm / 60)
                            )
                            .foregroundStyle(activityTypeColor(activity.activityType))
                        }
                    }
                    .frame(height: 200)
                }
                .padding(.horizontal)
            }
            .padding(.vertical)
        }
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showingShareSheet) {
            ActivityShareSheet(activity: activity)
        }
    }
    
    // Helper methods
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE, MMM d, yyyy • h:mm a"
        return formatter.string(from: date)
    }
    
    private func formatDistance(_ distanceMeters: Double) -> String {
        let distanceKm = distanceMeters / 1000
        return String(format: "%.2f km", distanceKm)
    }
    
    private func formatDuration(_ seconds: Int) -> String {
        let hours = seconds / 3600
        let minutes = (seconds % 3600) / 60
        let remainingSeconds = seconds % 60
        
        if hours > 0 {
            return String(format: "%d:%02d:%02d", hours, minutes, remainingSeconds)
        } else {
            return String(format: "%d:%02d", minutes, remainingSeconds)
        }
    }
    
    private func formatPace(_ seconds: Int, _ distanceMeters: Double) -> String {
        let distanceKm = distanceMeters / 1000
        guard distanceKm > 0 else { return "-- /km" }
        
        let paceSecondsPerKm = Int(Double(seconds) / distanceKm)
        let paceMinutes = paceSecondsPerKm / 60
        let paceSeconds = paceSecondsPerKm % 60
        
        return String(format: "%d:%02d /km", paceMinutes, paceSeconds)
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
    
    // Mock data generators for charts
    private func mockHeartRateData() -> [(time: Double, bpm: Int)] {
        var data: [(time: Double, bpm: Int)] = []
        let baseHeartRate = activity.averageHeartRate ?? 150
        let duration = Double(activity.movingTimeSeconds)
        
        // Create points every 30 seconds
        for i in 0...Int(duration / 30) {
            let time = Double(i) * 30
            // Random variation around average heart rate
            let variation = Int.random(in: -15...15)
            let heartRate = baseHeartRate + variation
            data.append((time: time, bpm: heartRate))
        }
        
        return data
    }
    
    private func mockPaceData() -> [(km: Int, secPerKm: Int)] {
        var data: [(km: Int, secPerKm: Int)] = []
        let distanceKm = Int(activity.distance / 1000)
        let avgPaceSecondsPerKm = activity.movingTimeSeconds / max(1, distanceKm)
        
        for km in 1...max(1, distanceKm) {
            // Random variation around average pace
            let variation = Int.random(in: -30...30)
            let paceSecondsPerKm = avgPaceSecondsPerKm + variation
            data.append((km: km, secPerKm: paceSecondsPerKm))
        }
        
        return data
    }
}

struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(.blue)
                Text(title)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            
            Text(value)
                .font(.title3)
                .fontWeight(.semibold)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

struct ActivityShareSheet: View {
    let activity: Activity
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                Image(systemName: activity.activityType.icon)
                    .font(.system(size: 48))
                    .foregroundColor(.white)
                    .frame(width: 100, height: 100)
                    .background(activityTypeColor(activity.activityType))
                    .clipShape(Circle())
                
                VStack(spacing: 8) {
                    Text(activity.name)
                        .font(.title2)
                        .fontWeight(.bold)
                    
                    Text(formatDate(activity.startTime))
                        .foregroundColor(.secondary)
                }
                
                HStack(spacing: 30) {
                    VStack {
                        Text(formatDistance(activity.distance))
                            .font(.title3)
                            .fontWeight(.semibold)
                        Text("Distance")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    VStack {
                        Text(formatDuration(activity.movingTimeSeconds))
                            .font(.title3)
                            .fontWeight(.semibold)
                        Text("Time")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    VStack {
                        Text("\(activity.calories)")
                            .font(.title3)
                            .fontWeight(.semibold)
                        Text("Calories")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                Divider()
                    .padding(.vertical)
                
                VStack(alignment: .leading, spacing: 16) {
                    Text("Share with")
                        .font(.headline)
                    
                    HStack(spacing: 20) {
                        ShareButton(title: "Instagram", icon: "camera", color: .purple) {
                            print("Share to Instagram")
                            dismiss()
                        }
                        
                        ShareButton(title: "Messages", icon: "message", color: .green) {
                            print("Share via Messages")
                            dismiss()
                        }
                        
                        ShareButton(title: "Copy", icon: "doc.on.doc", color: .blue) {
                            print("Copy to clipboard")
                            dismiss()
                        }
                    }
                    .padding(.top, 8)
                }
                
                Spacer()
            }
            .padding()
            .navigationBarTitleDisplayMode(.inline)
            .navigationBarItems(trailing: Button("Done") { dismiss() })
        }
    }
    
    // Helper functions
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE, MMM d, yyyy"
        return formatter.string(from: date)
    }
    
    private func formatDistance(_ distanceMeters: Double) -> String {
        let distanceKm = distanceMeters / 1000
        return String(format: "%.2f km", distanceKm)
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
}

struct ShareButton: View {
    let title: String
    let icon: String
    let color: Color
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Circle()
                    .fill(color.opacity(0.2))
                    .frame(width: 60, height: 60)
                    .overlay(
                        Image(systemName: icon)
                            .font(.system(size: 24))
                            .foregroundColor(color)
                    )
                
                Text(title)
                    .font(.caption)
                    .foregroundColor(.primary)
            }
        }
    }
}

struct ActivityDetailView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationView {
            ActivityDetailView(activity: Activity.sampleRun)
        }
    }
} 