import SwiftUI

/// View for displaying and editing user profile information
struct ProfileView: View {
    @StateObject private var viewModel = ProfileViewModel()
    @Environment(\.colorScheme) private var colorScheme
    @State private var showingLogoutAlert = false
    @State private var showingStravaConnect = false
    
    var body: some View {
        NavigationView {
            ZStack {
                ScrollView {
                    VStack(spacing: 24) {
                        // Profile header with avatar and name
                        profileHeader
                        
                        if viewModel.isEditing {
                            // Edit form when in edit mode
                            profileEditForm
                        } else {
                            // View mode - display user info
                            profileInfoSection
                            
                            // Strava connection card
                            stravaConnectionSection
                            
                            // Settings and preferences
                            settingsSection
                            
                            // Logout button
                            Button(action: {
                                showingLogoutAlert = true
                            }) {
                                Text("Log Out")
                                    .foregroundColor(.red)
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color(.systemGray6))
                                    .cornerRadius(10)
                            }
                            .padding(.horizontal)
                            .padding(.top, 8)
                        }
                    }
                    .padding(.bottom, 40)
                }
                .refreshable {
                    viewModel.loadUserProfile()
                }
                
                // Loading overlay
                if viewModel.isLoading {
                    Color.black.opacity(0.4)
                        .ignoresSafeArea()
                    ProgressView()
                        .scaleEffect(1.5)
                        .tint(.white)
                }
                
                // Error alert
                if let errorMessage = viewModel.errorMessage {
                    VStack {
                        Spacer()
                        
                        HStack {
                            Image(systemName: "exclamationmark.triangle")
                                .foregroundColor(.white)
                            
                            Text(errorMessage)
                                .foregroundColor(.white)
                            
                            Spacer()
                            
                            Button(action: {
                                viewModel.errorMessage = nil
                            }) {
                                Image(systemName: "xmark.circle.fill")
                                    .foregroundColor(.white)
                            }
                        }
                        .padding()
                        .background(Color.red)
                        .cornerRadius(10)
                        .padding()
                    }
                }
            }
            .navigationTitle("Profile")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    if viewModel.isEditing {
                        Button("Save") {
                            saveProfile()
                        }
                    } else {
                        Button("Edit") {
                            viewModel.startEditing()
                        }
                    }
                }
                
