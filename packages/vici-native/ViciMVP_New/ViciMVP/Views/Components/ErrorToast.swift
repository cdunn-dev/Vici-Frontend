import SwiftUI

/// A toast-style view for displaying errors in a consistent manner
struct ErrorToast: View {
    /// The error to display
    let error: AppError?
    
    /// Callback for when the dismiss button is tapped
    var onDismiss: () -> Void
    
    /// Whether to show the recovery suggestion
    var showRecoverySuggestion: Bool = true
    
    var body: some View {
        if let error = error {
            VStack {
                Spacer()
                
                HStack(alignment: .top) {
                    Image(systemName: "exclamationmark.triangle")
                        .foregroundColor(.white)
                        .font(.system(size: 16, weight: .bold))
                        .padding(.top, 2)
                    
                    VStack(alignment: .leading, spacing: 4) {
                        Text(error.errorDescription ?? "An error occurred")
                            .font(.subheadline)
                            .fontWeight(.medium)
                            .foregroundColor(.white)
                        
                        if showRecoverySuggestion, let recoverySuggestion = error.recoverySuggestion {
                            Text(recoverySuggestion)
                                .font(.footnote)
                                .foregroundColor(.white.opacity(0.8))
                        }
                    }
                    
                    Spacer()
                    
                    Button(action: onDismiss) {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.white.opacity(0.8))
                            .font(.system(size: 20))
                    }
                    .padding(.top, 2)
                }
                .padding()
                .background(errorBackground)
                .cornerRadius(10)
                .shadow(color: Color.black.opacity(0.2), radius: 5, x: 0, y: 2)
                .padding(.horizontal)
                .padding(.bottom, 8)
                .transition(.move(edge: .bottom).combined(with: .opacity))
            }
            .animation(.easeInOut(duration: 0.3), value: error)
            .zIndex(100) // Ensure it appears above other content
        }
    }
    
    /// Determine background color based on error type
    private var errorBackground: Color {
        if let networkError = error as? NetworkError {
            return .blue
        } else if let authError = error as? AuthError {
            return .red
        } else if let dataError = error as? DataError {
            return .orange
        } else if let trainingError = error as? TrainingPlanError {
            return .indigo
        } else {
            return .gray
        }
    }
}

/// A modifier to easily add error toast to any view
struct ErrorToastModifier: ViewModifier {
    let error: AppError?
    var onDismiss: () -> Void
    var showRecoverySuggestion: Bool = true
    
    func body(content: Content) -> some View {
        ZStack {
            content
            
            ErrorToast(
                error: error,
                onDismiss: onDismiss,
                showRecoverySuggestion: showRecoverySuggestion
            )
        }
    }
}

/// Extension to make it easy to add error toast to any view
extension View {
    func errorToast(
        error: AppError?,
        onDismiss: @escaping () -> Void,
        showRecoverySuggestion: Bool = true
    ) -> some View {
        self.modifier(
            ErrorToastModifier(
                error: error,
                onDismiss: onDismiss,
                showRecoverySuggestion: showRecoverySuggestion
            )
        )
    }
    
    /// Convenience method for showing error toast with string error message
    func errorToast(
        errorMessage: String?,
        onDismiss: @escaping () -> Void
    ) -> some View {
        let appError: AppError? = errorMessage.map { message in
            struct SimpleError: AppError {
                var errorCode: String { "generic.error" }
                var errorDescription: String? { message }
                var recoverySuggestion: String? { nil }
            }
            return SimpleError()
        }
        
        return self.modifier(
            ErrorToastModifier(
                error: appError,
                onDismiss: onDismiss,
                showRecoverySuggestion: false
            )
        )
    }
}

/// Preview for ErrorToast
struct ErrorToast_Previews: PreviewProvider {
    static var previews: some View {
        Group {
            // Network error preview
            ErrorToast(
                error: NetworkError.notConnectedToInternet,
                onDismiss: {}
            )
            .previewDisplayName("Network Error")
            .previewLayout(.sizeThatFits)
            
            // Auth error preview
            ErrorToast(
                error: AuthError.invalidCredentials,
                onDismiss: {}
            )
            .previewDisplayName("Auth Error")
            .previewLayout(.sizeThatFits)
            
            // Training plan error preview
            ErrorToast(
                error: TrainingPlanError.noActivePlan,
                onDismiss: {}
            )
            .previewDisplayName("Training Plan Error")
            .previewLayout(.sizeThatFits)
            
            // Usage example
            VStack {
                Text("Content View")
                    .font(.title)
                Spacer()
            }
            .errorToast(
                error: DataError.notFound(entity: "User", identifier: "123"),
                onDismiss: {}
            )
            .previewDisplayName("Usage Example")
        }
    }
} 