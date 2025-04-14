import Foundation
import Combine

class TrainingLogViewModel: ObservableObject {
    @Published var activities: [Activity] = []
    @Published var isLoading = false
    @Published var isLoadingMore = false
    @Published var errorMessage: String?
    @Published var hasMoreActivities = true
    
    private var cancellables = Set<AnyCancellable>()
    private var currentPage = 1
    private let pageSize = 10
    
    init() {
        // For preview/testing, load mock data
        #if DEBUG
        if ProcessInfo.processInfo.environment["XCODE_RUNNING_FOR_PREVIEWS"] == "1" {
            self.activities = Activity.mockData
        }
        #endif
    }
    
    func loadActivities() {
        guard !isLoading else { return }
        
        isLoading = true
        errorMessage = nil
        currentPage = 1
        
        // In a real implementation, this would be an API call
        // For now, using a delay to simulate network request
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) { [weak self] in
            guard let self = self else { return }
            
            // For development/testing purposes, use mock data
            self.activities = Activity.mockData
            self.isLoading = false
            self.hasMoreActivities = false  // Set to true when implementing real pagination
        }
    }
    
    func loadMoreActivities() {
        guard !isLoading && !isLoadingMore && hasMoreActivities else { return }
        
        isLoadingMore = true
        currentPage += 1
        
        // In a real implementation, this would fetch the next page of activities
        // For now, using a delay to simulate network request
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) { [weak self] in
            guard let self = self else { return }
            
            // When implementing real pagination, add more activities here
            // For now, simulate no more activities
            self.isLoadingMore = false
            self.hasMoreActivities = false
        }
    }
    
    // Helper methods for formatting
    func formatDuration(_ seconds: Int) -> String {
        let hours = seconds / 3600
        let minutes = (seconds % 3600) / 60
        let remainingSeconds = seconds % 60
        
        if hours > 0 {
            return String(format: "%d:%02d:%02d", hours, minutes, remainingSeconds)
        } else {
            return String(format: "%d:%02d", minutes, remainingSeconds)
        }
    }
    
    func formatDistance(_ meters: Double) -> String {
        let kilometers = meters / 1000
        return String(format: "%.2f km", kilometers)
    }
    
    func formatPace(_ secondsPerKm: Double) -> String {
        let minutes = Int(secondsPerKm) / 60
        let seconds = Int(secondsPerKm) % 60
        return String(format: "%d:%02d /km", minutes, seconds)
    }
    
    func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}

struct ActivityResponse: Codable {
    let activities: [Activity]
    let totalCount: Int
} 