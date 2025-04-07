# Monitoring & Debugging Testing Guide

## Prerequisites

### Required Tools
1. [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
2. [Chrome Browser](https://www.google.com/chrome/)
3. [Sentry Account](https://sentry.io) (for error tracking)

## Development Tools Testing

### React Native Debugger
1. **Installation**:
   ```bash
   # For Mac
   brew install --cask react-native-debugger
   ```

2. **Usage**:
   - Start your app in development mode
   - Open React Native Debugger
   - In the app, shake your device or press:
     - iOS: `Command + D`
     - Android: `R + R`
   - Select "Debug" from the menu
   - You should see the debugger connect

3. **Features to Test**:
   - Redux state inspection
   - Network request monitoring
   - Console logs
   - Performance metrics

### Network Inspection
1. **Using Chrome DevTools**:
   - Open Chrome
   - Press `Command + Option + J` (Mac) or `Ctrl + Shift + J` (Windows)
   - Go to the "Network" tab
   - Run your app
   - You'll see all network requests in real-time

2. **What to Look For**:
   - Request/response times
   - Request payloads
   - Response data
   - Error statuses

## Error Tracking Testing

### Error Boundary Testing
1. **Triggering Errors**:
   - Disconnect from the internet
   - Navigate to different screens
   - Try invalid inputs
   - Force API failures

2. **What to Verify**:
   - Error boundary UI appears
   - Error messages are clear
   - Retry functionality works
   - App doesn't crash

### Sentry Error Tracking
1. **Access Sentry Dashboard**:
   - Log in to your Sentry account
   - Navigate to your project
   - Go to "Issues" tab

2. **Verify Error Reports**:
   - Check if errors appear in real-time
   - Verify error details (stack trace, context)
   - Check user information
   - Verify breadcrumbs

## Performance Monitoring Testing

### Performance Monitor UI
1. **Access the Monitor**:
   - Navigate to the Performance Monitor screen
   - You should see real-time metrics

2. **Metrics to Check**:
   - Screen load times
   - API response times
   - Memory usage
   - App uptime

3. **Performance Alerts**:
   - Trigger slow API responses
   - Monitor memory usage
   - Check if alerts appear
   - Verify alert thresholds

## Testing Checklist

### Development Tools
- [ ] React Native Debugger connects successfully
- [ ] Redux state is visible
- [ ] Network requests are logged
- [ ] Console logs are visible

### Error Tracking
- [ ] Error boundary appears on errors
- [ ] Error messages are clear
- [ ] Retry functionality works
- [ ] Errors appear in Sentry
- [ ] Error context is captured
- [ ] User information is included

### Performance Monitoring
- [ ] Performance metrics are visible
- [ ] Metrics update in real-time
- [ ] Alerts trigger correctly
- [ ] Performance reports are generated
- [ ] Memory usage is tracked
- [ ] API response times are logged

## Troubleshooting

### Common Issues
1. **Debugger Not Connecting**:
   - Check if Metro bundler is running
   - Verify app is in development mode
   - Try restarting the debugger

2. **Errors Not Appearing in Sentry**:
   - Check internet connection
   - Verify Sentry DSN is correct
   - Check if Sentry is enabled in current environment

3. **Performance Metrics Not Updating**:
   - Verify monitoring is enabled
   - Check if app is in development mode
   - Restart the performance monitor

## Support
For additional help:
- Check the [React Native Documentation](https://reactnative.dev/docs/debugging)
- Visit the [Sentry Documentation](https://docs.sentry.io/platforms/react-native/)
- Contact the development team 