# Strava Integration Documentation

## Overview

This document outlines the Strava integration for the Vici App. The integration connects users' Strava accounts to Vici, enabling automatic syncing of running activities and profile data. This integration is central to the Vici experience, providing real-world activity data for training plan generation and progress tracking.

Key features include:

1. **OAuth 2.0 Authentication**: Secure connection to users' Strava accounts
2. **Profile Data Import**: Importing athlete data to enhance user profiles
3. **Activity Synchronization**: Importing historical activities and ongoing activity tracking
4. **Webhook Integration**: Real-time updates when users create, modify, or delete activities
5. **Token Management**: Secure handling of access and refresh tokens

## Implementation Details

### Core Components

- **StravaService**: Central service for all Strava API interactions
  - Handles OAuth flow and token management
  - Manages access token refresh
  - Fetches and processes athlete data
  - Syncs activities (historical and real-time)
  - Handles deauthorization events

- **Controllers**:
  - **StravaController**: Manages OAuth flow endpoints (`/connect`, `/callback`)
  - **StravaWebhookController**: Handles webhook verification and event processing

- **Routes**:
  - **Strava Routes**: Routes for OAuth flow
  - **Webhook Routes**: Routes for webhook verification and event handling

### Key Features

#### OAuth 2.0 Authentication Flow

- **Initiation**: User clicks "Connect with Strava" in the Vici app
- **CSRF Protection**: Generates and stores a secure state parameter
- **Authorization**: User is redirected to Strava to authorize Vici
- **Callback Handling**: Process authorization code and exchange for tokens
- **Token Storage**: Securely store access and refresh tokens in the database

#### Token Management

- **Token Storage**: Secure storage in UserConnection table
- **Token Refresh**: Automatic refresh when access tokens expire
- **Validation**: Check for token validity before API calls
- **Revocation Handling**: Clean up connections when users revoke access

#### Activity Synchronization

- **Initial Sync**: Pull user's historical activities after connection
- **Webhook Sync**: Real-time updates for new/changed activities
- **Single Activity Fetch**: Detailed activity data retrieval
- **Activity Mapping**: Convert Strava activity format to Vici's internal format
- **Processing**: Filter non-running activities, handle data cleaning

#### Webhook Implementation

- **Subscription Verification**: Respond to Strava's subscription validation
- **Event Processing**: Handle various events (create, update, delete)
- **Asynchronous Processing**: Process events in the background to avoid blocking
- **Error Handling**: Graceful error handling for webhook event processing

### Security Considerations

- **CSRF Protection**: State parameter validation
- **Token Encryption**: Secure storage of access/refresh tokens
- **Webhook Verification**: Verify webhook requests using challenge-response
- **Minimal Scopes**: Request only necessary Strava API scopes
- **User Authorization**: Verify user ownership before processing data

### Error Handling & Resilience

- **Token Refresh Logic**: Handle expired tokens automatically
- **Retry Mechanism**: Retry API calls on transient failures
- **Rate Limiting**: Respect Strava API rate limits
- **Graceful Degradation**: Handle unavailable services without app failure

### Testing

- **Integration Tests**: Verify correct OAuth flow and webhook handling
- **Mock Responses**: Simulate Strava API responses for testing
- **Error Scenarios**: Test authentication failures, invalid tokens, etc.
- **End-to-End Flow**: Test complete user journey from connection to activity sync

## Usage

### Environment Setup

Ensure the following environment variables are set:
```
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
STRAVA_REDIRECT_URI=your_redirect_uri
STRAVA_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token
```

### OAuth Endpoints

#### Initiate OAuth Flow
```
GET /api/integrations/strava/connect
Authorization: Bearer <user_jwt_token>
```

#### Handle Callback
```
GET /api/integrations/strava/callback?code=<authorization_code>&state=<state>
```

### Webhook Endpoints

#### Verify Subscription
```
GET /api/webhooks/strava?hub.mode=subscribe&hub.verify_token=<token>&hub.challenge=<challenge>
```

#### Receive Events
```
POST /api/webhooks/strava
Content-Type: application/json

{
  "object_type": "activity",
  "object_id": 12345678987654321,
  "aspect_type": "create",
  "owner_id": 134815,
  "event_time": 1516126040
}
```

## Strava API Usage

The integration uses the following Strava API endpoints:

1. **Authentication**:
   - `POST /oauth/token` - Exchange code for tokens / refresh token

2. **Athlete Data**:
   - `GET /api/v3/athlete` - Get authenticated athlete's profile

3. **Activities**:
   - `GET /api/v3/athlete/activities` - List athlete activities
   - `GET /api/v3/activities/{id}` - Get activity details
   - `GET /api/v3/activities/{id}/streams` - Get detailed time-series data

## Webhook Setup

To set up the Strava webhook integration:

1. Create a Strava API application at https://www.strava.com/settings/api
2. Deploy the Vici backend with a publicly accessible URL
3. Register the webhook with Strava:
   ```
   POST https://www.strava.com/api/v3/push_subscriptions
   client_id=<your_client_id>
   client_secret=<your_client_secret>
   callback_url=<your_webhook_url>/api/webhooks/strava
   verify_token=<your_verification_token>
   ```
4. Strava will verify the subscription with a GET request to your callback URL

## Database Schema

The integration uses the following database tables:

- **UserConnection**: Stores connection details, tokens, scopes
- **StravaAuthState**: Temporarily stores state parameter for CSRF protection
- **Activity**: Stores synced activities with source information

## Future Improvements

1. **Enhanced Data Integration**:
   - Import and utilize more detailed metrics (heart rate, power, etc.)
   - Enhance activity type detection and classification

2. **Performance Optimization**:
   - Batch processing for large activity imports
   - Optimize webhook processing with job queues

3. **Feature Expansion**:
   - Support for additional Strava data (routes, segments)
   - Two-way synchronization (plan workouts to Strava)
   - Support for additional fitness platforms (Garmin, etc.)

## Troubleshooting

Common issues and solutions:

1. **Authentication Failures**:
   - Verify client ID and secret are correctly configured
   - Check callback URL matches the registered redirect URI
   - Ensure HTTPS is properly set up for callback URL

2. **Token Refresh Issues**:
   - Check that refresh tokens are being stored correctly
   - Verify refresh token flow logic for proper error handling

3. **Webhook Problems**:
   - Ensure webhook endpoint is publicly accessible
   - Verify webhook subscription is active in Strava API settings
   - Check verification token matches in both systems

4. **Missing Activities**:
   - Verify activity type filtering (only running activities are imported)
   - Check webhook event processing for proper error handling
   - Ensure user has not revoked access 