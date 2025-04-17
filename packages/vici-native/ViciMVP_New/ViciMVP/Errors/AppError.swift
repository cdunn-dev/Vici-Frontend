import Foundation

/// A protocol defining app-specific errors
public protocol AppError: Error, LocalizedError {
    /// A unique code for this error type
    var errorCode: String { get }
    
    /// A user-friendly description of the error
    var errorDescription: String? { get }
    
    /// A suggestion for how to recover from the error
    var recoverySuggestion: String? { get }
}

/// Network-related errors
public enum NetworkError: AppError {
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
    case notConnectedToInternet
    
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
        case .notConnectedToInternet: return "NE012"
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
        case .notConnectedToInternet:
            return "No internet connection available"
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
        case .connectionLost, .unknownHost, .notConnectedToInternet:
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
public enum AuthError: AppError {
    case unauthorized
    case invalidCredentials
    case accountLocked
    case tokenExpired
    case registrationFailed(String)
    case sessionExpired
    case accountNotFound
    case unknown(String)
    
    var errorCode: String {
        switch self {
        case .unauthorized: return "AE001"
        case .invalidCredentials: return "AE002"
        case .accountLocked: return "AE003"
        case .tokenExpired: return "AE004"
        case .registrationFailed: return "AE005"
        case .sessionExpired: return "AE006"
        case .accountNotFound: return "AE007"
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
        case .sessionExpired:
            return "Your session has expired. Please log in again."
        case .accountNotFound:
            return "Account not found"
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
        case .tokenExpired, .sessionExpired:
            return "Please log in again to continue"
        case .registrationFailed:
            return "Please try again with different information"
        case .accountNotFound:
            return "Please check your email or register a new account"
        case .unknown:
            return "Please try again or contact support"
        }
    }
}

/// Data-related errors
public enum DataError: AppError {
    case notFound
    case invalidData
    case saveFailed
    case deleteFailed
    case updateFailed
    case alreadyExists(entity: String)
    case unknown(String)
    
    var errorCode: String {
        switch self {
        case .notFound: return "DE001"
        case .invalidData: return "DE002"
        case .saveFailed: return "DE003"
        case .deleteFailed: return "DE004"
        case .updateFailed: return "DE005"
        case .alreadyExists: return "DE006"
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
        case .alreadyExists(let entity):
            return "\(entity) already exists"
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
        case .alreadyExists:
            return "Please use a different identifier or update the existing item"
        case .unknown:
            return "Please try again or contact support"
        }
    }
}

/// Training plan-related errors
public enum TrainingPlanError: AppError {
    case noPlanActive
    case planGenerationFailed
    case invalidPlanData
    case planUpdateFailed
    case workoutNotFound(id: String)
    case incompatibleWorkoutType
    case unknown(String)
    
    var errorCode: String {
        switch self {
        case .noPlanActive: return "TPE001"
        case .planGenerationFailed: return "TPE002"
        case .invalidPlanData: return "TPE003"
        case .planUpdateFailed: return "TPE004"
        case .workoutNotFound: return "TPE005"
        case .incompatibleWorkoutType: return "TPE006"
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
        case .workoutNotFound(let id):
            return "Workout with ID \(id) not found"
        case .incompatibleWorkoutType:
            return "Incompatible workout type"
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
        case .workoutNotFound:
            return "Please refresh your plan or select a different workout"
        case .incompatibleWorkoutType:
            return "Please select a compatible workout type"
        case .unknown:
            return "Please try again or contact support"
        }
    }
}

/// Utility function to convert any error to an AppError
public func convertToAppError(_ error: Error) -> AppError {
    // Return the error as is if it's already an AppError
    if let appError = error as? AppError {
        return appError
    }
    
    // Handle network-related errors
    if let urlError = error as? URLError {
        switch urlError.code {
        case .notConnectedToInternet, .networkConnectionLost:
            return NetworkError.connectionLost
        case .timedOut:
            return NetworkError.requestTimeout
        case .badServerResponse, .cannotParseResponse:
            return NetworkError.invalidResponse
        case .serverCertificateUntrusted:
            return NetworkError.securityError
        default:
            return NetworkError.unknown(urlError.localizedDescription)
        }
    }
    
    // Check for NSError with specific error codes
    let nsError = error as NSError
    
    // Handle authentication errors
    if nsError.domain == "com.vici.auth" {
        switch nsError.code {
        case 401:
            return AuthError.unauthorized
        case 403:
            return AuthError.invalidCredentials
        case 404:
            return AuthError.accountNotFound
        default:
            return AuthError.unknown(error.localizedDescription)
        }
    }
    
    // Handle other NSURLErrorDomain errors
    if nsError.domain == NSURLErrorDomain {
        return NetworkError.unknown(nsError.localizedDescription)
    }
    
    // Default case
    return NetworkError.unknown(error.localizedDescription)
} 