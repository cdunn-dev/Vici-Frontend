import SwiftUI

struct TrainingLogView: View {
    @StateObject private var viewModel = TrainingLogViewModel()
    
    var body: some View {
        NavigationView {
            ZStack {
                if viewModel.isLoading && viewModel.activities.isEmpty {
                    ProgressView()
                        .scaleEffect(1.5)
                } else {
                    ScrollView {
                        LazyVStack(spacing: 16) {
                            ForEach(viewModel.activities) { activity in
                                NavigationLink(destination: ActivityDetailView(activity: activity)) {
                                    ActivityCard(activity: activity, viewModel: viewModel)
                                }
                                .buttonStyle(PlainButtonStyle())
                            }
                            
                            if viewModel.isLoadingMore {
                                ProgressView()
                                    .padding()
                            }
                            
                            if viewModel.hasMoreActivities && !viewModel.activities.isEmpty {
                                Color.clear
                                    .frame(height: 50)
                                    .onAppear {
                                        viewModel.loadMoreActivities()
                                    }
                            }
                        }
                        .padding()
                    }
                    .refreshable {
                        viewModel.loadActivities()
                    }
                }
                
                if let error = viewModel.error {
                    VStack {
                        Text("Error loading activities")
                            .font(.headline)
                        Text(error.localizedDescription)
                            .font(.subheadline)
                            .multilineTextAlignment(.center)
                        Button("Try Again") {
                            viewModel.loadActivities()
                        }
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(8)
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    .shadow(radius: 5)
                    .padding(.horizontal, 20)
                }
            }
            .navigationTitle("Training Log")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        // Action to add manual activity
                    }) {
                        Image(systemName: "plus.circle")
                            .font(.system(size: 20))
                    }
                }
            }
        }
    }
}

struct ActivityCard: View {
    let activity: Activity
    let viewModel: TrainingLogViewModel
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                activityTypeIcon
                    .font(.system(size: 18))
                    .foregroundColor(.blue)
                    .frame(width: 24, height: 24)
                
                Text(activity.name)
                    .font(.headline)
                
                Spacer()
                
                Text(formatDate(activity.startTime))
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            
            Divider()
            
            HStack(spacing: 16) {
                StatView(
                    icon: "ruler",
                    value: viewModel.formatDistance(activity.distance)
                )
                
                StatView(
                    icon: "clock",
                    value: viewModel.formatDuration(activity.movingTimeSeconds)
                )
                
                if activity.activityType == .run || activity.activityType == .walk {
                    StatView(
                        icon: "speedometer",
                        value: viewModel.formatPace(activity.averagePaceSecondsPerKm)
                    )
                }
                
                if activity.averageHeartRate > 0 {
                    StatView(
                        icon: "heart",
                        value: "\(Int(activity.averageHeartRate)) bpm"
                    )
                }
            }
            
            if let mapThumbnailUrl = activity.mapThumbnailUrl, !mapThumbnailUrl.isEmpty {
                // Placeholder for map thumbnail
                // In a real app, use AsyncImage to load the actual image
                Rectangle()
                    .fill(Color.gray.opacity(0.2))
                    .frame(height: 120)
                    .cornerRadius(8)
                    .overlay(
                        Text("Map Thumbnail")
                            .foregroundColor(.secondary)
                    )
            }
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(12)
    }
    
    private var activityTypeIcon: some View {
        switch activity.activityType {
        case .run:
            return Image(systemName: "figure.run")
        case .ride:
            return Image(systemName: "bicycle")
        case .swim:
            return Image(systemName: "figure.water.fitness")
        case .walk:
            return Image(systemName: "figure.walk")
        case .other:
            return Image(systemName: "figure.mixed.cardio")
        }
    }
    
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: date)
    }
}

struct StatView: View {
    let icon: String
    let value: String
    
    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
                .font(.system(size: 12))
                .foregroundColor(.blue)
            Text(value)
                .font(.subheadline)
        }
    }
}

struct ActivityDetailView: View {
    let activity: Activity
    
    var body: some View {
        Text("Activity Detail View - Coming Soon")
            .padding()
    }
}

struct TrainingLogView_Previews: PreviewProvider {
    static var previews: some View {
        TrainingLogView()
    }
} 