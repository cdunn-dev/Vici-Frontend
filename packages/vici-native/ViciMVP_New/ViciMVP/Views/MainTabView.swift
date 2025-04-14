import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var trainingViewModel = TrainingViewModel()
    
    var body: some View {
        TabView {
            HomeView()
                .environmentObject(trainingViewModel)
                .tabItem {
                    Label("Home", systemImage: "house")
                }
            
            TrainingPlansView()
                .environmentObject(trainingViewModel)
                .tabItem {
                    Label("Training", systemImage: "figure.run")
                }
            
            ProfileView()
                .environmentObject(authViewModel)
                .tabItem {
                    Label("Profile", systemImage: "person")
                }
        }
    }
}

class TrainingViewModel: ObservableObject {
    @Published var trainingPlans: [TrainingPlan] = []
    @Published var currentWorkout: Workout?
    private let trainingService = TrainingService.shared
    
    init() {
        Task {
            await loadTrainingPlans()
        }
    }
    
    func loadTrainingPlans() async {
        do {
            let plans = try await trainingService.getTrainingPlans()
            DispatchQueue.main.async {
                self.trainingPlans = plans
            }
        } catch {
            print("Failed to load training plans: \(error)")
        }
    }
    
    func startWorkout(id: String) async {
        do {
            let workout = try await trainingService.startWorkout(workoutId: id)
            DispatchQueue.main.async {
                self.currentWorkout = workout
            }
        } catch {
            print("Failed to start workout: \(error)")
        }
    }
}

struct MainTabView_Previews: PreviewProvider {
    static var previews: some View {
        MainTabView()
            .environmentObject(AuthViewModel())
    }
} 