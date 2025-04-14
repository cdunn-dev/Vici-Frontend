//
//  ViciMVPUITests.swift
//  ViciMVPUITests
//
//  Created by Chris Dunn on 11/04/2025.
//

import XCTest

final class ViciMVPUITests: XCTestCase {
    let app = XCUIApplication()
    
    override func setUpWithError() throws {
        continueAfterFailure = false
        app.launchArguments = ["UI_TESTING"]
        app.launchEnvironment = ["ENV": "TEST"]
    }
    
    override func tearDownWithError() throws {
        // Clean up after each test if needed
    }
    
    // MARK: - Authentication Flow Tests
    
    @MainActor
    func testLoginFlow() throws {
        app.launch()
        
        // Verify login screen appears
        XCTAssert(app.buttons["Sign In"].exists)
        XCTAssert(app.buttons["Sign Up"].exists)
        
        // Enter test credentials and login
        app.textFields["Email"].tap()
        app.textFields["Email"].typeText("test@vici.com")
        
        app.secureTextFields["Password"].tap()
        app.secureTextFields["Password"].typeText("Test123!")
        
        app.buttons["Sign In"].tap()
        
        // Verify successful login (main tab view appears)
        XCTAssert(app.tabBars["Tab Bar"].waitForExistence(timeout: 5.0))
        XCTAssert(app.tabBars["Tab Bar"].buttons["Training"].exists)
    }
    
    @MainActor
    func testRegistrationFlow() throws {
        app.launch()
        
        // Navigate to registration
        app.buttons["Sign Up"].tap()
        
        // Complete registration form
        app.textFields["Full Name"].tap()
        app.textFields["Full Name"].typeText("Test Runner")
        
        app.textFields["Email"].tap()
        app.textFields["Email"].typeText("newuser@vici.com")
        
        app.secureTextFields["Password"].tap()
        app.secureTextFields["Password"].typeText("Test123!")
        
        app.secureTextFields["Confirm Password"].tap()
        app.secureTextFields["Confirm Password"].typeText("Test123!")
        
        app.buttons["Create Account"].tap()
        
        // Verify successful registration (should be on welcome or Strava connect screen)
        XCTAssert(app.buttons["Connect with Strava"].waitForExistence(timeout: 5.0))
    }
    
    // MARK: - Strava Connection Tests
    
    @MainActor
    func testStravaConnectionFlow() throws {
        // Start with logged in user
        testLoginFlow()
        
        // Navigate to profile tab
        app.tabBars["Tab Bar"].buttons["Profile"].tap()
        
        // Check if already connected, disconnect if needed
        if app.buttons["Disconnect Strava"].exists {
            app.buttons["Disconnect Strava"].tap()
            app.alerts.buttons["Confirm"].tap()
        }
        
        // Connect to Strava
        app.buttons["Connect with Strava"].tap()
        
        // Simulate Strava login (would normally navigate to a web view)
        // Since we can't easily test OAuth web flow, we'll verify the web auth session starts
        XCTAssert(app.otherElements["AuthenticationServices"].waitForExistence(timeout: 5.0) || 
                 app.webViews.firstMatch.waitForExistence(timeout: 5.0))
        
        // In real testing, we would need to complete the OAuth flow
        // This would require mocking the OAuth process or using a test account
    }
    
    // MARK: - Training Plan Tests
    
    @MainActor
    func testCreateTrainingPlanFlow() throws {
        // Start with logged in user
        testLoginFlow()
        
        // Navigate to training tab if not already there
        app.tabBars["Tab Bar"].buttons["Training"].tap()
        
        // Check if we need to create a plan or already have one
        if app.buttons["Create a Plan"].exists {
            app.buttons["Create a Plan"].tap()
            
            // Goal selection
            XCTAssert(app.staticTexts["What's your goal?"].waitForExistence(timeout: 2.0))
            app.buttons["Race"].tap()
            
            // Race distance selection
            XCTAssert(app.staticTexts["What distance?"].waitForExistence(timeout: 2.0))
            app.buttons["Half Marathon"].tap()
            
            // Race date selection
            XCTAssert(app.staticTexts["When is your race?"].waitForExistence(timeout: 2.0))
            // Tap a date 12 weeks from now on the calendar
            let dateFormatter = DateFormatter()
            dateFormatter.dateFormat = "MMMM d, yyyy"
            let futureDate = Calendar.current.date(byAdding: .day, value: 84, to: Date())!
            let dateString = dateFormatter.string(from: futureDate)
            
            // This is an approximation - actual date selection would depend on calendar UI
            if app.buttons[dateString].exists {
                app.buttons[dateString].tap()
            } else {
                // Simplified approach - just tap the "Continue" button 
                // assuming a valid date is selected
                app.buttons["Continue"].tap()
            }
            
            // Runner profile
            XCTAssert(app.staticTexts["Tell us about yourself"].waitForExistence(timeout: 2.0))
            
            // Experience level
            app.buttons["Intermediate"].tap()
            
            // Typical weekly mileage
            app.sliders.firstMatch.adjust(toNormalizedSliderPosition: 0.5)
            
            // Continue to next screen
            app.buttons["Continue"].tap()
            
            // Plan preferences
            XCTAssert(app.staticTexts["Plan preferences"].waitForExistence(timeout: 2.0))
            
            // Running days per week
            app.buttons["4 days"].tap()
            
            // Long run day preference
            app.buttons["Saturday"].tap()
            
            // Generate plan
            app.buttons["Generate Plan"].tap()
            
            // Plan preview
            XCTAssert(app.staticTexts["Your Training Plan"].waitForExistence(timeout: 10.0))
            
            // Approve plan
            app.buttons["Approve Plan"].tap()
            
            // Verify plan is created and displayed
            XCTAssert(app.staticTexts["Today"].waitForExistence(timeout: 5.0))
        }
    }
    
