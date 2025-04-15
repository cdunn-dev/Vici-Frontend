# AuthViewModel Transition Plan

This document outlines our plan to transition from the temporary `AuthViewModel_Fixed` implementation to the full-featured `AuthViewModel`, ensuring a smooth integration with the real backend.

## Current State Analysis

The existing `AuthViewModel` implementation:

- Is properly structured with dependency injection
- Follows the proper protocol (`AuthViewModelProtocol`)
- Implements comprehensive error handling
- Has appropriate logging
- Contains proper token management and refresh logic
- Handles Strava connection state

The temporary `AuthViewModel_Fixed`:

- Provides hardcoded data instead of real API connections
- Implements empty method stubs
- Maintains the same interface as the real implementation
- Was previously used by `MainTabView`, `ViciMVPApp`, and `StravaConnectView`

## Transition Strategy

We'll implement a phased approach to ensure app stability throughout the transition:

### Phase 1: Update References (Immediate) ✅

1. Replace references to `AuthViewModel_Fixed` with `AuthViewModel` in:
   - ✅ `ViciMVPApp.swift`
   - ✅ `MainTabView.swift`
   - ✅ `StravaConnectView.swift`

2. ✅ Run build tests after each file update to ensure continuous buildability

### Phase 2: Test Authentication Flow (Day 1) ✅

1. ✅ Implement proper initialization with mock API responses:
   ```swift
   let mockAuthService = MockAuthService()
   let mockKeychainService = MockKeychainService()
   let viewModel = AuthViewModel(
       authService: mockAuthService,
       keychainService: mockKeychainService
   )
   ```

2. ✅ Create implementation of `MockAuthService` and `MockKeychainService` for testing

3. ✅ Update `AuthenticationView` with proper UI to test authentication flow

4. ✅ Build and run with updated components

5. ✅ Configure `ViciMVPApp` to use mock services with a flag for easy testing

6. Test specific scenarios:
   - Login success and failure
   - Registration success and failure
   - Logout functionality
   - Token refresh
   - Error handling for various error conditions

### Phase 3: Real API Integration (Day 2)

1. Create a test account on the development backend

2. Update the `Environment` configuration in `APIClient` to point to the correct backend

3. Test the full authentication flow with the real backend:
   - Registration
   - Login
   - Profile fetching
   - Logout

4. Verify that tokens are properly stored in the keychain

### Phase 4: Strava Integration (Day 2-3)

1. Test Strava connection functionality
   - Connection status checking
   - OAuth flow for connecting Strava
   - Handling callbacks
   - Disconnection flow

2. Implement error handling for Strava-specific scenarios

### Phase 5: Cleanup and Documentation (Day 3)

1. Remove `AuthViewModel_Fixed.swift`

2. Update any remaining references to the fixed implementation

3. Document the authentication flow

4. Add comments to explain key parts of the implementation

5. Update tests to cover critical authentication paths

## Implementation Checklist

- [x] Update `ViciMVPApp.swift`
- [x] Update `MainTabView.swift`
- [x] Update `StravaConnectView.swift`
- [x] Verify build succeeds with real AuthViewModel
- [x] Create `MockAuthService` for testing
- [x] Create `MockKeychainService` for testing
- [x] Update `AuthenticationView` with proper UI
- [x] Configure app to use mock services for testing
- [ ] Test login/logout functionality
- [ ] Test Strava connection
- [ ] Test token refresh logic
- [ ] Test error handling
- [ ] Remove fixed implementation
- [ ] Final code review and documentation

## Potential Issues and Mitigations

1. **API Endpoint Differences**
   - Verify all endpoint paths in `AuthService`
   - Test each API call independently

2. **Token Management**
   - Ensure `KeychainService` is properly storing and retrieving tokens
   - Test token refresh flow

3. **UI State Updates**
   - Verify that UI properly reflects authentication state changes
   - Test error message display

4. **Threading Issues**
   - Ensure all UI updates occur on the main thread
   - Verify `@MainActor` annotations are correct

5. **Fallback Strategy**
   - If issues arise, we can temporarily revert to the fixed implementation
   - Create specific test cases for problematic scenarios 