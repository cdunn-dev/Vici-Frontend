import Foundation
import Combine
import os.log
import SwiftUI

/// Base class for all ViewModels providing standard functionality
/// for loading state, error handling, and asynchronous operations.
@MainActor
class BaseViewModel: ObservableObject {
    /// Indicates whether the ViewModel is currently loading data
    @Published var isLoading: Bool = false
    
    /// Error message to display to the user
    @Published var errorMessage: String?
    
    /// The current app error, if any
    @Published var appError: AppError?
    
    /// Cancellables for managing subscriptions
    private var cancellables = Set<AnyCancellable>()
    
    /// Logger for ViewModel operations
    private let logger: Logger
    
    /// Initializes a new BaseViewModel
    init() {
        self.logger = Logger(subsystem: "com.vici.ViciMVP", category: String(describing: type(of: self)))
    }
    
    /// Initializes a new BaseViewModel with a specific log category
    init(logCategory: String) {
        self.logger = Logger(subsystem: "com.vici.ViciMVP", category: logCategory)
    }
    
    /// Runs a task with standard loading state management and error handling
    /// - Parameters:
    ///   - operation: Description of the operation for logging
    ///   - showLoading: Whether to show loading indicator
    ///   - task: The async task to run
    @discardableResult
    func runTask<T>(operation: String? = nil, showLoading: Bool = true, task: @escaping () async throws -> T) -> Task<T?, Error> {
        if showLoading {
            isLoading = true
        }
        
        errorMessage = nil
        appError = nil
        
        if let operation = operation {
            logger.debug("Starting operation: \(operation)")
        }
        
        return Task {
            do {
                let result = try await task()
                if !Task.isCancelled {
                    await MainActor.run {
                        if showLoading {
                            self.isLoading = false
                        }
                        
                        if let operation = operation {
                            logger.debug("Completed operation: \(operation)")
                        }
                    }
                }
                return result
            } catch {
                if !Task.isCancelled {
                    await MainActor.run {
                        self.handleError(error)
                        if showLoading {
                            self.isLoading = false
                        }
                        
                        if let operation = operation {
                            logger.error("Failed operation: \(operation) - Error: \(error.localizedDescription)")
                        }
                    }
                }
                throw error
            }
        }
    }
    
    /// Handles errors by attempting to convert them to AppError and updating state
    /// - Parameter error: The error to handle
    func handleError(_ error: Error) {
        if let appError = error as? AppError {
            self.appError = appError
            self.errorMessage = appError.errorDescription
        } else {
            // Convert generic error to AppError if possible
            let convertedError = convertToAppError(error)
            self.appError = convertedError
            self.errorMessage = convertedError.errorDescription
        }
        
        logger.error("Error: \(self.errorMessage ?? "Unknown error")")
    }
    
    /// Handles a publisher with standard loading state management and error handling
    /// - Parameters:
    ///   - publisher: The publisher to handle
    ///   - operation: Description of the operation for logging
    ///   - showLoading: Whether to show loading indicator
    ///   - onSuccess: Closure to execute on successful completion
    func handlePublisher<T, E: Error, Output>(
        _ publisher: AnyPublisher<T, E>,
        operation: String? = nil,
        showLoading: Bool = true,
        onSuccess: @escaping (T) -> Output
    ) {
        if showLoading {
            isLoading = true
        }
        
        errorMessage = nil
        appError = nil
        
        if let operation = operation {
            logger.debug("Starting publisher operation: \(operation)")
        }
        
        publisher
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    guard let self = self else { return }
                    
                    if showLoading {
                        self.isLoading = false
                    }
                    
                    switch completion {
                    case .finished:
                        if let operation = operation {
                            self.logger.debug("Completed publisher operation: \(operation)")
                        }
                    case .failure(let error):
                        self.handleError(error)
                        if let operation = operation {
                            self.logger.error("Failed publisher operation: \(operation) - Error: \(error.localizedDescription)")
                        }
                    }
                },
                receiveValue: { [weak self] value in
                    guard let self = self else { return }
                    let _ = onSuccess(value)
                }
            )
            .store(in: &cancellables)
    }
    
    /// Clears any current errors
    func clearError() {
        errorMessage = nil
        appError = nil
    }
}

/// Helper functions for error conversion
func convertToAppError(_ error: Error) -> AppError {
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
    
    // Handle NSError
    if let nsError = error as NSError? {
        if nsError.domain == NSURLErrorDomain {
            return NetworkError.unknown(nsError.localizedDescription)
        }
    }
    
    // Default case
    return NetworkError.unknown(error.localizedDescription)
} 