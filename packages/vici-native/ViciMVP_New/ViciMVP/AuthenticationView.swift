import SwiftUI

struct AuthenticationView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    
    var body: some View {
        Text("Authentication View")
    }
}

#Preview {
    AuthenticationView()
        .environmentObject(AuthViewModel())
} 