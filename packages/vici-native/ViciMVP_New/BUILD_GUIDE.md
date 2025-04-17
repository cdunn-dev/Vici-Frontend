# Vici App Comprehensive Build Guide

This guide provides a complete reference for building, maintaining, and troubleshooting the Vici app, with special attention to model integration and architecture best practices.

## Table of Contents
1. [Standard Build Process](#standard-build-process)
2. [Project Architecture](#project-architecture)
3. [Model Integration](#model-integration)
4. [Common Build Issues](#common-build-issues)
5. [Advanced Troubleshooting](#advanced-troubleshooting)
6. [Development Workflow](#development-workflow)
7. [Error Handling Best Practices](#error-handling-best-practices)
8. [Testing Strategy](#testing-strategy)
9. [Long-term Maintenance](#long-term-maintenance)

## Standard Build Process

1. Clone the repository
   ```bash
   git clone https://github.com/your-org/Vici-App.git
   cd Vici-App
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Navigate to the iOS project
   ```bash
   cd packages/vici-native/ViciMVP_New
   ```

4. Open in Xcode
   ```bash
   open ViciMVP.xcodeproj
   ```

5. Select your target device and build (⌘+B)

## Project Architecture

### Directory Structure

```
ViciMVP/
  ├── Models/            # Core data structures and domain objects
  │   ├── Core/          # Main models (User, Workout, TrainingPlan, etc.)
  │   └── Extensions/    # Model extensions (preview data, etc.)
  ├── Views/             # UI components
  │   ├── Core/          # Main views
  │   ├── Components/    # Reusable view components
  │   └── Screens/       # Main app screens
  ├── ViewModels/        # Business logic and state management
  ├── Services/          # API and business services
  ├── Utilities/         # Helper functions
  └── Resources/         # Assets, configs, etc.
```

### Key Files and Their Purpose

#### ViewModels
- **AuthViewModel.swift** - Handles authentication, user session management, and Strava connectivity
- **TrainingPlanViewModel.swift** - Manages training plan data, workout schedules, and plan updates
- **AskViciViewModel.swift** - Handles interactions with the AI coach feature
- **UserViewModel.swift** - Manages user profile data and preferences

#### Services
- **APIClient.swift** - Core networking layer for API communication
- **AuthService.swift** - Authentication service for user login/registration
- **KeychainService.swift** - Secure storage of authentication tokens
- **TrainingService.swift** - Service for training plan operations
- **StravaService.swift** - Integration with Strava API

### Architecture Principles

1. **Separation of Concerns**
   - Models define data structures only
   - ViewModels handle business logic and state
   - Views handle presentation only
   - Services handle external communication

2. **Dependency Injection**
   - ViewModels receive Services through initializers
   - Use protocols for service interfaces to enable testing
   - Avoid direct instantiation within components

3. **State Management**
   - Use `@Published` properties in ViewModels
   - Utilize SwiftUI's environment for providing shared state
   - Understand the proper use of `@State`, `@ObservedObject`, and `@EnvironmentObject`

## Model Integration

### Integration Guidelines

1. **Xcode Project Structure**
   - All model files must be added to the Xcode project (not copied)
   - Files should be organized in groups matching their directory structure
   - Never create duplicate "fixed" versions of models

2. **Dependency Management**
   - Use proper dependency injection for services
   - ViewModels should accept services via their initializers
   - Use protocols for service interfaces to enable testing

3. **Adding New Models**
   - Create the model in the appropriate directory
   - Add it to the Xcode project
   - Update any dependent files with proper imports

### Real Model Migration Process

1. **Analysis Phase**
   - Identify all model dependencies
   - Document property differences between mock and real models
   - Plan the migration sequence based on dependencies

2. **Implementation Phase**
   - Create preview extensions for real models (e.g., `Workout+Preview.swift`)
   - Implement real models with appropriate properties
   - Update ViewModels to use real services
   - Update Views to reference correct model properties

3. **Testing Phase**
   - Clean build folder and derived data
   - Build project and fix any compile errors
   - Run the app and verify functionality with real models

### Best Practices

1. **Always Add Files to Xcode Project**: When creating new Swift files, always add them to the Xcode project immediately.
2. **Proper Imports**: Ensure all files have proper import statements.
3. **No Temporary Fixes**: Address issues at their source rather than creating workarounds.
4. **Clear Documentation**: Document model structures, relationships, and usage patterns.
5. **Preview Extensions**: Create separate preview extensions for sample data rather than embedding in the model.

## Common Build Issues

Before troubleshooting complex issues, always start with a clean build:

1. In Xcode: Product > Clean Build Folder (⇧⌘K)
2. Delete derived data:
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData/ViciMVP-*
   ```

### Common Errors and Solutions

#### 1. "Cannot find type 'X' in scope"

**Possible causes:**
- Missing import
- Multiple definitions of the same type
- Circular dependencies
- File not added to the Xcode project

**Solutions:**
- Add the necessary import statement
- Ensure the type is defined only once
- Check for circular dependencies and break them
- Verify the file is added to the Xcode project

#### 2. "File 'X.swift' not found"

**Possible causes:**
- File was moved or deleted but still referenced in project
- Git issue where file is not properly tracked
- File exists but is not added to the Xcode project

**Solutions:**
- Check if file exists in expected location
- Run `git status` to verify file is tracked
- Add the file to the Xcode project
- Update project file references in project.pbxproj

#### 3. "Ambiguous use of 'X'"

**Possible causes:**
- Multiple definitions with the same name
- Type name conflicts between modules
- Mock and real implementations with the same name

**Solutions:**
- Use fully qualified names (e.g., `Module.TypeName`)
- Rename one of the conflicting definitions
- Use typealias to disambiguate
- Implement model extensions instead of duplicate models

#### 4. "Undefined symbols for architecture..."

**Possible causes:**
- Missing implementation files
- Circular dependencies
- Linking issues

**Solutions:**
- Ensure implementation files are included in the target
- Break circular dependencies
- Check target membership for affected files

### Identified Project-Specific Issues

1. **Missing ViewModels in Project**: The ViewModels directory and its Swift files existed in the filesystem but were not included in the Xcode project.
2. **Missing Service Files**: Several service files existed but were not properly included in the project.
3. **Temporary Files**: Some temporary fixed versions of models were created as workarounds.

## Advanced Troubleshooting

### Using The Temporary Fix Script

If you encounter persistent build issues, we've created a script to temporarily exclude problematic files:

```bash
./exclude_files_from_build.rb --exclude "ProblemFile1.swift,ProblemFile2.swift"
```

To restore files:
```bash
./exclude_files_from_build.rb --restore
```

**Note**: This is a temporary solution. The root cause should be addressed as soon as possible.

### Build with Verbose Output

```bash
xcodebuild -project ViciMVP.xcodeproj -scheme ViciMVP -configuration Debug -destination "platform=iOS Simulator,name=iPhone 14" build -verbose
```

### Analyze Specific Files

```bash
swiftc -parse {filename}.swift -dump-ast
```

### Check for Circular Dependencies

Look for patterns where File A imports File B and File B imports File A.

### Check for Duplicate Symbols

Review the linker output for duplicate symbol errors:

```bash
xcodebuild -project ViciMVP.xcodeproj -scheme ViciMVP 2>&1 | grep duplicate
```

### Project File Path Troubleshooting

When encountering build errors related to missing files that should exist, the issue is often in the Xcode project file path references.

#### Step 1: Diagnose Path References

Use Ruby to inspect the project file references:

```ruby
ruby -e 'require "xcodeproj"; proj = Xcodeproj::Project.open("ViciMVP.xcodeproj"); build_files = proj.targets.first.source_build_phase.files.map { |f| f.file_ref.path rescue nil }.compact; puts "Files in build phase:"; puts build_files'
```

Look for paths with duplicate directory patterns like `ViciMVP/ViciMVP/` or other incorrect nesting.

#### Step 2: Check for Incorrect Nested Paths

Use grep to find problematic path patterns:

```bash
grep -r "ViciMVP/ViciMVP" ViciMVP.xcodeproj/
```

#### Step 3: Fix Path References

For simple fixes, use sed to correct paths:

```bash
sed -i '' 's/ViciMVP\/ViciMVP\//ViciMVP\//g' ViciMVP.xcodeproj/project.pbxproj
```

For more complex issues, use Ruby:

```ruby
ruby -e 'require "xcodeproj"; proj = Xcodeproj::Project.open("ViciMVP.xcodeproj"); build_files = proj.targets.first.source_build_phase.files.to_a; build_files.each do |file|; if file.file_ref && file.file_ref.path; puts "Removing file: #{file.file_ref.path}"; proj.targets.first.source_build_phase.remove_build_file(file); end; end; proj.save'
```

#### Step 4: Create Minimal Test Build

When path issues persist, create a minimal build test:

1. Remove all file references from the build phase
2. Create a single file with basic app structure
3. Add only that file to the project
4. Build to validate the project structure

```ruby
ruby -e 'require "xcodeproj"; proj = Xcodeproj::Project.open("ViciMVP.xcodeproj"); file_ref = proj.main_group.new_file("ViciMVP/MinimalApp.swift"); proj.targets.first.source_build_phase.add_file_reference(file_ref); puts "Added minimal file"; proj.save'
```

#### Step 5: Incrementally Add Files

After a successful minimal build, add files back one by one or in related groups:

```ruby
ruby -e 'require "xcodeproj"; proj = Xcodeproj::Project.open("ViciMVP.xcodeproj"); main_group = proj.main_group.find_subpath("ViciMVP"); models_group = main_group.find_subpath("Models"); if models_group.nil?; models_group = main_group.new_group("Models", "ViciMVP/Models"); end; Dir.glob("ViciMVP/Models/*.swift").each do |file|; file_ref = models_group.new_file(file); proj.targets.first.source_build_phase.add_file_reference(file_ref); puts "Added #{file}"; end; proj.save'
```

#### Step 6: Warning Signs to Watch For

These patterns often indicate project reference problems:

- Build errors referencing nested paths (`/path/to/AppName/AppName/FileName.swift`)
- Files missing in Xcode but present in Finder
- Duplicate files appearing in multiple groups
- "Build input file cannot be found" for files that exist

## Development Workflow

### Step-by-Step Approach

1. **Pull latest changes and build first**
   - Verify the app builds successfully before making changes

2. **Make small, focused changes**
   - Build after each significant change
   - Commit working code frequently

3. **Use feature branches**
   - Create a new branch for each feature or fix
   - Request code reviews before merging

4. **Test thoroughly**
   - Run the app on multiple simulator configurations
   - Test on physical devices when possible

### Gradual Migration Strategy

For transitioning from mock to real implementations:

1. **Stub and Expand**
   - Create minimal implementations that compile first
   - Expand functionality incrementally
   - Test builds after each significant change

2. **Parallel Implementations**
   - Keep mock implementations until real ones are fully tested
   - Use namespacing or extensions to avoid conflicts
   - Remove mock code only after real implementations are verified

3. **Document Changes**
   - Update documentation after significant architectural changes
   - Note any workarounds and their planned resolution

## Error Handling Best Practices

1. **Typed Errors**
   - Create custom error types for different failure scenarios
   - Include context information with associated values
   - Example:
     ```swift
     enum APIError: Error {
         case networkError(Error)
         case serverError(Int, String)
         case decodingError(Error)
         case authenticationError
     }
     ```

2. **Contextual UI for Errors**
   - Display different UI based on error type
   - Provide actionable information to users
   - Include retry mechanisms where appropriate

3. **Comprehensive Logging**
   - Log all errors with context information
   - Include network request/response details for API errors
   - Make logs available for debugging in development builds

## Testing Strategy

1. **Unit Testing**
   - Test ViewModels with mock services
   - Utilize protocols for dependency injection
   - Test error handling paths

2. **UI Testing**
   - Create Preview providers for all main views
   - Test different states (loading, error, success)
   - Test responsive layouts on different device sizes

3. **API Testing**
   - Add comprehensive logging for debugging
   - Implement pull-to-refresh for manual testing
   - Support offline mode with appropriate feedback

4. **Performance Testing**
   - Monitor memory usage
   - Test network request optimization
   - Check UI responsiveness

## Long-term Maintenance

1. **Documentation**
   - Keep model documentation up to date
   - Document architectural decisions in LESSONS_LEARNED.md
   - Update API documentation for services

2. **Code Reviews**
   - Include checks for proper file inclusion
   - Review for proper error handling
   - Verify architectural pattern adherence

3. **CI Pipeline**
   - Implement automated builds and tests
   - Add checks to ensure all Swift files are included in the project
   - Run SwiftLint for code quality

4. **Refactoring**
   - Regularly review and refactor complex code
   - Address technical debt proactively
   - Document major refactorings

## Need Help?

If you've tried the steps above and still encounter build issues:

1. Document the specific error message
2. Note which files are involved
3. List the troubleshooting steps you've already taken
4. Contact the lead developer or create a detailed issue in GitHub 