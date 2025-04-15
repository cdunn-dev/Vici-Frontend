import SwiftUI

struct AuthenticationView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    
    @State private var email = "test@example.com"
    @State private var password = "password123"
    @State private var isLoggingIn = true
    @State private var name = ""
    
    var body: some View {
        VStack(spacing: 20) {
            // Logo/Title
            Text("Vici")
                .font(.system(size: 42, weight: .bold))
                .foregroundColor(.blue)
                .padding(.bottom, 30)
            
            // Form fields
            VStack(spacing: 15) {
                if !isLoggingIn {
                    TextField("Full Name", text: $name)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .autocapitalization(.words)
                }
                
                TextField("Email", text: $email)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
                    .disableAutocorrection(true)
                
                SecureField("Password", text: $password)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
            }
            .padding(.horizontal)
            
            // Error message
            if let errorMessage = authViewModel.errorMessage {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .font(.footnote)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }
            
            // Login/Register button
            Button(action: {
                if isLoggingIn {
                    login()
                } else {
                    register()
                }
            }) {
                Text(isLoggingIn ? "Login" : "Register")
                    .fontWeight(.semibold)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(10)
            }
            .disabled(authViewModel.isLoading)
            .padding(.horizontal)
            
            // Toggle between login/register
            Button(action: {
                isLoggingIn.toggle()
            }) {
                Text(isLoggingIn ? "Need an account? Register" : "Already have an account? Login")
                    .foregroundColor(.blue)
            }
            
            // Loading indicator
            if authViewModel.isLoading {
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle())
                    .padding()
            }
            
            Spacer()
        }
        .padding()
    }
    
    // MARK: - Actions
    
    private func login() {
        Task {
            await authViewModel.login(email: email, password: password)
        }
    }
    
    private func register() {
        Task {
            await authViewModel.register(email: email, password: password, name: name)
        }
    }
}

#Preview {
    AuthenticationView()
        .environmentObject(AuthViewModel.loggedOutPreview())
} 