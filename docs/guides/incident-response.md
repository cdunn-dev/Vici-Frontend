# Vici-V1 Incident Response Playbook

This guide provides a structured approach to handling incidents in the Vici-V1 application.

## Incident Response Process

### 1. Detection and Classification

1. **Alert Sources**
   - Prometheus alerts
   - Grafana dashboards
   - ELK Stack logs
   - User reports
   - Health checks

2. **Severity Levels**
   - P0: Critical - Service completely down
   - P1: High - Major functionality affected
   - P2: Medium - Minor functionality affected
   - P3: Low - Cosmetic or minor issues

### 2. Initial Response

1. **First Responder Actions**
   - Acknowledge the incident
   - Gather initial information
   - Classify severity
   - Notify relevant team members
   - Create incident ticket

2. **Communication Channels**
   - Slack: #incidents channel
   - Email: incidents@vici.com
   - PagerDuty: On-call rotation
   - Status page: status.vici.com

## Common Incidents and Responses

### 1. High Error Rate

1. **Symptoms**
   - Error rate >5%
   - Increased response times
   - User complaints
   - Failed health checks

2. **Response Steps**
   ```bash
   # 1. Check error logs
   kubectl logs -l app=vici-api --tail=1000 | grep ERROR

   # 2. Check service health
   kubectl get pods -l app=vici-api
   kubectl describe pod <pod-name>

   # 3. Check resource usage
   kubectl top pods -l app=vici-api

   # 4. Check recent deployments
   kubectl get deployments -l app=vici-api
   ```

3. **Recovery Actions**
   - Roll back recent deployments if needed
   - Scale up resources if constrained
   - Check dependent services
   - Review error patterns

### 2. Database Issues

1. **Symptoms**
   - High latency
   - Connection errors
   - Query timeouts
   - Replication lag

2. **Response Steps**
   ```bash
   # 1. Check database status
   kubectl exec -it <postgres-pod> -- psql -U postgres -c "SELECT * FROM pg_stat_activity;"

   # 2. Check replication status
   kubectl exec -it <postgres-pod> -- psql -U postgres -c "SELECT * FROM pg_stat_replication;"

   # 3. Check disk space
   kubectl exec -it <postgres-pod> -- df -h

   # 4. Check slow queries
   kubectl exec -it <postgres-pod> -- psql -U postgres -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
   ```

3. **Recovery Actions**
   - Restart database if needed
   - Optimize slow queries
   - Scale resources if needed
   - Check backup status

### 3. Cache Issues

1. **Symptoms**
   - High cache miss rate
   - Redis errors
   - Slow response times
   - Memory warnings

2. **Response Steps**
   ```bash
   # 1. Check Redis status
   kubectl exec -it <redis-pod> -- redis-cli info

   # 2. Check memory usage
   kubectl exec -it <redis-pod> -- redis-cli info memory

   # 3. Check connected clients
   kubectl exec -it <redis-pod> -- redis-cli client list

   # 4. Check slow commands
   kubectl exec -it <redis-pod> -- redis-cli slowlog get 10
   ```

3. **Recovery Actions**
   - Clear cache if corrupted
   - Scale Redis if needed
   - Check memory limits
   - Review cache patterns

### 4. Scaling Issues

1. **Symptoms**
   - HPA not scaling
   - Resource constraints
   - Pod pending
   - Node pressure

2. **Response Steps**
   ```bash
   # 1. Check HPA status
   kubectl get hpa
   kubectl describe hpa <hpa-name>

   # 2. Check node resources
   kubectl describe nodes
   kubectl top nodes

   # 3. Check pod status
   kubectl get pods -o wide
   kubectl describe pod <pod-name>

   # 4. Check events
   kubectl get events --sort-by='.lastTimestamp'
   ```

3. **Recovery Actions**
   - Adjust HPA settings
   - Scale node pool
   - Review resource requests
   - Check node health

## Post-Incident Process

### 1. Incident Review

1. **Documentation**
   - Incident timeline
   - Root cause analysis
   - Actions taken
   - Resolution steps

2. **Follow-up Actions**
   - Create tickets for improvements
   - Update monitoring
   - Review procedures
   - Update documentation

### 2. Prevention Measures

1. **Short-term**
   - Fix immediate issues
   - Add monitoring
   - Update procedures
   - Train team members

2. **Long-term**
   - Architecture improvements
   - Automation
   - Testing improvements
   - Documentation updates

## Emergency Contacts

### 1. Primary Contacts

1. **Technical Lead**
   - Name: [Name]
   - Phone: [Phone]
   - Email: [Email]
   - Slack: @[username]

2. **DevOps Engineer**
   - Name: [Name]
   - Phone: [Phone]
   - Email: [Email]
   - Slack: @[username]

### 2. Escalation Path

1. **Level 1**
   - On-call engineer
   - Technical lead
   - DevOps engineer

2. **Level 2**
   - CTO
   - VP of Engineering
   - Security team

3. **Level 3**
   - CEO
   - Board of Directors
   - External consultants

## Tools and Resources

### 1. Monitoring Tools

1. **Metrics**
   - Prometheus
   - Grafana
   - Custom dashboards
   - Alert rules

2. **Logging**
   - ELK Stack
   - Log aggregation
   - Log analysis
   - Alert rules

### 2. Management Tools

1. **Incident Management**
   - Jira
   - PagerDuty
   - Status page
   - Communication tools

2. **Documentation**
   - Confluence
   - Runbooks
   - Architecture docs
   - Troubleshooting guides

## Recovery Procedures

### 1. Service Recovery

1. **API Service**
   ```bash
   # 1. Check service status
   kubectl get deployment vici-api
   kubectl describe deployment vici-api

   # 2. Roll back if needed
   kubectl rollout undo deployment/vici-api

   # 3. Scale if needed
   kubectl scale deployment vici-api --replicas=3

   # 4. Verify recovery
   kubectl get pods -l app=vici-api
   ```

2. **Database Recovery**
   ```bash
   # 1. Check backup status
   kubectl exec -it <postgres-pod> -- pg_basebackup -D /backup

   # 2. Restore if needed
   kubectl exec -it <postgres-pod> -- pg_restore -d vici /backup/latest.dump

   # 3. Verify data
   kubectl exec -it <postgres-pod> -- psql -U postgres -c "SELECT count(*) FROM users;"
   ```

### 2. Data Recovery

1. **Backup Restoration**
   ```bash
   # 1. List available backups
   kubectl exec -it <backup-pod> -- ls -l /backups

   # 2. Restore backup
   kubectl exec -it <backup-pod> -- ./restore.sh latest_backup.tar.gz

   # 3. Verify restoration
   kubectl exec -it <postgres-pod> -- psql -U postgres -c "SELECT count(*) FROM users;"
   ```

2. **Data Validation**
   ```bash
   # 1. Check data integrity
   kubectl exec -it <postgres-pod> -- psql -U postgres -c "VACUUM ANALYZE;"

   # 2. Verify indexes
   kubectl exec -it <postgres-pod> -- psql -U postgres -c "REINDEX DATABASE vici;"

   # 3. Check constraints
   kubectl exec -it <postgres-pod> -- psql -U postgres -c "SELECT * FROM pg_constraint;"
   ``` 