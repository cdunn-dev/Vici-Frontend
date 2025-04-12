import SwiftUI

struct AuthenticationView: View {
    @EnvironmentObject var userAuth: UserAuthentication
    @State private var email = ""
    @State private var password = ""
    @State private var isRegistering = false
    @State private var showError = false
    @State private var errorMessage = ""
    
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
            
            SecureField("Password", text: $password)
                .textFieldStyle(RoundedBorderTextFieldStyle())
            
            Button(action: {
                if isRegistering {
                    // Register logic
                    userAuth.register(email: email, password: password)
                } else {
                    // Login logic
                    userAuth.login(email: email, password: password)
                }
            }) {
                Text(isRegistering ? "Register" : "Login")
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(10)
            }
            
            Button(action: {
                isRegistering.toggle()
            }) {
                Text(isRegistering ? "Already have an account? Sign In" : "Don't have an account? Register")
                    .foregroundColor(.blue)
            }
            .padding(.top)
            
            if showError {
                Text(errorMessage)
                    .foregroundColor(.red)
            }
        }
        .padding()
    }
}
