import XCTest
@testable import ViciMVP

final class AuthViewModelTests: XCTestCase {
    
    var viewModel: AuthViewModel!
    
    override func setUp() {
        super.setUp()
        viewModel = AuthViewModel()
    }
    
    override func tearDown() {
        viewModel = nil
        KeychainService.shared.clearTokens()
        super.tearDown()
    }
    
    func testInitialState() {
        // When the view model is initialized
        // Then the default state should be logged out
        XCTAssertFalse(viewModel.isLoggedIn)
        XCTAssertNil(viewModel.currentUser)
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNil(viewModel.errorMessage)
        XCTAssertFalse(viewModel.isStravaConnected)
    }
    
    func testLoginSuccess() async {
        // Given a valid email and password
        let email = "test@example.com"
        let password = "password123"
        
        // When login is called
        let success = await viewModel.login(email: email, password: password)
        
        // Then login should be successful
        XCTAssertTrue(success)
        XCTAssertTrue(viewModel.isLoggedIn)
        XCTAssertNotNil(viewModel.currentUser)
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNil(viewModel.errorMessage)
    }
    
    func testLoginFailure() async {
        // Given an invalid email and password
        let email = "invalid@example.com"
        let password = "wrongpassword"
        
        // When login is called
        let success = await viewModel.login(email: email, password: password)
        
        // Then login should fail
        XCTAssertFalse(success)
        XCTAssertFalse(viewModel.isLoggedIn)
        XCTAssertNil(viewModel.currentUser)
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNotNil(viewModel.errorMessage)
    }
    
    func testLogout() async {
        // Given a logged in user
        let email = "test@example.com"
        let password = "password123"
        let success = await viewModel.login(email: email, password: password)
        XCTAssertTrue(success)
        
        // When logout is called
        viewModel.logout()
        
        // Then the user should be logged out
        XCTAssertFalse(viewModel.isLoggedIn)
        XCTAssertNil(viewModel.currentUser)
        XCTAssertFalse(viewModel.isLoading)
    }
    
    func testRefreshUserProfile() async {
        // Given a logged in user
        let email = "test@example.com"
        let password = "password123"
        let success = await viewModel.login(email: email, password: password)
        XCTAssertTrue(success)
        
        // When refreshUserProfile is called
        await viewModel.refreshUserProfile()
        
        // Then the user profile should be updated
        XCTAssertNotNil(viewModel.currentUser)
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNil(viewModel.errorMessage)
    }
    
    func testUpdateStravaConnectionStatus() async {
        // Given a logged in user
        let email = "test@example.com"
        let password = "password123"
        let success = await viewModel.login(email: email, password: password)
        XCTAssertTrue(success)
        
        // When updateStravaConnectionStatus is called
        viewModel.updateStravaConnectionStatus()
        
        // Then the stravaConnected status should be updated based on the user
        XCTAssertEqual(viewModel.isStravaConnected, viewModel.currentUser?.stravaConnected ?? false)
    }
} 