terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
  
  backend "s3" {
    bucket = "vici-terraform-state"
    key    = "vici-staging/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project     = "Vici"
      Environment = "Staging"
      ManagedBy   = "Terraform"
    }
  }
}

# VPC Configuration
module "vpc" {
  source = "../modules/vpc"
  
  name                 = "vici-staging-vpc"
  cidr                 = "10.0.0.0/16"
  azs                  = ["${var.aws_region}a", "${var.aws_region}b"]
  private_subnets      = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets       = ["10.0.101.0/24", "10.0.102.0/24"]
  enable_nat_gateway   = true
  single_nat_gateway   = true
  enable_dns_hostnames = true
}

# Database Configuration
module "rds" {
  source = "../modules/rds"
  
  vpc_id              = module.vpc.vpc_id
  subnet_ids          = module.vpc.private_subnets
  identifier          = "vici-staging-db"
  allocated_storage   = 20
  storage_type        = "gp2"
  engine              = "postgres"
  engine_version      = "13.7"
  instance_class      = "db.t3.micro"
  name                = "vici_staging"
  username            = var.db_username
  password            = var.db_password
  multi_az            = false
  skip_final_snapshot = true
  backup_retention_period = 7
}

# ECS Configuration
module "ecs" {
  source = "../modules/ecs"
  
  vpc_id                  = module.vpc.vpc_id
  subnet_ids              = module.vpc.private_subnets
  public_subnet_ids       = module.vpc.public_subnets
  cluster_name            = "vici-staging"
  task_family             = "vici-api-staging"
  container_name          = "vici-api"
  container_image         = "${var.ecr_repository_url}:staging"
  container_port          = 3000
  desired_count           = 1
  max_capacity            = 3
  cpu                     = 512
  memory                  = 1024
  health_check_path       = "/api/health"
  aws_region              = var.aws_region
  
  environment_variables = [
    { name = "NODE_ENV", value = "staging" },
    { name = "DATABASE_URL", value = "postgresql://${var.db_username}:${var.db_password}@${module.rds.endpoint}/${module.rds.name}" },
    { name = "JWT_SECRET", value = var.jwt_secret },
    { name = "GOOGLE_GEMINI_API_KEY", value = var.gemini_api_key },
    { name = "STRAVA_CLIENT_ID", value = var.strava_client_id },
    { name = "STRAVA_CLIENT_SECRET", value = var.strava_client_secret },
    { name = "STRAVA_REDIRECT_URI", value = "https://api-staging.vici.app/api/integrations/strava/callback" },
    { name = "STRAVA_WEBHOOK_VERIFY_TOKEN", value = var.strava_webhook_verify_token },
    { name = "API_URL", value = "https://api-staging.vici.app" }
  ]
}

# CloudFront Distribution for API
module "cloudfront" {
  source = "../modules/cloudfront"
  
  name                    = "vici-api-staging"
  domain_name             = "api-staging.vici.app"
  alb_domain_name         = module.ecs.alb_dns_name
  acm_certificate_arn     = var.acm_certificate_arn
  api_gateway_stage       = "api"
  enable_waf              = true
  price_class             = "PriceClass_100"
}

# CloudWatch Alarms
module "cloudwatch" {
  source = "../modules/cloudwatch"
  
  cluster_name               = module.ecs.cluster_name
  service_name               = module.ecs.service_name
  alb_arn_suffix             = module.ecs.alb_arn_suffix
  target_group_arn_suffix    = module.ecs.target_group_arn_suffix
  alarm_actions              = [var.sns_alarm_topic_arn]
  ok_actions                 = [var.sns_alarm_topic_arn]
  insufficient_data_actions  = [var.sns_alarm_topic_arn]
}

# S3 Bucket for file uploads
resource "aws_s3_bucket" "uploads" {
  bucket = "vici-staging-uploads"
}

resource "aws_s3_bucket_ownership_controls" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "uploads" {
  depends_on = [aws_s3_bucket_ownership_controls.uploads]
  bucket = aws_s3_bucket.uploads.id
  acl    = "private"
}

resource "aws_s3_bucket_public_access_block" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Route 53 DNS Records
resource "aws_route53_record" "api" {
  zone_id = var.route53_zone_id
  name    = "api-staging.vici.app"
  type    = "A"
  
  alias {
    name                   = module.cloudfront.domain_name
    zone_id                = module.cloudfront.hosted_zone_id
    evaluate_target_health = false
  }
} 