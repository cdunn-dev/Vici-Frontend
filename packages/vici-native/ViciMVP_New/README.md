# Vici iOS MVP App

This is a native iOS implementation of the Vici training app MVP, created as a clean-slate approach after facing build issues with the React Native implementation.

## Features
- **Authentication**: Login and registration with simulated backend
- **Training Plan View**: View this week's workouts and overall plan
- **Training Log**: View past activities
- **Ask Vici**: Interact with the AI coach (mocked responses)
- **Profile**: View user info and connect to Strava

## Setup Instructions

1. **Open Xcode** (13.0 or newer)
2. **Create a new project**:
   - Template: iOS App
   - Name: ViciMVP
   - Interface: SwiftUI
   - Language: Swift
   - No Core Data or tests needed

3. **Add the source files** to your project:
   - Right-click on your project in the Project Navigator
   - Select "Add Files to 'ViciMVP'..."
   - Navigate to the `/Sources` directory
   - Select all files (MockData.swift, ViciMVPApp.swift, AuthenticationView.swift, MainTabView.swift)
   - Make sure "Copy items if needed" is NOT checked
   - Click "Add"

4. **Delete default auto-generated files**:
   - Delete the automatically created ContentView.swift
   - Delete the automatically created app file (likely called ViciMVPApp.swift)
   - Make sure our custom ViciMVPApp.swift is being used

5. **Run the app** by clicking the Run button or pressing ⌘R

## Implementation Notes
- All data is mocked within the application, no backend connection is required
- Testing of the functionality can be done with any valid inputs
- The login/registration flow accepts any email/password combination 

# Vici iOS MVP Architecture

## Overview

The Vici iOS app follows a clean architecture pattern with a focus on separation of concerns. This document outlines the service layer architecture which handles all network communication and data persistence.

## Service Architecture

The app uses a collection of service classes that each handle a specific domain of functionality:

### Core Services

#### `APIClient`

The foundation of the service layer, responsible for all HTTP communication with the backend.

- Makes HTTP requests (GET, POST, PUT, DELETE)
- Handles authentication headers
- Manages request/response serialization
- Handles error responses

#### `AuthService`

Manages user authentication and session management:

- Login/signup functionality
- Token storage and refresh
- User profile management
- Session state

### Domain Services

#### `TrainingService`

Handles all training-related functionality:

- Training plan CRUD operations
- Workout CRUD operations
- Activity management
- Workout completion

#### `StravaService`

Manages Strava integration:

- OAuth authentication with Strava
- Fetching activities from Strava
- Syncing Strava activities with Vici
- Token refresh management

#### `LLMService`

Interacts with AI models for training suggestions:

- Generating workout recommendations
- Creating training plans
- Analyzing workout performance
- Providing coaching feedback

## Model Structure

### Core Models

- `User`: User account and profile information
- `TrainingPlan`: A collection of workouts designed to achieve a specific goal
- `Workout`: A scheduled training session
- `Activity`: A recorded physical activity (completed workout or imported from Strava)

## API Endpoints

Below are the key API endpoints used by the services:

### Authentication

- `POST /auth/login`: User login
- `POST /auth/signup`: User registration
- `POST /auth/refresh`: Refresh authentication token

### Training Plans

- `GET /training-plans`: List user's training plans
- `GET /training-plans/:id`: Get a specific training plan
- `POST /training-plans`: Create a new training plan
- `PUT /training-plans/:id`: Update a training plan
- `DELETE /training-plans/:id`: Delete a training plan

### Workouts

- `GET /workouts`: List user's workouts
- `GET /workouts/:id`: Get a specific workout
- `POST /workouts`: Create a new workout
- `PUT /workouts/:id`: Update a workout
- `DELETE /workouts/:id`: Delete a workout
- `POST /workouts/:id/complete`: Mark a workout as completed

### Activities

- `GET /activities`: List user's activities
- `GET /activities/:id`: Get a specific activity
- `POST /activities`: Create a new activity
- `PUT /activities/:id`: Update an activity
- `DELETE /activities/:id`: Delete an activity

### Strava Integration

- `POST /integrations/strava`: Connect Strava account
- `DELETE /integrations/strava`: Disconnect Strava account
- `POST /integrations/strava/sync`: Sync Strava activities

### AI Services

- `POST /ai/workouts/generate`: Generate a workout
- `POST /ai/training-plans/generate`: Generate a training plan
- `POST /ai/workouts/analyze`: Analyze workout performance
- `POST /ai/feedback`: Get coaching feedback
- `POST /ai/chat`: Chat with AI coach
- `POST /ai/workouts/adapt`: Adapt a workout

## Dependencies

- KeychainSwift: Secure storage for authentication tokens
- AuthenticationServices: For OAuth flows with Strava

## Development Practices

- Use Swift's async/await for all asynchronous operations
- Handle errors appropriately at each layer
- Use Swift's Codable for JSON serialization/deserialization
- Follow SOLID principles
- Write unit tests for service classes 