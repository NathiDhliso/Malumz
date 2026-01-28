# Production Environment Configuration

environment = "prod"
aws_region  = "us-east-1"

# Domain Configuration
domain_name = "malumz.co.za"  # Update with your actual domain
api_subdomain = "api"

# Database Configuration (production ready)
docdb_instance_class = "db.r5.large"
docdb_instance_count = 2  # Primary + replica for high availability
docdb_backup_retention_period = 30
docdb_skip_final_snapshot = false

# Lambda Configuration
lambda_runtime = "python3.11"
lambda_timeout = 30
lambda_memory_size = 512  # More memory for production

# GitHub Configuration (update with your repository)
github_repository = ""  # Add your GitHub repo URL
github_branch = "main"
github_access_token = ""  # Add via environment variable or Terraform Cloud

# Monitoring Configuration
enable_detailed_monitoring = true
log_retention_days = 30

# Security Configuration
allowed_cidr_blocks = ["0.0.0.0/0"]  # Restrict this in production

# Production Features
enable_nat_gateway = true  # Required for private DocumentDB in production