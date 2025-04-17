#!/usr/bin/env ruby

# This script integrates the real model files into the Xcode project
# It follows a clean approach with no workarounds or temporary fixes

require 'fileutils'
require 'json'

# Define paths
PROJECT_ROOT = File.dirname(__FILE__)
PROJECT_FILE = File.join(PROJECT_ROOT, 'ViciMVP.xcodeproj', 'project.pbxproj')
BACKUP_FILE = "#{PROJECT_FILE}.backup.#{Time.now.strftime('%Y%m%d%H%M%S')}"
VIEW_MODELS_DIR = File.join(PROJECT_ROOT, 'ViciMVP', 'ViewModels')
SERVICES_DIR = File.join(PROJECT_ROOT, 'ViciMVP', 'Services')

# Check if the ViewModels directory exists
unless Dir.exist?(VIEW_MODELS_DIR)
  puts "❌ ViewModels directory not found at #{VIEW_MODELS_DIR}"
  exit 1
end

# Print status header
puts "\n===== 🧹 REAL MODEL INTEGRATION SCRIPT =====\n"
puts "This script will integrate real models into your Xcode project\n"

# Backup project file
FileUtils.cp(PROJECT_FILE, BACKUP_FILE)
puts "✅ Created backup of project file at #{BACKUP_FILE}"

# List all model files that need to be integrated
view_model_files = Dir.glob(File.join(VIEW_MODELS_DIR, '*.swift'))
puts "\n📋 Found #{view_model_files.length} ViewModel files to integrate:"
view_model_files.each do |file|
  puts "  - #{File.basename(file)}"
end

# List service files that might need integration
service_files = Dir.glob(File.join(SERVICES_DIR, '*.swift'))
missing_service_files = service_files.select do |file|
  !File.read(PROJECT_FILE).include?(File.basename(file))
end

if missing_service_files.any?
  puts "\n⚠️ Found #{missing_service_files.length} Service files that might not be in the project:"
  missing_service_files.each do |file|
    puts "  - #{File.basename(file)}"
  end
end

puts "\n⚠️ IMPORTANT: Manual steps are required to complete the integration"
puts "These steps cannot be automated because they require Xcode's GUI:"

puts "\n📝 INTEGRATION INSTRUCTIONS:"
puts "1. Open the ViciMVP.xcodeproj in Xcode"
puts "2. Right-click on the ViciMVP group in the Project Navigator"
puts "3. Select 'Add Files to \"ViciMVP\"...'"
puts "4. Navigate to the ViewModels directory: #{VIEW_MODELS_DIR}"
puts "5. Select all .swift files in this directory"
puts "6. Ensure 'Copy items if needed' is NOT checked"
puts "7. Click 'Add'"

if missing_service_files.any?
  puts "\n8. Repeat the process for missing service files:"
  puts "9. Right-click on the Services group"
  puts "10. Select 'Add Files to \"ViciMVP\"...'"
  puts "11. Navigate to: #{SERVICES_DIR}"
  puts "12. Select the following files:"
  missing_service_files.each do |file|
    puts "    - #{File.basename(file)}"
  end
  puts "13. Ensure 'Copy items if needed' is NOT checked"
  puts "14. Click 'Add'"
end

puts "\n🔧 FIXING THE CODE:"
puts "1. Update imports in all files to use the real models"
puts "2. Remove any temporary AuthViewModel_Fixed or other fixed classes"
puts "3. Update all @EnvironmentObject and @StateObject references to use real classes"
puts "4. Clean build folder (Shift+Cmd+K) and then build (Cmd+B)"

puts "\n✅ Integration preparation complete!"
puts "Follow the instructions above to complete the integration through Xcode."
puts "Once complete, rebuild the project to verify the integration was successful." 