                ToolbarItem(placement: .navigationBarLeading) {
                    if viewModel.isEditing {
                        Button("Cancel") {
                            viewModel.cancelEditing()
                        }
                    }
                }
            }
            .alert("Log Out", isPresented: $showingLogoutAlert) {
                Button("Cancel", role: .cancel) {}
                Button("Log Out", role: .destructive) {
                    logoutUser()
                }
            } message: {
                Text("Are you sure you want to log out of your account?")
            }
            .sheet(isPresented: $showingStravaConnect) {
                StravaConnectView()
            }
            .onAppear {
                viewModel.loadUserProfile()
            }
        }
    }
    
    // MARK: - View Components
    
    /// Profile header with avatar and name
    private var profileHeader: some View {
        VStack(spacing: 16) {
            // Profile image
            ZStack {
                Circle()
                    .fill(Color.orange)
                    .frame(width: 100, height: 100)
                
                Text(viewModel.getInitials())
                    .font(.system(size: 36, weight: .bold))
                    .foregroundColor(.white)
                
                // Edit indicator when not in edit mode
                if !viewModel.isEditing {
                    Circle()
                        .fill(Color.blue)
                        .frame(width: 30, height: 30)
                        .overlay(
                            Image(systemName: "camera.fill")
                                .font(.system(size: 14))
                                .foregroundColor(.white)
                        )
                        .offset(x: 35, y: 35)
                }
            }
            .padding(.top, 20)
            
            // User info
            if !viewModel.isEditing {
                Text(viewModel.displayName)
                    .font(.title)
                    .fontWeight(.bold)
                
                Text(viewModel.user?.email ?? "")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.bottom, 10)
    }
    
    /// Information section when viewing profile
    private var profileInfoSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            sectionHeader("Profile Information")
            
            infoRow(title: "Name", value: viewModel.user?.name ?? "Not set")
            infoRow(title: "Email", value: viewModel.user?.email ?? "")
            
            if let experienceLevel = viewModel.user?.experienceLevel {
                infoRow(title: "Experience", value: experienceLevel)
            }
            
            if let goal = viewModel.user?.runnerProfile?.primaryGoal {
                infoRow(title: "Goal", value: goal)
            }
            
            if let createdAt = viewModel.user?.createdAt {
                let formatter = DateFormatter()
                formatter.dateStyle = .medium
                infoRow(title: "Joined", value: formatter.string(from: createdAt))
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(10)
        .padding(.horizontal)
    }
    
    /// Form for editing profile information
    private var profileEditForm: some View {
        VStack(alignment: .leading, spacing: 16) {
            sectionHeader("Edit Profile")
            
            VStack(alignment: .leading, spacing: 8) {
                Text("Name")
                    .font(.headline)
                    .foregroundColor(.secondary)
                
                TextField("Enter your name", text: $viewModel.name)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .padding(.bottom, 8)
                
                Text("Bio/Goal")
                    .font(.headline)
                    .foregroundColor(.secondary)
                
                TextEditor(text: $viewModel.bio)
                    .frame(height: 100)
                    .padding(4)
                    .background(
                        RoundedRectangle(cornerRadius: 8)
                            .stroke(Color(.systemGray4))
                    )
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(10)
        }
        .padding(.horizontal)
    }
    
    /// Strava connection section
    private var stravaConnectionSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            sectionHeader("Integrations")
            
            Button(action: {
                showingStravaConnect = true
            }) {
                HStack {
                    Image("strava_logo")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 30, height: 30)
                        .clipShape(Circle())
                    
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Strava")
                            .font(.headline)
                        
                        Text(viewModel.isStravaConnected ? "Connected" : "Connect to import activities")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                    
                    if viewModel.isStravaConnected {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.green)
                    } else {
                        Image(systemName: "plus.circle")
                            .foregroundColor(.blue)
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(10)
            }
            .buttonStyle(PlainButtonStyle())
        }
        .padding(.horizontal)
    }
    
    /// Settings section
    private var settingsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            sectionHeader("Settings")
            
            settingsRow(title: "Notifications", icon: "bell.fill") {
                // Handle notifications
            }
            
            settingsRow(title: "Privacy & Data", icon: "lock.fill") {
                // Handle privacy settings
            }
            
            settingsRow(title: "Help & Support", icon: "questionmark.circle.fill") {
                // Handle help
            }
        }
        .padding(.horizontal)
    }
    
    // MARK: - Helper Views
    
    private func sectionHeader(_ title: String) -> some View {
        Text(title)
            .font(.headline)
            .foregroundColor(.primary)
    }
    
    private func infoRow(title: String, value: String) -> some View {
        HStack(alignment: .top) {
            Text(title)
                .font(.callout)
                .foregroundColor(.secondary)
                .frame(width: 80, alignment: .leading)
            
            Text(value)
                .font(.callout)
            
            Spacer()
        }
        .padding(.vertical, 4)
    }
    
    private func settingsRow(title: String, icon: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack {
                Image(systemName: icon)
                    .frame(width: 30, height: 30)
                    .foregroundColor(.blue)
                
                Text(title)
                    .font(.body)
                    .foregroundColor(.primary)
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding(.vertical, 8)
        }
    }
    
    // MARK: - Actions
    
    private func saveProfile() {
        Task {
            if await viewModel.updateProfile() {
                // Success - UI already updated by the view model
            }
        }
    }
    
    private func logoutUser() {
        Task {
            if await viewModel.logout() {
                // Navigate to login screen would happen here
                // This is handled by the app's root view based on auth state
            }
        }
    }
}

// MARK: - Preview

struct ProfileView_Previews: PreviewProvider {
    static var previews: some View {
        ProfileView()
    }
}
