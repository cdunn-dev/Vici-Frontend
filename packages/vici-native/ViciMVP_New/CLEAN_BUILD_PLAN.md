# Vici App Clean Build Plan

This document outlines the comprehensive plan to fix all build issues in the Vici App while maintaining full MVP functionality, eliminating workarounds, and ensuring a clean codebase for the future.

## Current Issues

1. **Import & Module Visibility Issues**
   - ✅ Resolved: Files can now find AuthViewModel 
   - ✅ Resolved: Import patterns are now consistent across the codebase
   - ✅ Resolved: Removed circular references through typealiases

2. **Duplicate/Redundant Implementations**
   - ✅ Resolved: Removed duplicate AuthenticationView declaration
   - ⚠️ In Progress: Still need to remove "_Fixed" implementations

3. **Dependencies & Structure**
   - ✅ Resolved: Removed LocSnap dependency
   - ✅ Resolved: Created documentation (LESSONS_LEARNED.md and BUILD_GUIDE.md)
   - ⚠️ In Progress: Still some temporary fixes to clean up

## Current Status

**BUILD STATUS: SUCCESSFUL** ✅
- The app now builds successfully with a clean structure
- AuthViewModel is properly integrated and accessible to all components
- Basic navigation and UI functionality should work
- All files in FixedFiles/ directory are properly marked as deprecated
- Documentation created for future reference and team guidance
- We've identified which files are safe to remove from code but still referenced in the project file
  - ✅ Tested removal of all fixed files with a build after each
  - ✅ Discovered `AuthenticationView_Fixed.swift` can be safely removed from code
  - ❌ Other files still referenced in project.pbxproj

## Next Steps: FixedFiles Cleanup

After running our test script for file removal, here's our plan for each file:

1. **ViciResponseModel.swift**
   - ✅ Verified proper implementation exists in Models/ViciResponse.swift
   - ✅ Added deprecation comments
   - ✅ Updated ViciImports.swift to point to the correct implementation
   - ⚠️ Still referenced in project.pbxproj - need Xcode to update

2. **AuthViewModel_Fixed.swift**
   - ✅ Our new implementation in MainTabView.swift serves as a replacement
   - ✅ Added deprecation comments
   - ⚠️ Still referenced in project.pbxproj - need Xcode to update

3. **AuthenticationView_Fixed.swift**
   - ✅ Replaced by the proper AuthenticationView
   - ✅ Added deprecation comments
   - ✅ Removed from project without build errors
   - ⚠️ Still referenced in project.pbxproj - need Xcode to update

4. **TrainingPlanView_Fixed.swift**
   - ✅ Simple placeholder with no real functionality
   - ✅ Added deprecation comments
   - ✅ Verified TrainingPlanView is already a placeholder (can be enhanced later)
   - ⚠️ Still referenced in project.pbxproj - need Xcode to update

5. **ImportFix.swift**
   - ✅ Already converted to a placeholder
   - ⚠️ Still referenced in project.pbxproj - need Xcode to update

## Action Plan (Current Phase)

### Phase 3: Cleanup & Testing (IN PROGRESS)

#### Current Priority Tasks:

1. **Complete File References Update (requires Xcode)**
   - [ ] Open the project in Xcode
   - [ ] Remove references to files in FixedFiles/ from project navigator
   - [ ] Save project and test build again
   - [ ] After successful build, delete the FixedFiles directory
   
2. **Test Current Implementation**
   - [x] Run a full build to verify current state 
   - [x] Run file removal test script to identify project dependencies
   - [x] Document findings regarding project file references
   - [ ] Run the app on simulator to verify navigation works
   - [ ] Test tab navigation and basic UI interaction
   - [ ] Confirm AuthViewModel properly manages authentication state

3. **Enhance TrainingPlanView Implementation**
   - [ ] Connect TrainingPlanView to real TrainingPlanViewModel
   - [ ] Implement weekly workout display
   - [ ] Add today's workout detail view
   - [ ] Connect to real API data services

4. **Documentation & Architecture**
   - [x] Created LESSONS_LEARNED.md document for reference
   - [x] Created BUILD_GUIDE.md with troubleshooting steps
   - [ ] Add architecture diagrams to documentation
   - [ ] Update API documentation for services

### Immediate Next Actions

1. **Use Xcode to update project references**
   - This step cannot be safely performed via command line
   - Need to manually remove file references in Xcode
   - Update ViciMVPApp.swift and any other files to not refer to FixedFiles
   - Run another build test after reference removal

2. **Update MainTabView.swift to fully use proper AuthViewModel**
   - Ensure it no longer references AuthViewModel_Fixed
   - Verify tab navigation functions with proper view models

3. **Test full app navigation**
   - Build and run on simulator
   - Test each tab and major user flow
   - Document any issues found

4. **Update TrainingPlanView to use real data models**
   - Connect to TrainingPlanViewModel
   - Start implementing real UI components

## Dependency Map (Updated)

This map documents the key interconnected components to ensure we address all dependencies:

### Core Models
- `User`: Used by `AuthViewModel`, `ProfileView`, `TrainingPlanView`
- `Workout`: Used by `TrainingPlanView`, `TrainingPlanViewModel`
- `TrainingPlan`: Used by `TrainingPlanView`, `TrainingPlanViewModel`
- `Activity`: Used by `TrainingService`, profile components
- `ViciResponse`: Used by Ask Vici view and view model

### ViewModels
- `AuthViewModel`: Used by `ViciMVPApp`, `MainTabView`, `AuthenticationView`, `ProfileView`
- `TrainingPlanViewModel`: Used by `TrainingPlanView`, potentially other views

### Services
- `AuthService`: Used by `AuthViewModel`
- `TrainingService`: Used by `TrainingPlanViewModel`
- `StravaService`: Used by connection flows
- `APIClient`: Used by all services

## Testing Checkpoints (Updated)

### Checkpoint 1: First Successful Build ✅
- [x] Verify project builds successfully
- [x] Confirm `AuthViewModel` can be instantiated
- [x] Test that imports work correctly in a sample file

### Checkpoint 2: Core Functionality Testing
- [x] Verify app builds with file removal testing
- [ ] Verify app launches correctly on simulator
- [ ] Confirm navigation between main tabs works
- [ ] Test authentication flow
- [ ] Verify profile data displays correctly

### Checkpoint 3: FixedFiles Removal
- [x] Test file removal one by one (partially successful)
- [ ] Remove file references from project file (requires Xcode)
- [ ] Delete FixedFiles directory and verify build
- [ ] Commit changes with clean project state

### Checkpoint 4: Full MVP Functionality
- [ ] Connect to real API services
- [ ] Test all user flows with real data
- [ ] Verify error handling works correctly
- [ ] Confirm UI displays correctly on all device sizes

## Timeline for Completion

1. **Week 1 (Current)**: Complete core testing and prepare for project file updates
2. **Week 2**: Remove FixedFiles dependencies in Xcode and enhance TrainingPlanView
3. **Week 3**: Complete error handling and final cleanup
4. **Week 4**: API integration testing and documentation updates

This plan addresses root causes rather than symptoms, creating a sustainable foundation for future development. 