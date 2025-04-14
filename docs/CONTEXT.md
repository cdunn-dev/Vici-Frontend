Vici Product Specification [Source of Truth]
Version: 1.2
Date: March 31, 2025
Status: Consolidated Draft

Document Purpose: This document serves as the central source of truth for the Vici application. It provides a comprehensive overview of the product vision, strategy, requirements, design, and technical specifications to guide development, design, testing, and other project contributions.
1. Introduction & Overview
1.1 Product Vision
Vici will revolutionize the world of running, becoming the global standard for accessible, data-driven performance optimization, empowering every runner to reach their full potential.
Key Value Propositions:
* Personalized and dynamic training plans that adapt to progress and life changes.
* Seamless integration with existing fitness trackers.
* Motivational gamification to keep users engaged.
* Accessible and affordable coaching.
1.2 Goals & Objectives
* Product Goals: Provide highly personalized and effective training plans, deliver actionable AI insights, ensure high user engagement and retention, help users achieve their running goals safely.
* Success Metrics: (Details below - see Section 8.4 for the full Analytics Tracking Plan)
   * Phase 1: MVP Launch & Initial Traction (First ~1-3 Months): Focus on Acquisition, Activation, Initial Engagement, Technical Performance, Early Feedback. Key metrics include Downloads, Registrations, Strava Connection Rate, First Plan Creation Rate, % Active Plan Users, Reconciliation Rate, Crash Rate.
   * Phase 2: Longer-Term Growth & Adoption (Post 3+ Months): Focus on Sustained Engagement, Retention, User Success/Value, Monetization (Post-MVP), Growth. Key metrics include DAU/WAU/MAU, Stickiness, Follow-Through Rate, Retention Rate, Churn Rate, Goal Achievement, NPS/CSAT, Conversion Rate (Paid), LTV, Referral Rate.
1.3 Target Audience
Vici will target runners of all experience levels who are dedicated to improving their performance as a runner and reaching their full potential. Key characteristics below:
* Beginner to intermediate runners looking for personalized guidance and motivation
* Experienced runners with time constraints for developing their own training programs, but either don’t want to or can’t afford a coach
* Tech-savvy individuals comfortable with app-based training.
* Runners who appreciate data-driven insights
1.4 Scope & Release Strategy
* MVP Scope: (Based on Functional Requirements marked [MVP])
   * Core running training plans (no cross-training initially).
   * AI for plan generation, basic insights, workout reconciliation.
   * Strava integration (priority).
   * Core features: Registration/Login, Profile (simple), Plan Creation/Viewing/Approval, Ask Vici (basic adjustments), Training Log, Basic Gamification (streaks, simple badges), Push Notifications.
* Future Scope (Post-MVP): (Based on Functional Requirements marked [Paid/Not MVP] or future)
   * Advanced AI Coach features (proactive adjustments, nutrition/strength, race strategy).
   * Advanced Training Analytics (potentially paid).
   * Additional integrations (Garmin Connect, HealthKit, Google Fit, etc.).
   * Manual activity entry.
   * Cross-training support.
   * Advanced gamification.
   * Social features / Community.
   * Web platform access.
   * (Needs more detailed phasing/roadmap)
2. User Requirements
2.1 User Stories
Training Plan Selection
* As a runner, I want to be able to easily find training plans that are tailored to my specific needs and goals, so I can avoid feeling overwhelmed by the sheer number of options and make a confident choice.
* As a runner, I want to easily compare different training plans based on my goals, experience level, and available time, so that I can choose the best plan for my needs.
* As a runner, I want to see how other runners with similar profiles have fared on different training plans, so that I can make a more informed decision.
* As a runner, I want to be able to ask questions about specific training plans and get advice from experienced coaches or runners, so that I can address my concerns before committing to a plan.
* As a runner, I want a platform that accommodates different training styles and philosophies, such as heart rate training, zone 2 training, or Galloway method, so I can choose an approach that aligns with my preferences.
Adjusting Training Plans for Individual Circumstances
* As a runner, I want clear guidance on how to modify training plans based on my progress, setbacks, or schedule changes, so I can stay on track with my training even when life throws me curveballs.
* As a runner, I want to be able to easily adjust my training plan based on factors such as hills, missed workouts, and scheduling conflicts, so that I can stay on track with my training despite life's unpredictable events.
* As a runner, I want to be able to get personalized advice on how to adjust my training plan based on my individual circumstances, so that I can avoid making mistakes that could hinder my progress or lead to injury.
Optimizing Workouts and Training Intensity
* As a runner, I want tools and resources that help me accurately assess my current fitness level and choose a training plan that is appropriately challenging yet achievable, so I can avoid feeling discouraged or overwhelmed.
* As a runner, I want to be able to easily track my workouts and monitor my progress, so that I can identify areas where I need to adjust my training or focus on specific aspects of my fitness.
* As a runner, I want to be able to get personalized feedback on my workouts from a coach, so that I can optimize my training and avoid overtraining or undertraining.
Access to Coaching
* As a runner, I want access to affordable and personalized coaching options, so I can get expert guidance and support without breaking the bank.
* As a runner, I want to be able to easily connect with experienced coaches who can provide personalized guidance and support, so that I can achieve my running goals and optimize my training.
* As a runner, I want to be able to access coaching services at a variety of price points, so that I can find a coach who fits my budget.
* As a runner, I want clear and timely communication with my coach (if I choose to work with one), so I can get regular feedback on my progress, ask questions, and make adjustments to my training as needed.
Predicting Race Performance
* As a runner, I want to be able to accurately predict my race performance based on my training data and recent race results, so that I can set realistic goals and evaluate my training progress.
* As a runner, I want to be able to compare my predicted race performance with other runners in my age group and experience level, so that I can get a better sense of where I stand.
Injury Prevention and Recovery
* As a runner, I want to learn more about common running injuries and how to prevent them, so that I can stay healthy and injury-free.
* As a runner, I want training plans and coaching that prioritize injury prevention, so I can stay healthy and avoid setbacks that could derail my progress.
* As a runner, I want to be able to track my recovery from workouts and races, so that I can avoid overtraining and reduce my risk of injury.
* As a runner, I want to be able to connect with physical therapists or other healthcare professionals who specialize in running injuries, so that I can get expert advice and treatment if needed.
Race Strategy and Tactics
* As a runner, I want to learn more about different race strategies and tactics, so that I can optimize my performance on race day.
* As a runner, I want to be able to simulate race conditions in my training, so that I can better prepare for the challenges of race day.
Motivation and Mindset
* As a runner, I want to be able to connect with other runners for support and motivation, so that I can stay on track with my training and achieve my goals.
* As a runner, I want to learn more about mental strategies for dealing with setbacks and challenges, so that I can maintain a positive attitude and stay motivated throughout my running journey.
* As a runner, I want a platform that connects me with a supportive community of other runners, so I can share experiences, ask questions, and stay motivated throughout my training journey.
Nutrition and Fueling
* As a runner, I want to learn more about proper nutrition and fueling for running, so that I can optimize my performance and recovery.
* As a runner, I want to be able to track my calorie intake and macronutrient ratios, so that I can make sure I'm getting the right fuel for my training.
2.2 User Flows
(Content from vici_user_flows_restructured_v1)
Overview: This outlines the Vici application's user flows, following major user journeys and tasks to enhance clarity for development. This approach highlights how different features connect and how users navigate through the application to achieve specific goals. Wireframe references (e.g., WF 1.1) link to specific screen designs listed in Section 5.2.
1. Onboarding & Initial Setup
* Goal: Get a new user registered, logged in, connected to Strava, and through the initial profile/settings configuration.
* Flow:
   * 1.1 User Registration:
      * User accesses the app and selects "Register".
      * User inputs Email Address, creates Password, and confirms Password on the Registration Screen (WF 1.1).
      * User accepts Terms of Service and Privacy Policy.
      * User taps "Register".
      * Error Handling: Display messages for invalid email format, password mismatch, weak password, or existing email.
      * Vici sends a verification code email.
      * User is directed to the Email Verification Screen (WF 1.2).
      * User enters the received verification code and taps "Verify".
      * Error Handling: Display messages for invalid/expired code. Allow "Resend Code".
      * Upon successful verification, proceed to First Login.
   * 1.2 First Login & Strava Connection:
      * User is automatically logged in or directed to the Login screen (WF 2.1) after verification.
      * User is presented with the Strava Connection Prompt Screen (WF 1.3).
      * Path A (Connect Strava):
         * User taps "Connect Strava".
         * User is potentially redirected to Strava authentication flow (handled by Strava SDK/web view).
         * Upon successful Strava authentication, user is shown the Strava Data Confirmation Screen (WF 1.4).
         * User reviews data Vici will access and taps "Confirm" or "Allow".
         * Vici displays the Strava Data Processing Screen (WF 1.7) with progress messages ("Retrieving profile...", "Importing activity history...", etc.).
         * Proceed to Initial Profile Setup (1.3).
      * Path B (Skip Strava):
         * User taps "Skip for Now".
         * Proceed directly to Initial Profile Setup (1.3). (Note: User will be prompted again before plan creation).
   * 1.3 Initial Profile & Settings:
      * User is directed to the Initial Profile Setup Screen (WF 1.5).
      * User inputs Name, optionally uploads Profile Picture, inputs Date of Birth, and selects Gender.
      * User taps "Next" or "Continue".
      * User is directed to the Settings Configuration Screen (WF 1.6).
      * User selects Preferred Distance Metric (Miles/Kilometers) and Preferred Language.
      * User taps "Save" or "Finish".
   * 1.4 Runner Profile Analysis & Review (Only if Strava Connected in 1.2):
      * If Strava was connected, Vici performs AI analysis in the background or shows WF 1.7 again briefly.
      * User is presented with the Initial Recommendations & Insights Screen (WF 1.8).
      * User reviews calculated Experience Level, Fitness Level, PBs, Recommendations (paces, mileage, etc.), and Insights (Goal, Training Plan safety).
      * User taps "Continue" or "Got it".
   * 1.5 Landing on Home Screen:
      * User is directed to the Training Plan Home screen, which displays the "No Active Plan" state (WF 1.9 / WF 2.8).
