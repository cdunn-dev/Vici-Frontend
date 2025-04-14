# Authentication Integration Documentation

## Overview

This document outlines the authentication system implemented in the Vici App. The authentication system secures user data, manages user sessions, and controls access to protected resources across both the iOS client and backend API.

Key features include:

1. **User Registration & Login**: Secure account creation and authentication
2. **JWT Token Management**: Access and refresh token handling
3. **Secure Storage**: Token storage in iOS Keychain
4. **Protected API Access**: Middleware for securing endpoints
5. **Password Recovery**: Forgot/reset password workflows
6. **Role-Based Authorization**: Access control for administrative features

## Implementation Details

### Core Components

#### iOS Client Components:

- **AuthViewModel**: SwiftUI ObservableObject managing authentication state
  - Tracks login status, loading states, and user information
  - Persists login state through app restarts
  - Provides methods for login, logout, and registration
  - Manages error handling and user feedback

- **AuthService**: Service layer for authentication operations
  - Handles API requests for login, registration, and logout
  - Manages token refresh logic
  - Fetches current user profile after authentication
  - Updates user profile information

- **KeychainService**: Secure storage for sensitive information
  - Provides methods to set, get, and delete keychain items
  - Handles token storage securely using iOS Keychain
  - Prevents token exposure in memory or storage

- **APIClient**: Network layer with authentication support
  - Automatically includes authentication headers
  - Handles HTTP methods (GET, POST, PUT, PATCH, DELETE)
  - Manages error responses and status codes
  - Supports typed responses with generics

#### Backend Components:

- **AuthController**: API controller for authentication endpoints
  - Handles login, registration, and token refresh requests
  - Manages password reset workflows
  - Provides consistent error responses
  - Delegates business logic to AuthService

- **AuthService**: Core authentication business logic
  - Securely hashes and verifies passwords with bcrypt
  - Generates and validates JWT tokens
  - Manages user creation and lookup
  - Implements token refresh logic

- **Auth Middleware**: Request authentication and authorization
  - Validates JWT tokens on protected routes
  - Extracts user information from tokens
  - Handles role-based access control
  - Manages token expiration and error responses

### Key Features

#### JWT-Based Authentication

- **Access Tokens**: Short-lived tokens for API request authorization
  - Default expiration: 1 hour
  - Signed with JWT_SECRET environment variable
  - Contains user ID and minimal claims

- **Refresh Tokens**: Long-lived tokens for obtaining new access tokens
  - Default expiration: 7 days
  - Signed with JWT_REFRESH_SECRET environment variable
  - Enables persistent sessions without frequent login

- **Token Generation**: Issued during login, registration, and refresh
  - Both tokens generated with user ID and appropriate expiry
  - Configurable expiration times via environment variables

#### Secure Password Management

- **Password Hashing**: Uses bcrypt with salt for secure storage
  - Default cost factor: 10
  - No plain-text passwords stored anywhere

- **Password Reset Flow**: Implemented through email tokens
  - Password reset request via email
  - Time-limited reset tokens
  - Secure reset token validation

### Security Considerations

- **HTTPS**: All API communications over secure connections
- **Token Storage**: iOS Keychain storage prevents exposure
- **Authorization Headers**: Bearer token format for API authorization
- **Minimal Token Payload**: Limited sensitive data in token claims
- **Token Expiration**: Short-lived access tokens limit exposure window
- **Environment Variables**: Secrets stored in environment, not code

### Error Handling & Resilience

- **Token Expiration Handling**: Automatic token refresh when possible
- **Connection Error Handling**: Retry mechanisms for transient failures
- **Invalid Credential Management**: User-friendly error messages
- **Keychain Access Failures**: Fallback behaviors for unavailable keychain

### iOS Client Usage

```swift
// Login
AuthViewModel.shared.login(email: "user@example.com", password: "securePassword")

// Check auth status
if AuthViewModel.shared.isLoggedIn {
    // User is authenticated
} else {
    // User needs to login
}

// Access user information
let currentUser = AuthViewModel.shared.currentUser

// Logout
AuthViewModel.shared.logout()
```

### Backend API Endpoints

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword"
}

Response:
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  },
  "accessToken": "jwt_access_token",
  "refreshToken": "jwt_refresh_token"
}
```

#### Registration
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "securePassword",
  "name": "New User"
}

Response:
{
  "user": {
    "id": "user_id",
    "email": "newuser@example.com",
    "name": "New User"
  },
  "accessToken": "jwt_access_token",
  "refreshToken": "jwt_refresh_token"
}
```

#### Refresh Token
```
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "jwt_refresh_token"
}

Response:
{
  "accessToken": "new_jwt_access_token",
  "refreshToken": "new_jwt_refresh_token"
}
```

#### Forgot Password
```
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}

Response:
{
  "message": "Password reset instructions sent to your email"
}
```

#### Reset Password
```
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "password": "newSecurePassword"
}

Response:
{
  "message": "Password reset successful"
}
```

#### Logout
```
POST /api/auth/logout
Content-Type: application/json

{
  "refreshToken": "jwt_refresh_token"
}

Response:
{
  "message": "Logout successful"
}
```

## Authentication Flow

1. **Registration/Login**:
   - User submits credentials through iOS app
   - Backend validates credentials and creates user if registering
   - Backend generates access and refresh tokens
   - iOS client stores tokens in Keychain
   - AuthViewModel updates state to reflect logged-in status

2. **Authenticated Requests**:
   - APIClient includes access token in Authorization header
   - Backend middleware validates token signature and expiration
   - If valid, request proceeds with user context
   - If invalid, returns 401 Unauthorized response

3. **Token Refresh**:
   - When access token expires, iOS client uses refresh token
   - Backend validates refresh token and issues new token pair
   - iOS client updates stored tokens
   - If refresh token is invalid, user is redirected to login

4. **Logout**:
   - iOS client sends refresh token to logout endpoint
   - Backend invalidates the token
   - iOS client removes tokens from Keychain
   - AuthViewModel updates state to reflect logged-out status

## Environment Setup

Ensure the following environment variables are set:
```
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_EXPIRES_IN_SECONDS=3600
JWT_REFRESH_EXPIRES_IN_SECONDS=604800
```

## Future Improvements

1. **Enhanced Security**:
   - Implement multi-factor authentication
   - Add biometric authentication options (Face ID, Touch ID)
   - Implement IP-based anomaly detection

2. **Performance Optimization**:
   - Token revocation mechanism
   - More efficient token storage
   - Better handling of concurrent token refreshes

3. **Feature Expansion**:
   - Social login options (Google, Apple)
   - Session management across devices
   - Granular permission system

## Troubleshooting

Common issues and solutions:

1. **"Invalid Credentials" Errors**:
   - Verify email and password are correct
   - Check for account existence
   - Password may have been reset

2. **"Token Expired" Issues**:
   - Verify system clock synchronization
   - Check token expiration settings
   - Ensure refresh token flow is working correctly

3. **Keychain Storage Problems**:
   - Check device security settings
   - Verify app has proper keychain access
   - Reset keychain items if corruption suspected 