    @MainActor
    func testViewTodaysWorkoutFlow() throws {
        // Start with logged in user who has a plan
        testLoginFlow()
        
        // Navigate to training tab
        app.tabBars["Tab Bar"].buttons["Training"].tap()
        
        // Tap on today's workout card
        XCTAssert(app.staticTexts["Today"].waitForExistence(timeout: 2.0))
        
        // The workout card might have various texts depending on the workout
        // We'll look for a common workout type - could be "Easy Run", "Long Run", etc.
        let workoutTypesPredicate = NSPredicate(format: "label CONTAINS 'Run' OR label CONTAINS 'Rest' OR label CONTAINS 'Cross Training'")
        let workoutElement = app.staticTexts.element(matching: workoutTypesPredicate)
        
        XCTAssert(workoutElement.exists)
        workoutElement.tap()
        
        // Verify workout detail view appears
        XCTAssert(app.buttons["Complete Workout"].waitForExistence(timeout: 2.0))
        
        // Test completing a workout
        app.buttons["Complete Workout"].tap()
        
        // Verify completion feedback
        XCTAssert(app.staticTexts["Workout Completed!"].waitForExistence(timeout: 2.0) ||
                 app.buttons["Mark as Complete"].exists == false)
    }
    
    // MARK: - Ask Vici Tests
    
    @MainActor
    func testAskViciFlow() throws {
        // Start with logged in user
        testLoginFlow()
        
        // Navigate to Ask Vici tab
        app.tabBars["Tab Bar"].buttons["Ask Vici"].tap()
        
        // Verify the chat interface appears
        XCTAssert(app.textFields["Ask me anything..."].waitForExistence(timeout: 2.0))
        
        // Test sending a message
        app.textFields["Ask me anything..."].tap()
        app.textFields["Ask me anything..."].typeText("How should I prepare for my long run tomorrow?")
        app.buttons["Send"].tap()
        
        // Verify message appears in chat
        XCTAssert(app.staticTexts["How should I prepare for my long run tomorrow?"].exists)
        
        // Verify AI starts responding (loading indicator or response appears)
        let responsePredicate = NSPredicate(format: "label CONTAINS 'hydrate' OR label CONTAINS 'prepare' OR label CONTAINS 'recommend'")
        let responseElement = app.staticTexts.element(matching: responsePredicate)
        
        XCTAssert(responseElement.waitForExistence(timeout: 10.0) || 
                 app.activityIndicators.firstMatch.waitForExistence(timeout: 2.0))
    }
    
    // MARK: - End-to-end Flow Tests
    
    @MainActor
    func testEndToEndUserJourney() throws {
        app.launch()
        
        // Register new user
        app.buttons["Sign Up"].tap()
        
        // Complete registration form
        let uniqueEmail = "test\(Int(Date().timeIntervalSince1970))@vici.com"
        
        app.textFields["Full Name"].tap()
        app.textFields["Full Name"].typeText("E2E Test User")
        
        app.textFields["Email"].tap()
        app.textFields["Email"].typeText(uniqueEmail)
        
        app.secureTextFields["Password"].tap()
        app.secureTextFields["Password"].typeText("TestE2E123!")
        
        app.secureTextFields["Confirm Password"].tap()
        app.secureTextFields["Confirm Password"].typeText("TestE2E123!")
        
        app.buttons["Create Account"].tap()
        
        // Strava connection (would be skipped in test env)
        if app.buttons["Skip for now"].exists {
            app.buttons["Skip for now"].tap()
        }
        
        // Create training plan
        if app.buttons["Create a Plan"].waitForExistence(timeout: 5.0) {
            app.buttons["Create a Plan"].tap()
            
            // Goal selection
            app.buttons["Race"].tap()
            
            // Race distance
            app.buttons["10K"].tap()
            
            // Race date - tap continue as date is preselected
            app.buttons["Continue"].tap()
            
            // Runner profile
            app.buttons["Beginner"].tap()
            app.sliders.firstMatch.adjust(toNormalizedSliderPosition: 0.3)
            app.buttons["Continue"].tap()
            
            // Plan preferences
            app.buttons["3 days"].tap()
            app.buttons["Sunday"].tap()
            app.buttons["Generate Plan"].tap()
            
            // Plan preview
            XCTAssert(app.staticTexts["Your Training Plan"].waitForExistence(timeout: 10.0))
            app.buttons["Approve Plan"].tap()
        }
        
        // View today's workout
        XCTAssert(app.staticTexts["Today"].waitForExistence(timeout: 5.0))
        
        // Navigate to Ask Vici and ask a question
        app.tabBars["Tab Bar"].buttons["Ask Vici"].tap()
        
        app.textFields["Ask me anything..."].tap()
        app.textFields["Ask me anything..."].typeText("Can you explain my training plan?")
        app.buttons["Send"].tap()
        
        // Verify response
        let responsePredicate = NSPredicate(format: "label CONTAINS 'plan' OR label CONTAINS 'training' OR label CONTAINS 'workout'")
        let responseElement = app.staticTexts.element(matching: responsePredicate)
        
        XCTAssert(responseElement.waitForExistence(timeout: 10.0))
        
        // Navigate to profile
        app.tabBars["Tab Bar"].buttons["Profile"].tap()
        
        // Verify we can see profile information
        XCTAssert(app.staticTexts[uniqueEmail].exists || app.staticTexts["E2E Test User"].exists)
    }
}
