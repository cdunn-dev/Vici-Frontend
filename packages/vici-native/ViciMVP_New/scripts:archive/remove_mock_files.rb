#!/usr/bin/ruby
require "xcodeproj"

# Open the project
project_path = "ViciMVP.xcodeproj"
project = Xcodeproj::Project.open(project_path)

# Find all file references to delete (MockData.swift)
files_to_remove = []
project.files.each do |file|
  if file.path.end_with?("MockData.swift")
    puts "Found file to remove: #{file.path}"
    files_to_remove << file
  end
end

# Remove each file
files_to_remove.each do |file|
  file.remove_from_project
  puts "Removed file: #{file.path}"
end

# Save the project
project.save
puts "Project saved!"
