# Variables for Malumz Movement Infrastructure

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "malumz"
}

# Domain Configuration
variable "domain_name" {
  description = "Primary domain name"
  type        = string
  default     = "malumz.co.za"
}

variable "api_subdomain" {
  description = "API subdomain"
  type        = string
  default     = "api"
}

# Database Configuration
variable "docdb_instance_class" {
  description = "DocumentDB instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "docdb_instance_count" {
  description = "Number of DocumentDB instances"
  type        = number
  default     = 1
}

variable "docdb_backup_retention_period" {
  description = "DocumentDB backup retention period in days"
  type        = number
  default     = 7
}

# Lambda Configuration
variable "lambda_runtime" {
  description = "Lambda runtime version"
  type        = string
  default     = "python3.11"
}

variable "lambda_timeout" {
  description = "Lambda function timeout in seconds"
  type        = number
  default     = 30
}

variable "lambda_memory_size" {
  description = "Lambda function memory size in MB"
  type        = number
  default     = 256
}

# Amplify Configuration
variable "github_repository" {
  description = "GitHub repository URL"
  type        = string
  default     = ""
}

variable "github_branch" {
  description = "GitHub branch for deployment"
  type        = string
  default     = "main"
}

variable "github_access_token" {
  description = "GitHub personal access token"
  type        = string
  sensitive   = true
  default     = ""
}

# Monitoring Configuration
variable "enable_detailed_monitoring" {
  description = "Enable detailed CloudWatch monitoring"
  type        = bool
  default     = false
}

variable "log_retention_days" {
  description = "CloudWatch log retention period in days"
  type        = number
  default     = 14
}

# Security Configuration
variable "allowed_cidr_blocks" {
  description = "CIDR blocks allowed to access resources"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

# Cost Optimization
variable "enable_nat_gateway" {
  description = "Enable NAT Gateway for private subnets (costs extra)"
  type        = bool
  default     = false
}

variable "docdb_skip_final_snapshot" {
  description = "Skip final snapshot when destroying DocumentDB cluster"
  type        = bool
  default     = true
}