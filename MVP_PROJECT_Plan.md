# Vici iOS MVP Project Plan
Version: 1.0
Date: [Insert Date]

## 1. Introduction

This document outlines the project plan for developing the Minimum Viable Product (MVP) of the Vici mobile application, specifically targeting the iOS platform. It is based on the specifications detailed in `docs/CONTEXT.md` and incorporates findings from a review focused on iOS MVP requirements. The goal is to deliver a functional, stable, and valuable initial product to early adopters, enabling feedback collection and iterative development.

**Target Platform:** iOS (using React Native or Flutter as per NFR 9)
**Backend:** Modular Monolith on Replit (as per 6.7)

## 2. Key Assumptions

*   **Cross-Platform Framework:** The chosen framework (React Native/Flutter) is suitable and team proficiency exists.
*   **Visual Assets Availability (Gap 1):** Figma (or equivalent) links containing wireframes and mockups aligned with the Design System will be available before Phase 2 begins. Designs will be reviewed against iOS HIG.
*   **AI Service Availability:** Google Gemini API access is available and sufficient for MVP AI feature implementation.
*   **Strava API Access:** Necessary Strava API keys and permissions can be obtained.
*   **Team Availability:** Resources are available to execute this plan.
*   **Replit Suitability:** Replit infrastructure (Reserved VM, PostgreSQL, Background Workers) is adequate for MVP scale and reliability needs.

## 3. Risks & Mitigations

| Risk                                     | Mitigation                                                                                                                               |
| :--------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| Delay in Visual Assets (Gap 1)           | Prioritize design delivery. Develop backend/foundational elements concurrently.                                                          |
| iOS HIG Compliance Issues                | Conduct HIG review of designs early. Use native-like components from the framework/library. Test on iOS devices frequently.                  |
| Cross-Platform Framework Limitations     | Prototype high-risk features early (e.g., background sync, complex animations). Allocate time for platform-specific workarounds.        |
| AI Integration Complexity/Performance    | Start with simpler AI logic for MVP. Define clear AI requirements & prompts. Test AI response times and safety rigorously.               |
| Strava API Issues (Rate Limits, Errors)  | Implement robust error handling & retry logic (exponential backoff). Monitor API usage closely. Have fallback strategy if sync fails.     |
| Background Sync Reliability on iOS       | Test background fetch/processing thoroughly on iOS devices. Monitor battery impact. Consider alternative sync triggers if needed.       |
| App Store Rejection                      | Review App Store Guidelines early. Ensure clear privacy policy and permission requests. Prepare comprehensive submission info.           |
| Backend Scalability/Reliability (Replit) | Monitor Replit resource usage. Optimize critical backend paths. Plan for potential migration post-MVP if needed. Implement DB backups. |
| Accessibility Implementation lagging     | Integrate accessibility checks into the development workflow from the start. Conduct regular VoiceOver testing.                          |

## 4. Project Phases

### Phase 1: Setup & Foundation (Sprint 0-1)

*Goal: Establish project infrastructure, development environment, basic app structure, and core backend services.*

*   **Project Management:**
    *   Setup task board (Jira, Trello), Git repository, communication channels.
*   **Environment Setup:**
    *   Configure Replit environment (Secrets, DB, Reserved VM).
    *   Setup local development environments for the chosen cross-platform framework.
    *   Configure iOS build environment (Xcode, dependencies).
    *   Establish basic CI/CD pipeline (e.g., GitHub Actions + Replit integration) for automated builds and basic checks.
*   **Backend Foundation:**
    *   Initialize Modular Monolith (FastAPI recommended) structure on Replit.
    *   Setup PostgreSQL schema based on Data Models (6.3), focusing on MVP tables.
    *   Implement Authentication module/service (Registration, Login APIs - 6.2.2).
    *   Implement User Profile & Settings module/service (basic GET/PUT APIs - 6.2.3).
*   **Frontend Foundation:**
    *   Initialize React Native/Flutter project.
    *   Setup basic navigation structure (Bottom Tab Bar - 5.1).
    *   Implement core UI component library foundation based on Design System (5.4) (Buttons, Inputs, Cards etc.). Ensure theme (colors, typography) is applied.
    *   Setup state management solution.
