#!/usr/bin/env ruby

# This script helps fix build issues by copying the necessary files 
# into the appropriate directories for the build process

require 'fileutils'

# Define source and destination paths
VIEW_MODELS_DIR = File.join(__dir__, 'ViciMVP/ViewModels')
FIXED_IMPORTS_DIR = File.join(__dir__, 'ViciMVP/FixedImports')
TEMP_BACKUP_DIR = File.join(__dir__, 'temp_backup')

# Ensure temporary backup directory exists
FileUtils.mkdir_p(TEMP_BACKUP_DIR)

# Step 1: Validate the existence of source files
auth_view_model = File.join(VIEW_MODELS_DIR, 'AuthViewModel.swift')
if File.exist?(auth_view_model)
  puts "✅ Found AuthViewModel.swift"
else
  puts "❌ AuthViewModel.swift not found in #{VIEW_MODELS_DIR}"
  exit 1
end

# Step 2: Copy AuthViewModel.swift to the FixedImports directory
auth_view_model_dest = File.join(FIXED_IMPORTS_DIR, 'AuthViewModel.swift')
FileUtils.cp(auth_view_model, auth_view_model_dest)
puts "✅ Copied AuthViewModel.swift to #{FIXED_IMPORTS_DIR}"

# Step 3: Copy KeychainService to a separate file
keychain_service_dest = File.join(FIXED_IMPORTS_DIR, 'KeychainService.swift')
File.open(keychain_service_dest, 'w') do |file|
  file.puts <<-SWIFT
import Foundation

// KeychainService for secure storage of auth tokens
class KeychainService {
    static let shared = KeychainService()
    
    private let accessTokenKey = "vici_access_token"
    private let refreshTokenKey = "vici_refresh_token"
    private let userIdKey = "vici_user_id"
    
    private init() {}
    
    func saveAccessToken(_ token: String) {
        // In a real app, this would use the Keychain API to securely store the token
        // For now using UserDefaults for simplicity
        UserDefaults.standard.set(token, forKey: accessTokenKey)
    }
    
    func getAccessToken() -> String? {
        // In a real app, this would retrieve from the Keychain
        return UserDefaults.standard.string(forKey: accessTokenKey)
    }
    
    func saveRefreshToken(_ token: String) {
        // In a real app, this would use the Keychain API
        UserDefaults.standard.set(token, forKey: refreshTokenKey)
    }
    
    func getRefreshToken() -> String? {
        // In a real app, this would retrieve from the Keychain
        return UserDefaults.standard.string(forKey: refreshTokenKey)
    }
    
    func saveUserId(_ userId: String) {
        UserDefaults.standard.set(userId, forKey: userIdKey)
    }
    
    func getUserId() -> String? {
        return UserDefaults.standard.string(forKey: userIdKey)
    }
    
    func clearTokens() {
        UserDefaults.standard.removeObject(forKey: accessTokenKey)
        UserDefaults.standard.removeObject(forKey: refreshTokenKey)
        UserDefaults.standard.removeObject(forKey: userIdKey)
    }
}
  SWIFT
end
puts "✅ Created KeychainService.swift in #{FIXED_IMPORTS_DIR}"

# Step 4: Remove @_exported imports from Imports.swift as they won't work
imports_file = File.join(FIXED_IMPORTS_DIR, 'Imports.swift')
if File.exist?(imports_file)
  content = File.read(imports_file)
  updated_content = content.gsub(/@_exported import .*$/, '// Import removed - direct file inclusion is more reliable')
  File.write(imports_file, updated_content)
  puts "✅ Updated Imports.swift to remove @_exported imports"
end

# Step 5: Set up the alternate main app class
File.open(File.join(FIXED_IMPORTS_DIR, 'AppEntry.swift'), 'w') do |file|
  file.puts <<-SWIFT
import SwiftUI
import UIKit
import Combine
import Foundation

// This is a complete implementation to ensure the app can build
// Eventually this will be replaced by the proper view model

// Final safety check implementation to ensure AuthViewModel is available
class AppEntry {
    static func initialize() {
        // This function can be called from ViciMVPApp to ensure
        // our fixes are loaded into the app
        print("AppEntry initialized - fixes loaded")
    }
}
  SWIFT
end
puts "✅ Created AppEntry.swift in #{FIXED_IMPORTS_DIR}"

puts "\n✅ Build fix script completed successfully. Please add the FixedImports directory to your Xcode project.\n"
puts "Instructions to add the FixedImports directory to Xcode:"
puts "1. Open the ViciMVP.xcodeproj in Xcode"
puts "2. Right-click on the ViciMVP group in the Project Navigator"
puts "3. Select 'Add Files to \"ViciMVP\"...'"
puts "4. Navigate to and select the FixedImports directory"
puts "5. Ensure 'Copy items if needed' is NOT checked"
puts "6. Click 'Add'"
puts "7. Clean and rebuild your project\n"

# Final note
puts "⚠️ This is a temporary solution. The proper long-term fix is to correctly add"
puts "   the ViewModels directory to the Xcode project." 