import SwiftUI

struct AuthView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var email = ""
    @State private var password = ""
    @State private var name = ""
    @State private var isRegistering = false
    
    var body: some View {
        GeometryReader { geometry in 
            NavigationView {
                VStack(spacing: 16) {
                    Text("Vici")
                        .font(.system(size: 48, weight: .bold))
                        .padding(.top, geometry.safeAreaInsets.top + 30)
                        .padding(.bottom, 30)
                    
                    VStack(spacing: 15) {
                        if isRegistering {
                            TextField("Full Name", text: $name)
                                .textContentType(.name)
                                .padding()
                                .background(Color(.systemGray6))
                                .cornerRadius(8)
                        }
                        
                        TextField("Email", text: $email)
                            .keyboardType(.emailAddress)
                            .textContentType(.emailAddress)
                            .autocapitalization(.none)
                            .disableAutocorrection(true)
                            .padding()
                            .background(Color(.systemGray6))
                            .cornerRadius(8)
                        
                        SecureField("Password", text: $password)
                            .textContentType(isRegistering ? .newPassword : .password)
                            .padding()
                            .background(Color(.systemGray6))
                            .cornerRadius(8)
                        
                        Button(action: handleAuthAction) {
                            Text(isRegistering ? "Register" : "Login")
                                .fontWeight(.semibold)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.accentColor)
                                .foregroundColor(.white)
                                .cornerRadius(8)
                        }
                        .disabled(email.isEmpty || password.isEmpty || (isRegistering && name.isEmpty) || authViewModel.isLoading)
                        .padding(.top, 10)
                        
                        Button(action: { 
                            isRegistering.toggle()
                            authViewModel.clearError()
                        }) {
                            Text(isRegistering ? "Already have an account? Login" : "Don't have an account? Register")
                                .foregroundColor(.accentColor)
                                .font(.footnote)
                        }
                        
                    }
                    .padding(.horizontal, 20)
                    
                    Spacer()
                    
                    Button(action: { 
                        authViewModel.connectToStrava()
                    }) {
                        HStack {
                            Image("strava_logo_white")
                                .resizable()
                                .scaledToFit()
                                .frame(width: 20, height: 20)
                            Text("Continue with Strava")
                                .fontWeight(.semibold)
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color(red: 0.98, green: 0.31, blue: 0.0))
                        .foregroundColor(.white)
                        .cornerRadius(8)
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, geometry.safeAreaInsets.bottom + 10)
                    
                }
                .navigationBarHidden(true)
                .ignoresSafeArea(.keyboard)
                .loadingFullscreen(isLoading: authViewModel.isLoading, message: isRegistering ? "Creating account..." : "Signing in...")
                .errorToast(error: authViewModel.appError) {
                    authViewModel.clearError()
                }
            }
        }
    }
    
    private func handleAuthAction() {
        authViewModel.clearError()
        
        if isRegistering {
            authViewModel.register(email: email, password: password, name: name)
        } else {
            authViewModel.login(email: email, password: password)
        }
    }
}

#Preview {
    AuthView()
        .environmentObject(AuthViewModel.loggedOutPreview())
} 