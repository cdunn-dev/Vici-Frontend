import Foundation

/// Base protocol for all app-specific errors
protocol AppError: Error, LocalizedError {
    var errorCode: String { get }
    var errorDescription: String? { get }
    var recoverySuggestion: String? { get }
}

/// Network related errors
enum NetworkError: AppError {
    case connectionFailed
    case serverError(statusCode: Int, message: String?)
    case requestTimeout
    case responseDecoding(description: String)
    case invalidURL(url: String)
    case notConnectedToInternet
    
    var errorCode: String {
        switch self {
        case .connectionFailed: return "network.connection.failed"
        case .serverError: return "network.server.error"
        case .requestTimeout: return "network.request.timeout"
        case .responseDecoding: return "network.response.decoding"
        case .invalidURL: return "network.invalid.url"
        case .notConnectedToInternet: return "network.not.connected"
        }
    }
    
    var errorDescription: String? {
        switch self {
        case .connectionFailed:
            return "Connection to server failed"
        case .serverError(let statusCode, let message):
            return message ?? "Server error occurred (Status code: \(statusCode))"
        case .requestTimeout:
            return "The request timed out"
        case .responseDecoding(let description):
            return "Could not decode the response: \(description)"
        case .invalidURL(let url):
            return "Invalid URL: \(url)"
        case .notConnectedToInternet:
            return "No internet connection available"
        }
    }
    
    var recoverySuggestion: String? {
        switch self {
        case .connectionFailed, .serverError, .requestTimeout:
            return "Please try again later or check your internet connection."
        case .notConnectedToInternet:
            return "Please check your internet connection and try again."
        case .responseDecoding, .invalidURL:
            return "Please contact support if this problem persists."
        }
    }
}

/// Authentication related errors
enum AuthError: AppError {
    case unauthorized
    case invalidCredentials
    case accountNotFound
    case tokenExpired
    case registrationFailed(reason: String)
    case sessionExpired
    
    var errorCode: String {
        switch self {
        case .unauthorized: return "auth.unauthorized"
        case .invalidCredentials: return "auth.invalid.credentials"
        case .accountNotFound: return "auth.account.not.found"
        case .tokenExpired: return "auth.token.expired"
        case .registrationFailed: return "auth.registration.failed"
        case .sessionExpired: return "auth.session.expired"
        }
    }
    
    var errorDescription: String? {
        switch self {
        case .unauthorized:
            return "You are not authorized to perform this action"
        case .invalidCredentials:
            return "Invalid email or password"
        case .accountNotFound:
            return "Account not found"
        case .tokenExpired:
            return "Your session has expired"
        case .registrationFailed(let reason):
            return "Registration failed: \(reason)"
        case .sessionExpired:
            return "Your session has expired. Please log in again."
        }
    }
    
    var recoverySuggestion: String? {
        switch self {
        case .unauthorized, .tokenExpired, .sessionExpired:
            return "Please log in again."
        case .invalidCredentials:
            return "Please check your email and password and try again."
        case .accountNotFound:
            return "Please check your email or register a new account."
        case .registrationFailed:
            return "Please try again with different information."
        }
    }
}

/// Data related errors
enum DataError: AppError {
    case notFound(entity: String, identifier: String? = nil)
    case invalidData(description: String)
    case saveFailed(entity: String)
    case deleteFailed(entity: String)
    case alreadyExists(entity: String)
    
    var errorCode: String {
        switch self {
        case .notFound: return "data.not.found"
        case .invalidData: return "data.invalid"
        case .saveFailed: return "data.save.failed"
        case .deleteFailed: return "data.delete.failed"
        case .alreadyExists: return "data.already.exists"
        }
    }
    
    var errorDescription: String? {
        switch self {
        case .notFound(let entity, let identifier):
            if let id = identifier {
                return "\(entity) with ID \(id) not found"
            }
            return "\(entity) not found"
        case .invalidData(let description):
            return "Invalid data: \(description)"
        case .saveFailed(let entity):
            return "Failed to save \(entity)"
        case .deleteFailed(let entity):
            return "Failed to delete \(entity)"
        case .alreadyExists(let entity):
            return "\(entity) already exists"
        }
    }
    
    var recoverySuggestion: String? {
        switch self {
        case .notFound:
            return "Please check that the requested item exists."
        case .invalidData:
            return "Please ensure the data is valid and try again."
        case .saveFailed, .deleteFailed:
            return "Please try again later."
        case .alreadyExists:
            return "Please use a different identifier or update the existing item."
        }
    }
}

/// Feature-specific errors for training plans
enum TrainingPlanError: AppError {
    case noActivePlan
    case planGenerationFailed(reason: String)
    case workoutNotFound(id: String)
    case incompatibleWorkoutType
    case invalidPlanConfiguration(reason: String)
    
    var errorCode: String {
        switch self {
        case .noActivePlan: return "training.no.active.plan"
        case .planGenerationFailed: return "training.plan.generation.failed"
        case .workoutNotFound: return "training.workout.not.found"
        case .incompatibleWorkoutType: return "training.workout.incompatible"
        case .invalidPlanConfiguration: return "training.plan.invalid.config"
        }
    }
    
    var errorDescription: String? {
        switch self {
        case .noActivePlan:
            return "No active training plan found"
        case .planGenerationFailed(let reason):
            return "Failed to generate training plan: \(reason)"
        case .workoutNotFound(let id):
            return "Workout with ID \(id) not found"
        case .incompatibleWorkoutType:
            return "Incompatible workout type"
        case .invalidPlanConfiguration(let reason):
            return "Invalid plan configuration: \(reason)"
        }
    }
    
    var recoverySuggestion: String? {
        switch self {
        case .noActivePlan:
            return "Create a new training plan to get started."
        case .planGenerationFailed:
            return "Please try again with different criteria or contact support."
        case .workoutNotFound:
            return "Please refresh your plan or select a different workout."
        case .incompatibleWorkoutType:
            return "Please select a compatible workout type."
        case .invalidPlanConfiguration:
            return "Please adjust your plan configuration and try again."
        }
    }
}

/// Utility function to convert any error to an AppError
func convertToAppError(_ error: Error) -> AppError {
    // Return the error as is if it's already an AppError
    if let appError = error as? AppError {
        return appError
    }
    
    // Check for NSError with specific error codes
    let nsError = error as NSError
    
    // Handle common network errors
    if nsError.domain == NSURLErrorDomain {
        switch nsError.code {
        case NSURLErrorNotConnectedToInternet:
            return NetworkError.notConnectedToInternet
        case NSURLErrorTimedOut:
            return NetworkError.requestTimeout
        case NSURLErrorBadURL:
            return NetworkError.invalidURL(url: nsError.userInfo[NSURLErrorFailingURLStringErrorKey] as? String ?? "unknown")
        default:
            return NetworkError.connectionFailed
        }
    }
    
    // Handle common authentication errors
    if nsError.domain == "com.vici.auth" {
        switch nsError.code {
        case 401:
            return AuthError.unauthorized
        case 403:
            return AuthError.invalidCredentials
        case 404:
            return AuthError.accountNotFound
        default:
            return AuthError.unauthorized
        }
    }
    
    // Default to a generic error with the original error's description
    return NetworkError.serverError(statusCode: nsError.code, message: error.localizedDescription)
} 