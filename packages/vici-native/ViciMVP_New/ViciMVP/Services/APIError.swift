import Foundation
import os.log

/// Error types that can occur during API operations
enum APIError: Error, LocalizedError {
    case invalidURL
    case invalidResponse
    case invalidResponseData
    case httpError(statusCode: Int, details: String?)
    case networkError(Error)
    case decodingError(String)
    case unauthorized
    case serverError(String)
    case validationError([String])
    case rateLimited(retryAfter: TimeInterval?)
    case connectionError
    case timeoutError
    case unknown
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid response from server"
        case .invalidResponseData:
            return "Invalid data received from server"
        case .httpError(let statusCode, let details):
            if let details = details, !details.isEmpty {
                return "HTTP error \(statusCode): \(details)"
            }
            return "HTTP error: \(statusCode)"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        case .decodingError(let message):
            return "Failed to decode response: \(message)"
        case .unauthorized:
            return "You are not authorized to perform this action"
        case .serverError(let message):
            return "Server error: \(message)"
        case .validationError(let errors):
            return "Validation errors: \(errors.joined(separator: ", "))"
        case .rateLimited(let retryAfter):
            if let seconds = retryAfter {
                return "Rate limited. Please try again after \(Int(seconds)) seconds."
            }
            return "Rate limited. Please try again later."
        case .connectionError:
            return "Could not connect to the server. Please check your internet connection."
        case .timeoutError:
            return "The request timed out. Please try again."
        case .unknown:
            return "An unknown error occurred"
        }
    }
    
    /// Whether this error is potentially recoverable with a retry
    var isRetryable: Bool {
        // TEMPORARY: Simplified to bypass statusCode errors during build troubleshooting
        switch self {
        case .connectionError, .timeoutError, .httpError: // Check only the case type for now
            // Basic check, refinement needed later
            return true 
        case .networkError(let error as URLError):
            return [URLError.networkConnectionLost, 
                    URLError.notConnectedToInternet,
                    URLError.timedOut].contains(error.code)
        default:
            return false
        }
    }
} 