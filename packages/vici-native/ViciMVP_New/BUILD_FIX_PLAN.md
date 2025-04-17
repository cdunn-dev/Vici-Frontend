## Phase 8: Resolving Build Errors Post-Cleanup

After our successful reorganization and cleanup efforts, we now have a cleaner codebase that has resolved the primary "Invalid redeclaration of APIClientProtocol" error. However, the build process now reveals a series of new errors related to our implementation. These errors are primarily related to code implementation rather than structural issues, which is a sign of progress.

### Error Categories Identified

1. **BaseViewModel Implementation Issues**:
   - "Cannot find type 'BaseViewModel' in scope" in multiple ViewModels
   - "'super' members cannot be referenced in a root class"
   - Missing methods like 'runTask', 'handleError', and 'logger'

2. **Missing Model Preview Extensions**:
   - "Type 'Workout' has no member 'sampleWorkout'"
   - "Type 'TrainingPlan' has no member 'samplePlan'"
   - "Type 'Activity' has no member 'sampleActivity'"
   - "Type 'User' has no member 'previewUsers'"

3. **Remaining Redeclaration Issues**:
   - "Invalid redeclaration of 'AppDelegate'"
   - "Invalid redeclaration of 'stravaCallbackReceived'"
   - "Invalid redeclaration of 'stravaCallbackFailed'"
   - "Invalid redeclaration of 'KeychainService'"

4. **Protocol Conformance Issues**:
   - "Type 'AuthViewModel' does not conform to protocol 'AuthViewModelProtocol'"
   - "Argument type 'KeychainService' does not conform to expected type 'KeychainServiceProtocol'"
   - "Generic struct 'StateObject' requires that 'ViewModel' conform to 'ObservableObject'"
   - Type 'Any' does not conform to protocol 'Decodable'

5. **Method Reference and Implementation Issues**:
   - "'async' call in a function that does not support concurrency"
   - "Call can throw, but it is not marked with 'try' and the error is not handled"
   - "Value of type 'any AuthServiceProtocol' has no member 'getCurrentUser'"
   - "'logger' is inaccessible due to 'private' protection level"

6. **Type Accessibility Issues**:
   - "Cannot find type 'APIError' in scope" in multiple services
   - Properties in error types need to be made public (errorCode, errorDescription, etc.)

### Implementation Plan

We will address these issues in a systematic order:

#### Step 1: Fix BaseViewModel Implementation
- [x] Verify BaseViewModel.swift is properly added to the Xcode project
- [x] Implement missing methods (runTask, handleError, logger)
- [x] Fix inheritance in all ViewModels that use BaseViewModel
- [x] Ensure BaseViewModel conforms to ObservableObject
- [x] Fix concurrency implementation in BaseViewModel

#### Step 2: Fix Model Preview Extensions
- [x] Create/fix Workout+Preview.swift with sample data
- [x] Create/fix TrainingPlan+Preview.swift with sample data
- [x] Create/fix Activity+Preview.swift with sample data
- [x] Create/fix User+Preview.swift with sample data
- [x] Ensure preview extensions are properly imported where needed
- [x] Verify all preview properties match those referenced in views

#### Step 3: Resolve Remaining Redeclaration Issues
- [x] Fix AppDelegate redeclaration
- [x] Fix Notification.Name extensions for Strava callbacks
- [ ] Review and fix other potential notification name conflicts
- [x] Fix "Invalid redeclaration of 'KeychainService'"

#### Step 4: Address Protocol Conformance Issues
- [x] Fix KeychainService to properly conform to KeychainServiceProtocol
- [x] Update KeychainServiceProtocol to include userId methods
- [x] Update AuthViewModel to implement all required methods from AuthViewModelProtocol
- [x] Create missing model files (TrainingPlanRequest)
- [x] Update core model files to match the preview extensions
- [x] Create APIError type or update code to use our new error types
- [x] Fix "invalid redeclaration" of convertToAppError function
- [x] Fix accessibility of AppError protocol and related enums
- [x] Make APIError public and properly accessible across modules
- [x] Make properties in error types public (errorCode, errorDescription, recoverySuggestion)
- [ ] Add 'override' keywords where needed in derived classes
- [ ] Fix generic type issues with APIResponse and Decodable
- [ ] Ensure ViewModels conform to ObservableObject where required by SwiftUI

#### Step 5: Fix Method References and Implementations
- [x] Implement proper async/await handling in AuthViewModel
- [x] Make logger property accessible in ViewModels
- [ ] Add proper error handling with try/catch
- [ ] Fix missing method implementations in service protocols
- [ ] Resolve scope issues with imports

### Progress Tracking

| Step | Status | Date | Notes |
|------|--------|------|-------|
| 1: BaseViewModel Implementation | Completed | April 17, 2024 | Created BaseViewModel.swift with comprehensive implementation that supports both default and custom initialization, proper error handling, task management, and publisher handling |
| 2: Model Preview Extensions | Completed | April 18, 2024 | Created preview extensions for all model types; Added missing methods like previewNewUser; Added computed properties to match ModelValidation expectations; Fixed property references |
| 3: Redeclaration Issues | In Progress | April 18, 2024 | Fixed AppDelegate redeclaration and confirmed Notification.Name extensions are properly moved; Removed duplicate KeychainService in AuthService.swift |
| 4: Protocol Conformance | In Progress | April 18, 2024 | Updated KeychainServiceProtocol with userId methods; Updated AuthViewModel to implement all required protocol methods; Created TrainingPlanRequest model; Made AppError protocol and related enums public; Fixed import of ViciMVP in BaseViewModel; Made APIError public and its properties public |
| 5: Method Reference Fixes | In Progress | April 18, 2024 | Implemented proper async/await pattern in AuthViewModel; Modified for Task-based operations; Made logger property accessible to subclasses in BaseViewModel |

### Execution Sequence

To maximize our progress, we'll execute the remaining tasks in this order:

1. **Fix Type Accessibility Issues**
   - Make APIError public and accessible
   - Make properties in error types public

2. **Fix Model Preview Extensions**
   - Ensure proper imports and access

3. **Fix Protocol Conformance Issues**
   - Fix KeychainService redeclaration
   - Add override keywords
   - Fix protocol conformance

4. **Fix Method References**
   - Make logger accessible
   - Fix async/try error handling

This phase represents the final steps in achieving a buildable application with proper architecture. Once completed, we should have a fully functional codebase that follows consistent patterns and best practices. 