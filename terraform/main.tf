# Malumz Movement - AWS Infrastructure
# Terraform configuration for complete AWS deployment

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }

  # Remote state configuration (uncomment for production)
  # backend "s3" {
  #   bucket         = "malumz-terraform-state"
  #   key            = "infrastructure/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "malumz-terraform-locks"
  #   encrypt        = true
  # }
}

# AWS Provider Configuration
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "Malumz Movement"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = "Malumz Team"
    }
  }
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}
data "aws_availability_zones" "available" {
  state = "available"
}

# Local values
locals {
  name_prefix = "${var.project_name}-${var.environment}"
  
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }

  # API Gateway stage name
  api_stage_name = var.environment == "prod" ? "v1" : var.environment
}