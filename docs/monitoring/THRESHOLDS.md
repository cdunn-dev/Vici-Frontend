# Monitoring Thresholds and Alerts

This document outlines the monitoring thresholds and alert configurations used in the Vici monitoring system.

## Alert Severity Levels

The monitoring system uses four severity levels for alerts:

1. **Info** (Low Priority)
   - Informational alerts that don't require immediate action
   - Example: System startup, configuration changes
   - Default throttle period: 1 hour

2. **Warning** (Medium Priority)
   - Potential issues that should be investigated
   - Example: High resource usage, slow response times
   - Default throttle period: 30 minutes

3. **Error** (High Priority)
   - Issues that require prompt attention
   - Example: Service failures, database errors
   - Default throttle period: 15 minutes

4. **Critical** (Highest Priority)
   - Severe issues that require immediate action
   - Example: System outages, data loss risk
   - Default throttle period: 5 minutes

## Resource Thresholds

### System Resources

1. **CPU Usage**
   - Warning: > 70%
   - Error: > 85%
   - Critical: > 95%
   - Measurement interval: 1 minute
   - Consecutive measurements: 3

2. **Memory Usage**
   - Warning: > 75%
   - Error: > 85%
   - Critical: > 95%
   - Measurement interval: 1 minute
   - Consecutive measurements: 3

3. **Disk Space**
   - Warning: > 75%
   - Error: > 85%
   - Critical: > 95%
   - Measurement interval: 5 minutes

### Database Metrics

1. **Connection Pool**
   - Warning: > 75% utilization
   - Error: > 85% utilization
   - Critical: > 95% utilization
   - Measurement interval: 30 seconds

2. **Query Response Time**
   - Warning: > 500ms (p95)
   - Error: > 1000ms (p95)
   - Critical: > 2000ms (p95)
   - Measurement interval: 1 minute

3. **Active Transactions**
   - Warning: > 75% of max connections
   - Error: > 85% of max connections
   - Critical: > 95% of max connections
   - Measurement interval: 30 seconds

### Redis Metrics

1. **Memory Usage**
   - Warning: > 75% of maxmemory
   - Error: > 85% of maxmemory
   - Critical: > 95% of maxmemory
   - Measurement interval: 1 minute

2. **Cache Hit Rate**
   - Warning: < 80%
   - Error: < 70%
   - Critical: < 50%
   - Measurement interval: 5 minutes

3. **Connected Clients**
   - Warning: > 75% of maxclients
   - Error: > 85% of maxclients
   - Critical: > 95% of maxclients
   - Measurement interval: 1 minute

### Sharding Metrics

1. **Shard Response Time**
   - Warning: > 100ms
   - Error: > 200ms
   - Critical: > 500ms
   - Measurement interval: 1 minute

2. **Shard Load Balance**
   - Warning: > 20% deviation from mean
   - Error: > 30% deviation from mean
   - Critical: > 50% deviation from mean
   - Measurement interval: 5 minutes

## Alert Throttling

Alert throttling prevents alert fatigue by limiting the frequency of repeated alerts:

1. **Throttle Periods**
   - Info: 60 minutes
   - Warning: 30 minutes
   - Error: 15 minutes
   - Critical: 5 minutes

2. **Throttle Rules**
   - Alerts are throttled based on:
     - Alert ID (unique identifier)
     - Severity level
     - Source component
   - Higher severity alerts override lower severity throttles
   - Critical alerts are never throttled for the same incident

## Alert Channels

Alerts are sent through multiple channels based on severity:

1. **Info**
   - Logged to monitoring dashboard
   - Stored in metrics database

2. **Warning**
   - All Info channels
   - Email notifications
   - Slack channel notifications

3. **Error**
   - All Warning channels
   - SMS notifications to on-call team
   - Incident tracking system

4. **Critical**
   - All Error channels
   - Phone calls to on-call team
   - Emergency response team notification

## Monitoring Dashboard

The monitoring dashboard provides:

1. **Real-time Metrics**
   - System resource usage
   - Database performance
   - Redis metrics
   - Sharding status

2. **Alert History**
   - Historical alert data
   - Trend analysis
   - Resolution tracking
   - Alert patterns

3. **Performance Graphs**
   - Resource utilization trends
   - Response time graphs
   - Error rate tracking
   - Capacity planning data

## Configuration

Thresholds can be configured in the monitoring system configuration:

```typescript
export const monitoringConfig = {
  thresholds: {
    cpu: {
      warning: 70,
      error: 85,
      critical: 95
    },
    memory: {
      warning: 75,
      error: 85,
      critical: 95
    },
    // ... other thresholds
  },
  alertThrottling: {
    info: 3600000, // 1 hour in ms
    warning: 1800000, // 30 minutes in ms
    error: 900000, // 15 minutes in ms
    critical: 300000 // 5 minutes in ms
  }
};
``` 