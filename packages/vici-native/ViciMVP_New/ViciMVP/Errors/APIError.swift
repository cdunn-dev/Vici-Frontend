import Foundation
import os.log

/// Error types that can occur during API operations
public enum APIError: AppError {
    case invalidURL
    case invalidResponse
    case invalidResponseData
    case httpError(statusCode: Int, details: String?)
    case networkError(Error)
    case decodingError(String)
    case encodingError(String)
    case unauthorized
    case serverError(String)
    case validationError([String])
    case rateLimited(retryAfter: TimeInterval?)
    case connectionError
    case timeoutError
    case unknown
    
    public var errorCode: String {
        switch self {
        case .invalidURL: return "API001"
        case .invalidResponse: return "API002"
        case .invalidResponseData: return "API003"
        case .httpError: return "API004"
        case .networkError: return "API005"
        case .decodingError: return "API006"
        case .encodingError: return "API007"
        case .unauthorized: return "API008"
        case .serverError: return "API009"
        case .validationError: return "API010"
        case .rateLimited: return "API011"
        case .connectionError: return "API012"
        case .timeoutError: return "API013"
        case .unknown: return "API999"
        }
    }
    
    public var errorDescription: String? {
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
        case .encodingError(let message):
            return "Failed to encode request: \(message)"
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
    
    public var recoverySuggestion: String? {
        switch self {
        case .invalidURL:
            return "Please contact support"
        case .invalidResponse, .invalidResponseData, .serverError:
            return "Please try again later"
        case .httpError:
            return "Please check your request and try again"
        case .networkError, .connectionError:
            return "Please check your internet connection and try again"
        case .decodingError, .encodingError:
            return "Please contact support if this issue persists"
        case .unauthorized:
            return "Please log in again"
        case .validationError:
            return "Please correct the input and try again"
        case .rateLimited:
            return "Please wait and try again later"
        case .timeoutError:
            return "Please check your internet connection and try again"
        case .unknown:
            return "Please try again or contact support if the issue persists"
        }
    }
    
    /// Whether this error is potentially recoverable with a retry
    public var isRetryable: Bool {
        switch self {
        case .connectionError, .timeoutError:
            return true
        case .httpError(let statusCode, _):
            // Server errors (5xx) are generally retryable
            return statusCode >= 500 && statusCode < 600
        case .networkError(let error as URLError):
            return [URLError.networkConnectionLost, 
                    URLError.notConnectedToInternet,
                    URLError.timedOut].contains(error.code)
        case .serverError:
            return true
        default:
            return false
        }
    }
} 