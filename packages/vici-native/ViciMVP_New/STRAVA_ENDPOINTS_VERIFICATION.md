# Strava API Endpoint Verification

This document compares the actual API endpoints used in the StravaService implementation with the expected endpoints from our integration plan.

## Expected Endpoints

From our Strava Integration Plan, we expect the following endpoints:
- `/strava/connection/{userId}`
- `/strava/auth-url/{userId}`
- `/strava/exchange-token`
- `/strava/activities/{userId}`

## Actual Implementation

From analyzing the StravaService.swift file, the following endpoints are used:

| Method | Expected Endpoint | Actual Endpoint | Status |
|--------|------------------|----------------|--------|
| GET | `/strava/connection/{userId}` | `/strava/connection/{userId}` | ✅ Match |
| GET | `/strava/auth-url/{userId}` | `/strava/auth-url/{userId}` | ✅ Match |
| POST | `/strava/exchange-token` | `/strava/exchange-token` | ✅ Match |
| GET | `/strava/activities/{userId}` | `/strava/activities/{userId}` | ✅ Match |
| DELETE | N/A (Not specified in plan) | `/strava/connection/{userId}` | ✅ Valid |

## Additional Observations

1. **Base URL Configuration**: 
   ```swift
   private struct Constants {
       static let baseURL = "https://api.vici.app"
       static let stravaEndpoint = "/api/v1/strava"
   }
   ```
   The base URL is defined as "https://api.vici.app" with a stravaEndpoint prefix of "/api/v1/strava", but these don't appear to be used when constructing the actual endpoints.

2. **Endpoint Usage**:
   - In the implementation, endpoints are directly passed to the apiClient without using the Constants values.
   - Example: `endpoint: "/strava/connection/\(userId)"` instead of using `Constants.stravaEndpoint + "/connection/\(userId)"`

3. **Parameters**:
   - Activity fetching includes a "limit" parameter: `parameters: ["limit": limit]`
   - Token exchange includes userId, code, and state parameters

## Issues and Recommendations

1. **Inconsistent Base URL Usage**:
   - **Issue**: Constants are defined but not used in the endpoint construction
   - **Recommendation**: Either remove the unused Constants or update the code to use them consistently

2. **Path Prefix Missing**:
   - **Issue**: The defined stravaEndpoint prefix "/api/v1/strava" is not used, but endpoints use "/strava/..." directly
   - **Recommendation**: Update endpoints to match the expected API structure:
     ```swift
     // From:
     endpoint: "/strava/connection/\(userId)"
     
     // To either:
     endpoint: "\(Constants.stravaEndpoint)/connection/\(userId)" 
     
     // Or update Constants.stravaEndpoint to "/strava"
     ```

## Conclusion

The actual endpoints used in the code match the expected endpoints from our plan. However, there's inconsistency in how the base URL and API path prefix are handled.

### Action Items

1. Update the code to use the Constants values consistently
2. Confirm with backend team that the endpoint prefix is "/strava" not "/api/v1/strava"
3. Add a comment explaining the disconnect URL endpoint (since it wasn't explicitly mentioned in our plan) 