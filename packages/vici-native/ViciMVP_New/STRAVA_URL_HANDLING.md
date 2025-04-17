# Strava OAuth URL Handling

## Current Implementation Analysis

### 1. URL Scheme Configuration in Info.plist

The application has the following URL scheme configuration in `Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleTypeRole</key>
        <string>Editor</string>
        <key>CFBundleURLName</key>
        <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>vici</string>
        </array>
    </dict>
</array>
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleTypeRole</key>
        <string>Editor</string>
        <key>CFBundleURLName</key>
        <string>com.vici.app</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>vici</string>
        </array>
    </dict>
</array>
```

**Issue**: There is a duplicate `CFBundleURLTypes` key, which may cause only one of them to be used.

### 2. AppDelegate URL Handling

In `AppDelegate.swift`, the URL handling is implemented as follows:

```swift
func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
    logger.debug("Received URL: \(url.absoluteString)")
    
    // Handle Strava OAuth callback
    if url.scheme == "vici" && url.host == "strava-callback" {
        logger.debug("Processing Strava callback")
        handleStravaCallback(url: url)
        return true
    }
    
    return false
}

private func handleStravaCallback(url: URL) {
    guard let components = URLComponents(url: url, resolvingAgainstBaseURL: true),
          let queryItems = components.queryItems,
          let code = queryItems.first(where: { $0.name == "code" })?.value else {
        logger.error("Invalid Strava callback: missing required parameters")
        // Post notification of failure
        NotificationCenter.default.post(
            name: .stravaCallbackFailed,
            object: nil,
            userInfo: ["error": "Missing required parameters"]
        )
        return
    }
    
    // Get state parameter (used for CSRF protection)
    let state = queryItems.first(where: { $0.name == "state" })?.value
    
    // Post notification with the auth code
    NotificationCenter.default.post(
        name: .stravaCallbackReceived,
        object: nil,
        userInfo: [
            "code": code,
            "state": state ?? ""
        ]
    )
    
    logger.debug("Dispatched Strava callback notification")
}
```

The implementation looks mostly correct but has a minor enhancement opportunity.

### 3. Notification Names

The notification names are defined in `Utils/NotificationNames.swift`:

```swift
extension Notification.Name {
    static let stravaCallbackReceived = Notification.Name("com.vici.app.stravaCallbackReceived")
    static let stravaCallbackFailed = Notification.Name("com.vici.app.stravaCallbackFailed")
}
```

## Issues and Recommendations

### 1. Info.plist Duplicate Entry

- **Issue**: Duplicate `CFBundleURLTypes` entry in Info.plist
- **Recommendation**: Remove one of the entries to avoid potential conflicts

### 2. AppDelegate URL Handling Enhancement

- **Issue**: The current AppDelegate implementation doesn't include the URL in the notification
- **Recommendation**: Update the callback handler to include the URL in the userInfo dictionary:

```swift
NotificationCenter.default.post(
    name: .stravaCallbackReceived,
    object: nil,
    userInfo: [
        "code": code,
        "state": state ?? "",
        "url": url
    ]
)
```

### 3. URL Format Verification

- **Issue**: No verification of what the actual callback URL will look like
- **Recommendation**: Add documentation/logging for the expected callback URL format:
  - Expected format: `vici://strava-callback?code=<auth_code>&state=<state_token>`
  - The Strava authentication URL should be configured to redirect to this format

## Action Items

1. Fix the duplicate entry in Info.plist
2. Update AppDelegate to include URL in notification
3. Add documentation about the expected callback URL format
4. Test the complete OAuth flow with a real Strava account

## Implementation Plan

### 1. Update Info.plist

Remove the duplicate `CFBundleURLTypes` entry, keeping only:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleTypeRole</key>
        <string>Editor</string>
        <key>CFBundleURLName</key>
        <string>com.vici.app</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>vici</string>
        </array>
    </dict>
</array>
```

### 2. Update AppDelegate.swift

Enhance the callback handler:

```swift
private func handleStravaCallback(url: URL) {
    guard let components = URLComponents(url: url, resolvingAgainstBaseURL: true),
          let queryItems = components.queryItems,
          let code = queryItems.first(where: { $0.name == "code" })?.value else {
        logger.error("Invalid Strava callback: missing required parameters")
        // Post notification of failure with URL included
        NotificationCenter.default.post(
            name: .stravaCallbackFailed,
            object: nil,
            userInfo: [
                "error": "Missing required parameters",
                "url": url
            ]
        )
        return
    }
    
    // Get state parameter (used for CSRF protection)
    let state = queryItems.first(where: { $0.name == "state" })?.value
    
    // Post notification with the auth code and URL
    NotificationCenter.default.post(
        name: .stravaCallbackReceived,
        object: nil,
        userInfo: [
            "code": code,
            "state": state ?? "",
            "url": url
        ]
    )
    
    logger.debug("Dispatched Strava callback notification")
}
```

### 3. Add Documentation

Add comment to StravaService.swift to explain the callback URL format:

```swift
/**
 * When getting the authorization URL from Strava, ensure it's configured to redirect to:
 * vici://strava-callback?code={authorizationCode}&state={stateToken}
 *
 * This URL format is handled by the AppDelegate, which will post a notification with the code and state.
 */
```

### 4. Test Plan

1. Run the app with the updated code
2. Attempt to connect to Strava
3. Verify the authorization URL is correctly formed
4. Complete the OAuth flow and verify the callback is received
5. Check the logs to ensure all steps are working as expected 