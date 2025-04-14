import Foundation

// APIClient: Handles all API requests to the backend
class APIClient {
    // MARK: - Properties
    
    private let baseURL: URL
    private var authToken: String?
    
    // MARK: - Initialization
    
    init(baseURL: String = "http://localhost:3000/api") {
        if let url = URL(string: baseURL) {
            self.baseURL = url
        } else {
            fatalError("Invalid base URL: \(baseURL)")
        }
    }
    
    // MARK: - Authentication
    
    func login(email: String, password: String) async throws -> User {
        let loginData = ["email": email, "password": password]
        let response: AuthResponse = try await request(
            endpoint: "/auth/login",
            method: "POST",
            body: loginData
        )
        
        // Save auth token
        self.authToken = response.token
        
        // Return the user data
        return response.user
    }
    
    func register(email: String, password: String, name: String) async throws -> User {
        let registerData = ["email": email, "password": password, "name": name]
        let response: AuthResponse = try await request(
            endpoint: "/auth/register",
            method: "POST",
            body: registerData
        )
        
        // Save auth token
        self.authToken = response.token
        
        // Return the user data
        return response.user
    }
    
    func getUserProfile() async throws -> User {
        let response: UserResponse = try await request(endpoint: "/users/profile", 
                                                     method: "GET",
                                                     requiresAuth: true)
        return response.data
    }
    
    // MARK: - Strava Integration
    
    func getStravaConnectURL() async throws -> String {
        let response: StravaURLResponse = try await request(endpoint: "/integrations/strava/connect", 
                                                           method: "GET",
                                                           requiresAuth: true)
        return response.url
    }
    
    // MARK: - Training Plans
    
    func getActivePlan() async throws -> TrainingPlan? {
        let response: TrainingPlanResponse = try await request(endpoint: "/training-plans/active", 
                                                             method: "GET",
                                                             requiresAuth: true)
        return response.data
    }
    
    func createTrainingPlan(goal: Goal, preferences: PlanPreferences) async throws -> TrainingPlan {
        let planData: [String: Any] = [
            "goal": [
                "type": goal.type.rawValue,
                "raceName": goal.raceName as Any,
                "distanceMeters": goal.distance as Any,
                "raceDate": goal.date?.ISO8601Format() as Any,
                "previousPbSeconds": goal.previousPb as Any,
                "goalTimeSeconds": goal.goalTime as Any
            ],
            "preferences": [
                "targetWeeklyDistanceMeters": preferences.targetWeeklyDistance,
                "runningDaysPerWeek": preferences.runningDaysPerWeek,
                "qualityWorkoutsPerWeek": preferences.qualityWorkoutsPerWeek,
                "preferredLongRunDay": preferences.preferredLongRunDay.rawValue,
                "coachingStyle": preferences.coachingStyle.rawValue
            ]
        ]
        
        let response: TrainingPlanResponse = try await request(
            endpoint: "/training-plans",
            method: "POST",
            body: planData,
            requiresAuth: true
        )
        
        return response.data
    }
    
    func approvePlan(planId: String) async throws -> TrainingPlan {
        let response: TrainingPlanResponse = try await request(
            endpoint: "/training-plans/\(planId)/approve",
            method: "POST",
            requiresAuth: true
        )
        
        return response.data
    }
    
    func askVici(planId: String, query: String) async throws -> ViciResponse {
        let askData = ["query": query]
        let response: AskViciResponse = try await request(
            endpoint: "/training-plans/\(planId)/ask-vici",
            method: "POST",
            body: askData,
            requiresAuth: true
        )
        
        return response.data
    }
    
    // MARK: - Activities
    
    func getActivities(limit: Int = 20, page: Int = 1) async throws -> [Activity] {
        let response: ActivitiesResponse = try await request(
            endpoint: "/activities?limit=\(limit)&page=\(page)",
            method: "GET",
            requiresAuth: true
        )
        
        return response.data
    }
    
    // MARK: - Generic Request Method
    
    private func request<T: Decodable>(endpoint: String, 
                                      method: String, 
                                      body: Any? = nil, 
                                      requiresAuth: Bool = false) async throws -> T {
        
        // Create URL from endpoint
        guard let url = URL(string: endpoint, relativeTo: baseURL) else {
            throw APIError.invalidURL
        }
        
        // Create URLRequest
        var request = URLRequest(url: url)
        request.httpMethod = method
        
        // Add auth token if required
        if requiresAuth {
            guard let token = authToken else {
                throw APIError.unauthorized
            }
            request.addValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        // Add body if provided
        if let body = body {
            request.addValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
        }
        
        // Make the request
        let (data, response) = try await URLSession.shared.data(for: request)
        
        // Check for HTTP errors
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        // Handle errors based on status code
        switch httpResponse.statusCode {
        case 200..<300:
            // Success - continue to parse response
            break
        case 401:
            throw APIError.unauthorized
        case 404:
            throw APIError.notFound
        default:
            throw APIError.serverError(statusCode: httpResponse.statusCode)
        }
        
        // Parse and return response data
        do {
            return try JSONDecoder().decode(T.self, from: data)
        } catch {
            throw APIError.decodingError(error: error)
        }
    }
}

// MARK: - API Response Structs

struct AuthResponse: Decodable {
    let success: Bool
    let token: String
    let user: User
}

struct UserResponse: Decodable {
    let success: Bool
    let data: User
}

struct StravaURLResponse: Decodable {
    let success: Bool
    let url: String
}

struct TrainingPlanResponse: Decodable {
    let success: Bool
    let data: TrainingPlan
}

struct AskViciResponse: Decodable {
    let success: Bool
    let data: ViciResponse
    let message: String
}

struct ActivitiesResponse: Decodable {
    let success: Bool
    let data: [Activity]
    let pagination: Pagination?
}

struct Pagination: Decodable {
    let total: Int
    let page: Int
    let limit: Int
    let pages: Int
}

struct ViciResponse: Decodable {
    let answerText: String
    let hasStructuredChanges: Bool
    let proposedChanges: ProposedChanges?
    let timestamp: String
}

struct ProposedChanges: Decodable {
    // Define the structure for proposed changes
    // This will depend on the actual response format from your API
    let adjustments: [String: Any]?
    
    // Custom decoding to handle dynamic values
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.adjustments = try container.decodeIfPresent([String: Any].self, forKey: .adjustments)
    }
    
    private enum CodingKeys: String, CodingKey {
        case adjustments
    }
}

// MARK: - API Errors

enum APIError: Error, LocalizedError {
    case invalidURL
    case networkError(Error)
    case invalidResponse
    case unauthorized
    case notFound
    case serverError(statusCode: Int)
    case decodingError(error: Error)
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        case .invalidResponse:
            return "Invalid response from server"
        case .unauthorized:
            return "Unauthorized. Please log in again."
        case .notFound:
            return "Resource not found"
        case .serverError(let code):
            return "Server error with status code: \(code)"
        case .decodingError(let error):
            return "Failed to decode response: \(error.localizedDescription)"
        }
    }
} 