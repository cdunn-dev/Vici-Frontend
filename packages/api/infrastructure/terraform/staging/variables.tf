variable "aws_region" {
  description = "The AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "db_username" {
  description = "Username for the RDS PostgreSQL instance"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Password for the RDS PostgreSQL instance"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "Secret key for JWT token generation and validation"
  type        = string
  sensitive   = true
}

variable "gemini_api_key" {
  description = "Google Gemini API key for LLM integration"
  type        = string
  sensitive   = true
}

variable "strava_client_id" {
  description = "Strava API client ID"
  type        = string
  sensitive   = true
}

variable "strava_client_secret" {
  description = "Strava API client secret"
  type        = string
  sensitive   = true
}

variable "strava_webhook_verify_token" {
  description = "Verification token for Strava webhooks"
  type        = string
  sensitive   = true
}

variable "ecr_repository_url" {
  description = "URL of the ECR repository for container images"
  type        = string
}

variable "acm_certificate_arn" {
  description = "ARN of the ACM certificate for HTTPS"
  type        = string
}

variable "route53_zone_id" {
  description = "Route 53 hosted zone ID for DNS records"
  type        = string
}

variable "sns_alarm_topic_arn" {
  description = "ARN of the SNS topic for CloudWatch alarms"
  type        = string
} 