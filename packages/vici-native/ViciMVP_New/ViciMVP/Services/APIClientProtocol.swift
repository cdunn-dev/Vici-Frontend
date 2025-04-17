import Foundation

/// Protocol defining the API client interface for testability
protocol APIClientProtocol {
    /// Perform a GET request
    /// - Parameters:
    ///   - endpoint: The API endpoint
    ///   - parameters: Optional query parameters
    ///   - headers: Optional HTTP headers
    /// - Returns: Decodable response of type T
    func get<T: Decodable>(endpoint: String, parameters: [String: Any]?, headers: [String: String]?) async throws -> T
    
    /// Perform a POST request
    /// - Parameters:
    ///   - endpoint: The API endpoint
    ///   - body: Optional request body
    ///   - headers: Optional HTTP headers
    /// - Returns: Decodable response of type T
    func post<T: Decodable>(endpoint: String, body: Any?, headers: [String: String]?) async throws -> T
    
    /// Perform a PUT request
    /// - Parameters:
    ///   - endpoint: The API endpoint
    ///   - body: Optional request body
    ///   - headers: Optional HTTP headers
    /// - Returns: Decodable response of type T
    func put<T: Decodable>(endpoint: String, body: Any?, headers: [String: String]?) async throws -> T
    
    /// Perform a PATCH request
    /// - Parameters:
    ///   - endpoint: The API endpoint
    ///   - body: Optional request body
    ///   - headers: Optional HTTP headers
    /// - Returns: Decodable response of type T
    func patch<T: Decodable>(endpoint: String, body: Any?, headers: [String: String]?) async throws -> T
    
    /// Perform a DELETE request
    /// - Parameters:
    ///   - endpoint: The API endpoint
    ///   - headers: Optional HTTP headers
    /// - Returns: Decodable response of type T
    func delete<T: Decodable>(endpoint: String, headers: [String: String]?) async throws -> T
} 