# Vici App - App Store Preparation Guide

This document outlines all the requirements and materials needed for submitting the Vici MVP to the Apple App Store.

## Required Materials Checklist

### App Metadata

- [ ] **App Name**: Vici - AI Running Coach
- [ ] **Subtitle**: Personalized AI Training Plans
- [ ] **Category**: Health & Fitness (Primary), Sports (Secondary)
- [ ] **Keywords**: Running, Training Plan, AI Coach, Marathon, 5K, 10K, Half Marathon, Running App, Fitness
- [ ] **Support URL**: https://vici.app/support
- [ ] **Marketing URL**: https://vici.app
- [ ] **Privacy Policy URL**: https://vici.app/privacy

### App Description

- [ ] **App Description** (4000 characters max):
  ```
  Vici is your personal AI running coach that creates customized training plans tailored to your specific goals, fitness level, and schedule.
  
  Whether you're training for your first 5K or your next marathon, Vici uses advanced AI technology to design a progressive training plan that will help you reach your potential while minimizing injury risk.
  
  KEY FEATURES:
  
  • PERSONALIZED TRAINING PLANS
  Create a running plan tailored specifically to your goal race, experience level, and preferred schedule. Vici's AI analyzes your profile to build a balanced plan that works for you.
  
  • STRAVA INTEGRATION
  Connect your Strava account to automatically sync your runs and keep your training log up to date.
  
  • ADAPTIVE TRAINING
  As you complete workouts, Vici adapts your plan to match your progress, ensuring you're always training at the right intensity.
  
  • ASK VICI ANYTHING
  Chat with our AI coach to get expert advice on training, recovery, nutrition, gear, and more. Get immediate answers to all your running questions.
  
  • WORKOUT TRACKING
  Log your runs directly in the app and track your progress over time with detailed metrics and insights.
  
  TRAINING PLANS FOR ALL LEVELS:
  
  • 5K Plans
  • 10K Plans
  • Half Marathon Plans
  • Marathon Plans
  • Custom Distance Plans
  
  Join the thousands of runners who are using Vici to train smarter, prevent injuries, and achieve their running goals!
  ```

- [ ] **What's New** (Initial Release):
  ```
  Initial release of Vici - Your AI Running Coach!
  ```

### App Store Visual Assets

- [ ] **App Icon** (1024x1024px, PNG format, no alpha channel)
- [ ] **App Preview Video** (Optional but recommended, 15-30 seconds)

#### Screenshots (PNG or JPEG format)
For each device size:

- [ ] **iPhone 6.5" Display (iPhone 11 Pro Max, 12/13 Pro Max)**
  - 6-10 screenshots showing key features (1242 x 2688 pixels portrait)
  
- [ ] **iPhone 5.5" Display (iPhone 8 Plus)**
  - 6-10 screenshots showing key features (1242 x 2208 pixels portrait)
  
- [ ] **iPad Pro (12.9-inch) (3rd generation)**
  - 6-10 screenshots showing iPad-specific layouts (2048 x 2732 pixels portrait)

Recommended screenshots to include:
1. Login/Onboarding screen
2. Creating a training plan (goal selection)
3. Training plan overview
4. Today's workout detail
5. Ask Vici conversation
6. Strava connection
7. User profile
8. Weekly training view

### App Rating Information

- [ ] **Age Rating**: 4+
- [ ] **Content Descriptions**: None (no objectionable content)

## Legal Documents

- [ ] **Terms of Service**: https://vici.app/terms
- [ ] **Privacy Policy**: https://vici.app/privacy

The privacy policy must cover:
- Data collection and usage
- Third-party data sharing (Strava, analytics)
- User controls and opt-out options
- Compliance with GDPR, CCPA, and other regulations

## Technical Requirements

- [ ] **Build Number**: Follow semantic versioning (e.g., 1.0.0)
- [ ] **Minimum iOS Version**: iOS 15.0 or higher
- [ ] **Devices**: iPhone and iPad
- [ ] **App Store Connect Setup**:
  - Create app record in App Store Connect
  - Configure TestFlight for beta testing
  - Set up App Store pricing (Free with IAP)

- [ ] **In-App Purchases** (if applicable):
  - Configure subscription options in App Store Connect
  - Implement StoreKit integration
  - Set up server-side validation

- [ ] **TestFlight Beta Testing**:
  - Internal testing group
  - External testing group
  - Beta app description

## Submission Checklist

- [ ] App passes all UI tests on multiple device sizes
- [ ] All features work as expected without crashes
- [ ] Authentication and Strava login flows have been tested extensively
- [ ] Network error handling has been verified
- [ ] Offline functionality has been tested
- [ ] App passes Apple's accessibility guidelines
- [ ] Privacy policy and terms of service are complete
- [ ] All required app metadata is complete in App Store Connect
- [ ] All visuals (icon, screenshots) are uploaded in App Store Connect
- [ ] Final build is uploaded and processed in App Store Connect

## Submission Process

1. Archive the app in Xcode
2. Validate the app archive
3. Upload to App Store Connect
4. Complete all metadata in App Store Connect
5. Submit for review
6. Monitor review status
7. Respond to any reviewer questions promptly

## Post-Submission

- [ ] Prepare marketing materials for launch
- [ ] Configure analytics to track downloads and usage
- [ ] Set up monitoring for app crashes and issues
- [ ] Establish process for user feedback and feature requests

## Timeline

- Complete all materials: [DATE]
- Final QA testing: [DATE]
- TestFlight beta testing: [DATE]
- Submission to App Store: [DATE]
- Expected release: [DATE] (typically 1-3 days after approval) 