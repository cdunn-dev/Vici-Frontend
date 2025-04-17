import Foundation
import os.log

/// Generic API response structure
struct APIResponse<T: Decodable>: Decodable {
    let success: Bool
    let message: String?
    let data: T?
    let errors: [String]?
}

/// Dictionary response type for any JSON response
struct DictionaryResponse: Decodable {
    let dictionary: [String: AnyCodable]
    
    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        dictionary = try container.decode([String: AnyCodable].self)
    }
    
    subscript(key: String) -> Any? {
        return dictionary[key]?.value
    }
    
    var allKeys: [String] {
        return Array(dictionary.keys)
    }
}

/// A type that can hold any Codable value
struct AnyCodable: Codable {
    let value: Any
    
    init(_ value: Any) {
        self.value = value
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        
        if container.decodeNil() {
            self.value = NSNull()
        } else if let bool = try? container.decode(Bool.self) {
            self.value = bool
        } else if let int = try? container.decode(Int.self) {
            self.value = int
        } else if let double = try? container.decode(Double.self) {
            self.value = double
        } else if let string = try? container.decode(String.self) {
            self.value = string
        } else if let array = try? container.decode([AnyCodable].self) {
            self.value = array.map { $0.value }
        } else if let dictionary = try? container.decode([String: AnyCodable].self) {
            self.value = dictionary.mapValues { $0.value }
        } else {
            throw DecodingError.dataCorruptedError(in: container, debugDescription: "AnyCodable cannot decode value")
        }
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        
        switch value {
        case is NSNull:
            try container.encodeNil()
        case let bool as Bool:
            try container.encode(bool)
        case let int as Int:
            try container.encode(int)
        case let double as Double:
            try container.encode(double)
        case let string as String:
            try container.encode(string)
        case let array as [Any]:
            try container.encode(array.map { AnyCodable($0) })
        case let dictionary as [String: Any]:
            try container.encode(dictionary.mapValues { AnyCodable($0) })
        default:
            let context = EncodingError.Context(
                codingPath: container.codingPath,
                debugDescription: "AnyCodable cannot encode value \(value)"
            )
            throw EncodingError.invalidValue(value, context)
        }
    }
}

/// APIClient for making HTTP requests to the Vici backend API
class APIClient: APIClientProtocol {
    // MARK: - Properties
    
    /// Singleton instance
    static let shared = APIClient()
    
    /// Shared URLSession for network requests
    private let session: URLSession
    
    /// JSON decoder for response parsing
    private let decoder: JSONDecoder
    
    /// JSON encoder for request body creation
    private let encoder: JSONEncoder
    
    /// Environment-specific configuration
    private let environment: Environment
    
    /// Logger for API operations
    private let logger = Logger(subsystem: "com.vici.ViciMVP", category: "APIClient")
    
    /// Maximum number of retry attempts for recoverable errors
    private let maxRetries = 3
    
    /// Flag to prevent multiple simultaneous token refreshes
    private var isRefreshingToken = false
    
    /// Task to wait on if a token refresh is in progress
    private var refreshTask: Task<Void, Error>?
    
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
        self.session = session
        
        // Configure JSON decoder
        self.decoder = JSONDecoder()
        self.decoder.keyDecodingStrategy = .convertFromSnakeCase
        self.decoder.dateDecodingStrategy = .iso8601
        
        // Configure JSON encoder
        self.encoder = JSONEncoder()
        self.encoder.keyEncodingStrategy = .convertToSnakeCase
        self.encoder.dateEncodingStrategy = .iso8601
        
