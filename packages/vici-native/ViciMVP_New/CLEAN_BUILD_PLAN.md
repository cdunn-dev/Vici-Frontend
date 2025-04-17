# Vici App Clean Build Plan

This document outlines the comprehensive plan to fix all build issues in the Vici App while maintaining full MVP functionality, eliminating workarounds, and ensuring a clean codebase for the future.

## Current Issues

1. **Import & Module Visibility Issues**
   - ✅ Resolved: Files can now find AuthViewModel 
   - ✅ Resolved: Import patterns are now consistent across the codebase
   - ✅ Resolved: Removed circular references through typealiases

2. **Duplicate/Redundant Implementations**
   - ✅ Resolved: Removed duplicate AuthenticationView declaration
   - ✅ Resolved: Removed "_Fixed" implementations from project navigator

3. **Dependencies & Structure**
   - ✅ Resolved: Removed LocSnap dependency
   - ✅ Resolved: Created documentation (LESSONS_LEARNED.md and BUILD_GUIDE.md)
   - ✅ Resolved: Successfully removed FixedFiles directory without affecting build

## Current Status

**BUILD STATUS: SUCCESSFUL** ✅
**APP LAUNCHES SUCCESSFULLY** ✅
**REAL DATA CONNECTIONS: IN PROGRESS** ⚠️
- The app now builds successfully with no errors
- App launches and runs on iOS simulators
- AuthViewModel is properly integrated and accessible to all components
- Basic navigation and UI functionality works
- All temporary fix files have been properly removed
- Documentation created for future reference and team guidance
- ✅ Fixed files removed from project references in Xcode
  - ✅ Tested removal of all fixed files with a build after each
  - ✅ Successfully removed references from project.pbxproj via Xcode
  - ✅ Deleted FixedFiles directory and verified build still succeeds
- ✅ TrainingPlanViewModel now connects to real data services
- ✅ AskViciViewModel now connects to real LLMService
- ✅ ProfileViewModel now connects to real AuthService
- ✅ Comprehensive logging added to debug API connectivity
- ✅ Pull-to-refresh and manual refresh functionality added
- ✅ Enhanced error handling with typed errors and custom UI for different error states
- ✅ Created comprehensive BUILD_GUIDE.md that consolidates all build and model integration documentation
- ✅ Updated LESSONS_LEARNED.md with insights from simplified build approach and real data migration
- ✅ Documentation now provides clear guidance for future development

## Next Steps: Real Implementation

Now that we've successfully cleaned up the project structure and have a stable build, our focus shifts to implementing real functionality:

1. **Test Current Implementation**
   - [x] Run a full build to verify current state ✅
   - [x] Run file removal test script to identify project dependencies
   - [x] Document findings regarding project file references
   - [x] Remove FixedFiles directory and confirm build success ✅
   - [x] Run the app on simulator to verify it launches ✅
   - [x] Test tab navigation and basic UI interaction ✅
   - [ ] Confirm AuthViewModel properly manages authentication state

2. **Enhance TrainingPlanView Implementation**
   - [x] Connect TrainingPlanViewModel to real TrainingService ✅
   - [x] Run a build test to verify changes ✅
   - [x] Launch the app in the simulator with updated ViewModel ✅
   - [x] Add logging/debugging to verify API connectivity ✅
   - [x] Add refresh mechanism for manual data reload ✅
   - [x] Enhance error handling in the UI ✅
   - [ ] Test that workouts load from the API properly
   - [ ] Implement weekly workout display
   - [ ] Add today's workout detail view

3. **Documentation & Architecture**
   - [x] Created LESSONS_LEARNED.md document for reference
   - [x] Created BUILD_GUIDE.md with troubleshooting steps
   - [x] Updated documentation with lessons from simplified build approach ✅
   - [x] Consolidated documentation into comprehensive BUILD_GUIDE.md ✅
   - [ ] Add architecture diagrams to documentation
   - [ ] Update API documentation for services

### Immediate Next Actions

1. **Finalize TrainingPlanView implementation**
   - [x] Update TrainingPlanViewModel to use real data ✅
   - [x] Run a build test to verify changes ✅
   - [x] Test the updated view in the simulator ✅
   - [x] Add logging to debug API connectivity ✅
   - [x] Add refresh mechanism for manual data reload ✅
   - [x] Enhance error handling in the UI ✅
   - [ ] Configure and verify backend API access
   - [ ] Debug any issues with API connectivity

