import Foundation
import Combine
import os.log

/// Base ViewModel class to provide common functionality for all ViewModels
@MainActor
class BaseViewModel: ObservableObject {
    // MARK: - Published Properties
    
    /// Whether the ViewModel is currently loading data
    @Published var isLoading = false
    
    /// Current error message, if any
    @Published var errorMessage: String?
    
    /// Current typed error, if any
    @Published var appError: AppError?
    
    // MARK: - Protected Properties
    
    /// Set of cancellables for managing subscriptions
    var cancellables = Set<AnyCancellable>()
    
    /// Logger for ViewModel operations
    let logger: Logger
    
    // MARK: - Initialization
    
    /// Initialize with a category for the logger
    init(logCategory: String) {
        self.logger = Logger(subsystem: "com.vici.ViciMVP", category: logCategory)
    }
    
    // MARK: - Error Handling
    
    /// Handle an error by converting it to an AppError and setting appropriate properties
    /// - Parameters:
    ///   - error: The error to handle
    ///   - message: Optional override message
    ///   - file: Source file where the error occurred
    ///   - function: Function where the error occurred
    ///   - line: Line number where the error occurred
    func handleError(_ error: Error, message: String? = nil, file: String = #file, function: String = #function, line: Int = #line) {
        // Convert to AppError if needed
        let appError = error as? AppError ?? convertToAppError(error)
        
        // Set the app error and error message
        self.appError = appError
        self.errorMessage = message ?? appError.errorDescription
        
        // Reset loading state
        self.isLoading = false
        
        // Log the error
        logger.error("Error in \(file):\(line) \(function): \(appError.errorDescription ?? "Unknown error")")
    }
    
    /// Clear current error state
    func clearError() {
        self.appError = nil
        self.errorMessage = nil
    }
    
    // MARK: - Loading State
    
    /// Begin loading operation and clear any errors
    func beginLoading() {
        isLoading = true
        clearError()
    }
    
    /// End loading operation
    func endLoading() {
        isLoading = false
    }
    
    // MARK: - Task Management
    
    /// Run an async task with proper loading and error handling
    /// - Parameters:
    ///   - operation: Description of the operation (for logging)
    ///   - showLoading: Whether to show loading indicators
    ///   - task: The async task to run
    func runTask<T>(
        operation: String,
        showLoading: Bool = true,
        task: @escaping () async throws -> T
    ) async -> T? {
        if showLoading {
            beginLoading()
        }
        
        logger.debug("Starting operation: \(operation)")
        
        do {
            let result = try await task()
            
            if showLoading {
                endLoading()
            }
            
            logger.debug("Completed operation: \(operation)")
            return result
        } catch {
            handleError(error)
            logger.error("Failed operation: \(operation) - \(error.localizedDescription)")
            return nil
        }
    }
    
    // MARK: - Subscription Management
    
    /// Handle a publisher with proper loading and error handling
    /// - Parameters:
    ///   - publisher: The publisher to subscribe to
    ///   - operation: Description of the operation (for logging)
    ///   - showLoading: Whether to show loading indicators
    ///   - onValue: Closure to handle received values
    func handlePublisher<P: Publisher>(
        _ publisher: P,
        operation: String,
        showLoading: Bool = true,
        onValue: @escaping (P.Output) -> Void
    ) where P.Failure == Error {
        if showLoading {
            beginLoading()
        }
        
        logger.debug("Starting operation: \(operation)")
        
        publisher
            .receive(on: RunLoop.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    guard let self = self else { return }
                    
                    if showLoading {
                        self.endLoading()
                    }
                    
                    if case .failure(let error) = completion {
                        self.handleError(error)
                        self.logger.error("Failed operation: \(operation) - \(error.localizedDescription)")
                    } else {
                        self.logger.debug("Completed operation: \(operation)")
                    }
                },
                receiveValue: { value in
                    onValue(value)
                }
            )
            .store(in: &cancellables)
    }
} 