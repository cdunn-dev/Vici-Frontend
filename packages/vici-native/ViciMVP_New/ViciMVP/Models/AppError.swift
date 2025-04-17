import Foundation

/// A protocol defining app-specific errors
protocol AppError: Error, LocalizedError {
    /// A unique code for this error type
    var errorCode: String { get }
    
    /// A user-friendly description of the error
    var errorDescription: String? { get }
    
    /// A suggestion for how to recover from the error
    var recoverySuggestion: String? { get }
}

/// Network-related errors
enum NetworkError: AppError {
    case invalidURL
    case invalidResponse
    case invalidData
    case requestFailed(Int)
    case requestTimeout
    case connectionLost
    case authenticationRequired
    case securityError
    case serverError(String)
    case rateLimitExceeded
    case unknownHost
    case unknown(String)
    
    var errorCode: String {
        switch self {
        case .invalidURL: return "NE001"
        case .invalidResponse: return "NE002"
        case .invalidData: return "NE003"
        case .requestFailed: return "NE004"
        case .requestTimeout: return "NE005"
        case .connectionLost: return "NE006"
        case .authenticationRequired: return "NE007"
        case .securityError: return "NE008"
        case .serverError: return "NE009"
        case .rateLimitExceeded: return "NE010"
        case .unknownHost: return "NE011"
        case .unknown: return "NE999"
        }
    }
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "The server returned an invalid response"
        case .invalidData:
            return "The data received from the server was invalid"
        case .requestFailed(let statusCode):
            return "Request failed with status code: \(statusCode)"
        case .requestTimeout:
            return "The request timed out"
        case .connectionLost:
            return "The network connection was lost"
        case .authenticationRequired:
            return "Authentication is required"
        case .securityError:
            return "A security error occurred"
        case .serverError(let message):
            return "Server error: \(message)"
        case .rateLimitExceeded:
            return "Rate limit exceeded"
        case .unknownHost:
            return "Could not connect to the server"
        case .unknown(let message):
            return "Network error: \(message)"
        }
    }
    
    var recoverySuggestion: String? {
        switch self {
        case .invalidURL:
            return "Please contact support"
        case .invalidResponse, .invalidData, .serverError:
            return "Please try again later"
        case .requestFailed:
            return "Please check your request and try again"
        case .requestTimeout:
            return "Please check your internet connection and try again"
        case .connectionLost, .unknownHost:
            return "Please check your internet connection and try again"
        case .authenticationRequired:
            return "Please log in again"
        case .securityError:
            return "Please ensure you are using a secure connection"
        case .rateLimitExceeded:
            return "Please wait a moment before trying again"
        case .unknown:
            return "Please try again or contact support if the issue persists"
        }
    }
}

/// Authentication-related errors
enum AuthError: AppError {
    case unauthorized
    case invalidCredentials
    case accountLocked
    case tokenExpired
    case registrationFailed(String)
    case unknown(String)
    
    var errorCode: String {
        switch self {
        case .unauthorized: return "AE001"
        case .invalidCredentials: return "AE002"
        case .accountLocked: return "AE003"
        case .tokenExpired: return "AE004"
        case .registrationFailed: return "AE005"
        case .unknown: return "AE999"
        }
    }
    
    var errorDescription: String? {
        switch self {
        case .unauthorized:
            return "You are not authorized to perform this action"
        case .invalidCredentials:
            return "Invalid username or password"
        case .accountLocked:
            return "Your account has been locked"
        case .tokenExpired:
            return "Your session has expired"
        case .registrationFailed(let reason):
            return "Registration failed: \(reason)"
        case .unknown(let message):
            return "Authentication error: \(message)"
        }
    }
    
    var recoverySuggestion: String? {
        switch self {
        case .unauthorized:
            return "Please log in with an account that has the necessary permissions"
        case .invalidCredentials:
            return "Please check your username and password and try again"
        case .accountLocked:
            return "Please contact support to unlock your account"
        case .tokenExpired:
            return "Please log in again to continue"
        case .registrationFailed:
            return "Please try again with different information"
        case .unknown:
            return "Please try again or contact support"
        }
    }
}

/// Data-related errors
enum DataError: AppError {
    case notFound
    case invalidData
    case saveFailed
    case deleteFailed
    case updateFailed
    case unknown(String)
    
    var errorCode: String {
        switch self {
        case .notFound: return "DE001"
        case .invalidData: return "DE002"
        case .saveFailed: return "DE003"
        case .deleteFailed: return "DE004"
        case .updateFailed: return "DE005"
        case .unknown: return "DE999"
        }
    }
    
    var errorDescription: String? {
        switch self {
        case .notFound:
            return "The requested data could not be found"
        case .invalidData:
            return "The data is invalid"
        case .saveFailed:
            return "Failed to save data"
        case .deleteFailed:
            return "Failed to delete data"
        case .updateFailed:
            return "Failed to update data"
        case .unknown(let message):
            return "Data error: \(message)"
        }
    }
    
    var recoverySuggestion: String? {
        switch self {
        case .notFound:
            return "Please refresh and try again"
        case .invalidData:
            return "Please check the data and try again"
        case .saveFailed, .deleteFailed, .updateFailed:
            return "Please try again later"
        case .unknown:
            return "Please try again or contact support"
        }
    }
}

/// Training plan-related errors
enum TrainingPlanError: AppError {
    case noPlanActive
    case planGenerationFailed
    case invalidPlanData
    case planUpdateFailed
    case unknown(String)
    
    var errorCode: String {
        switch self {
        case .noPlanActive: return "TPE001"
        case .planGenerationFailed: return "TPE002"
        case .invalidPlanData: return "TPE003"
        case .planUpdateFailed: return "TPE004"
        case .unknown: return "TPE999"
        }
    }
    
    var errorDescription: String? {
        switch self {
        case .noPlanActive:
            return "No active training plan found"
        case .planGenerationFailed:
            return "Failed to generate training plan"
        case .invalidPlanData:
            return "Invalid training plan data"
        case .planUpdateFailed:
            return "Failed to update training plan"
        case .unknown(let message):
            return "Training plan error: \(message)"
        }
    }
    
    var recoverySuggestion: String? {
        switch self {
        case .noPlanActive:
            return "Create a new training plan to get started"
        case .planGenerationFailed:
            return "Please try again or adjust your goals"
        case .invalidPlanData:
            return "Please try creating a new plan"
        case .planUpdateFailed:
            return "Please try again later"
        case .unknown:
            return "Please try again or contact support"
        }
    }
} 