2. **Move to other views**
   - [x] Update AskViciView to use real data models ✅
     - [x] Connect AskViciViewModel to real LLMService ✅
     - [x] Implement error handling with typed errors ✅
     - [x] Add pull-to-refresh mechanism ✅
     - [x] Update UI components to display real data ✅
     - [x] Add loading indicators for API requests ✅
   - [x] Update ProfileView to use real user data ✅
     - [x] Create ProfileViewModel with real AuthService connection ✅
     - [x] Implement profile view/edit functionality ✅
     - [x] Add comprehensive error handling ✅
     - [x] Support for Strava connection status ✅
     - [x] Add logout functionality ✅
   - [ ] Ensure Strava connection flow uses real API

3. **Commit changes with clean project state**
   - [x] Commit all current changes with appropriate message ✅
   - [x] Create branch for TrainingPlanView enhancements ✅
   - [x] Commit TrainingPlanViewModel updates ✅
   - [x] Push branch to remote repository ✅
   - [ ] Commit UI enhancements with error handling

## Strategic Implementation Sequence

To ensure the most effective and sustainable transition to real models, we'll follow this strategic sequence:

1. **Fix Core Infrastructure First** (Week 2)
   - [x] Verify all service interfaces are properly defined ✅
     - Added `AuthServiceProtocol`, `KeychainServiceProtocol`, and `StravaServiceProtocol`
     - Ensured proper implementation in service classes
     - Updated with comprehensive documentation
   - [x] Clean up the real AuthViewModel implementation if needed ✅
     - Added comprehensive logging
     - Removed duplicate KeychainService implementation
     - Updated to use Task and @MainActor for thread safety
     - Improved error handling with more specific checks
     - Fixed preview extensions for consistent naming
   - [x] Ensure APIClient has proper error handling and response processing ✅
     - Created `APIClientProtocol` for better testability
     - Enhanced error handling with detailed APIError types
     - Implemented automatic token refresh logic
     - Added retry logic with exponential backoff for transient errors
     - Added rate limiting detection and handling
     - Improved logging for better debugging
   - [ ] Verify token management in AuthService works correctly

2. **Update View Models with Real Services** (Week 2-3)
   - [x] TrainingPlanViewModel properly uses TrainingService ✅
   - [x] Verify AskViciViewModel uses real LLMService ✅
     - Added proper error handling with typed errors
     - Implemented network status checking
     - Added comprehensive logging
     - Updated to use Task and @MainActor for thread safety
     - Added rate limiting detection
   - [x] Ensure ProfileViewModel connects to AuthService for user data ✅
     - Created comprehensive ProfileViewModel with real AuthService
     - Implemented proper error handling
     - Added profile data loading and editing
     - Added Strava connection status management
     - Implemented proper loading state indication
   - [ ] Verify all view models follow consistent patterns for error handling

3. **Update Views in Dependency Order** (Week 3)
   - [ ] MainTabView (container for all other views)
   - [ ] Authentication flows (required for other functionality)
   - [ ] StravaConnectView integration with real StravaService
   - [ ] ProfileView implementation with real user data
   - [ ] Remaining views

4. **Systematically Remove All "Fixed" References** (Week 3)
   - [ ] Search codebase for any remaining references to fixed models
   - [ ] Remove any temporary workarounds or duplicate implementations
   - [ ] Ensure consistent import statements across all files
   - [ ] Verify no "_Fixed" suffixed types remain in use

5. **Build Testing Cycle** (Week 3-4)
   - [ ] Test build after each component update
   - [ ] Document issues and their solutions in BUILD_GUIDE.md
   - [ ] Create automated tests for critical functionality
   - [ ] Verify app launches and functions correctly on multiple simulators

6. **Final Cleanup and Documentation** (Week 4)
   - [ ] Update MODEL_INTEGRATION.md with additional learnings
   - [ ] Clean up TODO comments and temporary code
   - [ ] Document final architecture for team reference
   - [ ] Create architectural diagrams showing relationships between components

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
  - ✅ Now connects to TrainingService for real API data
  - ✅ Enhanced with proper logging for debugging
  - ✅ Supports manual data refresh
  - ✅ Improved error handling with typed errors
- `AskViciViewModel`: Used by `AskViciView`
  - ✅ Now connects to LLMService for real AI responses
  - ✅ Comprehensive error handling with typed errors
  - ✅ Network status detection for offline mode
  - ✅ Improved logging for debugging API connections
  - ✅ Local storage of conversation history
