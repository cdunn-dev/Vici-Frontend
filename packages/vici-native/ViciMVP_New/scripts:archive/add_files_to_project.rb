#!/usr/bin/env ruby

require 'xcodeproj'

# Path to the Xcode project
project_path = 'ViciMVP.xcodeproj'
project = Xcodeproj::Project.open(project_path)

# Find the main group (ViciMVP)
main_group = project.main_group.find_subpath('ViciMVP')
if main_group.nil?
  puts "Error: Could not find the ViciMVP group in the project"
  exit 1
end

# Get all existing file references to avoid duplicates
existing_files = []
project.files.each do |file|
  existing_files << file.real_path.to_s if file.real_path
end

# Helper method to add files without duplicates
def add_files_to_group(group, file_glob, target, existing_files)
  files_added = 0
  
  Dir.glob(file_glob).each do |file|
    # Check if file already exists in the project
    full_path = File.expand_path(file)
    if existing_files.any? { |path| path.include?(File.basename(file)) }
      puts "Skipping (already exists): #{file}"
      next
    end
    
    puts "Adding file: #{file}"
    file_ref = group.new_file(file)
    target.add_file_references([file_ref])
    files_added += 1
  end
  
  return files_added
end

# Find or create ViewModels group
viewmodels_group = main_group.find_subpath('ViewModels')
if viewmodels_group.nil?
  viewmodels_group = main_group.new_group('ViewModels', 'ViciMVP/ViewModels')
end

# Find or create Services group
services_group = main_group.find_subpath('Services')
if services_group.nil?
  services_group = main_group.new_group('Services', 'ViciMVP/Services')
end

# Find or create Models group
models_group = main_group.find_subpath('Models')
if models_group.nil?
  models_group = main_group.new_group('Models', 'ViciMVP/Models')
end

# Get the main target
target = project.targets.first

# Add files to groups
viewmodels_added = add_files_to_group(viewmodels_group, 'ViciMVP/ViewModels/*.swift', target, existing_files)
services_added = add_files_to_group(services_group, 'ViciMVP/Services/*.swift', target, existing_files)
models_added = add_files_to_group(models_group, 'ViciMVP/Models/*.swift', target, existing_files)

# Save the project
project.save

puts "Files added to project: #{viewmodels_added + services_added + models_added} total files"
puts "  - ViewModels: #{viewmodels_added}"
puts "  - Services: #{services_added}"
puts "  - Models: #{models_added}"
