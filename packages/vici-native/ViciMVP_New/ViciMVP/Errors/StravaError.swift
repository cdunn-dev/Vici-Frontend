import Foundation

enum StravaError: Error, LocalizedError {
    case offlineError
    case userNotAuthenticated
    case tokenExchangeFailed(reason: String)
    case connectionFailed(reason: String)
    case disconnectionFailed(reason: String)
    case invalidResponse(details: String)
    case apiError(APIError, context: String) // To wrap underlying API errors
    case unknown(Error)

    var errorDescription: String? {
        switch self {
        case .offlineError:
            return "Network connection is unavailable. Please check your connection and try again."
        case .userNotAuthenticated:
            return "User is not authenticated or session is invalid."
        case .tokenExchangeFailed(let reason):
            return "Failed to exchange Strava authorization code for token: \(reason)"
        case .connectionFailed(let reason):
            return "Failed to connect to Strava: \(reason)"
        case .disconnectionFailed(let reason):
             return "Failed to disconnect from Strava: \(reason)"
        case .invalidResponse(let details):
            return "Received an invalid response from Strava API: \(details)"
        case .apiError(let underlyingError, let context):
            return "An API error occurred during Strava operation (\(context)): \(underlyingError.localizedDescription)"
         case .unknown(let error):
            return "An unknown Strava error occurred: \(error.localizedDescription)"
        }
    }

    // Helper to convert APIError to StravaError
    static func from(_ apiError: APIError, context: String) -> StravaError {
        switch apiError {
        case .unauthorized:
            return .userNotAuthenticated
        case .connectionError, .networkError, .timeoutError:
             return .connectionFailed(reason: apiError.localizedDescription)
        default:
            return .apiError(apiError, context: context)
        }
    }
} 