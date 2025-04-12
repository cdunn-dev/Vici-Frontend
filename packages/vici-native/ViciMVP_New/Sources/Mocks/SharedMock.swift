import Foundation
import SwiftUI
import Combine

// MARK: - Mock API Service
class MockAPIService {
    static let shared = MockAPIService()
    
    private init() {}
    
    // Simulate network delay
    private func simulateNetworkDelay() -> TimeInterval {
        return TimeInterval.random(in: 0.5...1.5)
    }
    
    // MARK: Authentication API
    func login(email: String, password: String) -> AnyPublisher<User, Error> {
        return Future<User, Error> { promise in
            // Simulate API call delay
            DispatchQueue.main.asyncAfter(deadline: .now() + self.simulateNetworkDelay()) {
                // Simple validation
                if email.isEmpty || password.isEmpty {
                    promise(.failure(MockAPIError.invalidCredentials))
                    return
                }
                
                // For demo, any non-empty credentials work
                promise(.success(User.current))
            }
        }.eraseToAnyPublisher()
    }
    
    func register(email: String, password: String, name: String) -> AnyPublisher<User, Error> {
        return Future<User, Error> { promise in
            // Simulate API call delay
            DispatchQueue.main.asyncAfter(deadline: .now() + self.simulateNetworkDelay()) {
                // Simple validation
                if email.isEmpty || password.isEmpty {
                    promise(.failure(MockAPIError.invalidCredentials))
                    return
                }
                
                // For demo, any non-empty credentials work
                var newUser = User.current
                newUser.email = email
                newUser.name = name.isEmpty ? "New Runner" : name
                
                promise(.success(newUser))
            }
        }.eraseToAnyPublisher()
    }
    
    // MARK: Training Plan API
    func getCurrentPlan() -> AnyPublisher<TrainingPlan?, Error> {
        return Future<TrainingPlan?, Error> { promise in
            DispatchQueue.main.asyncAfter(deadline: .now() + self.simulateNetworkDelay()) {
                promise(.success(TrainingPlan.mockCurrentPlan))
            }
        }.eraseToAnyPublisher()
    }
    
    func getTodaysWorkout() -> AnyPublisher<Workout?, Error> {
        return Future<Workout?, Error> { promise in
            DispatchQueue.main.asyncAfter(deadline: .now() + self.simulateNetworkDelay()) {
                let today = Date()
                let workouts = TrainingPlan.mockCurrentPlan.currentWeekWorkouts
                let todaysWorkout = workouts.first(where: { Calendar.current.isDate($0.date, inSameDayAs: today) })
                promise(.success(todaysWorkout))
            }
        }.eraseToAnyPublisher()
    }
    
    // Add more mock API methods as needed for other MVP features
}

// MARK: - Error Types
enum MockAPIError: Error, LocalizedError {
    case invalidCredentials
    case networkError
    case notFound
    case serverError
    
    var errorDescription: String? {
        switch self {
        case .invalidCredentials:
            return "Invalid email or password."
        case .networkError:
            return "Network error. Please check your connection."
        case .notFound:
            return "The requested resource was not found."
        case .serverError:
            return "Server error. Please try again later."
        }
    }
}

// MARK: - Enhanced Authentication Service
class AuthenticationService: ObservableObject {
    @Published var currentUser: User?
    @Published var isAuthenticated = false
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private var cancellables = Set<AnyCancellable>()
    private let apiService = MockAPIService.shared
    
    // For persistent login
    private let userDefaultsKey = "vici.currentUser"
    
    init() {
        // Check for saved user
        loadSavedUser()
    }
    
    private func loadSavedUser() {
        // In a real app, you'd use Keychain for sensitive data
        if let userData = UserDefaults.standard.data(forKey: userDefaultsKey),
           let user = try? JSONDecoder().decode(User.self, from: userData) {
            self.currentUser = user
            self.isAuthenticated = true
        }
    }
    
    private func saveUser(_ user: User) {
        // In a real app, you'd use Keychain for sensitive data
        if let userData = try? JSONEncoder().encode(user) {
            UserDefaults.standard.set(userData, forKey: userDefaultsKey)
        }
    }
    