2. Core Training Cycle Management
* Goal: Detail the primary loop users engage with daily/weekly: creating, viewing, adjusting, and completing training plans and workouts.
* Flow:
   * 2.1 Accessing the Training Hub (Post-Login):
      * Registered user opens the app.
      * User enters Email and Password on the Login Screen (WF 2.1) and taps "Login".
      * Error Handling: Display messages for unrecognized email (WF 2.2) or incorrect password (WF 2.3). Link to "Forgot Password?" flow (WF 2.4-2.6).
      * Upon successful login:
         * If user has an active plan, they land on the Training Plan Home screen, "This Week" tab, focused on "Today's Workout" (WF 2.7 / WF 5.1).
         * If user has no active plan, they land on the Training Plan Home screen with the prompt to create one (WF 2.8 / WF 3.1).
   * 2.2 Creating a New Training Plan:
      * User taps "Create Training Plan" (triggered from WF 2.8/3.1).
      * Strava Check: If Strava is not connected, prompt user to connect (WF 3.2 -> WF 1.4 -> WF 3.3). Connection is mandatory here.
      * User reviews/confirms profile data retrieved from Strava (WF 3.4).
      * User defines goal type (Race/Non-Race) (WF 3.5).
      * If Race: User inputs race details (Name, Distance, Date, PB, Goal Time) (WF 3.6). Vici provides goal time recommendations.
      * If Non-Race: User defines objective (WF 3.7).
      * User sets Training Preferences (Mileage, Days/Week, Quality Workouts, Long Run Day, Coaching Style) (WF 3.8). Vici provides recommendations.
      * User taps "Generate Training Plan".
      * Vici displays the Generating Plan Screen (WF 3.9).
   * 2.3 Reviewing & Approving a New Plan:
      * Vici presents the generated plan on the Training Plan Preview Screen (Overview) (WF 4.1).
      * User reviews the Overview Summary and Weekly Breakdown tiles.
      * User can tap a week tile to expand to the Weekly Workout Details view (WF 4.2).
      * User can tap a day within the week view to see Detailed Daily Workout information (WF 4.3).
      * At any point during preview, user can interact with "Ask Vici" (WF 4.4) to ask questions or request adjustments. Vici responds, potentially proposing changes that the user can approve/reject within the chat interface, updating the preview.
      * User taps "Approve Training Plan" on the main preview screen (WF 4.1).
      * The plan becomes active, and the user is directed to the Training Plan Home screen, "This Week" tab (WF 4.5 / WF 5.1).
   * 2.4 Daily/Weekly Plan Interaction (Active Plan):
      * User navigates to the "Training Plan" tab (bottom nav).
      * Default view is "This Week" (WF 5.1), showing progress, today's workout tile, and the weekly workout list.
      * User taps "Today's Workout" tile (WF 6.1) to view the Detailed Daily Workout View (WF 6.2).
      * User taps the "Overview" tab (WF 5.2) to see overall plan progress and the list of all week tiles with status indicators.
      * User taps a past week tile (WF 5.3) to review recommended vs. completed workouts/activities.
      * User taps a current/upcoming week tile (WF 5.4) to see completed activities and future recommended workouts.
   * 2.5 Workout Completion & Reconciliation:
      * User performs their run (external activity).
      * User syncs their activity via their device/Strava (external).
      * Vici automatically syncs the completed activity from Strava (background process).
      * The synced activity appears in the Training Log screen (WF 7.1).
      * Automatic Reconciliation: Vici attempts to match the synced activity to the day's recommended workout based on time, duration, distance, etc. If successful, the activity is marked as reconciled (checkmark on WF 7.1 tile).
      * Manual Reconciliation Prompt: If auto-reconciliation fails or is uncertain, Vici prompts the user (via Push Notification 5.1.2 or an in-app prompt/overlay like WF 7.4 when viewing the log/activity) asking "Did you complete today's recommended workout?" with options "Yes," "No," "With Modifications". User selection updates the reconciliation status.
      * Training Plan progress (% completion on WF 5.1, 5.2) is updated based on reconciled workouts.
   * 2.6 Dynamic Plan Adjustments ("Ask Vici"):
      * From the Training Plan Home ("This Week" or "Overview") or Daily Workout View (WF 5.1, 5.2, 6.2), user taps the "Ask Vici" input.
      * User types a request for adjustment (e.g., "Feeling tired, need an easier week," "Need to shift long run due to travel").
      * Vici processes the request, potentially asks clarifying questions, and proposes changes via the conversational interface (WF 5.5).
      * User is prompted to "Preview Changes".
      * User is shown the Plan Adjustment Preview Screen (WF 5.6), highlighting the proposed modifications.
      * User taps "Approve Changes" or "Reject Changes".
      * If approved, the active training plan is updated immediately.
3. Activity & Performance Review
* Goal: Describe how users review their completed activities and analyze performance trends.
* Flow:
   * 3.1 Reviewing Past Activities:
      * User navigates to the "Training Log" tab (bottom nav).
      * User views the list of completed activities (WF 7.1 or 7.2).
      * User taps on a specific activity tile.
      * User views the Detailed Activity View (WF 7.3) including map, stats, photos, laps, and charts. If reconciled, a link to the original recommended workout is available.
   * 3.2 Analyzing Performance Trends:
      * User navigates to the "Analytics" tab (bottom nav).
      * User views the Analytics Dashboard (WF 9.1) with overview summaries and the global time period selector.
      * User taps on a specific chart type (Volume, Load, Recovery, Fitness, Health).
      * User views the Detailed Chart View (WF 9.2) for that metric, interacting with selectors (time period, volume type) and the chart itself (zoom, scroll, tap data points).
4. Profile & Settings Management
* Goal: Detail how users view and manage their personal information, app settings, and achievements.
* Flow:
   * 4.1 Viewing User Profile:
      * User navigates to the "Profile" tab (bottom nav).
      * User views the Profile Overview Screen (WF 10.1) with collapsible sections for User Profile, Runner Profile, Active Plan, Past Plans, and Gamification Badges.
   * 4.2 Editing User/Runner Profile:
      * From the Profile Overview (WF 10.1), user taps to expand/edit the "User Profile" section.
      * User accesses the Edit User Profile Screen (WF 10.2) to modify Name, Picture, DOB, Gender, and taps "Save".
      * From the Profile Overview (WF 10.1), user taps to expand/edit the "Runner Profile" section.
      * User accesses the Edit Runner Profile Screen (WF 10.3) to modify Running Shoe Preferences (PBs, Experience, Fitness are informational) and taps "Save".
   * 4.3 Reviewing Past Plans:
      * From the Profile Overview (WF 10.1), user taps to expand the "Past/Completed Training Plans" section.
      * User taps "View Details" for a specific past plan.
      * User views the Past Training Plan Screen (WF 10.4) with summary stats.
   * 4.4 Managing Settings:
      * From the Profile Overview (WF 10.1), user taps the "Settings" link/icon or navigates via a dedicated Settings entry point.
      * User views the Settings Overview Screen (WF 11.1).
      * User taps a category (e.g., "Distance Metrics", "Push Notifications", "Account Management").
      * User views the specific settings screen (WF 11.2 - 11.6) and makes changes (e.g., selects miles/km, toggles notifications, changes password, logs out, deletes account). Changes are saved automatically or upon confirmation for destructive actions.
   * 4.5 Viewing Gamification Badges:
      * From the Profile Overview (WF 10.1), user taps to expand the "Training Gamification Badges / Trophy Room" section.
      * User views the grid/list of earned badges. Tapping a badge shows its name, description, and date earned.
5. System-Triggered Events & Notifications
* Goal: Describe events initiated by the system (AI, time-based triggers) rather than direct user action.
* Structure: List of triggers and outcomes:
   * 5.1 Push Notifications:
      * Trigger: Scheduled workout time for the day. -> Outcome: Daily Workout Reminder notification sent. (Tapping opens WF 6.2).
      * Trigger: Activity synced from Strava, not auto-reconciled. -> Outcome: Workout Reconciliation Nudge notification sent after a delay. (Tapping opens WF 7.1 with prompt or WF 7.4).
      * Trigger: Scheduled workout completion time passed, no reconciled activity found. -> Outcome: Missed Workout Check-in notification sent. (Tapping opens relevant Training Plan view, e.g., WF 5.1 with missed workout highlighted).
      * Trigger: Vici AI analysis identifies need for plan adjustment. -> Outcome: Recommended Plan Change notification sent. (Tapping opens WF 5.6).
      * Trigger: Training plan ends; or period of inactivity/low volume detected. -> Outcome: Start New Plan Nudge notification sent. (Tapping opens WF 3.1).
      * Trigger: Vici AI detects significant performance change, potential overtraining, or scheduled check-in point. -> Outcome: Vici "Check-in" notification sent. (Tapping opens Ask Vici interface or an insight summary screen).
      * Trigger: Gamification streak milestone reached or badge awarded (see 5.2). -> Outcome: Gamification Alert notification sent (WF 8.1, 8.2). (Tapping opens Profile/Trophy Room - WF 10.1).
   * 5.2 Gamification Awards:
      * Trigger: User completes recommended workouts on consecutive days. -> Outcome: Streak counter (visible on WF 5.1 / WF 7.1) increments. Milestone reached triggers notification (5.1.7).
      * Trigger: Vici AI detects significant improvement in fitness metrics (pace, HR, VO2 Max est.). -> Outcome: Fitness Improvement Badge awarded (visible on WF 10.1). Notification sent (5.1.7).
      * Trigger: User completes a training plan with >= 90% / >= 75% follow-through. -> Outcome: "90% Club" / Tiered Completion Badge awarded (visible on WF 10.1). Notification sent (5.1.7).
      * Trigger: User completes a race (linked to plan goal) achieving a PB or goal time. -> Outcome: PB/Goal Achievement Badge awarded (visible on WF 10.1). Notification sent (5.1.7).
      * Trigger: User completes a race (linked to plan goal) of a distance for the first time. -> Outcome: New Race Distance Badge awarded (visible on WF 10.1). Notification sent (5.1.7).
3. Functional Requirements
3.1 MVP Functional Requirements
(Content from fetched document)
1. User Account Management
* User Registration:
   * Allow users to register using an email address and password.
   * Implement password confirmation and strength indicators.
   * Include links to Terms of Service and Privacy Policy.
   * Verify user email address via a verification code sent to their email.
   * Display appropriate error messages for invalid input or registration issues.
* User Login:
   * Allow registered users to log in using their email and password.
   * Provide a "Forgot Password?" flow, including email validation and password reset email dispatch.
   * Display appropriate error messages for unrecognized emails or incorrect passwords.
   * Maintain user login session unless manually logged out.
* Account Management (within Settings):
   * Allow users to change their password.
   * Allow users to log out of their account.
   * Provide an option for users to delete their account (with confirmation).
2. Profile & Settings
* Initial Profile Setup:
   * Prompt users to provide basic profile information: Name, Date of Birth, Gender.
   * Allow users to optionally upload a profile picture.
* Strava Integration:
   * Prompt users to connect their Strava account during onboarding and plan creation.
   * Explain the benefits and necessity of Strava connection for personalization.
   * Provide an option to skip connection initially, but emphasize its importance for core features.
   * Clearly display the data Vici will access upon connection and require user confirmation.
   * Process Strava data upon connection (profile info, activity history) and display progress.
   * Provide links/instructions for creating a Strava account if the user doesn't have one.
