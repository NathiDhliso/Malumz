# Development Environment Configuration

environment = "dev"
aws_region  = "us-east-1"

# Domain Configuration
domain_name = ""  # Leave empty for dev, will use Amplify default domain
api_subdomain = "api-dev"

# Database Configuration (minimal for dev)
docdb_instance_class = "db.t3.medium"
docdb_instance_count = 1
docdb_backup_retention_period = 1
docdb_skip_final_snapshot = true

# Lambda Configuration
lambda_runtime = "python3.11"
lambda_timeout = 30
lambda_memory_size = 256

# GitHub Configuration (update with your repository)
github_repository = ""  # Add your GitHub repo URL
github_branch = "main"
github_access_token = ""  # Add via environment variable or Terraform Cloud

# Monitoring Configuration
enable_detailed_monitoring = false
log_retention_days = 7

# Cost Optimization for Dev
enable_nat_gateway = false  # Saves ~$45/month, DocumentDB will be in public subnet for dev