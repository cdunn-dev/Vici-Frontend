#!/usr/bin/env ruby

require 'xcodeproj'

# Path to the Xcode project
project_path = 'ViciMVP.xcodeproj'
project = Xcodeproj::Project.open(project_path)

# Get the main target
target = project.targets.first

# Find the main group
main_group = project.main_group.find_subpath('ViciMVP')
if main_group.nil?
  puts "Error: Could not find the ViciMVP group"
  exit 1
end

# Add the main app files
main_files = [
  'ViciMVP/ViciMVPApp.swift',
  'ViciMVP/MainTabView.swift',
  'ViciMVP/AuthenticationView.swift',
  'ViciMVP/Views/StravaConnectView.swift'
]

main_files.each do |file_path|
  if File.exist?(file_path)
    puts "Adding file: #{file_path}"
    file_ref = main_group.new_file(file_path)
    target.source_build_phase.add_file_reference(file_ref, true)
  else
    puts "Warning: File not found: #{file_path}"
  end
end

# Save the project
project.save

puts "Main app files added to project" 