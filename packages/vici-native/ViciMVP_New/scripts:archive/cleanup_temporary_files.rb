#!/usr/bin/env ruby

# This script cleans up any temporary files and directories
# that were created during development but are no longer needed

require 'fileutils'

# Define paths
PROJECT_ROOT = File.dirname(__FILE__)
FIXED_IMPORTS_DIR = File.join(PROJECT_ROOT, 'ViciMVP/FixedImports')
TEMP_BACKUP_DIR = File.join(PROJECT_ROOT, 'temp_backup')

# Array to track actions
actions = []

# Remove FixedImports directory
if Dir.exist?(FIXED_IMPORTS_DIR)
  puts "🗑️ Removing FixedImports directory: #{FIXED_IMPORTS_DIR}"
  FileUtils.rm_rf(FIXED_IMPORTS_DIR)
  actions << "Removed FixedImports directory"
end

# Remove temp_backup directory if it exists
if Dir.exist?(TEMP_BACKUP_DIR)
  puts "🗑️ Removing temp_backup directory: #{TEMP_BACKUP_DIR}"
  FileUtils.rm_rf(TEMP_BACKUP_DIR)
  actions << "Removed temp_backup directory"
end

# Find and remove any *_Fixed.swift files
fixed_files = Dir.glob(File.join(PROJECT_ROOT, '**/*_Fixed.swift'))
if fixed_files.any?
  puts "🗑️ Removing temporary fixed files:"
  fixed_files.each do |file|
    puts "  - #{file}"
    FileUtils.rm(file)
    actions << "Removed #{File.basename(file)}"
  end
end

# Find and remove any *.problematic files
problematic_files = Dir.glob(File.join(PROJECT_ROOT, '**/*.problematic'))
if problematic_files.any?
  puts "🗑️ Removing .problematic files:"
  problematic_files.each do |file|
    puts "  - #{file}"
    FileUtils.rm(file)
    actions << "Removed #{File.basename(file)}"
  end
end

# Find any script files that were temporary
temp_scripts = Dir.glob(File.join(PROJECT_ROOT, '*fix*.rb'))
if temp_scripts.any?
  puts "⚠️ Found temporary script files (these will NOT be deleted automatically):"
  temp_scripts.each do |file|
    if file != __FILE__ # Don't list the current script
      puts "  - #{file}"
    end
  end
  actions << "Found temporary script files (not deleted)"
end

# Print summary
if actions.empty?
  puts "\n✅ No temporary files were found. The project is already clean."
else
  puts "\n✅ Cleanup complete! Actions performed:"
  actions.each_with_index do |action, index|
    puts "#{index + 1}. #{action}"
  end
end

puts "\n📝 NEXT STEPS:"
puts "1. In Xcode, use File > Add Files to \"ViciMVP\"... to add the ViewModels directory"
puts "2. Check if any service files need to be added similarly"
puts "3. Clean the build folder (Shift+Cmd+K)"
puts "4. Build the project (Cmd+B) to verify everything is working" 