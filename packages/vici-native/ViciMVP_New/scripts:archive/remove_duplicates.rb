#!/usr/bin/env ruby

require 'xcodeproj'

# Path to the Xcode project
project_path = 'ViciMVP.xcodeproj'
project = Xcodeproj::Project.open(project_path)

# Get the main target
target = project.targets.first

# Track file paths to detect duplicates
file_paths = {}
duplicates_removed = 0

# Find all file references in the project
project.files.each do |file_ref|
  next unless file_ref.path.end_with?('.swift')
  
  path = file_ref.real_path.to_s
  basename = File.basename(path)
  
  if file_paths[basename]
    # We've found a duplicate
    puts "Found duplicate: #{basename}"
    puts "  - First: #{file_paths[basename][:path]}"
    puts "  - Duplicate: #{path}"
    
    # Remove the duplicate from build phases
    target.source_build_phase.files.each do |build_file|
      if build_file.file_ref == file_ref
        target.source_build_phase.files.delete(build_file)
        puts "  - Removed from build phase"
      end
    end
    
    # Remove the duplicate file reference from project
    file_ref.remove_from_project
    puts "  - Removed from project"
    duplicates_removed += 1
  else
    file_paths[basename] = { ref: file_ref, path: path }
  end
end

# Save the project
project.save

puts "Project cleaned - removed #{duplicates_removed} duplicate file references" 