*   **Tooling:**
    *   **DECISION:** Finalize and integrate Analytics SDK (e.g., Firebase Analytics) (Gap 5).
    *   Integrate Crash Reporting tool (e.g., Sentry, Firebase Crashlytics).

### Phase 2: Core Feature Development (Sprint 2-5)

*Goal: Implement core MVP user flows and backend logic.* (Parallel work possible)

*   **User Account Management:**
    *   Frontend: Registration, Login, Forgot Password screens (WF 2.1-2.6). Basic Profile display screen (WF 10.1). Settings screen foundation (WF 11.1).
    *   Backend: Implement password reset logic, email verification logic (SMTP service integration needed), account deletion endpoint.
*   **Strava Integration:**
    *   Backend: Implement Strava OAuth flow (6.6.2), token storage, basic activity sync logic (webhook/polling), API endpoints (6.2.4).
    *   Frontend: Strava connection prompts (WF 1.3, 3.2), data confirmation (WF 1.4), settings toggle.
*   **AI Runner Profile Analysis:**
    *   Backend: Implement Initial Runner Profile Analysis logic (6.5.1) integrating with Gemini API. Store results in RunnerProfile (6.3.3).
    *   Frontend: Display initial recommendations/insights (WF 1.8), display Runner Profile data in Profile screen (WF 10.1).
*   **Training Plan Creation:**
    *   Backend: Implement Training Plan Generation logic (6.5.2) integrating with Gemini (MVP version may use simpler rules/templates initially). Implement plan creation/preview APIs (6.2.5).
    *   Frontend: Implement Plan Creation flow screens (WF 3.1-3.8), Plan Preview screens (WF 4.1-4.3), handle API calls.
*   **Training Plan Viewing & Interaction:**
    *   Backend: Implement APIs to fetch active/past plans, weekly details, today's workout (6.2.5). Implement basic "Ask Vici" endpoint stub (receiving query, potentially simple canned response for MVP).
    *   Frontend: Implement Training Plan Home screen (WF 5.1, 5.2), Daily Workout Detail view (WF 6.2), connect to APIs. Implement basic "Ask Vici" UI (WF 4.4/5.5).
*   **Training Log:**
    *   Backend: Implement Activity fetch API (6.2.6). Implement basic Workout Reconciliation logic (manual trigger/prompt - 4.4).
    *   Frontend: Implement Training Log screen (WF 7.1/7.2), Detailed Activity View (WF 7.3), Reconciliation prompt UI (WF 7.4), connect to APIs.
*   **Content:** Integrate finalized MVP copy/content (Gap 3).

### Phase 3: Integration, Polishing & Testing (Sprint 6-8)

*Goal: Integrate all features, refine UI/UX, implement supporting features, and conduct thorough testing.*

*   **AI Integration:**
    *   Integrate full MVP "Ask Vici" logic (NLP, simple adjustments - 6.5.4).
    *   Refine AI plan generation based on testing.
*   **Supporting Features:**
    *   Implement Push Notifications (APNS setup, backend logic, frontend handling - 3.1.7, 5.1 MVP types). Handle iOS permissions.
    *   Implement basic Gamification logic (Streaks, simple badges - 3.1.5) and UI display (WF 8.3/10.1).
    *   Implement basic Analytics events (tracking key user actions defined in 7.4).
*   **UI/UX Polishing:**
    *   Refine UI based on visual designs (assuming Gap 1 resolved).
    *   Ensure smooth navigation and transitions.
    *   Implement microinteractions (5.3.10).
    *   Review and enhance adherence to iOS HIG.
*   **Testing:**
    *   Execute comprehensive Unit, Integration, and API tests.
    *   Conduct manual E2E testing on target iOS devices/simulators covering all MVP user flows (7.1).
    *   Perform basic Accessibility testing (VoiceOver) (7.3).
    *   Conduct basic Performance and Stability testing on iOS devices (check against NFRs).
    *   Perform initial Security checks (review checklist 7.2).
    *   User Acceptance Testing (UAT) with internal stakeholders/beta group.
