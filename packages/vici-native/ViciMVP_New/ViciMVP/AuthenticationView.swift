import SwiftUI

struct AuthenticationView: View {
    @State private var email = ""
    @State private var password = ""
    @State private var isLogin = true
    
    var body: some View {
        VStack {
            Text(isLogin ? "Login" : "Register")
                .font(.largeTitle)
                .bold()
                .padding(.bottom, 30)
            
            TextField("Email", text: $email)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .padding(.horizontal)
                .autocapitalization(.none)
                .keyboardType(.emailAddress)
            
            SecureField("Password", text: $password)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .padding(.horizontal)
            
            Button(action: {
                // Authentication would happen here
            }) {
                Text(isLogin ? "Sign In" : "Sign Up")
                    .font(.headline)
                    .foregroundColor(.white)
                    .padding()
                    .frame(width: 220, height: 60)
                    .background(Color.blue)
                    .cornerRadius(15.0)
            }
            .padding(.top, 30)
            
            Button(action: {
                isLogin.toggle()
            }) {
                Text(isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In")
                    .foregroundColor(.blue)
            }
            .padding(.top, 20)
        }
        .padding()
    }
}

// Preview for SwiftUI Canvas
struct AuthenticationView_Previews: PreviewProvider {
    static var previews: some View {
        AuthenticationView()
    }
} 