* Runner Profile Analysis (AI-driven from Strava):
   * Analyze connected Strava data to determine:
      * Experience Level (Beginner, Intermediate, Advanced).
      * Current Fitness Level.
      * Personal Bests (PBs) for various distances.
   * Use analyzed data to provide initial recommendations (goal ranges, paces, mileage, frequency).
   * Present safety/optimization insights based on analysis (e.g., recommended goal time, max mileage).
   * Synchronize calculated profile data (experience, fitness, PBs) to the User Profile screen.
   * Continuously update fitness and experience levels based on ongoing activity data.
* User Profile Screen:
   * Display user-provided information (Name, Picture, DOB, Gender).
   * Display AI-calculated runner profile data (PBs, Experience Level, Fitness Level) derived from Strava.
   * Allow editing of user-provided information and running shoe preferences.
   * Display an overview of the Active Training Plan (if applicable) with a link to details.
   * Display a list of Past/Completed Training Plans with links to details.
   * Display earned Gamification Badges ("Trophy Room").
   * Provide access to Settings.
* Settings Configuration:
   * Allow users to set preferred distance metric (miles/kilometers).
   * Allow users to set preferred language.
   * Allow users to select their preferred coaching style (with descriptions).
   * Allow users to manage Push Notification preferences with granular toggles.
   * Allow users to manage Privacy Settings (data sharing, location services link).
   * Provide access to Account Management (Password change, Logout, Delete Account).
   * Provide links to Help/Support, Terms of Service, and Privacy Policy.
3. AI Training Plan Management
* Training Plan Creation:
   * Require Strava connection for personalized plan generation.
   * Guide users through goal setting:
      * Race Goal: Name (optional), Distance, Date, Previous PB (optional), Goal Time (with AI recommendations).
      * Non-Race Goal: Define objective (e.g., general fitness).
   * Guide users through setting training preferences: Target weekly mileage, running days/week, quality workouts/week, preferred long run day, coaching style (with AI recommendations).
   * Generate a personalized training plan using AI based on profile data, goals, and preferences.
   * Display plan generation progress.
