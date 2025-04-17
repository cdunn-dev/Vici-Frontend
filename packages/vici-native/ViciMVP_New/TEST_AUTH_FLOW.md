# Authentication Flow Test Script

This document outlines tests to verify the full authentication flow in the Vici app, including login, token refresh, logout, and error handling.

## Prerequisites
- Running backend API (dev environment)
- Valid test account credentials
- iOS Simulator with Vici app installed

## Test Cases

### 1. Basic Authentication

| Test ID | Test Description | Expected Result | Status |
|---------|-----------------|-----------------|--------|
| AUTH-1 | Launch app and verify login screen appears | Login form displayed with email/password fields | 🔄 |
| AUTH-2 | Login with valid credentials | Successfully logs in; MainTabView displayed | 🔄 |
| AUTH-3 | Verify user profile is loaded | User data displayed in ProfileView | 🔄 |
| AUTH-4 | Logout from profile screen | Successfully logs out; returns to login screen | 🔄 |
| AUTH-5 | Register new account | Successfully creates account; MainTabView displayed | 🔄 |

### 2. Token Management

| Test ID | Test Description | Expected Result | Status |
|---------|-----------------|-----------------|--------|
| AUTH-6 | Kill and restart app after login | App maintains login state | 🔄 |
| AUTH-7 | Force token expiration | App automatically refreshes token | 🔄 |
| AUTH-8 | Inspect keychain after login | Access token and refresh token stored | 🔄 |
| AUTH-9 | Inspect keychain after logout | Tokens removed from keychain | 🔄 |
| AUTH-10 | Invalid refresh token | App forces logout and shows error | 🔄 |

### 3. Error Handling

| Test ID | Test Description | Expected Result | Status |
|---------|-----------------|-----------------|--------|
| AUTH-11 | Login with invalid credentials | Error message displayed | 🔄 |
| AUTH-12 | Login with network offline | Network error message displayed | 🔄 |
| AUTH-13 | Register with existing email | Conflict error message displayed | 🔄 |
| AUTH-14 | Login with offline backend | Server unavailable error displayed | 🔄 |
| AUTH-15 | Refresh with server error | Appropriate error handling and recovery | 🔄 |

### 4. UI States

| Test ID | Test Description | Expected Result | Status |
|---------|-----------------|-----------------|--------|
| AUTH-16 | Loading indicator during login | Loading spinner visible during API call | 🔄 |
| AUTH-17 | Login button disabled state | Button disabled with empty fields | 🔄 |
| AUTH-18 | Error message display | Error toast with clear message | 🔄 |
| AUTH-19 | Toggle between login/register | Form correctly toggles fields and validation | 🔄 |
| AUTH-20 | Keyboard behavior | Keyboard doesn't obscure input fields | 🔄 |

## Test Execution

### Environment Setup
1. Start the development backend server
2. Clear app data and keychain on the simulator
3. Launch the app in a clean state

### Test Procedure
1. Execute tests in order, beginning with basic authentication
2. Document results with pass/fail status
3. For failures, capture logs and screenshots
4. Note any unexpected behavior even if test passes

### Logging
- Enable debug logging for AuthViewModel
- Monitor Xcode console during tests
- Record any relevant error messages

## Additional Tests

### API Client Testing
- Verify proper headers are sent with authenticated requests
- Confirm token refresh doesn't interrupt user experience
- Test API retry mechanism for transient failures

### Edge Cases
- Simultaneous login attempts from multiple devices
- Login during poor network connectivity
- System interruptions during authentication process

## Status Legend
- ✅ Pass - Test completed successfully
- ❌ Fail - Test failed to meet expected result
- 🔄 Not Started - Test not yet executed
- ⚠️ Partial - Test partially passed with issues 