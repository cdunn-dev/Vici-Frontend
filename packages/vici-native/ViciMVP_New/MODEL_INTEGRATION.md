# Model Integration Guide

This document outlines the integration of real data models in the Vici App, ensuring a clean architecture without temporary fixes or workarounds.

## Directory Structure

- **Models/** - Core data structures and domain objects
- **ViewModels/** - Business logic and state management
- **Services/** - API and external service integration
- **Views/** - UI components and screens

## Key Files and Their Purpose

### ViewModels

- **AuthViewModel.swift** - Handles authentication, user session management, and Strava connectivity
- **TrainingPlanViewModel.swift** - Manages training plan data, workout schedules, and plan updates
- **AskViciViewModel.swift** - Handles interactions with the AI coach feature
- **UserViewModel.swift** - Manages user profile data and preferences

### Services

- **APIClient.swift** - Core networking layer for API communication
- **AuthService.swift** - Authentication service for user login/registration
- **KeychainService.swift** - Secure storage of authentication tokens
- **TrainingService.swift** - Service for training plan operations
- **StravaService.swift** - Integration with Strava API

## Integration Guidelines

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

## Build Process

To ensure a clean build:

1. Always add new Swift files to the Xcode project
2. Ensure proper import statements in all files
3. Use the standard build process without workarounds
4. Address compilation errors by fixing the underlying issues, not creating temporary workarounds

## Common Issues and Solutions

- **"Cannot find type" errors**: Ensure the file containing the type is added to the Xcode project
- **Undefined symbols**: Check for circular dependencies or missing imports
- **Build errors after adding files**: Clean the build folder and rebuild

## Long-term Maintainability

- Document any complex model relationships
- Keep view models focused on specific domains
- Separate concerns between models, view models, and services
- Use SwiftUI's environment for providing shared state 