*   **Bug Fixing:** Address bugs identified during testing.

### Phase 4: Pre-Launch Preparation (Sprint 9)

*Goal: Finalize the app and backend for launch, prepare App Store submission materials.*

*   **App Store Connect Setup:**
    *   Create App ID, Certificates (Push Notifications, Distribution), Provisioning Profiles.
    *   Set up TestFlight for internal/beta distribution.
*   **App Store Listing:**
    *   Prepare metadata (name, subtitle, description, keywords).
    *   Create screenshots and app preview video (if required).
    *   Finalize Privacy Policy URL and user-facing text.
    *   Configure app details (pricing, availability, rating).
*   **Final Testing:**
    *   Regression testing on release candidate build.
    *   Final UAT sign-off.
    *   Final Security review.
*   **Backend Preparation:**
    *   Finalize Replit deployment configuration (scaling, monitoring).
    *   Perform database backup.
    *   Ensure logging and monitoring are active.
*   **Documentation:** Finalize basic internal documentation.

### Phase 5: Launch & Post-Launch Monitoring (Sprint 10+)

*Goal: Release the MVP to the App Store, monitor its performance, and gather user feedback.*

*   **App Store Submission:** Submit the app for review. Address any reviewer feedback.
*   **Launch:** Release the app upon approval.
*   **Monitoring:**
    *   Closely monitor Analytics for key metrics (Activation, Engagement, Retention - 1.2 Phase 1).
    *   Monitor Crash Reporting for stability issues.
    *   Monitor backend performance and logs.
    *   Monitor Strava API usage and errors.
*   **Feedback Collection:** Gather user feedback via App Store reviews, support channels (if any), surveys.
*   **Iteration Planning:** Analyze metrics and feedback to plan the first post-MVP iteration (addressing critical bugs, incorporating key feedback, potentially starting on post-MVP features from 3.2).

## 5. Timeline & Milestones

*(High-level estimates - requires detailed sprint planning)*

*   **End of Phase 1:** Foundation built, environments stable, basic auth working.
*   **End of Phase 2:** Core features implemented (Plan generation/viewing, Strava sync, Log display). Internal demo possible.
*   **End of Phase 3:** Features integrated, polished, tested. UAT completed. Release candidate ready.
*   **End of Phase 4:** App Store submission prepared. Backend ready for launch.
*   **Phase 5:** App launched on App Store. Monitoring established.

*(Detailed sprint breakdown with specific task assignments should follow)*

## 6. Detailed Task List by Phase

*(Use checkboxes to track progress: `- [x]` for completed, `- [ ]` for pending)*

### Phase 1: Setup & Foundation (Sprint 0-1)

**Project Management:**
- [ ] Setup Task Board (Jira/Trello/etc.)
- [ ] Create & Configure Git Repository
- [ ] Establish Team Communication Channels (Slack/Discord)

**Environment Setup:**
- [ ] Configure Replit Project (Secrets, DB Connection, Reserved VM)
- [ ] Setup Local Dev Environment (React Native/Flutter, Node, Watchman, etc.)
- [ ] Setup iOS Build Environment (Xcode, CocoaPods/Dependencies)
- [ ] Configure Basic CI/CD Pipeline (GitHub Actions -> Replit Deploy Trigger)
- [ ] Verify CI/CD Build & Basic Checks

**Backend Foundation:**
- [ ] Initialize FastAPI Project Structure on Replit
- [ ] Define & Apply Initial PostgreSQL Schema (Users, Settings, Base Tables)
- [ ] Implement User Registration API Endpoint (`/auth/register`)
- [ ] Implement User Login API Endpoint (`/auth/login`)
- [ ] Implement Basic JWT Authentication Middleware
- [ ] Implement Get User Profile API Endpoint (`/user/profile` - GET)
- [ ] Implement Update User Profile API Endpoint (`/user/profile` - PUT)
- [ ] Implement Get User Settings API Endpoint (`/user/settings` - GET)
- [ ] Implement Update User Settings API Endpoint (`/user/settings` - PUT)

