# Vici API - Deployment Setup Guide

This document provides detailed instructions for setting up the deployment infrastructure for the Vici API in both staging and production environments.

## Prerequisites

- AWS Account with administrative access
- AWS CLI installed and configured
- Terraform v1.2.9 or higher
- GitHub access to configure secrets and actions

## AWS Resources Overview

The Vici API deployment infrastructure includes the following AWS resources:

- **VPC**: Isolated network for all resources
- **RDS PostgreSQL**: Database for storing application data
- **ECS Fargate**: Container orchestration for running the API
- **ECR**: Repository for storing Docker images
- **CloudFront**: CDN for API caching and SSL termination
- **Route 53**: DNS management
- **S3**: Object storage for file uploads and Terraform state
- **CloudWatch**: Monitoring and alerting
- **IAM**: Access management for services and users

## Initial Setup

### 1. Create S3 Bucket for Terraform State

```bash
aws s3 mb s3://vici-terraform-state --region us-east-1
aws s3api put-bucket-versioning --bucket vici-terraform-state --versioning-configuration Status=Enabled
```

### 2. Create ECR Repository

```bash
aws ecr create-repository --repository-name vici-api --region us-east-1
```

Note the repository URI for later use.

### 3. Create ACM Certificate

Use the AWS Certificate Manager to request a certificate for:
- `api-staging.vici.app`
- `api.vici.app`

Note the ARN of the certificate for later use.

### 4. Create Route 53 Hosted Zone

If you don't already have a hosted zone for `vici.app`, create one:

```bash
aws route53 create-hosted-zone --name vici.app --caller-reference $(date +%s)
```

Note the Zone ID for later use.

### 5. Create SNS Topic for Alarms

```bash
aws sns create-topic --name vici-alerts --region us-east-1
aws sns subscribe --topic-arn arn:aws:sns:us-east-1:ACCOUNT_ID:vici-alerts --protocol email --notification-endpoint alerts@vici.app
```

Note the Topic ARN for later use.

## GitHub Secrets

Add the following secrets to your GitHub repository for CI/CD:

### AWS Credentials

- `AWS_ACCESS_KEY_ID`: AWS access key with permissions to deploy resources
- `AWS_SECRET_ACCESS_KEY`: Corresponding secret key

### Terraform Variables

- `TF_VAR_DB_USERNAME`: Database username (e.g., vici_admin)
- `TF_VAR_DB_PASSWORD`: Secure database password
- `TF_VAR_JWT_SECRET`: Secure random string for JWT token generation
- `TF_VAR_GEMINI_API_KEY`: Google Gemini API key
- `TF_VAR_STRAVA_CLIENT_ID`: Strava API client ID
- `TF_VAR_STRAVA_CLIENT_SECRET`: Strava API client secret
- `TF_VAR_STRAVA_WEBHOOK_VERIFY_TOKEN`: Secure random string for Strava webhook verification
- `TF_VAR_ACM_CERTIFICATE_ARN`: ARN of the ACM certificate
- `TF_VAR_ROUTE53_ZONE_ID`: ID of the Route 53 hosted zone
- `TF_VAR_SNS_ALARM_TOPIC_ARN`: ARN of the SNS topic for alarms

### Database URLs

- `STAGING_DATABASE_URL`: Full connection string for the staging database
- `PRODUCTION_DATABASE_URL`: Full connection string for the production database

### Notifications

- `SLACK_WEBHOOK_URL`: Webhook URL for Slack notifications

## Manual Deployment

While CI/CD is recommended, you can also deploy manually:

### Deploy Staging Environment

```bash
cd packages/api/infrastructure/terraform/staging
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

### Deploy Production Environment

```bash
cd packages/api/infrastructure/terraform/production
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

## Post-Deployment Configuration

### 1. Update DNS Records

Verify that Route 53 records have been created for:
- `api-staging.vici.app` -> CloudFront distribution
- `api.vici.app` -> CloudFront distribution

### 2. Configure Strava Webhook

After deployment, register the Strava webhook:

```bash
curl -X POST https://www.strava.com/api/v3/push_subscriptions \
  -F client_id=YOUR_STRAVA_CLIENT_ID \
  -F client_secret=YOUR_STRAVA_CLIENT_SECRET \
  -F callback_url=https://api.vici.app/api/webhooks/strava \
  -F verify_token=YOUR_STRAVA_WEBHOOK_VERIFY_TOKEN
```

### 3. Set Up Monitoring

1. Verify that CloudWatch alarms are active
2. Test SNS notifications by triggering an alarm
3. Monitor initial logs for any startup issues

## Security Considerations

- Database is deployed in a private subnet and not accessible from the internet
- API access is controlled through JWT authentication
- All traffic is encrypted using HTTPS
- Credentials are stored as GitHub secrets and not in the repository
- IAM roles use the principle of least privilege

## Troubleshooting

### Common Issues

1. **Database Connection Issues**:
   - Check security group rules
   - Verify database credentials
   - Check VPC endpoint configuration

2. **Container Deployment Issues**:
   - Check ECS service logs in CloudWatch
   - Verify task definition and container configuration
   - Check IAM roles and permissions

3. **DNS Resolution Issues**:
   - Verify Route 53 record configuration
   - Check CloudFront distribution settings
   - Allow time for DNS propagation (up to 48 hours)

### Logs and Monitoring

- ECS task logs are available in CloudWatch Logs
- CloudWatch metrics track API performance and availability
- CloudWatch alarms notify on critical issues

## Scaling Considerations

- RDS can be scaled by changing the instance class
- ECS service can be scaled by adjusting the desired count
- Auto-scaling is configured based on CPU and memory usage

## Maintenance

### Database Backups

Automated backups are configured for both staging and production databases:
- Staging: 7-day retention
- Production: 30-day retention

### Infrastructure Updates

To update infrastructure:

1. Modify Terraform configuration
2. Run `terraform plan` to verify changes
3. Apply changes through CI/CD or manually with `terraform apply` 