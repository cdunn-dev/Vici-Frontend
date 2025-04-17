#!/usr/bin/env ruby

require 'xcodeproj'

# Path to the Xcode project
project_path = 'ViciMVP.xcodeproj'
project = Xcodeproj::Project.open(project_path)

# Get the main target
target = project.targets.first

puts "=== Cleaning Project File References ==="

# Step 1: Remove all Swift file references from build phases
source_build_phase = target.source_build_phase
removed_refs = []
source_build_phase.files.each do |build_file|
  file_ref = build_file.file_ref
  
  # Only process Swift files
  if file_ref && file_ref.path && file_ref.path.end_with?('.swift')
    removed_refs << file_ref.path
    source_build_phase.remove_build_file(build_file)
  end
end

puts "Removed #{removed_refs.count} build file references"

# Step 2: Find and remove problematic file references
def find_all_file_refs(group)
  files = []
  
  group.files.each do |file_ref|
    files << file_ref if file_ref.path && file_ref.path.end_with?('.swift')
  end
  
  group.groups.each do |subgroup|
    files.concat(find_all_file_refs(subgroup))
  end
  
  return files
end

all_file_refs = find_all_file_refs(project.main_group)
puts "Found #{all_file_refs.count} total file references"

# Remove all existing Swift file references
all_file_refs.each do |file_ref|
  puts "Removing file reference: #{file_ref.path}"
  file_ref.remove_from_project
end

# Step 3: Create Clean Group Structure
main_group = project.main_group.find_subpath('ViciMVP')
if main_group.nil?
  main_group = project.main_group.new_group('ViciMVP', 'ViciMVP')
end

# Create needed groups
viewmodels_group = main_group.find_subpath('ViewModels')
viewmodels_group = main_group.new_group('ViewModels', 'ViciMVP/ViewModels') if viewmodels_group.nil?

services_group = main_group.find_subpath('Services')
services_group = main_group.new_group('Services', 'ViciMVP/Services') if services_group.nil?

models_group = main_group.find_subpath('Models')
models_group = main_group.new_group('Models', 'ViciMVP/Models') if models_group.nil?

# Step 4: Add files with proper paths
def add_files_to_group(group, file_path_pattern, target)
  files_added = []
  Dir.glob(file_path_pattern).each do |file_path|
    puts "Adding file: #{file_path}"
    file_ref = group.new_file(file_path)
    target.source_build_phase.add_file_reference(file_ref, true)
    files_added << file_path
  end
  files_added
end

viewmodel_files = add_files_to_group(viewmodels_group, 'ViciMVP/ViewModels/*.swift', target)
service_files = add_files_to_group(services_group, 'ViciMVP/Services/*.swift', target)
model_files = add_files_to_group(models_group, 'ViciMVP/Models/*.swift', target)

# Save the project
project.save

puts "=== Project Structure Fixed ==="
puts "Added #{viewmodel_files.count} ViewModels"
puts "Added #{service_files.count} Services"
puts "Added #{model_files.count} Models"
puts "Total files added: #{viewmodel_files.count + service_files.count + model_files.count}" 