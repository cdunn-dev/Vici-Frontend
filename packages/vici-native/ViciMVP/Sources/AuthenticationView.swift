import SwiftUI

struct AuthenticationView: View {
    @EnvironmentObject var userAuth: UserAuthentication
    @State private var email = ""
    @State private var password = ""
    @State private var name = "" // For registration
    @State private var isRegistering = false
    @State private var showError = false
    @State private var errorMessage = ""
    @State private var isLoading = false
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Vici")
                .font(.system(size: 40, weight: .bold))
                .foregroundColor(.blue)
            
            Text(isRegistering ? "Create Account" : "Sign In")
                .font(.title)
                .padding(.bottom)
            
            TextField("Email", text: $email)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .autocapitalization(.none)
                .keyboardType(.emailAddress)
                .disabled(isLoading)
            
            SecureField("Password", text: $password)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .disabled(isLoading)
            
            // Name field for registration
            if isRegistering {
                TextField("Full Name", text: $name)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .disabled(isLoading)
            }
            
            Button(action: {
                authenticateUser()
            }) {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue.opacity(0.7))
                        .foregroundColor(.white)
                        .cornerRadius(10)
                } else {
                    Text(isRegistering ? "Register" : "Login")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                }
            }
            .disabled(isLoading || !isFormValid)
            
            Button(action: {
                // Clear fields and error when switching modes
                isRegistering.toggle()
                email = ""
                password = ""
                name = ""
                showError = false
            }) {
                Text(isRegistering ? "Already have an account? Sign In" : "Don't have an account? Register")
                    .foregroundColor(.blue)
            }
            .padding(.top)
            .disabled(isLoading)
            
            if showError {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .padding(.top, 10)
            }
        }
        .padding()
    }
    
    // Validation check
    private var isFormValid: Bool {
        if isRegistering {
            return !email.isEmpty && !password.isEmpty && !name.isEmpty && password.count >= 6
        } else {
            return !email.isEmpty && !password.isEmpty
        }
    }
    
    // Authentication function
    private func authenticateUser() {
        showError = false
        isLoading = true
        
        Task {
            do {
                if isRegistering {
                    try await userAuth.register(email: email, password: password, name: name)
                } else {
                    try await userAuth.login(email: email, password: password)
                }
                // Authentication successful - UserAuthentication will update isAuthenticated
            } catch let error as APIError {
                // Handle API-specific errors
                await MainActor.run {
                    showError = true
                    errorMessage = error.localizedDescription
                    isLoading = false
                }
            } catch {
                // Handle other errors
                await MainActor.run {
                    showError = true
                    errorMessage = "Authentication failed: \(error.localizedDescription)"
                    isLoading = false
                }
            }
        }
    }
} 