* Training Plan Preview & Approval:
   * Present the generated plan for review before activation.
   * Display an overview summary (goal, dates, duration, total/average mileage).
   * Provide a week-by-week breakdown (week #, date, phase, mileage), allowing expansion to daily details.
   * Show detailed daily workout information upon expansion (type, distance, pace, structured workout details, purpose, alternatives).
   * Allow users to interact with "Ask Vici" (AI Assistant) to ask questions or request adjustments to the previewed plan. Vici should confirm changes before applying them to the preview.
   * Require user to explicitly "Approve Training Plan" to activate it.
* Training Plan Home Screen:
   * Default screen upon login if a plan is active.
   * If no plan is active, display a prompt to create one.
   * Display active plan details via two main tabs: "This Week" and "Overview".
   * "This Week" Tab: Show weekly progress summary (% mileage completion, % workout completion). Display an overview tile for "Today's Workout" (tappable for details). List all workouts for the current week, highlighting today and indicating completed ones. Provide access to "Ask Vici" for questions/adjustments related to the current week.
   * "Overview" Tab: Show overall plan progress summary (% plan completion, % workout completion). Display a scrollable list of all weeks in the plan (tiles showing week #, date, phase, mileage). Visually indicate the status of each week (Past, Current, Upcoming). Allow tapping week tiles to view daily workout details for that week (showing recommended vs. completed for past/current). Provide access to "Ask Vici" for questions/adjustments related to the overall plan.
* Daily Workout Review:
   * Allow users to easily view details for "Today's Workout" from the "This Week" tab.
   * Display full workout details: type, distance, pace, structured components (warm-up, intervals, cool-down), purpose, execution recommendations, alternative workout options.
   * Allow interaction with "Ask Vici" related to the specific workout.
   * (Potential Feature): Allow syncing the workout to a connected watch.
* Dynamic Plan Adjustments (via "Ask Vici"):
   * Allow users to request adjustments to their active plan (weekly or overall) based on factors like travel, illness, injury, fatigue, or feeling the plan isn't right.
   * Vici (AI Assistant) processes requests, potentially asking clarifying questions, and proposes specific changes.
   * Present proposed changes in a preview format similar to initial plan review.
   * Require user approval ("Approve Changes") to implement adjustments into the active plan.
* Training Plan Completion Tile:
   * Generate a summary "completion tile" when a training plan finishes.
   * Display key stats: Plan Goal, duration, total mileage, % completion, fitness improvement, goal accomplishment.
   * Store completed plan tiles in the User Profile ("Past Training Plans").
   * Prompt user to set their next goal/create a new plan upon completion.
4. Training Log & Activity Tracking
* Automatic Activity Syncing:
   * Automatically sync completed running activities from the user's connected Strava account into the Vici Training Log.
* Training Log Screen:
   * Accessed via main navigation.
   * If an active plan exists, display "This Week's Progress" summary (mileage %, workout %, daily mileage chart).
   * If no active plan exists, display total weekly miles and optionally compare against a user-set weekly goal.
   * Display a chronological, scrollable list of completed activities (synced from Strava).
   * Each activity tile should show key info: Date, Description, Distance, Pace, Avg HR, Elevation, Map thumbnail, Photo indicator.
   * Indicate which activities have been reconciled with a recommended workout.
* Detailed Activity View:
   * Allow users to tap an activity tile to view full details.
   * Display expanded stats, full-screen map, photos, lap data (auto and custom), and charts (HR, elevation, pace optional).
   * If reconciled, provide a link back to the originally recommended workout details.
* Workout Reconciliation:
   * Prompt users (manually or via push notification) to confirm if a completed activity corresponds to the day's recommended workout ("Yes," "No," "With Modifications").
   * Allow AI to auto-reconcile activities with recommended workouts where possible based on data matching.
   * (Potential Feature): Allow users to add perceived effort and journal entries to completed activities.
5. Training Gamification
* Workout Completion Streaks: Track and display consecutive days of completing recommended workouts. Provide notifications for achieving streak milestones. Display current/best streaks.
* Simple Badges: Award badges for basic achievements like completing first plan, achieving first distance PB detected via Strava, potentially high plan follow-through (e.g., "90% Club"). Display in profile. Notify user.
6. Training Analytics
* Basic display of dashboard elements (WF 9.1) with summary values. Detailed interactive charts (WF 9.2) might be post-MVP or part of a paid tier.
7. Push Notifications 
* Daily Workout Reminder.
* Workout Reconciliation Nudge.
* Missed Workout Check-in.
* Recommended Plan Changes (from "Ask Vici" or proactive AI).
* Start New Plan Nudge.
* Vici "Check-ins" (basic insights/prompts).
* Gamification Alerts (streaks, badges).
8. AI Assistant ("Ask Vici") 
* Provide conversational interface accessible from Training Plan screens.
* Allow natural language questions about the plan/workouts.
* Enable requests for dynamic adjustments (e.g., move workout, change intensity slightly).
* Provide informative answers, clarify requests, propose changes, require confirmation.
3.2 Future Functional Requirements (Post-MVP)
(Content from ai_coach_functional_requirements and other non-MVP items)
1. AI Coach Features [Advanced/Paid [Not MVP]
* Proactive Performance Monitoring & Analysis: Continuous data ingestion (activities, user input, wearables), advanced AI analysis (trends, fatigue, injury risk, deviations).
* Proactive Training Guidance & Adjustment: Proactive suggestions for workout/plan changes based on analysis, contextual workout guidance (pre/during run).
* Holistic Runner Support: Proactive check-ins, personalized motivation/accountability, nutrition recommendations, strength/pliability recommendations, race strategy assistance.
* Enhanced Interaction Model: More continuous conversational coaching, personalized AI persona.
2. Training Analytics (Advanced / Paid)
* Analytics Dashboard: Provide a dedicated "Analytics" section accessible via main navigation. Offer a dashboard overview with summaries/thumbnails for key analytic charts. Include a global time period selector applicable to all charts (e.g., Week, Month, Year, Custom).
* Detailed Analytic Charts: Provide detailed, interactive charts (line or bar graphs) for: Training Volume, Training Load, Recovery Trend, Fitness Trend, Training Health Trend. Charts should support zooming, scrolling, and display specific data point values on interaction. Include info icons/links explaining the metrics.
3. Other Potential Features
* Garmin Connect / Other Wearable Integrations: Sync activities and potentially richer data (HRV, sleep) from other platforms.
* Manual Activity Entry: Allow users to log activities not captured by connected devices.
* Cross-Training Support: Incorporate non-running activities (cycling, swimming, strength) into planning and analysis.
* Advanced Gamification: Leaderboards, challenges, more diverse badges (Fitness Improvement, Goal Achievement, New Distance).
* Social/Community Features: Activity sharing, groups, following other users (with privacy controls).
* Web Platform: Access to Vici features via a web browser.
* Enhanced User Input: More structured ways to log perceived effort, journal entries, fatigue, mood, injury status.
* Predicting Race Performance: Features based on user stories.
* Nutrition/Fueling Tracking: Features based on user stories.
4. Non-Functional Requirements (NFRs)
(Content from vici_nfrs_v2 updated with platform spec)
1. Performance
* Responsiveness:
   * UI Interaction: <= 100ms response; <= 300ms transitions.
   * AI Plan Generation: ~15-30 seconds target, with progress indicators.
   * "Ask Vici" Interaction: ~2-5 seconds (simple), ~10-15 seconds (complex adjustment), with feedback.
   * Data Loading: ~2-3 seconds (Log, Analytics, Profile) on standard connection.
* Data Synchronization:
   * Strava Sync: Automatic within ~5 mins of availability; Manual starts immediately, completes < 30s (typical).
   * Background Sync: Minimize impact on foreground performance and battery.
* Efficiency:
   * Battery Consumption: Minimize drain during active use and background sync.
   * Network Usage: Optimize data transfer.
2. Usability & User Experience (UX)
* Intuitive Navigation: Follow platform conventions (iOS/Android); easy access to core features (Bottom Tab Bar).
* Clarity & Simplicity: Clean, uncluttered UI; Clear AI explanations (understand why); Easy-to-read data visualizations.
* Onboarding: Seamless, guided setup; clear value proposition.
* Feedback: Immediate visual feedback for actions; progress indicators for long operations.
* Error Handling: User-friendly messages explaining problem and solution (see Error Catalogue).
* Accessibility: Adhere to WCAG 2.1 Level AA (see Accessibility Notes).
* Unit Display Consistency: Client application must convert base units (meters, seconds/km) from API to user's preferred display unit (distanceUnit setting) accurately.
* Consistency: Consistent design language, terminology, interaction patterns.
3. Reliability & Stability
* Accuracy: Accurate display of synced data; Consistent, plausible, defensible AI calculations.
* Data Integrity: No loss or corruption of user data; robust validation and backups.
* Integration Robustness: Graceful handling of Strava API changes, rate limits, errors.
* Application Stability: Target crash-free session rate >= 99.5%.
* Offline Functionality: View active plan/today's workout offline; queue completed activities for sync.
4. AI-Specific Requirements
* Adaptability: AI models adapt based on ongoing data, feedback, preferences.
* Explainability (XAI): Clear rationale for AI outputs.
* Personalization: Outputs feel genuinely tailored to the user.
* Safety: Prioritize user safety; avoid unsafe recommendations (e.g., excessive load jumps); safety insights prominent.
5. Security & Privacy
* Data Security: Encrypt sensitive data at rest and in transit (HTTPS).
* Authentication: Secure login/password reset mechanisms (JWT).
* Privacy Compliance: Adhere to GDPR, CCPA, etc.; clear Privacy Policy.
* Permissions: Request only necessary permissions with clear explanations.
6. Maintainability
* Code Quality: Well-documented, modular code adhering to standards.
* Testability: Design for testability (see Testing Strategy).
* AI Model Management: Processes for updating, testing, deploying AI models.
* Configuration Management: Easy configuration (env vars, config services).
7. Scalability
* User Growth: Backend handles increasing users/data without performance degradation.
* Data Volume: Efficient storage/processing of time-series activity data.
* Feature Expansion: Architecture supports adding new features.
8. Interoperability
* Platform Compatibility: Consistent functionality/UI across iOS & Android.
* Device Compatibility: Support reasonable range of devices/OS versions.
* Integration Standards: Use standard APIs/protocols for integrations.
9. Target Platform (Content from vici_platform_specs)
* Recommendation: Cross-Platform Mobile Application (using React Native or Flutter).
* Rationale: Balances development efficiency, user reach (iOS & Android), performance, and access to necessary native device features (push notifications, integrations, background tasks). Faster time-to-market than separate native builds.
* Why Not Others (for MVP): Native (higher cost/time); PWA (limitations in native feature access, offline complexity, integration smoothness).
* Key Platform-Specific Considerations: Push Notification setup (APNS/FCM), Permissions handling, Background Execution rules, UI Convention adaptations, Store Deployment processes.
5. Design Specifications
5.1 Information Architecture
(Content from vici_information_architecture)
1. Overview: Task-oriented, user-centric IA prioritizing core features. Uses familiar mobile patterns.
2. Primary Navigation: Persistent Bottom Tab Bar (Training Plan, Training Log, Analytics, Profile).
3. Site Map / Screen Hierarchy:
* Onboarding Flow (Sequential)
* Main App Structure (via Bottom Tab Bar)
   * Training Plan (Home) -> This Week / Overview Tabs -> Workout Details / Expanded Week Views / Create Plan Flow / Plan Preview / Ask Vici
   * Training Log -> Activity List -> Detailed Activity View / Reconciliation Prompt
   * Analytics -> Dashboard -> Detailed Chart View
   * Profile -> Overview -> Edit Screens / Past Plans / Badges / Settings -> Specific Settings Screens
* System Events Layer (Notifications, Gamification Awards)
4. Key Principles: Hierarchy (Overview->Detail), Consistency, Task Focus, Discoverability, Contextual AI Integration.
5.2 Wireframes
(Detailed descriptions extracted from original document)
1. Registration/Profile Setup Flow
   * Wireframe 1.1: User Registration Screen
   * Layout: A single screen or a tab within a “Login/Register” screen.
   * Elements:
   * Header: App Logo and Title.
   * Input field for Email Address.
   * Input field for Password.
   * Input field to Confirm Password.
   * “Register” Button.
   * Links to “Terms of Service” and “Privacy Policy”.
   * Error message area (below input fields).
   * Annotations:
   * Clear labels for each input field.
   * Placeholder text in input fields (e.g., “Enter your email”, "Create password").
   * Password strength indicator.
   * Validation messages for password requirements (e.g., “Password must be at least 8 characters”).
   * Wireframe 1.2: Email Verification Screen
   * Layout: A single screen displayed after tapping "Register".
   * Elements:
   * Header: App Logo and Title.
   * Instruction text: "We've sent a verification code to [User's Email]. Please enter it below.".
   * Input field for Verification Code.
   * "Verify" or "Submit" Button.
   * Link/Button to "Resend Code".
   * Error message area (e.g., "Invalid code").
   * Annotations:
   * Clear label for the input field.
   * Placeholder text (e.g., "Enter code").
   * Focus automatically set to the input field.
   * Wireframe 1.3: Strava Connection Prompt Screen
   * Layout: A screen displayed after successful email verification/first login.
   * Elements:
   * Header: App Logo and Title.
   * Headline: "Connect Your Strava Account".
   * Rationale Text: Explaining the benefits of connecting Strava (personalized plans, data analysis).
   * "Connect Strava" Button.
   * "Skip for Now" Link/Button.
   * Annotations:
   * Clear explanation of why Strava connection is recommended.
   * Visually distinct primary action ("Connect Strava") and secondary action ("Skip").
   * Wireframe 1.4: Strava Data Confirmation Screen (If Connecting)
   * Layout: A screen displayed after the user agrees to connect Strava.
   * Elements:
   * Header: App Logo and Title.
   * Headline: "Confirm Strava Data Usage".
   * List of data types Vici will access from Strava (e.g., Profile Info, Activity History, PBs).
   * "Confirm" or "Allow" Button.
   * "Cancel" or "Back" Button/Link.
   * Annotations:
   * Clearly lists the specific data being requested.
   * Link to Strava's permissions page (optional).
   * Wireframe 1.5: Initial Profile Setup Screen
   * Layout: A screen displayed after Strava connection/skip.
   * Elements:
   * Header: App Logo and Title.
   * Headline: "Set Up Your Profile".
   * Input field for Name.
   * Option to add/upload a Profile Picture (optional).
   * Input field for Date of Birth.
   * Selection for Gender.
   * "Next" or "Continue" Button.
   * Annotations:
   * Clear labels for all fields.
   * Indicate optional fields (Profile Picture).
   * Use appropriate input types (e.g., date picker for DOB).
   * Wireframe 1.6: Settings Configuration Screen
   * Layout: A screen displayed after initial profile setup.
   * Elements:
   * Header: App Logo and Title.
   * Headline: "Configure Your Settings".
   * Selection for Preferred Distance Metric (Miles/Kilometers).
   * Selection for Preferred Language.
   * "Save" or "Finish" Button.
   * Annotations:
   * Clearly labeled options.
   * Defaults pre-selected based on location/device settings if possible.
   * Wireframe 1.7: Runner Profile Analysis/Sync Screen (If Strava Connected)
   * Layout: An intermediary screen shown while data is processed.
   * Elements:
   * Header: App Logo and Title.
   * Progress Indicator (e.g., spinner, progress bar).
   * Text indicating analysis is in progress (e.g., "Analyzing your Strava data...", "Calculating fitness level...").
   * Annotations:
   * Provides feedback that the app is working.
   * Wireframe 1.8: Initial Recommendations & Insights Screen
   * Layout: A screen displaying AI-derived insights after Strava analysis.
   * Elements:
   * Header: App Logo and Title.
   * Headline: "Your Initial Running Profile".
   * Display of calculated Experience Level.
   * Display of calculated Current Fitness Level.
   * Display of detected Personal Bests.
   * Section for Initial Recommendations: Recommended Goal Ranges, Paces, Max Weekly Mileage, Running Days/Week, Long Run Day, Workouts/Week.
   * Section for Insights: Goal Insight Text, Training Plan Insight Text.
   * "Continue" or "Got it" Button.
   * Annotations:
   * Clearly labels all calculated and recommended data.
   * Explanations for how insights were derived (optional info icon).
   * Emphasizes that profile data is editable later.
   * Wireframe 1.9: Post-Registration Home Screen (No Active Plan)
   * Layout: The main "Training Plan Home" screen displayed after setup is complete.
   * Elements:
   * Header: App Logo and Title.
   * Main Content Area: Prompt message "You don't have any active training plans yet. Create one to get started.".
   * "Create Training Plan" Button.
   * Bottom Navigation Bar (with icons for Home/Training Plan, Training Log, Analytics, Profile, Settings).
   * Annotations:
   * Clear call to action to create a plan.
   * Standard app navigation is visible.
2. User Login Flow
   * Wireframe 2.1: Login Screen
   * Layout: A single screen or a tab within a “Login/Register” screen.
   * Elements: Header: App Logo and Title, Input field for Email Address, Input field for Password, "Login" Button, "Forgot Password?" Link, Link/Button to switch to "Register" screen, Error message area.
   * Annotations: Clear labels and placeholder text. Distinguish between login and registration actions.
   * Wireframe 2.2: Login Error Message (Email Not Registered)
   * Layout: Login screen with an error message displayed.
   * Elements: All from WF 2.1 + Error Message: "Email address not recognized. Would you like to create an account? [Register]".
   * Annotations: Error message clear, provides link to registration.
   * Wireframe 2.3: Login Error Message (Incorrect Password)
   * Layout: Login screen with an error message displayed.
   * Elements: All from WF 2.1 + Error Message: "Incorrect password. [Forgot Password?]".
   * Annotations: Error message clear, provides link to password reset.
   * Wireframe 2.4: Forgot Password Screen 1 (Enter Email)
   * Layout: Single screen after tapping "Forgot Password?".
   * Elements: Header, Instruction Text, Input field for Email Address, "Send Reset Link" Button, "Back to Login" Link/Button, Error message area.
   * Annotations: Clear instructions and label.
   * Wireframe 2.5: Forgot Password Screen 2 (Confirmation)
   * Layout: Screen after submitting valid email for password reset.
   * Elements: Header, Confirmation Message ("If an account exists..."), "Back to Login" Button.
   * Annotations: Confirms action without revealing email registration status.
   * Wireframe 2.6: Forgot Password Error Message (Email Not Registered)
   * Layout: Forgot Password screen with error message.
   * Elements: All from WF 2.4 + Error Message: "Email address not recognized. Would you like to create an account? [Register]".
   * Annotations: Error message clear, provides link to registration.
   * Wireframe 2.7: Post-Login Home Screen (Active Plan)
   * Layout: Main "Training Plan Home" screen, defaulting to "Today's Workout" view.
   * Elements: Header, Tabs ("This Week" selected, "Overview"), Content Area (Today's Workout details), Bottom Navigation Bar.
   * Annotations: Defaults to relevant view for active plan user.
   * Wireframe 2.8: Post-Login Home Screen (No Active Plan)
   * Layout: Main "Training Plan Home" screen.
   * Elements: Header, Prompt message ("...Create one to get started. [Create Training Plan]"), "Create Training Plan" Button, Bottom Navigation Bar.
   * Annotations: Same as WF 1.9.
3. Training Plan Creation Flow
   * Wireframe 3.1: Training Plan Home (Initiate Creation)
   * Layout: Main "Training Plan Home" screen (no active plan).
   * Elements: Header, Prompt ("Ready to start training?..."), "Create Training Plan" Button, Bottom Navigation Bar.
   * Annotations: Clear call to action.
   * Wireframe 3.2: Strava Connection Prompt (If Not Connected)
   * Layout: Screen prompting Strava connection if skipped earlier.
   * Elements: Header, Headline ("Connect Strava for Personalized Plans"), Rationale Text, "Connect Strava" Button, Link/Instructions for Strava account creation.
   * Annotations: Emphasizes necessity of Strava for this feature.
   * Wireframe 3.3: Strava Data Processing Screen
   * Layout: Intermediary screen during Strava data fetch/process.
   * Elements: Header, Progress Indicator, Status Messages ("Retrieving profile...", etc.).
   * Annotations: Provides feedback.
   * Wireframe 3.4: Strava Data Review & Confirmation Screen
   * Layout: Screen displaying retrieved Strava data for review.
   * Elements: Header, Headline ("Review Your Profile Data"), Display of Strava Data (Name, Pic, DOB, Gender, PBs, Levels), Display of Vici Recommendations (Goals, Pace, Mileage), "Confirm Profile" Button.
   * Annotations: Labels data source, allows verification.
   * Wireframe 3.5: Goal Setting Screen (Step 1: Type)
   * Layout: Screen to define primary goal.
   * Elements: Header, Question ("What are you training for?"), Options ("A Race", "General Fitness / Other Goal"), "Next" Button, "Back" Button/Link.
   * Annotations: Clear choices.
   * Wireframe 3.6: Goal Setting Screen (Step 2a: Race Details)
   * Layout: Screen for race specifics.
   * Elements: Header, Input: Race Name (Optional, auto-fill?), Input/Select: Race Distance, Input/Select: Race Date, Input: Previous PB?, Input: Goal Time (with Vici recommendations nearby), "Next" Button, "Back" Button/Link.
   * Annotations: Indicate auto-fill, provide goal recommendations, use appropriate input types.
   * Wireframe 3.7: Goal Setting Screen (Step 2b: Non-Race Goal)
   * Layout: Screen for non-race goal.
   * Elements: Header, Question ("What is your training goal?"), Input (text) or Selection list, "Next" Button, "Back" Button/Link.
   * Annotations: Provide examples or predefined options.
   * Wireframe 3.8: Training Preferences Screen
   * Layout: Screen for plan preferences.
   * Elements: Header, Input/Slider: Target weekly mileage? (with Vici rec.), Input/Select: Days/week? (with Vici rec.), Input/Select: Quality workouts/week? (with Vici rec.), Select: Long run day?, Select: Coaching style? (with descriptions), "Generate Training Plan" Button, "Back" Button/Link.
   * Annotations: Display recommendations alongside inputs, clear descriptions for styles, use appropriate controls.
   * Wireframe 3.9: Generating Plan Screen
   * Layout: Intermediary screen during plan generation.
   * Elements: Header, Progress Indicator, Status Message ("Generating...").
   * Annotations: Provides feedback.
4. Training Plan Review and Approval Flow
   * Wireframe 4.1: Training Plan Preview Screen (Overview)
   * Layout: Screen displaying generated plan for review.
   * Elements: Header ("Training Plan Preview"), Overview Summary Section (Goal, Dates, Weeks, Mileage), Weekly Breakdown Section (Scrollable Week Tiles: Number, Date, Phase, Mileage), "Ask Vici" Input Area, "Approve Training Plan" Button.
   * Annotations: High-level summary, tappable week tiles, clear CTAs.
   * Wireframe 4.2: Training Plan Preview Screen (Expanded Week View)
   * Layout: Full-screen view when week tile tapped.
   * Elements: Header ("Week [N]: [Phase] - [Date]"), List of Daily Workout Summaries (Date, Day, Type, Mileage), "Back"/"Close" Button.
   * Annotations: Tappable daily summaries.
   * Wireframe 4.3: Training Plan Preview Screen (Expanded Day/Workout View)
   * Layout: Full-screen view when daily summary tapped.
   * Elements: Header ("[Day], [Date] - [Type]"), Total Mileage, Detailed Description (Simple runs: dist/pace; Structured: warm-up, sets/reps/rec, cool-down), "Alternative Workout" Option, "Execution Recommendations" Link, "Purpose/Goal Overview" Link, "Learn more" Link, "Back"/"Close" Button.
   * Annotations: Clear breakdown, unit toggles, context provided.
   * Wireframe 4.4: "Ask Vici" Interaction (Within Preview)
   * Layout: Chat-like interface (modal or integrated).
   * Elements: Vici Prompt ("Ask questions..."), User Input Text Box, "Send" Button, Conversation History Area, Adjustment response with "Approve Changes"/"Reject Changes" buttons.
   * Annotations: Handles Q&A and modification requests before approval.
   * Wireframe 4.5: Post-Approval Training Plan Home
   * Layout: Main "Training Plan Home" screen after approval.
   * Elements: Header, Tabs ("This Week" selected, "Overview"), Content Area ("This Week's Progress", "Today's Workout" tile, "This Week" list, "Ask Vici" section), Bottom Navigation Bar.
   * Annotations: Reflects active plan, defaults to current week.
5. Ongoing Training Plan Review Flow
   * Wireframe 5.1: Training Plan Home ("This Week" View - Default)
   * Layout: Accessed via "Training Plan" tab.
   * Elements: Header, Tabs ("This Week" selected, "Overview"), Weekly Progress Summary (Mileage %, Workout %), "Today's Workout" Tile (tappable), "This Week" Detailed Workout List (scrollable, tappable days, highlights Today, indicates completed), "Ask Vici" Prompt/Input, Bottom Navigation Bar.
   * Annotations: Immediate snapshot of week/today.
   * Wireframe 5.2: Training Plan Home ("Overview" View)
   * Layout: Accessed via "Overview" tab.
   * Elements: Header, Tabs ("This Week", "Overview" selected), Overall Plan Progress Summary (Plan %, Workout %), Weekly Breakdown Tiles (scrollable: Week #, Date, Phase, Mileage; Status indicators: Past/Current/Upcoming), "Ask Vici" Prompt/Input, Bottom Navigation Bar.
   * Annotations: High-level view, tappable week tiles.
   * Wireframe 5.3: Expanded Past Week View (From Overview)
   * Layout: Full-screen view when past week tapped.
   * Elements: Header ("Week [N]: [Phase] - [Date]"), List of days showing: Recommended Workout, Completed Activity (linked?), Missed indicator, Alternative indicator, "Back"/"Close" Button.
   * Annotations: Review past performance, tappable completed activities.
   * Wireframe 5.4: Expanded Current/Upcoming Week View (From Overview)
   * Layout: Full-screen view when current/upcoming week tapped.
   * Elements: Header ("Week [N]: [Phase] - [Date]"), List of days showing: Completed activities (past days), Recommended workouts (remaining/upcoming days), "Back"/"Close" Button.
   * Annotations: Shows completed/upcoming for the week, tappable recommended workouts.
   * Wireframe 5.5: "Ask Vici" Interaction (Ongoing Plan Review)
   * Layout: Similar to WF 4.4, accessible from "This Week"/"Overview".
   * Elements: Vici Prompt (contextual), User Input, "Send", Conversation History, Adjustment response with "Preview Changes" button.
   * Annotations: Allows dynamic adjustments based on real-time factors.
   * Wireframe 5.6: Plan Adjustment Preview Screen
   * Layout: Similar to WF 4.1, displaying proposed changes.
   * Elements: Header ("Review Recommended Changes"), Highlights changes, Ability to view adjusted details, "Approve Changes" Button, "Reject Changes"/"Cancel" Button.
   * Annotations: Allows review before accepting adjustments.
6. Daily Workout Review Flow
   * Wireframe 6.1: Accessing Today's Workout (via "This Week" Tab)
   * Layout: Default view of "Training Plan" section.
   * Elements: Header, Tabs ("This Week" selected), Weekly Progress, "Today's Workout" Tile (Date, Day, Type, Dist, Desc), "This Week" List, "Ask Vici", Bottom Nav Bar.
   * Annotations: Today's tile is primary focus, tappable.
   * Wireframe 6.2: Detailed Daily Workout View (Full Screen)
   * Layout: Full-screen view from "Today's Workout" tile.
   * Elements: Header ("[Day], [Date] - [Type]"), Total Distance, Detailed Description (Run details or Structured components), "Alternative Workout" Toggle/Button, "Execution Recommendations", "Purpose/Goal Overview", "Learn more", "Ask Vici", Optional "Sync to Watch", "Back"/"Close".
   * Annotations: All info needed for workout, alternatives, context.
7. Training Log Flow
   * Wireframe 7.1: Training Log Screen (With Active Plan)
   * Layout: Accessed via "Training Log" tab.
   * Elements: Header, "This Week's Progress" Summary (Mileage %, Workout %, Daily Mileage Chart), Scrollable List of Completed Activity Tiles (Date, Desc, Dist, Pace, HR, Elev, Map thumb?, Photos?, Reconciliation Indicator ✓), Bottom Nav Bar.
   * Annotations: Focuses on completed activities vs plan, tappable tiles.
   * Wireframe 7.2: Training Log Screen (No Active Plan)
   * Layout: Accessed via "Training Log" tab.
   * Elements: Header, "This Week's Progress" Summary (Mileage Goal Display or Prompt, Daily Mileage Chart), Scrollable List of Completed Activity Tiles (Date, Desc, Dist, Pace, HR, Elev, Map thumb?, Photos?), Bottom Nav Bar.
   * Annotations: Focuses on total mileage/weekly goal.
   * Wireframe 7.3: Detailed Activity View (Full Screen)
   * Layout: Expanded view from activity tile tap.
   * Elements: Header (Date, Desc), Key Stats Summary, Full GPS Map View, Photos Section?, Lap Data Section (Mile/KM, Custom), Charts Section (HR, Elev, Pace?), Reconciled Workout Link?, Optional Perceived Effort/Journal Input, "Back"/"Close".
   * Annotations: Comprehensive review, comparison with plan if reconciled.
   * Wireframe 7.4: Workout Reconciliation Prompt (Modal/Overlay)
   * Layout: Appears after sync or when viewing unreconciled activity.
   * Elements: Question ("Did you complete...?"), Options ("Yes", "No", "With Modifications"), Optional link to recommended workout, "Save"/"Confirm".
   * Annotations: Simple prompt, AI might auto-reconcile.
8. Training Gamification (Notifications & Profile Display)
   * Wireframe 8.1: Streak Notification
   * Layout: Standard OS push notification.
   * Elements: App Icon/Name, Text ("Congratulations! ... [N]-day workout streak!").
   * Annotations: Appears on milestone, tap opens app (Log/Profile).
   * Wireframe 8.2: Badge Unlocked Notification
   * Layout: Standard OS push notification.
   * Elements: App Icon/Name, Text ("You've unlocked [Badge Name]..."). Examples for fitness improvement, 90% Club, plan completion, PB, first distance.
   * Annotations: Appears when criteria met, tap opens app (Profile/Trophy Room).
   * Wireframe 8.3: Profile Screen - Gamification Section (See WF 10.1)
   * Annotations: Badges displayed within User Profile screen.
9. Training Analytics Flow
   * Wireframe 9.1: Training Analytics Dashboard/Overview
   * Layout: Accessed via "Analytics" tab.
   * Elements: Header ("Training Analytics"), Global Time Period Selector, Vertically Stacked Summary Sections/Chart Thumbnails (Volume, Load, Recovery, Fitness, Health - showing key metric), Navigation Menu/Tabs?, Bottom Nav Bar.
   * Annotations: High-level snapshot, tappable summaries/thumbnails.
   * Wireframe 9.2: Detailed Chart View (Example: Training Volume)
   * Layout: Full-screen view from dashboard tap.
   * Elements: Header ("Training Volume"), Time Period Selector (can override global), Volume Type Selector (Miles/KM, Time, Elev), Chart Area (Line/Bar graph), Interactive Data Points, Legend, "Back"/"Close".
   * Annotations: Detailed exploration, zoom/scroll, similar layout for other charts, info icons needed for complex metrics.
10. User Profile Flow
   * Wireframe 10.1: User Profile Overview Screen
   * Layout: Accessed via "Profile" tab.
   * Elements: Header (Name, Pic), Collapsible Sections/Tabs ("User Profile" [Editable], "Runner Profile" [Info], "Active Training Plan", "Past/Completed Plans", "Gamification Badges / Trophy Room"), Link/Button to "Settings", Bottom Nav Bar.
   * Annotations: Central hub, indicates editable fields, badges tappable.
   * Wireframe 10.2: Edit User Profile Screen
   * Layout: Screen from tapping Edit/"User Profile".
   * Elements: Header ("Edit User Profile"), Input: Name, Option: Change Pic, Input: DOB, Select: Gender, "Save" Button, "Cancel"/"Back".
   * Annotations: Standard edit form.
   * Wireframe 10.3: Edit Runner Profile Screen
   * Layout: Screen from tapping Edit/"Runner Profile".
   * Elements: Header ("Edit Runner Profile"), Informational Display (PBs, Levels - AI derived), "Save" Button, "Cancel"/"Back".
   * Annotations: Limits editing to user prefs.
   * Wireframe 10.4: View Past Training Plan Screen
   * Layout: Screen from tapping "View Details" on past plan.
   * Elements: Header ("[Plan Name] - ([Dates])"), Summary Section (Goal, Weeks, Miles, Completion Stats), Optional read-only weekly breakdown view, "Back"/"Close".
   * Annotations: Historical record.
11. Settings Flow
   * Wireframe 11.1: Settings Overview Screen
   * Layout: Accessed from Profile.
   * Elements: Header ("Settings"), List of Settings Categories (tappable rows: Distance Metrics, Coaching Style, Push Notifications, Connected Apps, Privacy, Account Management, Help/Support, About/Legal), "Back"/"Close".
   * Annotations: Logical grouping.
   * Wireframe 11.2: Distance Metrics Settings Screen
   * Layout: Screen for distance units.
   * Elements: Header ("Distance Metrics"), Selection Options (Radio buttons: Miles, Kilometers), "Back".
   * Annotations: Saved automatically.
   * Wireframe 11.3: Coaching Style Preferences Screen
   * Layout: Screen for coaching style.
   * Elements: Header ("Coaching Style Preferences"), Selection Options (Radio buttons/list: Styles with descriptions), "Back".
   * Annotations: Saved automatically, descriptions help choice.
   * Wireframe 11.4: Push Notifications Settings Screen
   * Layout: Screen for notification prefs.
   * Elements: Header ("Push Notifications"), List of Notification Types with Toggles (On/Off: Daily reminder, Reconciliation nudge, Missed check-ins, Recommended changes, New plan nudge, Vici check-ins, Gamification alerts), "Back".
   * Annotations: Granular control, saved automatically.
   * Wireframe 11.5: Privacy Settings Screen
   * Layout: Screen for privacy options.
   * Elements: Header ("Privacy Settings"), Options (Toggles/Select: Data sharing, Location services link), Link to full Privacy Policy, "Back".
   * Annotations: Control over data usage, saved automatically.
   * Wireframe 11.6: Account Management Screen
   * Layout: Screen for account actions.
   * Elements: Header ("Account Management"), Options (Buttons/Links: Change Password, Delete Account, Logout), "Back".
   * Annotations: Destructive actions need confirmation, Change Password leads to separate flow.
Note: These textual descriptions should be supplemented by actual visual wireframes or mockups (e.g., in Figma) for complete clarity during design and development. (See Gap #1 below)
5.3 UI/UX Themes & Elements
(Content from vici_ui_ux_themes - updated version)
1. Overall Theme: "Data-Driven Motivation" (Clean, Modern, Data-Focused, Insightful, Motivational, Personalized).
2. Color Palette: Primary Accent (#5224EF), Secondary Accents (Lighter Purples), Neutrals (White, Greys), Semantic (Green, Red, Amber).
3. Typography: Inter font family; Defined scale/styles for hierarchy (Display, Headings, Body, Labels).
4. Layout & Structure: Bottom Tab Bar, Contextual Nav, Header; Card-Based UI, Expandable Sections, Lists, Generous Spacing.
5. Iconography: Lucide Icons (Line style), Standard Sizes (16-24px).
6. Data Visualization: Clarity first, appropriate chart types (Bar, Line, Progress), Interactivity, Use palette effectively, Prominent summary values.
7. Core UI Elements: Buttons (Primary, Secondary, Link styles; states; rounded-lg), Inputs (Labeled, states, rounded-lg), Cards (rounded-lg, shadow), Tabs (Active state), Expandable Sections (Header, Content, Arrow), Lists/Tiles (Structure, Dividers), Modals, Progress Indicators.
8. AI Integration Elements: "Vici AI" Insight Boxes (Distinct style), "Ask Vici" Interface (Conversational UI).
9. Gamification Elements: Badges (Visual style, rounded-full), Streaks (Clear display).
10. Microinteractions & Feedback: Subtle transitions, immediate visual feedback.
5.4 Design System / Style Guide
(Content from vici_design_system - updated version)
1. Introduction: Foundational visual language; ensures consistency; to evolve (Figma/Storybook).
2. Color Palette: Specific Hex Codes: Primary (#5224EF), Hover (#4318C9), Light (#E0D8FD, #F0EDFD). Neutrals (White, Grays #F9FAFB to #11182C). Semantic (Green #16A34A, Red #DC2626, Amber #F59E0B).
3. Typography: Inter; Scale: Display Large (24px/Bold) down to Label Small (12px/Med); Defined line heights.
4. Spacing & Layout: 4px increment scale (Tailwind p-1 to p-6); Card-based, white space, mobile-first.
5. Iconography: Lucide Icons (Line, 1.5-2px stroke); Sizes 16, 20, 24px.
6. Border Radius: rounded-md (6px), rounded-lg (8px - standard), rounded-full.
7. Shadows: shadow-sm, shadow (standard), shadow-md (optional hover).
8. Component Styles: Detailed styles for Buttons, Input Fields, Cards, Tabs, Expandable Sections, List Items, Badges, AI Insight Boxes (including states and referencing color/typography tokens).
6. Technical Specifications
6.1 Backend Structure
(Content from vici_backend_structure - refined version)
1. Architectural Overview: Cloud-Native Microservices (target), starting with Modular Monolith (MVP).
2. Core Services (Microservices): Auth, User Profile, Training Plan, Activity, Strava Integration, AI, Analytics, Gamification, Notification. (Modules in MVP).
3. Key Architectural Patterns: API Gateway, Asynchronous Processing (Message Queue), Service Communication (Sync/Async).
4. Data Management (Polyglot Persistence): Relational (PostgreSQL), Time-Series (TimescaleDB/InfluxDB - future), Cache (Redis). (Replit PostgreSQL for MVP, designed for split).
5. AI/ML Integration: Dedicated AI Service, Model Serving (e.g., Vertex AI), Clear internal APIs. (Direct Gemini API calls in MVP).
6. Cross-Cutting Concerns: Auth (Gateway/Auth Service), Centralized Logging, Monitoring.
7. Deployment & Operations: Docker, Kubernetes (target). Cloud Services (GCP recommended). CI/CD. (Replit Deployments, basic CI/CD for MVP).
6.2 API Specifications
(Content from vici_api_specs - updated version)
1. Overview: RESTful, Base URL (/v1), JWT Auth, JSON format, HTTPS. Unit Handling: API uses base SI units (meters, seconds, seconds/km); client converts based on UserSettings.
2. Authentication Endpoints: POST /auth/register, /verify-email, /resend-verification, /login, /forgot-password, /reset-password.
3. User Profile & Settings Endpoints: GET /user/profile, PUT /user/profile, PUT /user/profile/picture, PUT /user/runner-profile, GET /user/settings, PUT /user/settings, PUT /user/password, DELETE /user/account.
4. Strava Integration Endpoints: GET /integrations/strava/status, POST /integrations/strava/connect, GET /integrations/strava/callback, DELETE /integrations/strava/disconnect, GET /integrations/strava/initial-analysis.
5. Training Plan Endpoints: POST /training-plans, GET /training-plans/active, GET /training-plans/past, GET /training-plans/{planId}, GET /training-plans/{planId}/week/{weekNumber}, GET /training-plans/today, POST /training-plans/{planId}/approve, POST /training-plans/{planId}/ask-vici, POST /training-plans/{planId}/approve-changes.
6. Training Log & Activities Endpoints: GET /activities, GET /activities/{activityId}, POST /activities/{activityId}/reconcile, PUT /activities/{activityId} (Optional user input).
7. Analytics Endpoints: GET /analytics/dashboard, GET /analytics/volume, /load, /recovery, /fitness, /health (with query params).
8. Gamification Endpoints: GET /gamification/badges, GET /gamification/streaks.
9. Push Notification Endpoints: POST /notifications/register-device, DELETE /notifications/unregister-device.
10. Data Models: (See Section 6.3 below)
11. Error Handling: Standard HTTP codes (2xx, 4xx, 5xx), Standard JSON error format ({"error": {"code": ..., "message": ...}}).
6.3 Detailed Data Models
(Content from vici_data_models_detailed)
Notes: Timestamps (ISO8601 UTC), IDs (UUID Strings), Base Units (meters, seconds, seconds/km), Nullability defined. Unit Conversion: Backend uses base units; frontend converts for display based on UserSettings.distanceUnit.
Core Entities:
   1. User: userId, email, passwordHash, name, profilePictureUrl?, dateOfBirth?, gender?, emailVerified, createdAt, updatedAt, settings (UserSettings), runnerProfile (RunnerProfile).
   2. UserSettings: distanceUnit (enum), language, coachingStyle (enum), notificationPreferences (object), privacyDataSharing, updatedAt.
   3. RunnerProfile: experienceLevel? (enum), fitnessLevel? (string/score), personalBests? (array[PersonalBest]), shoePreferences? (array[string]), lastCalculatedAt?.
   4. PersonalBest: distanceMeters, timeSeconds, dateAchieved?, activityId?.
   5. TrainingPlan: planId, userId, status (enum), createdAt, startDate, endDate, goal (Goal), preferences (PlanPreferences), summary (PlanSummary), weeks (array[PlanWeek]), completionStats?, updatedAt.
   6. Goal: type (enum), raceName?, distanceMeters?, raceDate?, previousPbSeconds?, goalTimeSeconds?, objective?.
   7. PlanPreferences: targetWeeklyDistanceMeters, runningDaysPerWeek, qualityWorkoutsPerWeek, preferredLongRunDay (enum), coachingStyle (enum).
   8. PlanSummary: durationWeeks, totalDistanceMeters, avgWeeklyDistanceMeters.
   9. PlanWeek: weekNumber, startDate, endDate, phase, totalDistanceMeters, completedDistanceMeters?, dailyWorkouts (array[Workout]).
   10. Workout: workoutId, date, dayOfWeek (enum), workoutType (enum), status (enum), description, purpose, distanceMeters?, durationSeconds?, paceTarget? (PaceTarget), heartRateZoneTarget?, perceivedEffortTarget?, components? (array[WorkoutComponent]), alternatives? (array[WorkoutAlternative]), reconciledActivityId?.
   11. PaceTarget: minSecondsPerKm, maxSecondsPerKm.
   12. WorkoutComponent: componentId, sequence, type (enum), description, distanceMeters?, durationSeconds?, paceTarget?, heartRateZoneTarget?, perceivedEffortTarget?, repeatCount?.
   13. WorkoutAlternative: alternativeId, description, reason.
   14. PlanCompletionStats: overallCompletionPercent, mileageCompletionPercent, goalAchieved?, fitnessImprovementMetric?, actualRaceTimeSeconds?.
   15. Activity: activityId, userId, source (enum), sourceActivityId?, startTime, name, description?, distanceMeters, movingTimeSeconds, elapsedTimeSeconds, averagePaceSecondsPerKm, maxPaceSecondsPerKm?, averageHeartRate?, maxHeartRate?, totalElevationGainMeters?, mapThumbnailUrl?, mapPolyline?, hasPhotos, photos?, laps? (array[ActivityLap]), detailedStats? (ActivityTimeSeriesStats), isReconciled, reconciliationType? (enum), reconciledWorkoutId?, perceivedEffort?, journalEntry?, syncedAt, updatedAt.
   16. ActivityLap: lapNumber, distanceMeters, startTime, elapsedTimeSeconds, movingTimeSeconds, averagePaceSecondsPerKm, averageHeartRate?, splitType (enum).
   17. ActivityTimeSeriesStats: timestamps (array[int]), heartRate? (array[int]), elevation? (array[float]), pace? (array[float]), cadence? (array[int]), temperature? (array[float]).
   18. Badge: badgeId (string), name, description, imageUrl.
   19. UserBadge: userId, badgeId, earnedDate.
6.4 Enum Definitions
(Content from vici_enum_definitions)
   1. User.gender: "Female", "Male", "Other", "PreferNotToSay"
   2. UserSettings.distanceUnit: "km", "miles" (Default: "km")
   3. UserSettings.coachingStyle: "Motivational", "Authoritative", "Technical", "Data-Driven", "Balanced" (Default: "Balanced")
   4. RunnerProfile.experienceLevel: "Beginner", "Intermediate", "Advanced"
   5. TrainingPlan.status: "Preview", "Active", "Completed", "Cancelled"
   6. Goal.type: "Race", "NonRace"
   7. PlanPreferences.preferredLongRunDay: "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
   8. Workout.workoutType: "Easy Run", "Tempo", "Intervals", "Long Run", "Rest", "Cross Training", "Race"
   9. Workout.status: "Upcoming", "Completed", "Missed", "Skipped" (Default: "Upcoming")
   10. WorkoutComponent.type: "WarmUp", "Run", "Recovery", "CoolDown"
   11. Activity.source: "Strava", "Manual" (MVP); Future: "Garmin Connect", "Other"
   12. Activity.reconciliationType: "Yes", "No", "WithModifications", "Auto"
   13. ActivityLap.splitType: "Distance", "Manual" (MVP); Future: "Session", "Other"
6.5 AI Model Specifications
(Content from vici_ai_model_specs)
1. Initial Runner Profile Analysis:
   * Purpose: Analyze historical data for baseline metrics (Experience, Fitness, PBs) & initial recommendations.
   * Trigger: Post-Strava connect & profile setup.
   * Inputs: userId, Strava History (Activities), User profile (DOB/Gender?).
   * Logic: Analyze frequency, intensity, consistency, PBs. Estimate fitness (Pace/HR, VO2Max?). Generate safe recommendations.
   * Outputs: Updates RunnerProfile (experience, fitness, PBs); Returns initial recommendations/insights object.
   * Notes: Async processing likely needed. Prioritize safety in recommendations.
2. Training Plan Generation:
   * Purpose: Create personalized, structured plan.
   * Trigger: POST /training-plans.
   * Inputs: userId, Goal, PlanPreferences, RunnerProfile, recent training load?.
   * Logic: Select template, determine duration, progress mileage safely (~10% rule, down weeks), schedule workout types based on prefs/principles, define workout details (pace/HR/RPE targets, components) based on fitness/goal, generate descriptions, assign days, ensure phases (Base, Build, Peak, Taper).
   * Outputs: TrainingPlan object (status: Preview).
   * Notes: Target < 30s generation. Strict safety rules on progression.
3. Ongoing Fitness/Experience Updates:
   * Purpose: Periodically reassess fitness/experience.
   * Trigger: Weekly batch or significant activity/reconciliation.
   * Inputs: userId, Recent Activity data, current RunnerProfile.
   * Logic: Analyze recent performance trends vs. targets/history. Update fitnessLevel (more frequent), experienceLevel (less frequent). Detect new PBs.
   * Outputs: Updated RunnerProfile fields.
   * Notes: Background process. Avoid volatile changes.
4. "Ask Vici" (NLP & Plan Adjustment):
   * Purpose: Understand requests, answer questions, propose safe plan adjustments.
   * Trigger: POST /training-plans/{planId}/ask-vici.
   * Inputs: userId, planId, user query, current TrainingPlan, UserSettings (coachingStyle).
   * Logic: NLP (Intent/Entity Recognition). Q&A (retrieve info). Adjustment (validate request, analyze impact, generate modifications respecting safety rules, formulate response/structured changes). Tailor tone.
   * Outputs: API response (response text, optional proposedChanges object).
   * Notes: Target < 5-15s response. Critical safety validation on adjustments.
6.6 Third-Party Integration Specifications (Strava)
(Content from vici_strava_integration_specs)
1. Overview: Integrate via Strava API v3 for profile/activity sync using Strava Integration Service.
2. Authentication (OAuth 2.0): Request scopes profile:read_all, activity:read_all. Standard OAuth flow (redirect, callback, token exchange). Secure token storage & refresh mechanism required.
3. Strava API Endpoints Used: GET /athlete, GET /athlete/activities (for initial/polling sync), GET /activities/{id} (for details/webhook sync), GET /activities/{id}/streams (potentially for time-series), POST /oauth/deauthorize.
4. Data Synchronization Strategy: Initial sync (async, fetch profile & history). Ongoing sync (Webhook preferred: subscribe to activity create/update/delete, fetch details on event; Polling fallback: periodic GET /athlete/activities with after param). Publish ActivityReceived/ActivityDeleted to message queue.
5. Data Mapping: Defined mapping from Strava fields to Vici Activity model fields (see table in original spec). Handle unit conversions (speed->pace).
6. Error Handling: Specific handling for 401 (refresh token/re-auth), 403 (scope issue), 429 (rate limits - backoff/retry), 5xx (retry). Graceful handling of missing data.
7. Deauthorization / Disconnection: Handle user-initiated disconnect via Vici (call Strava deauthorize, delete tokens) and user-initiated disconnect via Strava (via webhook or token failure).
6.7 Deployment & Infrastructure Specifics
(Content from vici_deployment_infra_specs - refined version)
1. Target Hosting Environment: Phase 1: Replit (MVP). Phase 2: GCP (Recommended, Long-Term).
2. Initial Architecture (MVP on Replit): Modular Monolith (Python/FastAPI recommended). Internal modules (auth, users, plans, activities, strava_integration, ai_interface, etc.). Single API endpoint. Replit PostgreSQL DB (design schema for future split). Replit Reserved VM / Background Workers for async tasks (using simple queue). Direct API calls to AI service. Config via Replit Secrets.
3. Future / Target Architecture (GCP): Microservices (Cloud Run/GKE). Managed DBs (Cloud SQL, Timescale?). Pub/Sub messaging. API Gateway. Vertex AI. Cloud Storage.
4. Environment Strategy: MVP (Replit dev/staging/prod via branches/deployments). Long-Term (Separate GCP projects for dev/staging/prod, managed via IaC - Terraform).
5. CI/CD Strategy: MVP (Git + Replit GitHub integration for basic CI/CD). Long-Term (Robust pipelines - GitHub Actions/Cloud Build - testing, container builds, registry push, deployment).
7. Supporting Specifications & Strategies
7.1 Testing Strategy
(Content from vici_testing_strategy)
1. Goals: Verify requirements, ensure reliability/performance/security, validate AI outputs, build release confidence.
2. Testing Levels & Types:
   * Unit Testing: Isolate functions/classes (pytest, mocks). High coverage target (>80%).
   * Integration Testing: Test module/service interactions (pytest, testcontainers). Validate internal contracts.
   * API Testing: Test API endpoints (pytest + HTTP client, Postman). Verify contract, auth, validation, logic.
   * End-to-End (E2E) Testing: Test critical user flows via API sequences or UI automation (Cypress/Playwright/Appium).
   * AI Model Testing: Offline evaluation (benchmarks), Safety/Constraint testing (edge cases), Plausibility checks, Integration tests, Human Review.
   * Performance & Load Testing: Test API/services under load (k6, Locust). Measure latency, throughput, errors vs NFRs.
   * Security Testing: SAST, DAST, Dependency Scanning (Snyk/Dependabot), Penetration Testing.
   * User Acceptance Testing (UAT): Manual validation by stakeholders/beta users.
3. Integration with CI/CD: Automate Unit, Integration, API tests in pipeline; gate deployments.
4. Evolution: MVP (focus on Unit, API, Manual, basic AI validation). Long-Term (more Integration, E2E, Performance, Security, advanced AI testing).
7.2 Security Considerations Checklist
(Content from vici_security_checklist)
Goal: Adhere to best practices, protect user data (health/location).
1. Auth & AuthZ: Strong passwords (hashed), secure JWT (short expiry, HTTPS), secure password reset, rate limiting, strict authorization (user owns data). MFA post-MVP.
2. Data Security: Encrypt transit (HTTPS) & rest (sensitive PII, tokens, health data). Secure file storage. Data minimization & retention policies. Avoid sensitive data in logs.
3. API Security: Input validation, output encoding, rate limiting, security headers, least privilege API keys.
4. Input Validation: Rigorous server-side validation (type, format, length, range, enums). Sanitize inputs (beware prompt injection).
5. 3rd Party: Secure secret storage (Replit Secrets -> GCP Secret Manager). Validate webhooks. Minimize Strava scopes. Secure AI service comms, mindful of data sent.
6. Infra & Deployment: Secure cloud config (firewalls, IAM least privilege). Container security (scan images, run minimal). Patch management. Secure CI/CD (protect secrets).
7. Dependencies: Vulnerability scanning (Snyk/Dependabot), update policy.
8. Logging & Monitoring: Log security events (logins, failures, changes). Secure log storage. No sensitive data in logs. Monitor for suspicious activity, set alerts.
9. Privacy: GDPR/CCPA compliance. Clear Privacy Policy. User consent. Data subject rights handling (access/delete).
7.3 Accessibility Implementation Notes
(Content from vici_accessibility_notes)
1. Introduction: Goal: WCAG 2.1 AA on iOS (VoiceOver) & Android (TalkBack). Integrate throughout process. POUR principles.
2. Key Implementation Areas:
      * Semantics & Navigation: Logical focus order, heading structure, clear navigation states.
      * Screen Reader: Meaningful labels, hints, roles, states for ALL elements (interactive & informative). Group related elements. Announce dynamic changes.
      * Touch Targets: Minimum 44x44 points/dp.
      * Color & Contrast: Meet ratios (4.5:1 text, 3:1 large/UI). Don't rely solely on color. Test for color blindness.
      * Text: Support OS-level resizing (Dynamic Type/Scaling). Ensure readability (line height).
      * Images/Icons: Accessible labels for meaningful ones; hide decorative ones.
      * Forms: Associate labels, clear instructions, announce errors programmatically.
      * Charts: Accessible labels/titles. Provide data alternatives (summary text, table view). Make points focusable if possible. Ensure contrast.
      * Custom Components: Implement platform accessibility APIs correctly.
      * Motion: Reduce motion option, avoid excessive/informative-only animations.
3. Testing: Manual (VoiceOver/TalkBack), Inspectors (Xcode/Android), Automated checks, Contrast tools, User testing with disabilities.
7.4 Analytics Tracking Plan
(Content from vici_analytics_plan)
1. Introduction: Define events/properties to measure Success Metrics. Tooling: Firebase Analytics, Amplitude, or Mixpanel recommended.
2. User Identification: Set userId post-login; track anonymous pre-login; merge identities if possible.
3. Standard Properties: timestamp, userId, appVersion, platform, osVersion, deviceModel.
4. Key Events & Properties (By Flow):
         * Onboarding: app_opened, registration_started, registration_completed, email_verification_completed, login_completed, strava_connection_prompt_viewed, strava_connection_initiated, strava_connection_completed, strava_connection_skipped, profile_setup_completed, initial_recommendations_viewed.
         * Core Cycle: screen_viewed (with screenName), plan_creation_started, plan_goal_set, plan_preferences_set, plan_generation_requested, plan_generation_completed, plan_preview_viewed, plan_preview_week_expanded, plan_approved, workout_viewed, ask_vici_initiated, ask_vici_request_sent, ask_vici_adjustment_proposed, ask_vici_adjustment_approved, ask_vici_adjustment_rejected.
         * Activity/Review: activity_synced (backend?), activity_reconciliation_prompt_viewed, activity_reconciled, activity_details_viewed, analytics_chart_viewed.
         * Profile/Settings: profile_edited, settings_changed, strava_disconnected, badge_details_viewed.
         * Gamification (Backend?): badge_earned, streak_milestone_reached.
         * Errors: error_occurred (with errorCode, errorMessage, context).
5. Implementation: Use SDK client-side primarily. Track backend events server-side if possible/reliable. Maintain naming consistency. Review against metrics.
7.5 Onboarding & Help Strategy
(Content from vici_onboarding_help_strategy)
1. Introduction: Goal: Seamless setup, feature introduction, ongoing support. Tone: Knowledgeable, Encouraging, Clear, Personalized, Trustworthy.
2. Phase 1 (Initial Onboarding): Streamlined setup (WF 1.1-1.6). Clear value prop. Emphasize Strava benefit (WF 1.3). Progress indication (WF 1.7). Value demo via Initial Recommendations (WF 1.8).
3. Phase 2 (First Use): Clear CTA for first plan (WF 1.9/2.8). Contextual Tooltips/Coach Marks (optional) for key UI on first view (Tabs, Ask Vici, Nav). Guided plan creation (WF 3.5-3.8). Plan preview explanation (WF 4.1).
4. Phase 3 (Ongoing Help): "Ask Vici" as primary help. AI Insight Boxes for context. Info Icons (ⓘ) for complex terms/settings. Helpful Empty States (Log, Analytics, Past Plans). Help Section (Post-MVP? - FAQs, Glossary, Contact). Feature Highlighting (optional for new releases).
7.6 Content Strategy & Copy Guidelines
(Content from vici_content_strategy)
1. Brand Voice & Tone: Knowledgeable & Insightful, Encouraging & Motivational, Clear & Concise, Personalized, Trustworthy.
2. Key Content Areas & Sources:
            * UI Labels/Microcopy: (Static) Clear, concise.
            * Onboarding: (Static) Welcoming, clear, benefit-oriented.
            * Workout Desc/Purpose: (AI-Gen) Informative, simple. Needs review/templates.
            * AI Insights/Feedback: (AI-Gen) Insightful, personalized, explains "why", encouraging/constructive tone based on coachingStyle. Needs prompt engineering/review.
            * "Ask Vici" Responses: (AI-Gen) Conversational, clear, helpful, matches coachingStyle. Needs safety guardrails.
            * Error Messages: (Static) Clear, simple explanation, suggests solution (See Error Catalogue).
            * Gamification Copy: (Static) Celebratory, motivating.
            * Help/Support Content: (Static) Clear, instructional.
            * Legal Copy: (Legal) Formal, compliant.
3. Style Guidelines: Consistent Terminology (define key terms). Units displayed clearly (respect user pref). Formatting for readability (bold, lists). Pronouns ("You"/"Your", "Vici"/"Your AI Coach").
4. Content Management: Define process for managing static copy (e.g., resource files). Define process for ensuring quality/safety of AI-generated copy (prompts, templates, review).
7.7 User Facing Error Message Catalogue
(Content from vici_error_messages)
Goal: Provide clear, user-friendly, actionable error messages.
1. Authentication & Registration: (Invalid email, short password, mismatch, email exists, email not found, incorrect password, email not verified, invalid code, invalid reset token).
2. Strava Integration: (Connection failed, Sync failed, Token expired/revoked, Insufficient permissions).
3. Training Plan Management: (Plan generation failed, Ask Vici failed, Invalid plan state).
4. General Application & Network Errors: (No internet, Server error, Timeout).
5. Input Validation (Generic): (Required field, invalid number, invalid date).
(Messages include Title (optional), Body, Action(s))
8. Remaining Gaps & Future Considerations
This section lists areas identified during the specification process that require further definition or are planned for future iterations.
               * Gap 1: Visual Assets: This document primarily uses textual descriptions for Wireframes. Access to the complete set of visual wireframes and high-fidelity mockups (e.g., via Figma links) is essential for UI/UX implementation. (Action: Link to Figma/design repository)
               * Gap 2: Comprehensive Design System Implementation: The Design System/Style Guide provides a foundation. A fully implemented system, ideally in a tool like Figma and potentially a code component library (e.g., Storybook), is needed for full development efficiency and consistency. (Action: Develop alongside implementation)
               * Gap 3: Specific Content/Copy: While the Content Strategy defines tone and sources, the actual user-facing copy for many elements (detailed AI explanations, specific error messages beyond the catalogue, help content, onboarding tooltips) needs to be written and finalized. (Action: Content writing/review process)
               * Gap 4: Detailed Release Phasing/Roadmap: The MVP scope is defined, but a more detailed roadmap outlining the sequence and priority of post-MVP features (AI Coach components, new integrations, analytics tiers, etc.) is needed for long-term planning. (Action: Product roadmap planning)
               * Gap 5: Analytics Tooling & Implementation: A specific analytics platform needs to be chosen, and the implementation details (SDK setup, specific tracking calls) need to be integrated into the development workflow. (Action: Choose tool, implement tracking plan)
               * Gap 6: Help/Support Content Implementation: If a dedicated Help section or tutorials are planned, the actual content needs to be created. The mechanism for Contact Support needs definition. (Action: Create help content if prioritized)
               * Gap 7: Internationalization (i18n) / Localization (l10n) Strategy: If supporting multiple languages is a requirement, a detailed strategy for managing translations and adapting the UI/content is needed. (Action: Define strategy if/when needed)
               * Gap 8: Open Issues/Questions: Maintain a running list of unresolved questions or decisions encountered during specification or development. (Action: Create and maintain an open issues log)
This restructured document provides a comprehensive guide for developing the Vici application, organized according to common industry practices for product specifications.