**Frontend Foundation:**
- [ ] Initialize React Native/Flutter Project
- [ ] Implement Bottom Tab Navigator Structure
- [ ] Setup State Management Library (Redux Toolkit, Zustand, Riverpod, etc.)
- [ ] Implement Core UI Components (Button, Input, Card, Base Layout)
- [ ] Integrate Design System Tokens (Colors, Typography, Spacing)
- [ ] Setup Basic Theming

**Tooling:**
- [ ] **DECISION:** Choose Analytics Platform (e.g., Firebase)
- [ ] Integrate Analytics SDK (Basic Setup, User ID Tracking)
- [ ] Integrate Crash Reporting SDK (e.g., Sentry, Crashlytics)
- [ ] Verify Crash Reports are Received

### Phase 2: Core Feature Development (Sprint 2-5)

**User Account Management (Backend):**
- [ ] Implement Password Reset Request Logic (`/forgot-password`)
- [ ] Implement Password Reset Execution Logic (`/reset-password`)
- [ ] Integrate Email Service (e.g., SendGrid, Mailgun) for Verification/Reset Emails
- [ ] Implement Email Verification Logic (`/verify-email`, `/resend-verification`)
- [ ] Implement Account Deletion Endpoint (`/user/account` - DELETE)

**User Account Management (Frontend):**
- [ ] Implement Registration Screen UI (WF 1.1)
- [ ] Implement Email Verification Screen UI (WF 1.2)
- [ ] Implement Login Screen UI (WF 2.1)
- [ ] Implement Forgot Password Flow UI (WF 2.4 - 2.6)
- [ ] Implement Basic Profile Screen UI (Display data - WF 10.1)
- [ ] Implement Basic Settings Screen UI (Display data - WF 11.1)
- [ ] Connect Frontend Screens to Auth/Profile/Settings APIs

**Strava Integration (Backend):**
- [ ] Implement Strava OAuth Connection Endpoint (`/integrations/strava/connect`, `/callback`)
- [ ] Implement Secure Storage/Retrieval of Strava Tokens
- [ ] Implement Strava Token Refresh Logic
- [ ] Implement Strava Disconnect Endpoint (`/integrations/strava/disconnect`)
- [ ] Implement Basic Activity Sync Logic (Webhook Receiver or Polling Job)
- [ ] Define Activity Data Mapping (Strava -> Vici Model)
- [ ] Implement API Endpoint to Get Strava Connection Status (`/integrations/strava/status`)

**Strava Integration (Frontend):**
- [ ] Implement Strava Connection Prompt UI (WF 1.3, 3.2)
- [ ] Implement Strava Data Confirmation UI (WF 1.4)
- [ ] Implement Settings Toggle for Strava Connection
- [ ] Handle Strava Connection/Disconnection Flow

**AI Runner Profile Analysis (Backend):**
- [ ] Define Gemini Prompts for Initial Profile Analysis
- [ ] Implement API Endpoint for Initial Analysis (`/integrations/strava/initial-analysis`)
- [ ] Call Gemini API and Parse Response
- [ ] Update RunnerProfile Table with Analysis Results
- [ ] Implement Logic for Ongoing Fitness/Experience Updates (Basic MVP version)

**AI Runner Profile Analysis (Frontend):**
- [ ] Implement Initial Recommendations & Insights Screen UI (WF 1.8)
- [ ] Display Runner Profile Data (Experience, Fitness, PBs) on Profile Screen

**Training Plan Creation (Backend):**
- [ ] Define Gemini Prompts for Training Plan Generation (MVP Scope)
- [ ] Implement Training Plan Creation API Endpoint (`/training-plans` - POST)
- [ ] Implement Plan Preview Data Fetching Logic
- [ ] Implement Plan Approval Endpoint (`/training-plans/{planId}/approve`)
- [ ] Store Generated Plan Data in DB (Status: Preview -> Active)

