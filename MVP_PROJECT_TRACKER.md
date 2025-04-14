# Vici MVP Project Tracker

**Version:** 2.1
**Date:** 2025-07-15
**Status:** Revised - iOS Focus with Real Integrations + Clean-up

**Document Purpose:** This document serves as the central tracker for all remaining tasks required to complete and launch the Vici MVP. It reflects the strategic decision to focus on iOS-only launch with real Strava and LLM integrations while streamlining the technical approach.

**MVP Goal:** Launch a stable version of the Vici **iOS application** including core features: User Registration/Login, Real Strava Connection & Data Import, AI Training Plan Generation (using real LLM), Plan Viewing, and Basic Ask Vici functionality (real AI responses but limited scope).

---

_(Status Legend: [ ] To Do, [/] In Progress, [x] Done)_

## Vici MVP Launch Tasks (iOS Focus with Real Integrations)

### Phase 0: Codebase Consolidation & Clean-up

- [/] **Consolidate iOS Implementation:**

  - [x] Designate packages/vici-native/ViciMVP as primary iOS project
  - [x] Remove duplicate iOS app directories
  - [x] Create Swift model definitions matching TypeScript interfaces
    - [x] TrainingPlan.swift
    - [x] Workout.swift
    - [x] Activity.swift
    - [x] User.swift
  - [x] Setup API integration layer
    - [x] APIClient.swift (updated for async/await)
    - [x] AuthService.swift
    - [x] TrainingService.swift
    - [x] StravaService.swift
    - [x] LLMService.swift

- [x] **Simplify Package Structure:**

  - [x] Clean up mobile package directories
  - [x] Consolidate TypeScript model definitions
  - [/] Document mock implementations for later removal

- [x] **Ensure Backend API Alignment:**

  - [x] Review and align API endpoints with models
  - [x] Verify database schema matches models

- [x] **Documentation & Organization:**
  - [x] Update README.md with architecture overview
  - [x] Create development guides for iOS
  - [x] Establish proper Git workflow and practices

### Phase 1: Repository & Foundation (Verification)

- [x] Repository Setup Complete (Based on `REPOSITORY_TRANSITION.md` Phase 1)
- [x] Monorepo Structure Setup Complete
- [x] Development Environment Configuration Complete
- [x] CI/CD Pipeline Foundational Setup Complete (Testing, Linting, Checks)
- [x] Environment Variables Setup Complete

### Phase 2: Backend Development & Integration (Core MVP Needs)

- **Backend (`api`, `database`, `services` packages):**
  - [x] Core package structure setup
  - [x] Database models (Prisma) setup
  - [x] Basic API endpoints structure setup
  - [x] Authentication services & middleware setup
  - [x] Strava Integration Services:
    - [x] Auth/OAuth flow implementation
    - [x] Athlete data import implementation
    - [x] Activity history import implementation
  - [x] LLM Integration Services:
    - [x] API configuration and connection setup
    - [x] Training plan generation prompt engineering
    - [x] Ask Vici prompt engineering
  - [x] Training services:
    - [x] Implement `getActivePlan` logic
    - [x] Implement `getTodaysWorkout` logic
    - [x] Implement `approvePlan` logic
    - [x] Implement `createPlan` with real LLM integration
    - [x] Implement `askVici` with real LLM integration
    - [x] Implement `approveViciChanges` logic
  - [/] Basic Analytics services (Limited scope - user acquisition & key feature usage)
  - [/] User API implementation completion (Focus on essential profile management)

### Phase 3: Backend Testing (Core MVP Needs)

- [/] Unit Tests (Focus on Strava and LLM integration services)
- [/] Integration Tests (`packages/api/__tests__/integration`):
  - [x] Auth API Endpoints
  - [x] User API Endpoints (All runnable tests passing; 1 `todo` for profile pic)
  - [x] Strava Integration API Endpoints
  - [x] Training API Endpoints with LLM Integration
  - [ ] Simplified Analytics API Endpoints
- [/] API Documentation (Essential endpoints only):
  - [x] Strava integration documentation
  - [x] LLM integration documentation
  - [ ] User/Auth API documentation

### Phase 4: iOS Frontend Implementation (Direct Implementation)

- [/] **iOS Native Implementation:**
  - [x] Reorganize ViciMVP structure to focus on key features
  - [/] Remove unnecessary mock implementations
  - [x] Implement direct API client for backend services
