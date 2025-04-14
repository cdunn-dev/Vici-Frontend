import SwiftUI

struct AuthenticationView: View {
    @EnvironmentObject var userAuth: UserAuthentication
    @State private var email = ""
    @State private var password = ""
    @State private var name = ""
    @State private var isRegistering = false
    @State private var showingValidationError = false
    @State private var validationErrorMessage = ""
    
    // Computed property to determine if form is valid
    private var isFormValid: Bool {
        if email.isEmpty {
            validationErrorMessage = "Email is required"
            return false
        }
        
        if !isValidEmail(email) {
            validationErrorMessage = "Please enter a valid email address"
            return false
        }
        
        if password.isEmpty {
            validationErrorMessage = "Password is required"
            return false
        }
        
        if isRegistering && password.count < 6 {
            validationErrorMessage = "Password must be at least 6 characters"
            return false
        }
        
        return true
    }
    
    // Simple email validation
    private func isValidEmail(_ email: String) -> Bool {
        let emailRegEx = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}"
        let emailPred = NSPredicate(format:"SELF MATCHES %@", emailRegEx)
        return emailPred.evaluate(with: email)
    }
    
    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(gradient: Gradient(colors: [Color.blue.opacity(0.7), Color.purple.opacity(0.5)]), 
                           startPoint: .top, 
                           endPoint: .bottom)
                .ignoresSafeArea()
            
            // Form content
            ScrollView {
                VStack(spacing: 25) {
                    Spacer().frame(height: 40)
                    
                    // App logo/title
                    VStack(spacing: 10) {
                        Image(systemName: "figure.run.circle.fill")
                            .font(.system(size: 80))
                            .foregroundColor(.white)
                        
                        Text("Vici")
                            .font(.system(size: 40, weight: .bold))
                            .foregroundColor(.white)
                    }
                    .padding(.bottom, 30)
                    
                    Text(isRegistering ? "Create Account" : "Sign In")
                        .font(.title)
                        .foregroundColor(.white)
                        .padding(.bottom)
                    
                    // Form
                    VStack(spacing: 15) {
                        if isRegistering {
                            VStack(alignment: .leading) {
                                Text("Name")
                                    .font(.caption)
                                    .foregroundColor(.white.opacity(0.8))
                                
                                TextField("", text: $name)
                                    .padding()
                                    .background(Color.white.opacity(0.9))
                                    .cornerRadius(10)
                                    .autocapitalization(.words)
                            }
                        }
                        
                        VStack(alignment: .leading) {
                            Text("Email")
                                .font(.caption)
                                .foregroundColor(.white.opacity(0.8))
                            
                            TextField("", text: $email)
                                .padding()
                                .background(Color.white.opacity(0.9))
                                .cornerRadius(10)
                                .autocapitalization(.none)
                                .keyboardType(.emailAddress)
                        }
                        
                        VStack(alignment: .leading) {
                            Text("Password")
                                .font(.caption)
                                .foregroundColor(.white.opacity(0.8))
                            
                            SecureField("", text: $password)
                                .padding()
                                .background(Color.white.opacity(0.9))
                                .cornerRadius(10)
                        }
                    }
                    .padding(.horizontal)
                    
                    // Error message
                    if let errorMessage = userAuth.errorMessage {
                        Text(errorMessage)
                            .foregroundColor(.red)
                            .padding(.horizontal)
                    }
                    
                    if showingValidationError {
                        Text(validationErrorMessage)
                            .foregroundColor(.red)
                            .padding(.horizontal)
                    }
                    
                    // Primary button
                    Button(action: {
                        showingValidationError = false
                        
                        if !isFormValid {
                            showingValidationError = true
                            return
                        }
                        
                        if isRegistering {
                            userAuth.register(email: email, password: password, name: name)
                        } else {
                            userAuth.login(email: email, password: password)
                        }
                    }) {
                        HStack {
                            if userAuth.isLoading {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                    .padding(.trailing, 5)
                            }
                            
                            Text(isRegistering ? "Register" : "Login")
                                .fontWeight(.bold)
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.purple)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                    }
                    .disabled(userAuth.isLoading)
                    .padding(.horizontal)
                    
                    // Secondary button
                    Button(action: {
                        // Reset error states when switching modes
                        showingValidationError = false
                        isRegistering.toggle()
                    }) {
                        Text(isRegistering ? "Already have an account? Sign In" : "Don't have an account? Register")
                            .foregroundColor(.white)
                    }
                    .padding(.top)
                    
                    Spacer()
                }
                .padding()
            }
        }
    }
}

// Preview for SwiftUI Canvas
struct AuthenticationView_Previews: PreviewProvider {
    static var previews: some View {
        AuthenticationView()
            .environmentObject(UserAuthentication())
    }
} 