- `ProfileViewModel`: Used by `ProfileView`
  - ✅ Now connects to AuthService for real user data
  - ✅ Supports viewing and editing user profiles
  - ✅ Manages Strava connection status
  - ✅ Comprehensive error handling
  - ✅ Proper loading state management

### Views
- `TrainingPlanView`: Used as a tab in MainTabView
  - ✅ Connected to real data via TrainingPlanViewModel
  - ✅ Supports pull-to-refresh
  - ✅ Custom error handling with specific UI for different error types
  - ✅ Offline mode support with appropriate UI feedback
- `AskViciView`: Used as a tab in MainTabView
  - ✅ Connected to real data via AskViciViewModel
  - ✅ Enhanced UI with conversational interface
  - ✅ Pull-to-refresh functionality
  - ✅ Loading indicators for API requests
  - ✅ Contextual error handling UI for different error types
  - ✅ Offline mode with appropriate UI feedback
- `ProfileView`: Used as a tab in MainTabView
  - ✅ Connected to real data via ProfileViewModel
  - ✅ Comprehensive profile viewing and editing
  - ✅ Strava connection status display
  - ✅ Settings and configuration options
  - ✅ Logout functionality
  - ✅ Pull-to-refresh support
  - ✅ Error handling with visual feedback

### Services
- `AuthService`: Used by `AuthViewModel`
- `TrainingService`: Used by `TrainingPlanViewModel` ✅
- `LLMService`: Used by `AskViciViewModel` ✅
- `StravaService`: Used by connection flows
- `APIClient`: Used by all services

## Testing Checkpoints (Updated)

### Checkpoint 1: First Successful Build ✅
- [x] Verify project builds successfully
- [x] Confirm `AuthViewModel` can be instantiated
- [x] Test that imports work correctly in a sample file

### Checkpoint 2: Core Functionality Testing ✅
- [x] Verify app builds with file removal testing
- [x] Verify app builds with no errors ✅
- [x] Delete FixedFiles directory and verify build still succeeds ✅
- [x] Verify app launches correctly on simulator ✅
- [x] Confirm navigation between main tabs works
- [ ] Test authentication flow
- [ ] Verify profile data displays correctly

### Checkpoint 3: FixedFiles Removal ✅
- [x] Test file removal one by one (successful)
- [x] Remove file references from project file (completed in Xcode)
- [x] Delete FixedFiles directory and verify build
- [x] Commit changes with clean project state

### Checkpoint 4: Real API Integration ⚠️
- [x] Connect TrainingPlanViewModel to real TrainingService ✅
- [x] Verify builds succeed with real API connections ✅ 
- [x] Add logging for API request debugging ✅
- [x] Add data refresh functionality ✅
- [x] Enhance error handling with typed errors ✅
- [x] Implement UI for different error states ✅
- [x] Update AskViciView and ViewModel to use real LLMService ✅
- [ ] Test that API requests function correctly
- [ ] Verify data flows correctly from API to views
- [ ] Handle loading states and error scenarios
- [ ] Implement caching for offline support

### Checkpoint 5: Full MVP Functionality
- [ ] Connect all services to real APIs
- [ ] Test all user flows with real data
- [ ] Verify error handling works correctly
- [ ] Confirm UI displays correctly on all device sizes

## Timeline for Completion

1. **Week 1**: ✅ Complete core testing and delete FixedFiles directory
2. **Week 2 (Current)**: ⚠️ Connect views to real data services
   - ✅ TrainingPlanView connected to real data
   - ✅ AskViciView integration completed
   - ✅ ProfileView integration completed
   - [ ] StravaConnectView pending
3. **Week 3**: Complete error handling and final cleanup
4. **Week 4**: API integration testing and documentation updates

This plan addresses root causes rather than symptoms, creating a sustainable foundation for future development. 

protocol AuthViewModelProtocol: ObservableObject {
    var isLoggedIn: Bool { get }
    var currentUser: User? { get }
    var isLoading: Bool { get }
    var errorMessage: String? { get }
    var isStravaConnected: Bool { get }
    
    func login(email: String, password: String)
    func register(email: String, password: String, name: String)
    func logout()
    func refreshUserProfile()
    func updateStravaConnectionStatus(isConnected: Bool)
} 