- [/] Authentication screens (Connect to real backend)
  - [/] Login/Registration flow (UI exists, connecting to real API)
  - [ ] Strava OAuth Connection flow
- [ ] Training Plan Creation flow (Using real LLM)
  - [ ] Goal setting interface
  - [ ] Athlete profile input
  - [ ] Real plan generation & display
- [ ] Training Plan Viewing screens
  - [ ] This Week view
  - [ ] Today's Workout view
  - [ ] Plan Overview
- [ ] Ask Vici interface (Using real LLM)
  - [ ] Basic question interface
  - [ ] Plan adjustment requests
- [ ] Profile/Settings screens (Essential settings only)
- [/] iOS-specific optimizations:
  - [ ] SwiftUI performance tuning
  - [ ] Push Notification setup
  - [x] Secure credential storage (Implemented KeychainService)

### Phase 5: Testing & Validation (iOS MVP Scope)

- [ ] iOS Simulator Testing:
  - [ ] Test across multiple iPhone models
  - [ ] Verify responsive layouts
  - [ ] Test offline/poor connectivity scenarios
- [/] Integration Testing:
  - [x] Strava API integration tests
  - [x] LLM integration tests
  - [ ] End-to-end user flows
- [ ] User Acceptance Testing (UAT):
  - [ ] Internal team testing of real features
  - [ ] Small focus group testing
- [ ] Performance Testing:
  - [ ] Network request optimization
  - [ ] LLM response time optimization

### Phase 6: Documentation & Launch Prep (iOS MVP)

- [/] Update Documentation:
  - [x] Development setup guide (iOS focus)
  - [x] API documentation for essential endpoints
  - [x] LLM prompt documentation
- [ ] App Store Preparation:
  - [ ] App Store screenshots & descriptions
  - [ ] Privacy policy updates
  - [ ] Terms of service updates
- [ ] Backend Deployment:
  - [ ] Staging environment setup
  - [ ] Production environment setup
  - [ ] Database migration scripts
- [ ] CI/CD Pipeline:
  - [ ] iOS build automation
  - [ ] Backend deployment automation
- [ ] Launch Monitoring Setup:
  - [ ] Error tracking implementation
  - [ ] Basic analytics instrumentation
  - [ ] Performance monitoring
- [ ] Define Launch Go/No-Go criteria

---

## Post-MVP Enhancements

### Phase 7: Cross-Platform & Architecture Enhancements

- [ ] **Fix Monorepo Module Resolution/Build Errors:**
  - [ ] Investigate why `@vici/mobile` fails to resolve `@vici/shared` during build/lint
  - [ ] Fix Metro/TypeScript/Turbo configurations and potential interactions
  - [ ] **Comprehensive TypeScript Type Fixes:**
    - [ ] Address issues documented in `docs/TYPE_ISSUES.md`
    - [ ] Fix field name mismatches between code and Prisma schema
    - [ ] Correct enum capitalization throughout the codebase
    - [ ] Update relationship traversals in controllers
    - [ ] Add proper TypeScript interfaces for all API models
- [ ] **Implement Core Shared Logic:**
  - [ ] Refactor iOS-specific implementations to shared packages
  - [ ] Implement better abstraction for API services
  - [ ] Create cross-platform UI components library
- [ ] **Android Support:**
  - [ ] Implement Android version of the app
  - [ ] Test on multiple Android devices/versions
  - [ ] Google Play Store preparation

### Phase 8: Feature Expansion

- [ ] **Enhanced Training Features:**
  - [ ] Training Log implementation
  - [ ] Advanced analytics and insights
  - [ ] Expanded workout types
- [ ] **Social Features:**
  - [ ] Basic gamification implementation
  - [ ] Sharing capabilities
  - [ ] Achievements system
- [ ] **Extended Integration:**
  - [ ] Additional fitness platform integrations
  - [ ] Advanced LLM capabilities
  - [ ] Third-party service connections

### Phase 9: Web Implementation

- [ ] Implement web version using shared packages
- [ ] Cross-platform feature parity
- [ ] Browser testing and optimization

### Phase 10: Advanced Analytics & Optimization

- [ ] Advanced user analytics
- [ ] A/B testing framework
- [ ] Personalization engine
- [ ] Performance optimization across platforms

---

## Notes

- This revised tracker prioritizes an iOS-only MVP with real integrations to deliver actual value to users
- Post-MVP phases focus on platform expansion and feature enhancement
- All timeframes should be reviewed with the development team to ensure realistic scheduling