**Training Plan Creation (Frontend):**
- [ ] Implement Goal Setting Screens UI (WF 3.5 - 3.7)
- [ ] Implement Training Preferences Screen UI (WF 3.8)
- [ ] Implement Generating Plan Screen UI (WF 3.9)
- [ ] Implement Plan Preview Screens UI (Overview, Week, Day - WF 4.1-4.3)
- [ ] Connect Plan Creation Flow to Backend APIs
- [ ] Handle Plan Approval Flow

**Training Plan Viewing & Interaction (Backend):**
- [ ] Implement API to Fetch Active Plan Overview (`/training-plans/active`)
- [ ] Implement API to Fetch Past Plans List (`/training-plans/past`)
- [ ] Implement API to Fetch Specific Plan Details (`/training-plans/{planId}`)
- [ ] Implement API to Fetch Specific Week Details (`/training-plans/{planId}/week/{weekNumber}`)
- [ ] Implement API to Fetch Today's Workout (`/training-plans/today`)
- [ ] Implement Basic Ask Vici Endpoint Stub (`/training-plans/{planId}/ask-vici` - POST)

**Training Plan Viewing & Interaction (Frontend):**
- [ ] Implement Training Plan Home Screen UI (This Week/Overview Tabs - WF 5.1, 5.2)
- [ ] Implement Detailed Daily Workout View UI (WF 6.2)
- [ ] Connect Plan Viewing Screens to Backend APIs
- [ ] Implement Basic Ask Vici Input UI (WF 4.4 / 5.5)

**Training Log (Backend):**
- [ ] Implement Fetch Activities API Endpoint (`/activities` - GET)
- [ ] Implement Fetch Specific Activity Details API (`/activities/{activityId}` - GET)
- [ ] Implement Basic Manual Workout Reconciliation Endpoint (`/activities/{activityId}/reconcile` - POST)

**Training Log (Frontend):**
- [ ] Implement Training Log Screen UI (WF 7.1 / 7.2)
- [ ] Implement Detailed Activity View UI (WF 7.3)
- [ ] Implement Workout Reconciliation Prompt UI (WF 7.4)
- [ ] Connect Log Screens to Backend APIs

**Content Integration:**
- [ ] Integrate Finalized UI Microcopy
- [ ] Integrate Placeholder/Initial Workout Descriptions
- [ ] Integrate Finalized Error Messages (from Catalogue)

### Phase 3: Integration, Polishing & Testing (Sprint 6-8)

**AI Integration:**
- [ ] Define Gemini Prompts for Ask Vici (MVP Adjustments)
- [ ] Implement Ask Vici Backend Logic (Intent Recognition, Simple Adjustment Proposals)
- [ ] Implement Ask Vici Response Handling (`/training-plans/{planId}/ask-vici`)
- [ ] Implement Ask Vici Change Approval Endpoint (`/training-plans/{planId}/approve-changes`)
- [ ] Connect Full Ask Vici Flow in Frontend
- [ ] Test and Refine AI Plan Generation Prompts/Logic
- [ ] Test and Refine Ask Vici Prompts/Logic

**Supporting Features (Backend):**
- [ ] Configure APNS Certificates/Keys
- [ ] Implement Push Notification Token Registration Endpoint (`/notifications/register-device`)
- [ ] Implement Logic to Send MVP Push Notifications (Workout Reminder, Reconciliation Nudge)
- [ ] Implement Gamification Logic (Track Streaks, Award Simple Badges)
- [ ] Implement Gamification Data Fetching Endpoints (`/gamification/badges`, `/streaks`)
- [ ] Implement Analytics Event Tracking (Server-side where appropriate, e.g., `activity_synced`)

**Supporting Features (Frontend):**
- [ ] Implement iOS Push Notification Permission Request Flow
- [ ] Handle Receiving Push Notifications (Foreground/Background)
- [ ] Implement Gamification Display in Profile UI (WF 8.3 / 10.1)
- [ ] Implement Analytics Event Tracking (Client-side key events: `screen_viewed`, `button_clicked`, etc.)