        logger.debug("Initialized APIClient with environment: \(String(describing: environment))")
    }
    
    // MARK: - General Request Method
    
    /// Makes an HTTP request with the specified parameters using async/await
    @discardableResult
    func request<T: Decodable>(
        endpoint: String,
        method: HTTPMethod,
        parameters: [String: Any]? = nil,
        body: Any? = nil,
        headers: [String: String]? = nil,
        retryCount: Int = 0
    ) async throws -> T {
        logger.debug("Starting API request: \(method.rawValue) \(endpoint) (attempt \(retryCount + 1))")
        
        // Create URL with query parameters if necessary
        let url: URL
        
        if let parameters = parameters, !parameters.isEmpty, method == .get {
            var components = URLComponents(url: URL(string: environment.baseURLString)!.appendingPathComponent(endpoint), resolvingAgainstBaseURL: true)
            components?.queryItems = parameters.map { key, value in
                URLQueryItem(name: key, value: String(describing: value))
            }
            
            guard let componentURL = components?.url else {
                logger.error("Failed to create URL with parameters")
                throw APIError.invalidURL
            }
            url = componentURL
            
            if let queryItems = components?.queryItems {
                logger.debug("Request parameters: \(queryItems.map { "\($0.name)=\($0.value ?? "")" }.joined(separator: ", "))")
            }
        } else {
            url = URL(string: environment.baseURLString)!.appendingPathComponent(endpoint)
        }
        
        logger.debug("Request URL: \(url)")
        
        // Create request
        var request = URLRequest(url: url)
        request.httpMethod = method.rawValue
        request.timeoutInterval = 30 // 30 second timeout
        
        // Add headers
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // Add Authorization header if token is available
        if let token = KeychainService.shared.getAccessToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
            logger.debug("Added Authorization token")
        } else {
            logger.debug("No Authorization token available")
        }
        
        headers?.forEach { key, value in
            request.setValue(value, forHTTPHeaderField: key)
            logger.debug("Added custom header: \(key)")
        }
        
        // Add body if provided
        if let body = body, method != .get {
            do {
                if let encodableBody = body as? Encodable {
                    request.httpBody = try encoder.encode(encodableBody)
                } else {
                    request.httpBody = try JSONSerialization.data(withJSONObject: body)
                }
                
                if let jsonObject = body as? [String: Any] {
                    logger.debug("Request body: \(jsonObject)")
                } else {
                    logger.debug("Request body included (not logged)")
                }
            } catch {
                logger.error("Failed to encode request body: \(error.localizedDescription)")
                throw APIError.decodingError(error.localizedDescription)
            }
        }
        
        // Execute request
        do {
            logger.debug("Executing request...")
            let (data, response) = try await session.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                logger.error("Invalid response type received")
                throw APIError.invalidResponse
            }
            
            logger.debug("Received response: HTTP \(httpResponse.statusCode)")
            
            // Handle HTTP status codes
            switch httpResponse.statusCode {
            case 200...299:
                // Success
                do {
                    if T.self == Data.self {
                        logger.debug("Returning raw data response")
                        return data as! T
                    } else if T.self == String.self {
                        let stringResponse = String(data: data, encoding: .utf8) ?? ""
                        logger.debug("Returning string response: \(stringResponse.prefix(100))...")
                        return stringResponse as! T
                    } else if T.self == DictionaryResponse.self {
                        let dictResponse = try decoder.decode(DictionaryResponse.self, from: data)
                        logger.debug("Returning dictionary response with keys: \(dictResponse.allKeys)")
                        return dictResponse as! T
                    } else {
                        let decodedResponse = try decoder.decode(T.self, from: data)
                        logger.debug("Successfully decoded response of type \(T.self)")
                        return decodedResponse
                    }
                } catch {
                    logger.error("Failed to decode response: \(error.localizedDescription)")
                    
                    // Log the raw response for debugging
                    if let responseString = String(data: data, encoding: .utf8) {
                        logger.debug("Raw response data: \(responseString.prefix(500))")
                    }
                    
                    throw APIError.decodingError(error.localizedDescription)
                }
                
            case 401:
                logger.error("Unauthorized: Access token may be invalid or expired")
                
                // Try to refresh the token if available and retry
                if retryCount == 0 {
                    do {
                        try await refreshTokenIfNeeded()
                        // Retry the request with the new token
                        return try await request(
                            endpoint: endpoint,
                            method: method,
                            parameters: parameters,
                            body: body,
                            headers: headers,
                            retryCount: retryCount + 1
                        )
                    } catch {
                        logger.error("Token refresh failed: \(error.localizedDescription)")
                        throw APIError.unauthorized
                    }
                } else {
                    throw APIError.unauthorized
                }
                
            case 404:
                logger.error("Resource not found: \(endpoint)")
                throw APIError.httpError(statusCode: 404, details: "Resource not found")
                
            case 429:
                // Rate limiting
                let retryAfter = httpResponse.value(forHTTPHeaderField: "Retry-After").flatMap { Double($0) }
                logger.error("Rate limited. Retry after: \(retryAfter ?? 0) seconds")
                throw APIError.rateLimited(retryAfter: retryAfter)
                
            case 400...499:
                // Client error
                if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
                    if let errors = json["errors"] as? [String] {
                        logger.error("Validation errors: \(errors)")
                        throw APIError.validationError(errors)
                    } else if let message = json["message"] as? String {
                        logger.error("Client error: \(message)")
                        throw APIError.httpError(statusCode: httpResponse.statusCode, details: message)
                    }
                }
                
                logger.error("Client error with status code \(httpResponse.statusCode)")
                throw APIError.httpError(statusCode: httpResponse.statusCode, details: nil)
                
            case 500...599:
                // Server error
                if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let message = json["message"] as? String {
                    logger.error("Server error: \(message)")
                    
                    // Retry for 5xx errors if we haven't exceeded max retries
                    if retryCount < self.maxRetries {
                        logger.debug("Retrying request after server error (attempt \(retryCount + 1)/\(self.maxRetries))")
                        
                        // Add exponential backoff
                        let delay = pow(2.0, Double(retryCount)) * 0.5
                        try await Task.sleep(nanoseconds: UInt64(delay * 1_000_000_000))
                        
                        return try await request(
                            endpoint: endpoint,
                            method: method,
                            parameters: parameters,
                            body: body,
                            headers: headers,
                            retryCount: retryCount + 1
                        )
                    }
                    
                    throw APIError.serverError(message)
                } else {
                    logger.error("Server error with status code \(httpResponse.statusCode)")
                    
                    // Retry for 5xx errors if we haven't exceeded max retries
                    if retryCount < self.maxRetries {
                        logger.debug("Retrying request after server error (attempt \(retryCount + 1)/\(self.maxRetries))")
                        
                        // Add exponential backoff
                        let delay = pow(2.0, Double(retryCount)) * 0.5
                        try await Task.sleep(nanoseconds: UInt64(delay * 1_000_000_000))
                        
                        return try await request(
                            endpoint: endpoint,
                            method: method,
                            parameters: parameters,
                            body: body,
                            headers: headers,
                            retryCount: retryCount + 1
                        )
                    }
                    
                    throw APIError.serverError("Server error with status code \(httpResponse.statusCode)")
                }
                
            default:
                logger.error("Unexpected HTTP status code: \(httpResponse.statusCode)")
                throw APIError.httpError(statusCode: httpResponse.statusCode, details: nil)
            }
        } catch let urlError as URLError {
            // Handle specific URLError cases
            switch urlError.code {
            case .notConnectedToInternet, .networkConnectionLost:
                logger.error("Connection error: \(urlError.localizedDescription)")
                
                if retryCount < self.maxRetries {
                    logger.debug("Retrying request after connection error (attempt \(retryCount + 1)/\(self.maxRetries))")
                    
                    // Add exponential backoff
                    let delay = pow(2.0, Double(retryCount)) * 0.5
                    try await Task.sleep(nanoseconds: UInt64(delay * 1_000_000_000))
                    
                    return try await request(
                        endpoint: endpoint,
                        method: method,
                        parameters: parameters,
                        body: body,
                        headers: headers,
                        retryCount: retryCount + 1
                    )
                }
                
                throw APIError.connectionError
                
            case .timedOut:
                logger.error("Request timed out: \(urlError.localizedDescription)")
                
                if retryCount < self.maxRetries {
                    logger.debug("Retrying request after timeout (attempt \(retryCount + 1)/\(self.maxRetries))")
                    
                    // Add exponential backoff
                    let delay = pow(2.0, Double(retryCount)) * 0.5
                    try await Task.sleep(nanoseconds: UInt64(delay * 1_000_000_000))
                    
                    return try await request(
                        endpoint: endpoint,
                        method: method,
                        parameters: parameters,
                        body: body,
                        headers: headers,
                        retryCount: retryCount + 1
                    )
                }
                
                throw APIError.timeoutError
                
            default:
                logger.error("Network error: \(urlError.localizedDescription)")
                throw APIError.networkError(urlError)
            }
        } catch let apiError as APIError {
            // Already logged
            throw apiError
        } catch {
            logger.error("Unknown error: \(error.localizedDescription)")
            throw APIError.unknown
        }
    }
    
    // MARK: - Token Refresh
    
    /// Refresh the authentication token if needed
    private func refreshTokenIfNeeded() async throws {
        // If another task is already refreshing the token, wait for it to complete
        if let refreshTask = refreshTask {
            try await refreshTask.value
            return
        }
        
        // Skip if there's no refresh token
        guard KeychainService.shared.getRefreshToken() != nil else {
            logger.error("No refresh token available for token refresh")
            throw APIError.unauthorized
        }
        
        // Create a task to refresh the token
        let task = Task<Void, Error> {
            do {
                logger.debug("Refreshing authentication token")
                
                // Call auth service to refresh token
                let authService = AuthService.shared
                let (accessToken, refreshToken) = try await authService.refreshToken()
                
                // Save the new tokens
                KeychainService.shared.saveAccessToken(accessToken)
                KeychainService.shared.saveRefreshToken(refreshToken)
                
                logger.debug("Token refresh successful")
            } catch {
                logger.error("Token refresh failed: \(error.localizedDescription)")
                throw error
            }
        }
        
        // Store the task for other requests to wait on
        refreshTask = task
        
        do {
            // Wait for the task to complete
            try await task.value
            
            // Reset the task when done
            refreshTask = nil
        } catch {
            // Reset the task on error
            refreshTask = nil
            throw error
        }
    }
    
    // MARK: - Convenience Methods
    
    /// GET request with typed response
    func get<T: Decodable>(endpoint: String, parameters: [String: Any]? = nil, headers: [String: String]? = nil) async throws -> T {
        logger.debug("GET \(endpoint)")
        return try await request(
            endpoint: endpoint,
            method: .get,
            parameters: parameters,
            headers: headers
        )
    }
    
    /// GET request that returns a dictionary
    func getDictionary(endpoint: String, parameters: [String: Any]? = nil, headers: [String: String]? = nil) async throws -> DictionaryResponse {
        logger.debug("GET Dictionary \(endpoint)")
        return try await request(
            endpoint: endpoint,
            method: .get,
            parameters: parameters,
            headers: headers
        )
    }
    
    /// POST request with typed response
    func post<T: Decodable>(endpoint: String, body: Any? = nil, headers: [String: String]? = nil) async throws -> T {
        logger.debug("POST \(endpoint)")
        return try await request(
            endpoint: endpoint,
            method: .post,
            body: body,
            headers: headers
        )
    }
    
    /// POST request that returns a dictionary
    func postDictionary(endpoint: String, body: Any? = nil, headers: [String: String]? = nil) async throws -> DictionaryResponse {
        logger.debug("POST Dictionary \(endpoint)")
        return try await request(
            endpoint: endpoint,
            method: .post,
            body: body,
            headers: headers
        )
    }
    
    /// PUT request with typed response
    func put<T: Decodable>(endpoint: String, body: Any? = nil, headers: [String: String]? = nil) async throws -> T {
        logger.debug("PUT \(endpoint)")
        return try await request(
            endpoint: endpoint,
            method: .put,
            body: body,
            headers: headers
        )
    }
    
    /// PATCH request with typed response
    func patch<T: Decodable>(endpoint: String, body: Any? = nil, headers: [String: String]? = nil) async throws -> T {
        logger.debug("PATCH \(endpoint)")
        return try await request(
            endpoint: endpoint,
            method: .patch,
            body: body,
            headers: headers
        )
    }
    
    /// DELETE request with typed response
    func delete<T: Decodable>(endpoint: String, headers: [String: String]? = nil) async throws -> T {
        logger.debug("DELETE \(endpoint)")
        return try await request(
            endpoint: endpoint,
            method: .delete,
            headers: headers
        )
    }
}

// HTTPMethod enum
enum HTTPMethod: String {
    case get = "GET"
    case post = "POST"
    case put = "PUT"
    case patch = "PATCH"
    case delete = "DELETE"
} 