# Vici-V1 Deployment Guide

This guide provides detailed instructions for deploying the Vici-V1 application in a Kubernetes environment.

## Table of Contents

1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Deployment Steps](#deployment-steps)
5. [Verification Steps](#verification-steps)
6. [Troubleshooting](#troubleshooting)
7. [Maintenance](#maintenance)
8. [Rollback Procedures](#rollback-procedures)
9. [Deployment Checklist](#deployment-checklist)
10. [Security Considerations](#security-considerations)
11. [Glossary](#glossary)
12. [Conclusion](#conclusion)

## Introduction

### What is Vici-V1?

Vici-V1 is a modern web application that provides [brief description of what the application does]. This guide will walk you through the process of deploying Vici-V1 in a Kubernetes environment.

### Deployment Architecture

The Vici-V1 application consists of the following components:

- **Frontend**: The user interface of the application
- **API**: The backend service that handles business logic
- **Database**: PostgreSQL database for persistent data storage
- **Cache**: Redis for caching and session management
- **Monitoring**: Prometheus and Grafana for metrics and visualization
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana) for log aggregation
- **Backup**: Automated backup system for data protection

### Deployment Environments

This guide covers deployment for the following environments:

- **Development**: For local development and testing
- **Staging**: For pre-production testing
- **Production**: For the live application

## Prerequisites

Before deploying the Vici-V1 application, ensure you have the following:

1. **Kubernetes Cluster**
   - Kubernetes v1.20 or higher
   - kubectl v1.20 or higher
   - Helm v3.0 or higher (optional, for package management)

2. **Required Tools**
   - Docker for local development
   - kubectl configured with cluster access
   - kustomize v4.0 or higher
   - git for version control

3. **Infrastructure Requirements**
   - Persistent storage for databases
   - Load balancer or ingress controller
   - DNS configuration
   - SSL certificates

4. **Access and Permissions**
   - Cluster admin access
   - Namespace creation permissions
   - Storage class access
   - Secret management permissions

5. **Resource Requirements**
   - Minimum cluster size: 4 CPU cores, 8GB RAM
   - Recommended cluster size: 8 CPU cores, 16GB RAM
   - Storage: 50GB minimum for databases and logs

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/vici-v1.git
cd vici-v1
```

### 2. Configure kubectl

Ensure your kubectl is configured to access your target cluster:

```bash
# List available contexts
kubectl config get-contexts

# Switch to the desired context
kubectl config use-context your-cluster-context

# Verify the connection
kubectl cluster-info
```

### 3. Create Namespace

```bash
# Create a new namespace
kubectl create namespace vici

# Set the current context to use the new namespace
kubectl config set-context --current --namespace=vici

# Verify the namespace was created
kubectl get namespace
```

### 4. Set Up Secrets

Create the required secrets for the application:

```bash
# Create a secret for database credentials
kubectl create secret generic db-credentials \
  --from-literal=username=vici \
  --from-literal=password=your-secure-password

# Create a secret for Redis
kubectl create secret generic redis-credentials \
  --from-literal=password=your-redis-password

# Create a secret for API keys
kubectl create secret generic api-keys \
  --from-literal=api-key=your-api-key

# Create a secret for Grafana
kubectl create secret generic grafana-admin \
  --from-literal=admin-user=admin \
  --from-literal=admin-password=your-grafana-password

# Verify secrets were created
kubectl get secrets
```

### 5. Configure Environment Variables

For different deployment environments, you may need to set different environment variables:

```bash
# For development environment
export ENVIRONMENT=development
export DOMAIN=dev.vici.example.com

# For staging environment
export ENVIRONMENT=staging
export DOMAIN=staging.vici.example.com

# For production environment
export ENVIRONMENT=production
export DOMAIN=vici.example.com
```

## Deployment Steps

### 1. Deploy Core Infrastructure

First, deploy the core infrastructure components:

```bash
# Apply the base configuration
kubectl apply -k k8s/base

# Verify the deployments
kubectl get deployments
kubectl get services
kubectl get pods
```

### 2. Deploy Monitoring Stack

Deploy the monitoring components:

```bash
# Apply monitoring configurations
kubectl apply -k k8s/base/monitoring

# Verify monitoring deployments
kubectl get deployments -l app=prometheus
kubectl get deployments -l app=grafana
```

### 3. Deploy Logging Stack

Deploy the logging components:

```bash
# Apply logging configurations
kubectl apply -k k8s/base/logging

# Verify logging deployments
kubectl get deployments -l app=elasticsearch
kubectl get deployments -l app=logstash
kubectl get deployments -l app=kibana
```

### 4. Deploy Application

Deploy the main application components:

```bash
# Apply application configurations
kubectl apply -k k8s/base

# Verify application deployments
kubectl get deployments -l app=vici-api
kubectl get deployments -l app=vici-frontend
```

### 5. Deploy Security Configurations

Apply the security configurations:

```bash
# Apply security configurations
kubectl apply -k k8s/base/security

# Verify security configurations
kubectl get networkpolicies
kubectl get resourcequotas
kubectl get podsecuritypolicies
```

### 6. Deploy Autoscaling

Apply the autoscaling configurations:

```bash
# Apply autoscaling configurations
kubectl apply -k k8s/base/autoscaling

# Verify autoscaling configurations
kubectl get hpa
```

### 7. Configure Ingress

Set up the ingress for external access:

```bash
# Apply ingress configuration
kubectl apply -f k8s/base/ingress.yaml

# Verify ingress configuration
kubectl get ingress
```

## Verification Steps

After deployment, verify that all components are functioning correctly:

### 1. Check Pod Status

```bash
# Check all pods
kubectl get pods

# Check pods with more details
kubectl get pods -o wide

# Check pod logs if needed
kubectl logs <pod-name>
```

All pods should be in the `Running` state.

### 2. Check Service Status

```bash
# Check all services
kubectl get services

# Check service details
kubectl describe service <service-name>
```

All services should be properly assigned external IPs or cluster IPs.

### 3. Check Ingress Status

```bash
# Check ingress configuration
kubectl get ingress

# Check ingress details
kubectl describe ingress vici-ingress
```

The ingress should be properly configured with the correct host and TLS settings.

### 4. Verify Database Connection

```bash
# Check database pod logs
kubectl logs -l app=vici-postgres

# Check database connection from API
kubectl exec -it $(kubectl get pod -l app=vici-api -o jsonpath='{.items[0].metadata.name}') -- curl -s http://localhost:8080/health
```

### 5. Verify Redis Connection

```bash
# Check Redis pod logs
kubectl logs -l app=vici-redis

# Check Redis connection from API
kubectl exec -it $(kubectl get pod -l app=vici-api -o jsonpath='{.items[0].metadata.name}') -- redis-cli -h vici-redis ping
```

### 6. Verify Monitoring

```bash
# Port forward to Prometheus
kubectl port-forward svc/prometheus 9090:9090

# Port forward to Grafana
kubectl port-forward svc/grafana 3000:3000
```

Access Prometheus at http://localhost:9090 and Grafana at http://localhost:3000.

### 7. Verify Logging

```bash
# Port forward to Kibana
kubectl port-forward svc/kibana 5601:5601
```

Access Kibana at http://localhost:5601.

### 8. Verify Application Functionality

```bash
# Get the application URL
export APP_URL=$(kubectl get ingress vici-ingress -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Test the API
curl -s https://$APP_URL/api/health

# Test the frontend
curl -s https://$APP_URL
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Pods Not Starting

**Issue**: Pods are stuck in `Pending` state.

**Solution**:
```bash
# Check pod details
kubectl describe pod <pod-name>

# Check for resource constraints
kubectl describe nodes
kubectl top nodes
```

#### 2. Database Connection Issues

**Issue**: API cannot connect to the database.

**Solution**:
```bash
# Check database pod status
kubectl get pods -l app=vici-postgres

# Check database logs
kubectl logs -l app=vici-postgres

# Verify database service
kubectl get svc vici-postgres
```

#### 3. Redis Connection Issues

**Issue**: API cannot connect to Redis.

**Solution**:
```bash
# Check Redis pod status
kubectl get pods -l app=vici-redis

# Check Redis logs
kubectl logs -l app=vici-redis

# Verify Redis service
kubectl get svc vici-redis
```

#### 4. Ingress Not Working

**Issue**: Ingress is not routing traffic correctly.

**Solution**:
```bash
# Check ingress status
kubectl describe ingress vici-ingress

# Check ingress controller logs
kubectl logs -l app=ingress-nginx -n ingress-nginx
```

#### 5. Persistent Volume Issues

**Issue**: Pods cannot mount persistent volumes.

**Solution**:
```bash
# Check persistent volume claims
kubectl get pvc

# Check persistent volumes
kubectl get pv

# Check storage class
kubectl get storageclass
```

#### 6. Resource Quota Exceeded

**Issue**: Deployments fail due to resource quota limits.

**Solution**:
```bash
# Check resource quotas
kubectl get resourcequota

# Check resource usage
kubectl describe resourcequota vici-quota

# Check node resources
kubectl describe nodes
```

### Debugging Tools

#### 1. kubectl describe

Use `kubectl describe` to get detailed information about a resource:

```bash
# Describe a pod
kubectl describe pod <pod-name>

# Describe a service
kubectl describe service <service-name>

# Describe a deployment
kubectl describe deployment <deployment-name>
```

#### 2. kubectl logs

Use `kubectl logs` to view container logs:

```bash
# View logs for a pod
kubectl logs <pod-name>

# View logs for a specific container
kubectl logs <pod-name> -c <container-name>

# Follow logs in real-time
kubectl logs -f <pod-name>
```

#### 3. kubectl exec

Use `kubectl exec` to run commands inside a container:

```bash
# Run a command in a pod
kubectl exec -it <pod-name> -- <command>

# Run a command in a specific container
kubectl exec -it <pod-name> -c <container-name> -- <command>
```

## Maintenance

### 1. Updating the Application

To update the application to a new version:

```bash
# Update the image tag in the deployment
kubectl set image deployment/vici-api vici-api=your-registry/vici-api:new-tag
kubectl set image deployment/vici-frontend vici-frontend=your-registry/vici-frontend:new-tag

# Monitor the rollout
kubectl rollout status deployment/vici-api
kubectl rollout status deployment/vici-frontend
```

### 2. Scaling the Application

To manually scale the application:

```bash
# Scale the API
kubectl scale deployment vici-api --replicas=5

# Scale the frontend
kubectl scale deployment vici-frontend --replicas=5
```

### 3. Backing Up Data

To manually trigger a backup:

```bash
# Create a backup job
kubectl create job --from=cronjob/vici-backup manual-backup-$(date +%s)
```

### 4. Restoring Data

To restore from a backup:

```bash
# List available backups
kubectl exec -it $(kubectl get pod -l app=vici-backup -o jsonpath='{.items[0].metadata.name}') -- ls -l /backups

# Restore from a backup
kubectl exec -it $(kubectl get pod -l app=vici-backup -o jsonpath='{.items[0].metadata.name}') -- ./restore.sh /backups/backup-file.tar.gz
```

### 5. Rotating Certificates

To rotate TLS certificates:

```bash
# Update the TLS secret
kubectl create secret tls vici-tls \
  --cert=path/to/new/cert.pem \
  --key=path/to/new/key.pem \
  --dry-run=client -o yaml | kubectl apply -f -

# Restart the ingress controller to pick up the new certificate
kubectl rollout restart deployment -n ingress-nginx ingress-nginx-controller
```

### 6. Updating Kubernetes Resources

To update Kubernetes resources:

```bash
# Apply updated configurations
kubectl apply -k k8s/base

# Verify the changes
kubectl get deployments
kubectl get services
kubectl get configmaps
```

## Rollback Procedures

### 1. Rolling Back a Deployment

If a deployment causes issues, you can roll it back:

```bash
# Roll back the API deployment
kubectl rollout undo deployment/vici-api

# Roll back the frontend deployment
kubectl rollout undo deployment/vici-frontend
```

### 2. Rolling Back to a Specific Revision

To roll back to a specific revision:

```bash
# List deployment revisions
kubectl rollout history deployment/vici-api

# Roll back to a specific revision
kubectl rollout undo deployment/vici-api --to-revision=2
```

### 3. Emergency Rollback

In case of critical issues, you can perform an emergency rollback:

```bash
# Delete the problematic deployment
kubectl delete deployment vici-api

# Reapply the previous version
kubectl apply -f k8s/base/previous-version/api-deployment.yaml
```

## Deployment Checklist

Before deploying to production, ensure you have completed the following:

- [ ] All tests are passing
- [ ] Security scans are completed
- [ ] Performance tests are completed
- [ ] Backup procedures are tested
- [ ] Rollback procedures are tested
- [ ] Monitoring is configured
- [ ] Alerts are configured
- [ ] Documentation is updated
- [ ] Stakeholders are notified
- [ ] Load testing is performed
- [ ] Disaster recovery plan is reviewed
- [ ] Compliance requirements are met
- [ ] Access controls are verified
- [ ] SSL certificates are valid
- [ ] DNS records are updated

## Security Considerations

### 1. Secret Management

Ensure all secrets are properly managed:

```bash
# Rotate database credentials
kubectl create secret generic db-credentials \
  --from-literal=username=vici \
  --from-literal=password=new-secure-password \
  --dry-run=client -o yaml | kubectl apply -f -

# Update the deployment to use the new secret
kubectl rollout restart deployment/vici-api
```

### 2. Network Policies

Verify that network policies are properly configured:

```bash
# Check network policies
kubectl get networkpolicies

# Test network isolation
kubectl exec -it $(kubectl get pod -l app=vici-frontend -o jsonpath='{.items[0].metadata.name}') -- curl -s http://vici-postgres:5432
```

### 3. Pod Security Policies

Ensure pod security policies are enforced:

```bash
# Check pod security policies
kubectl get psp

# Verify pods are running with the correct security context
kubectl get pod -o yaml | grep securityContext
```

### 4. Regular Security Audits

Perform regular security audits:

```bash
# Check for privileged containers
kubectl get pods -o yaml | grep privileged

# Check for containers running as root
kubectl get pods -o yaml | grep runAsUser

# Check for exposed sensitive information
kubectl get configmaps -o yaml | grep -i password
kubectl get secrets -o yaml | grep -i password
```

## Glossary

- **Kubernetes**: An open-source container orchestration platform
- **Pod**: The smallest deployable unit in Kubernetes
- **Deployment**: A Kubernetes resource that manages multiple identical pods
- **Service**: A Kubernetes resource that provides a stable endpoint for pods
- **Ingress**: A Kubernetes resource that manages external access to services
- **ConfigMap**: A Kubernetes resource for storing non-confidential data
- **Secret**: A Kubernetes resource for storing confidential data
- **PersistentVolume**: A Kubernetes resource for persistent storage
- **PersistentVolumeClaim**: A request for storage by a user
- **HorizontalPodAutoscaler**: A Kubernetes resource for automatically scaling pods
- **NetworkPolicy**: A Kubernetes resource for controlling pod-to-pod communication
- **PodSecurityPolicy**: A Kubernetes resource for controlling security-sensitive aspects of pod specification
- **RBAC**: Role-Based Access Control, a method of regulating access to resources
- **ELK Stack**: Elasticsearch, Logstash, and Kibana, used for log aggregation and analysis
- **Prometheus**: An open-source monitoring and alerting toolkit
- **Grafana**: An open-source platform for monitoring and observability

## Conclusion

This deployment guide provides a comprehensive overview of the deployment process for the Vici-V1 application. Follow these steps to ensure a smooth deployment and maintenance of the application in your Kubernetes environment.

For additional information, refer to the following documentation:
- [Performance Tuning Guide](performance-tuning.md)
- [Capacity Planning Guide](capacity-planning.md)
- [Incident Response Playbook](incident-response.md)
- [Cost Optimization Guide](cost-optimization.md)

## Support

If you encounter any issues during deployment, please contact the DevOps team at devops@example.com or create an issue in the project repository. 