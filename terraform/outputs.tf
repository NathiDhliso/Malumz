# Outputs for Malumz Movement Infrastructure

# General Information
output "aws_region" {
  description = "AWS region"
  value       = var.aws_region
}

output "environment" {
  description = "Environment name"
  value       = var.environment
}

output "account_id" {
  description = "AWS Account ID"
  value       = data.aws_caller_identity.current.account_id
}

# VPC Information
output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "vpc_cidr_block" {
  description = "VPC CIDR block"
  value       = module.vpc.vpc_cidr_block
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.vpc.public_subnets
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.vpc.private_subnets
}

# Database Information
output "docdb_cluster_endpoint" {
  description = "DocumentDB cluster endpoint"
  value       = aws_docdb_cluster.main.endpoint
  sensitive   = true
}

output "docdb_cluster_reader_endpoint" {
  description = "DocumentDB cluster reader endpoint"
  value       = aws_docdb_cluster.main.reader_endpoint
  sensitive   = true
}

output "docdb_cluster_id" {
  description = "DocumentDB cluster identifier"
  value       = aws_docdb_cluster.main.cluster_identifier
}

# API Gateway Information
output "api_gateway_url" {
  description = "API Gateway URL"
  value       = "https://${aws_api_gateway_rest_api.main.id}.execute-api.${var.aws_region}.amazonaws.com/${local.api_stage_name}"
}

output "api_gateway_id" {
  description = "API Gateway ID"
  value       = aws_api_gateway_rest_api.main.id
}

output "api_gateway_stage" {
  description = "API Gateway stage name"
  value       = local.api_stage_name
}

# Lambda Information
output "lambda_function_names" {
  description = "Lambda function names"
  value = {
    gap_test      = aws_lambda_function.gap_test.function_name
    contact       = aws_lambda_function.contact.function_name
    mock_purchase = aws_lambda_function.mock_purchase.function_name
    status        = aws_lambda_function.status.function_name
  }
}

# Amplify Information (manually deployed)
# output "amplify_app_id" {
#   description = "Amplify App ID"
#   value       = "manually-deployed"
# }

# output "amplify_default_domain" {
#   description = "Amplify default domain"
#   value       = "manually-deployed"
# }

# output "amplify_custom_domain" {
#   description = "Amplify custom domain (if configured)"
#   value       = null
# }

# Security Information
output "secrets_manager_secret_arn" {
  description = "Secrets Manager secret ARN for database credentials"
  value       = aws_secretsmanager_secret.docdb_credentials.arn
  sensitive   = true
}

# S3 Information
output "s3_bucket_names" {
  description = "S3 bucket names"
  value = {
    assets  = aws_s3_bucket.assets.bucket
    backups = aws_s3_bucket.backups.bucket
  }
}

# CloudWatch Information
output "cloudwatch_log_groups" {
  description = "CloudWatch log group names"
  value = {
    gap_test      = aws_cloudwatch_log_group.gap_test.name
    contact       = aws_cloudwatch_log_group.contact.name
    mock_purchase = aws_cloudwatch_log_group.mock_purchase.name
    status        = aws_cloudwatch_log_group.status.name
    api_gateway   = aws_cloudwatch_log_group.api_gateway.name
  }
}

# Environment Variables for Application
output "environment_variables" {
  description = "Environment variables for application configuration"
  value = {
    REACT_APP_API_URL = "https://${aws_api_gateway_rest_api.main.id}.execute-api.${var.aws_region}.amazonaws.com/${local.api_stage_name}"
    API_GATEWAY_URL   = "https://${aws_api_gateway_rest_api.main.id}.execute-api.${var.aws_region}.amazonaws.com/${local.api_stage_name}"
    DOCDB_ENDPOINT    = aws_docdb_cluster.main.endpoint
    DOCDB_PORT        = aws_docdb_cluster.main.port
    AWS_REGION        = var.aws_region
    ENVIRONMENT       = var.environment
  }
  sensitive = true
}

# Cost Tracking
output "estimated_monthly_cost" {
  description = "Estimated monthly cost breakdown (USD)"
  value = {
    amplify_hosting    = "$1-5"
    lambda_compute     = "$1-10"
    api_gateway        = "$1-5"
    documentdb         = "$50-100"
    cloudwatch_logs    = "$1-5"
    s3_storage         = "$1-3"
    secrets_manager    = "$0.40"
    total_estimated    = "$55-128"
    note              = "Costs vary based on usage. DocumentDB is the largest component."
  }
}