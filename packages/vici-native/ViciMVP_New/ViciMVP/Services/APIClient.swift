import Foundation

enum HTTPMethod: String {
    case get = "GET"
    case post = "POST"
    case put = "PUT"
    case delete = "DELETE"
}

enum APIError: Error {
    case invalidURL
    case requestFailed(Error)
    case invalidResponse
    case decodingFailed(Error)
    case unauthorized
    case serverError(Int, String)
    case unexpectedError
}

class APIClient {
    static let shared = APIClient()
    
    private let baseURL = "https://api.vici.fit/v1"
    private let session = URLSession.shared
    private let jsonDecoder = JSONDecoder()
    
    private var authToken: String?
    
    init() {
        self.jsonDecoder.keyDecodingStrategy = .convertFromSnakeCase
        self.jsonDecoder.dateDecodingStrategy = .iso8601
    }
    
    func setAuthToken(_ token: String?) {
        self.authToken = token
    }
    
    func request<T: Decodable>(endpoint: String, method: HTTPMethod, parameters: [String: Any]? = nil) async throws -> T {
        guard let url = URL(string: "\(baseURL)/\(endpoint)") else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method.rawValue
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // Add auth token if available
        if let token = authToken {
            request.addValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        // Add body for POST/PUT requests
        if let parameters = parameters, (method == .post || method == .put) {
            do {
                request.httpBody = try JSONSerialization.data(withJSONObject: parameters, options: [])
            } catch {
                throw APIError.requestFailed(error)
            }
        }
        
        do {
            let (data, response) = try await session.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                throw APIError.invalidResponse
            }
            
            switch httpResponse.statusCode {
            case 200...299:
                do {
                    return try jsonDecoder.decode(T.self, from: data)
                } catch {
                    print("Decoding error: \(error)")
                    throw APIError.decodingFailed(error)
                }
            case 401:
                throw APIError.unauthorized
            default:
                let errorMessage = String(data: data, encoding: .utf8) ?? "Unknown error"
                throw APIError.serverError(httpResponse.statusCode, errorMessage)
            }
        } catch let urlError as URLError {
            throw APIError.requestFailed(urlError)
        } catch {
            if let apiError = error as? APIError {
                throw apiError
            }
            throw APIError.unexpectedError
        }
    }
    
    // Helper methods for common operations
    
    func get<T: Decodable>(endpoint: String) async throws -> T {
        return try await request(endpoint: endpoint, method: .get)
    }
    
    func post<T: Decodable>(endpoint: String, parameters: [String: Any]? = nil) async throws -> T {
        return try await request(endpoint: endpoint, method: .post, parameters: parameters)
    }
    
    func put<T: Decodable>(endpoint: String, parameters: [String: Any]? = nil) async throws -> T {
        return try await request(endpoint: endpoint, method: .put, parameters: parameters)
    }
    
    func delete<T: Decodable>(endpoint: String) async throws -> T {
        return try await request(endpoint: endpoint, method: .delete)
    }
}