**UI/UX Polishing:**
- [ ] Review All Screens Against Final Visual Designs (Figma)
- [ ] Ensure Consistent Application of Design System
- [ ] Implement Loading States and Skeletons
- [ ] Implement Empty States (Log, Plans, etc.)
- [ ] Refine Navigation Transitions
- [ ] Implement Key Microinteractions (Button presses, etc.)
- [ ] Conduct iOS Human Interface Guidelines (HIG) Review
- [ ] Address any HIG Violations

**Testing:**
- [ ] Write/Update Unit Tests (Target >80% Coverage)
- [ ] Write/Update Integration Tests (Backend Modules)
- [ ] Write/Update API Tests (Postman/Automated)
- [ ] Define E2E Test Cases for MVP Flows
- [ ] Execute Manual E2E Testing on Multiple iOS Devices/Simulators
- [ ] Perform Basic VoiceOver Testing on Key Screens
- [ ] Conduct Informal Performance Testing (Startup time, screen loads)
- [ ] Conduct Stability Testing (Monitor crash reports during testing)
- [ ] Review Security Checklist (7.2) and Address Gaps
- [ ] Conduct Internal User Acceptance Testing (UAT)

**Bug Fixing:**
- [ ] Triage Bugs from Testing & UAT
- [ ] Fix High/Medium Priority Bugs

### Phase 4: Pre-Launch Preparation (Sprint 9)

**App Store Connect Setup:**
- [ ] Create App ID in Apple Developer Portal
- [ ] Create Distribution Certificate
- [ ] Create Push Notification Service (APNS) Key/Certificate
- [ ] Create App Store Connect App Record
- [ ] Create Provisioning Profiles (Development, Ad Hoc, App Store)
- [ ] Configure TestFlight Internal Testing Group
- [ ] Upload Initial Build to TestFlight

**App Store Listing:**
- [ ] Write App Name, Subtitle, Description, Keywords
- [ ] Generate Required App Store Screenshots (Multiple device sizes)
- [ ] Create App Preview Video (Optional but Recommended)
- [ ] Finalize Privacy Policy URL
- [ ] Write User-Facing Privacy Information for App Store
- [ ] Set Pricing and Availability
- [ ] Determine App Category and Content Rating
- [ ] Prepare App Review Information (Test Account, Notes)

**Final Testing:**
- [ ] Create Release Candidate Build
- [ ] Distribute RC Build via TestFlight
- [ ] Execute Final Regression Test Suite (Manual/Automated)
- [ ] Obtain Final UAT Sign-off
- [ ] Conduct Final Security Review/Checklist Pass

**Backend Preparation:**
- [ ] Finalize Replit Deployment Settings (Ensure Reserved VM active)
- [ ] Confirm Background Worker Configuration
- [ ] Perform Manual Database Backup
- [ ] Verify Logging Configuration
- [ ] Setup Basic Monitoring/Alerting (if available on Replit plan)

**Documentation:**
- [ ] Write Basic README for Frontend/Backend
- [ ] Document Build/Deployment Process
- [ ] Document Setup for New Developers (Basic)

### Phase 5: Launch & Post-Launch Monitoring (Sprint 10+)

**Launch Activities:**
- [ ] Submit Release Candidate Build to App Store Review
- [ ] Monitor App Review Status
- [ ] Respond to any App Review Feedback/Rejections
- [ ] Release Approved App to the App Store

**Monitoring:**
- [ ] Configure Analytics Dashboards for MVP Metrics (Activation, Engagement)
- [ ] Monitor Real-time Analytics Post-Launch
- [ ] Monitor Crash Reporting Dashboard Closely
- [ ] Monitor Backend Logs for Errors
- [ ] Monitor Replit Resource Usage (CPU, Memory)
- [ ] Monitor Strava API Usage/Error Rates

**Feedback & Iteration:**
- [ ] Setup Process for Collecting App Store Reviews/Feedback
- [ ] Establish Support Channel (if applicable)
- [ ] Triage Incoming Bug Reports and Feedback
- [ ] Prioritize Post-MVP Bug Fixes
- [ ] Analyze Metrics & Feedback for Next Iteration Planning 