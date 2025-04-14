//
//  ProfileView.swift
//  ViciMVP
//
//  Created on 15/07/2025
//

import SwiftUI

struct ProfileView: View {
    @EnvironmentObject private var authViewModel: AuthViewModel
    @State private var isEditingProfile = false
    @State private var showingStravaConnect = false
    @State private var showingLogoutAlert = false
    @State private var fullName = ""
    @State private var email = ""
    @State private var bio = ""
    @State private var isLoading = false
    @State private var errorMessage: String? = nil
    
    // Strava connection status
    private var isStravaConnected: Bool {
        return authViewModel.currentUser?.stravaConnected ?? false
    }
    
    var body: some View {
        NavigationView {
            ZStack {
                ScrollView {
                    VStack(spacing: 24) {
                        profileHeader
                        
                        if isEditingProfile {
                            profileEditForm
                        } else {
                            profileInfoSection
                            
                            stravaConnectionSection
                            
                            settingsSection
                        }
                        
                        if !isEditingProfile {
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
                            .padding(.top, 24)
                        }
                    }
                    .padding(.bottom, 40)
                }
                .padding(.top, 1) // Fix ScrollView offset issue
                
                if isLoading {
                    Color.black.opacity(0.4)
                        .ignoresSafeArea()
                    ProgressView()
                        .tint(.white)
                        .scaleEffect(1.5)
                }
            }
            .navigationTitle("Profile")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    if isEditingProfile {
                        Button("Save") {
                            saveProfile()
                        }
                    } else {
                        Button("Edit") {
                            prepareForEditing()
                        }
                    }
                }
                
                ToolbarItem(placement: .navigationBarLeading) {
                    if isEditingProfile {
                        Button("Cancel") {
                            isEditingProfile = false
                        }
                    }
                }
            }
            .alert(isPresented: $showingLogoutAlert) {
                Alert(
                    title: Text("Log Out"),
                    message: Text("Are you sure you want to log out?"),
                    primaryButton: .destructive(Text("Log Out")) {
                        authViewModel.logout()
                    },
                    secondaryButton: .cancel()
                )
            }
            .alert(item: Binding<IdentifiableAlert?>(
                get: { errorMessage.map { IdentifiableAlert(message: $0) } },
                set: { errorMessage = $0?.message }
            )) { alert in
                Alert(
                    title: Text("Error"),
                    message: Text(alert.message),
                    dismissButton: .default(Text("OK"))
                )
            }
            .onAppear {
                if !isEditingProfile {
                    loadUserData()
                }
            }
            .sheet(isPresented: $showingStravaConnect) {
                StravaConnectionView()
            }
        }
    }
    
    private var profileHeader: some View {
        VStack(spacing: 16) {
            // Profile image
            ZStack {
                Circle()
                    .fill(Color.orange)
                    .frame(width: 100, height: 100)
                
                if let initials = initialsFromName() {
                    Text(initials)
                        .font(.system(size: 36, weight: .bold))
                        .foregroundColor(.white)
                } else {
                    Image(systemName: "person.fill")
                        .font(.system(size: 40))
                        .foregroundColor(.white)
                }
                
                // Edit button shown only when not in edit mode
                if !isEditingProfile {
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
            
            // User name
            if !isEditingProfile {
                Text(authViewModel.currentUser?.fullName ?? "Runner")
                    .font(.title)
                    .fontWeight(.bold)
                
                // User email
                Text(authViewModel.currentUser?.email ?? "")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.bottom, 10)
    }
    
    private var profileInfoSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            sectionHeader("Profile Information")
            
            infoRow(title: "Name", value: authViewModel.currentUser?.fullName ?? "Not set")
            infoRow(title: "Email", value: authViewModel.currentUser?.email ?? "Not set")
            infoRow(title: "Bio", value: authViewModel.currentUser?.bio ?? "Add a short bio")
            
            if let joinDate = authViewModel.currentUser?.createdAt {
                let formatter = DateFormatter()
                formatter.dateStyle = .medium
                infoRow(title: "Joined", value: formatter.string(from: joinDate))
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(10)
        .padding(.horizontal)
    }
    
    private var stravaConnectionSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            sectionHeader("Strava Connection")
            
            HStack {
                Image("strava-logo")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 30, height: 30)
                    .foregroundColor(.orange)
                
                VStack(alignment: .leading) {
                    Text(isStravaConnected ? "Connected to Strava" : "Not connected")
                        .font(.headline)
                    Text(isStravaConnected ? "Your activities are automatically synced" : "Connect to import your activities")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                Button(action: {
                    if isStravaConnected {
                        disconnectStrava()
                    } else {
                        showingStravaConnect = true
                    }
                }) {
                    Text(isStravaConnected ? "Disconnect" : "Connect")
                        .font(.callout)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(isStravaConnected ? Color.red : Color.orange)
                        .foregroundColor(.white)
                        .cornerRadius(8)
                }
            }
            .padding(.vertical, 8)
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(10)
        .padding(.horizontal)
    }
    
    private var settingsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            sectionHeader("Settings")
            
            settingsRow(title: "Notifications", icon: "bell.fill") {
                // Handle notifications settings
            }
            
            settingsRow(title: "Privacy", icon: "lock.fill") {
                // Handle privacy settings
            }
            
            settingsRow(title: "Help & Support", icon: "questionmark.circle.fill") {
                // Handle help
            }
            
            settingsRow(title: "About", icon: "info.circle.fill") {
                // Show about info
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(10)
        .padding(.horizontal)
    }
    
    private var profileEditForm: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("Edit Profile")
                .font(.headline)
                .padding(.horizontal)
            
            VStack(spacing: 16) {
                VStack(alignment: .leading) {
                    Text("Full Name")
                        .font(.callout)
                        .foregroundColor(.secondary)
                    
                    TextField("Full Name", text: $fullName)
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(8)
                }
                
                VStack(alignment: .leading) {
                    Text("Email")
                        .font(.callout)
                        .foregroundColor(.secondary)
                    
                    TextField("Email", text: $email)
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(8)
                        .disabled(true) // Email cannot be changed
                        .foregroundColor(.gray)
                }
                
                VStack(alignment: .leading) {
                    Text("Bio")
                        .font(.callout)
                        .foregroundColor(.secondary)
                    
                    TextEditor(text: $bio)
                        .padding()
                        .frame(minHeight: 100)
                        .background(Color(.systemGray6))
                        .cornerRadius(8)
                }
            }
            .padding()
            .background(Color.white)
            .cornerRadius(10)
            .padding(.horizontal)
        }
    }
    
    // Helper Views
    
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
    
    // Helper Methods
    
    private func initialsFromName() -> String? {
        guard let fullName = authViewModel.currentUser?.fullName, !fullName.isEmpty else { return nil }
        
        let components = fullName.components(separatedBy: " ")
        if components.count > 1, let first = components.first?.first, let last = components.last?.first {
            return String(first) + String(last)
        } else if let first = components.first?.first {
            return String(first)
        }
        
        return nil
    }
    
    private func loadUserData() {
        guard let user = authViewModel.currentUser else { return }
        
        fullName = user.fullName
        email = user.email
        bio = user.bio ?? ""
    }
    
    private func prepareForEditing() {
        loadUserData()
        isEditingProfile = true
    }
    
    private func saveProfile() {
        isLoading = true
        
        // Prepare profile update data
        let profileData: [String: Any] = [
            "fullName": fullName,
            "bio": bio
        ]
        
        // Call the AuthViewModel update method
        Task {
            do {
                try await authViewModel.updateProfile(profileData: profileData)
                
                // Update successful
                DispatchQueue.main.async {
                    isLoading = false
                    isEditingProfile = false
                }
            } catch {
                // Handle error
                DispatchQueue.main.async {
                    isLoading = false
                    errorMessage = "Failed to update profile: \(error.localizedDescription)"
                }
            }
        }
    }
    
    private func disconnectStrava() {
        isLoading = true
        
        // Call disconnect method
        Task {
            do {
                try await authViewModel.disconnectStrava()
                
                DispatchQueue.main.async {
                    isLoading = false
                }
            } catch {
                DispatchQueue.main.async {
                    isLoading = false
                    errorMessage = "Failed to disconnect Strava: \(error.localizedDescription)"
                }
            }
        }
    }
}

// Helper struct for identifying alerts
struct IdentifiableAlert: Identifiable {
    var id = UUID()
    var message: String
}

struct ProfileView_Previews: PreviewProvider {
    static var previews: some View {
        ProfileView()
            .environmentObject(AuthViewModel())
    }
} 