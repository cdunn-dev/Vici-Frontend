import SwiftUI

/// A consistent loading view for displaying loading states across the app
struct LoadingView: View {
    /// The message to display below the loading indicator
    var message: String?
    
    /// Whether to use a fullscreen overlay
    var fullscreen: Bool = true
    
    /// Whether to show a blur effect behind the loading indicator
    var showBlur: Bool = true
    
    var body: some View {
        ZStack {
            if fullscreen {
                if showBlur {
                    // Semi-transparent background with blur
                    Color.black.opacity(0.2)
                        .ignoresSafeArea()
                        .blur(radius: 0.5)
                } else {
                    // Semi-transparent background without blur
                    Color.black.opacity(0.3)
                        .ignoresSafeArea()
                }
            }
            
            VStack(spacing: 16) {
                ProgressView()
                    .scaleEffect(1.5)
                    .progressViewStyle(CircularProgressViewStyle(tint: fullscreen ? .white : .blue))
                
                if let message = message {
                    Text(message)
                        .font(.subheadline)
                        .foregroundColor(fullscreen ? .white : .primary)
                        .multilineTextAlignment(.center)
                }
            }
            .padding(24)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(fullscreen ? Color.black.opacity(0.5) : Color(.systemBackground))
                    .shadow(color: Color.black.opacity(0.1), radius: 10, x: 0, y: 5)
            )
            .padding(32)
        }
        .zIndex(100) // Ensure it appears above other content
    }
}

/// A modifier for easily adding loading view to any view
struct LoadingViewModifier: ViewModifier {
    let isLoading: Bool
    let message: String?
    let fullscreen: Bool
    let showBlur: Bool
    
    func body(content: Content) -> some View {
        ZStack {
            content
                .disabled(isLoading && fullscreen) // Disable interactions when fullscreen loading
            
            if isLoading {
                LoadingView(
                    message: message,
                    fullscreen: fullscreen,
                    showBlur: showBlur
                )
                .transition(.opacity.animation(.easeInOut(duration: 0.2)))
            }
        }
    }
}

/// Extension to easily add loading view to any view
extension View {
    /// Add a loading overlay to the view
    /// - Parameters:
    ///   - isLoading: Whether to show the loading indicator
    ///   - message: Optional message to display
    ///   - fullscreen: Whether to use a fullscreen overlay
    ///   - showBlur: Whether to show a blur effect
    /// - Returns: A view with loading indicator
    func loading(
        isLoading: Bool,
        message: String? = nil,
        fullscreen: Bool = true,
        showBlur: Bool = true
    ) -> some View {
        self.modifier(
            LoadingViewModifier(
                isLoading: isLoading,
                message: message,
                fullscreen: fullscreen,
                showBlur: showBlur
            )
        )
    }
    
    /// Add a fullscreen loading overlay with a message
    func loadingFullscreen(isLoading: Bool, message: String? = nil) -> some View {
        self.loading(isLoading: isLoading, message: message, fullscreen: true)
    }
    
    /// Add an inline loading indicator (non-fullscreen)
    func loadingInline(isLoading: Bool, message: String? = nil) -> some View {
        self.loading(isLoading: isLoading, message: message, fullscreen: false)
    }
}

/// Preview provider for LoadingView
struct LoadingView_Previews: PreviewProvider {
    static var previews: some View {
        Group {
            // Fullscreen with message
            LoadingView(message: "Loading data...", fullscreen: true)
                .previewDisplayName("Fullscreen with Message")
            
            // Fullscreen without message
            LoadingView(fullscreen: true)
                .previewDisplayName("Fullscreen without Message")
            
            // Inline with message
            LoadingView(message: "Saving...", fullscreen: false)
                .previewDisplayName("Inline with Message")
                .previewLayout(.sizeThatFits)
            
            // Inline without message
            LoadingView(fullscreen: false)
                .previewDisplayName("Inline without Message")
                .previewLayout(.sizeThatFits)
            
            // Usage example
            VStack {
                Text("Content View")
                    .font(.title)
                Spacer()
            }
            .loadingFullscreen(isLoading: true, message: "Fetching data...")
            .previewDisplayName("Usage Example - Fullscreen")
            
            VStack {
                Text("Content View")
                    .font(.title)
                Spacer()
            }
            .loadingInline(isLoading: true, message: "Updating...")
            .previewDisplayName("Usage Example - Inline")
        }
    }
} 