    func login(email: String, password: String) {
        isLoading = true
        errorMessage = nil
        
        apiService.login(email: email, password: password)
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { [weak self] completion in
                self?.isLoading = false
                if case .failure(let error) = completion {
                    self?.errorMessage = error.localizedDescription
                }
            }, receiveValue: { [weak self] user in
                self?.currentUser = user
                self?.isAuthenticated = true
                self?.saveUser(user)
            })
            .store(in: &cancellables)
    }
    
    func register(email: String, password: String, name: String = "") {
        isLoading = true
        errorMessage = nil
        
        apiService.register(email: email, password: password, name: name)
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { [weak self] completion in
                self?.isLoading = false
                if case .failure(let error) = completion {
                    self?.errorMessage = error.localizedDescription
                }
            }, receiveValue: { [weak self] user in
                self?.currentUser = user
                self?.isAuthenticated = true
                self?.saveUser(user)
            })
            .store(in: &cancellables)
    }
    
    func logout() {
        currentUser = nil
        isAuthenticated = false
        UserDefaults.standard.removeObject(forKey: userDefaultsKey)
    }
}

// MARK: - Training Plan Service
class TrainingPlanService: ObservableObject {
    @Published var currentPlan: TrainingPlan?
    @Published var todaysWorkout: Workout?
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private var cancellables = Set<AnyCancellable>()
    private let apiService = MockAPIService.shared
    
    func fetchCurrentPlan() {
        isLoading = true
        errorMessage = nil
        
        apiService.getCurrentPlan()
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { [weak self] completion in
                self?.isLoading = false
                if case .failure(let error) = completion {
                    self?.errorMessage = error.localizedDescription
                }
            }, receiveValue: { [weak self] plan in
                self?.currentPlan = plan
            })
            .store(in: &cancellables)
    }
    
    func fetchTodaysWorkout() {
        isLoading = true
        errorMessage = nil
        
        apiService.getTodaysWorkout()
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { [weak self] completion in
                self?.isLoading = false
                if case .failure(let error) = completion {
                    self?.errorMessage = error.localizedDescription
                }
            }, receiveValue: { [weak self] workout in
                self?.todaysWorkout = workout
            })
            .store(in: &cancellables)
    }
}

// Extensions to make enums Codable
extension Gender: Codable {}
extension ExperienceLevel: Codable {}

// Extension to make User Codable
extension User: Codable {
    enum CodingKeys: String, CodingKey {
        case id, email, name, profilePictureUrl, dateOfBirth, gender, experienceLevel, currentFitnessLevel, personalBests, isStravaConnected
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        email = try container.decode(String.self, forKey: .email)
        name = try container.decode(String.self, forKey: .name)
        profilePictureUrl = try container.decodeIfPresent(String.self, forKey: .profilePictureUrl)
        dateOfBirth = try container.decodeIfPresent(Date.self, forKey: .dateOfBirth)
        gender = try container.decode(Gender.self, forKey: .gender)
        experienceLevel = try container.decode(ExperienceLevel.self, forKey: .experienceLevel)
        currentFitnessLevel = try container.decode(Double.self, forKey: .currentFitnessLevel)
        personalBests = try container.decode([PersonalBest].self, forKey: .personalBests)
        isStravaConnected = try container.decode(Bool.self, forKey: .isStravaConnected)
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encode(email, forKey: .email)
        try container.encode(name, forKey: .name)
        try container.encodeIfPresent(profilePictureUrl, forKey: .profilePictureUrl)
        try container.encodeIfPresent(dateOfBirth, forKey: .dateOfBirth)
        try container.encode(gender, forKey: .gender)
        try container.encode(experienceLevel, forKey: .experienceLevel)
        try container.encode(currentFitnessLevel, forKey: .currentFitnessLevel)
        try container.encode(personalBests, forKey: .personalBests)
        try container.encode(isStravaConnected, forKey: .isStravaConnected)
    }
} 