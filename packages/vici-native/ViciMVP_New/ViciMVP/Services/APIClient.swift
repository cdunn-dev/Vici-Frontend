import Foundation

/// Error types that can occur during API operations
enum APIError: Error, LocalizedError {
    case invalidURL
    case networkError(Error)
    case invalidResponse
    case decodingError(String)
    case serverError(Int, String)
    case unauthorized
    case notFound
    case unknown
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        case .invalidResponse:
            return "Invalid server response"
        case .decodingError(let message):
            return "Data decoding error: \(message)"
        case .serverError(let statusCode, let message):
            return "Server error (\(statusCode)): \(message)"
        case .unauthorized:
            return "Unauthorized access"
        case .notFound:
            return "Resource not found"
        case .unknown:
            return "Unknown error occurred"
        }
    }
}

/// HTTP methods supported by the API client
enum HTTPMethod: String {
    case get = "GET"
    case post = "POST"
    case put = "PUT"
    case patch = "PATCH"
    case delete = "DELETE"
}

/// APIClient for making HTTP requests to the Vici backend API
class APIClient {
    // MARK: - Properties
    
    /// Singleton instance
    static let shared = APIClient()
    
    /// Base URL for the API
    private let baseURL: URL
    
    /// Shared URLSession for network requests
    private let session: URLSession
    
    /// JSON decoder for response parsing
    private let decoder: JSONDecoder
    
    /// JSON encoder for request body creation
    private let encoder: JSONEncoder
    
    /// Environment-specific configuration
    private let environment: Environment
    
    /// Environment configuration
    enum Environment {
        case development
        case staging
        case production
        
        var baseURLString: String {
            switch self {
            case .development:
                return "http://localhost:3000/api"
            case .staging:
                return "https://api-staging.vici.ai/api"
            case .production:
                return "https://api.vici.ai/api"
            }
        }
    }
    
    // MARK: - Initialization
    
    /// Initialize with the environment and optional custom session
    init(environment: Environment = .development, session: URLSession = .shared) {
        self.environment = environment
        guard let url = URL(string: environment.baseURLString) else {
            fatalError("Invalid base URL: \(environment.baseURLString)")
        }
        self.baseURL = url
        self.session = session
        
        // Configure JSON decoder
        self.decoder = JSONDecoder()
        self.decoder.keyDecodingStrategy = .convertFromSnakeCase
        self.decoder.dateDecodingStrategy = .iso8601
        
        // Configure JSON encoder
        self.encoder = JSONEncoder()
        self.encoder.keyEncodingStrategy = .convertToSnakeCase
        self.encoder.dateEncodingStrategy = .iso8601
    }
    
    // MARK: - General Request Method
    
    /// Makes an HTTP request with the specified parameters using async/await
    @discardableResult
    func request<T: Decodable>(
        endpoint: String,
        method: HTTPMethod,
        parameters: [String: Any]? = nil,
        body: Any? = nil,
        headers: [String: String]? = nil
    ) async throws -> T {
        // Create URL with query parameters if necessary
        let url: URL
        
        if let parameters = parameters, !parameters.isEmpty, method == .get {
            var components = URLComponents(url: baseURL.appendingPathComponent(endpoint), resolvingAgainstBaseURL: true)
            components?.queryItems = parameters.map { key, value in
                URLQueryItem(name: key, value: String(describing: value))
            }
            
            guard let componentURL = components?.url else {
                throw APIError.invalidURL
            }
            url = componentURL
        } else {
            url = baseURL.appendingPathComponent(endpoint)
        }
        
        // Create request
        var request = URLRequest(url: url)
        request.httpMethod = method.rawValue
        
        // Add headers
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        headers?.forEach { key, value in
            request.setValue(value, forHTTPHeaderField: key)
        }
        
        // Add body if provided
        if let body = body, method != .get {
            do {
                if let encodableBody = body as? Encodable {
                    request.httpBody = try encoder.encode(encodableBody)
                } else {
                    request.httpBody = try JSONSerialization.data(withJSONObject: body)
                }
            } catch {
                throw APIError.decodingError("Failed to encode request body: \(error.localizedDescription)")
            }
        }
        
        // Execute request
        do {
            let (data, response) = try await session.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                throw APIError.invalidResponse
            }
            
            // Handle HTTP status codes
            switch httpResponse.statusCode {
            case 200...299:
                // Success
                do {
                    if T.self == Data.self {
                        return data as! T
                    } else if T.self == String.self {
                        return String(data: data, encoding: .utf8) as! T
                    } else if T.self == [String: Any].self {
                        guard let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
                            throw APIError.decodingError("Failed to parse JSON response")
                        }
                        return json as! T
                    } else {
                        return try decoder.decode(T.self, from: data)
                    }
                } catch {
                    throw APIError.decodingError("Failed to decode response: \(error.localizedDescription)")
                }
                
            case 401:
                throw APIError.unauthorized
                
            case 404:
                throw APIError.notFound
                
            case 400...499:
                // Client error
                if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let message = json["message"] as? String {
                    throw APIError.serverError(httpResponse.statusCode, message)
                } else {
                    throw APIError.serverError(httpResponse.statusCode, "Client error")
                }
                
            case 500...599:
                // Server error
                if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let message = json["message"] as? String {
                    throw APIError.serverError(httpResponse.statusCode, message)
                } else {
                    throw APIError.serverError(httpResponse.statusCode, "Server error")
                }
                
            default:
                throw APIError.unknown
            }
        } catch let urlError as URLError {
            throw APIError.networkError(urlError)
        } catch let apiError as APIError {
            throw apiError
        } catch {
            throw APIError.unknown
        }
    }
    
    // MARK: - Convenience Methods
    
    /// GET request with typed response
    func get<T: Decodable>(endpoint: String, parameters: [String: Any]? = nil, headers: [String: String]? = nil) async throws -> T {
        return try await request(
            endpoint: endpoint,
            method: .get,
            parameters: parameters,
            headers: headers
        )
    }
    
    /// POST request with typed response
    func post<T: Decodable>(endpoint: String, body: Any? = nil, headers: [String: String]? = nil) async throws -> T {
        return try await request(
            endpoint: endpoint,
            method: .post,
            body: body,
            headers: headers
        )
    }
    
    /// PUT request with typed response
    func put<T: Decodable>(endpoint: String, body: Any? = nil, headers: [String: String]? = nil) async throws -> T {
        return try await request(
            endpoint: endpoint,
            method: .put,
            body: body,
            headers: headers
        )
    }
    
    /// PATCH request with typed response
    func patch<T: Decodable>(endpoint: String, body: Any? = nil, headers: [String: String]? = nil) async throws -> T {
        return try await request(
            endpoint: endpoint,
            method: .patch,
            body: body,
            headers: headers
        )
    }
    
    /// DELETE request with typed response
    func delete<T: Decodable>(endpoint: String, headers: [String: String]? = nil) async throws -> T {
        return try await request(
            endpoint: endpoint,
            method: .delete,
            headers: headers
        )
    }
} 