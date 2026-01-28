# Malumz Movement - AWS Infrastructure

This directory contains Terraform configuration for deploying the Malumz Movement application on AWS.

## 🏗️ Architecture

- **Frontend**: AWS Amplify (React app)
- **Backend**: AWS Lambda + API Gateway (Python FastAPI)
- **Database**: Amazon DocumentDB (MongoDB-compatible)
- **Storage**: S3 buckets for assets and backups
- **Monitoring**: CloudWatch logs and metrics

## 📁 Directory Structure

```
terraform/
├── environments/           # Environment-specific configurations
│   ├── dev.tfvars         # Development environment
│   └── prod.tfvars        # Production environment
├── lambda_functions/       # Lambda function code
│   ├── gap_test/          # Gap Test API
│   ├── contact/           # Contact form API
│   ├── mock_purchase/     # Mock purchase API
│   └── status/            # System status API
├── lambda_layer/          # Python dependencies layer
│   ├── requirements.txt   # Python packages
│   ├── build_layer.py     # Build script
│   └── lambda_layer.zip   # Built layer (generated)
├── scripts/               # Deployment scripts
│   ├── deploy.sh          # Main deployment script
│   └── setup.sh           # Initial setup script
├── *.tf                   # Terraform configuration files
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

1. **AWS CLI** configured with appropriate credentials
2. **Terraform** >= 1.0 installed
3. **Python 3.11+** for building Lambda layer
4. **Git** for version control

### Initial Setup

1. **Clone and navigate to terraform directory**:
   ```bash
   cd terraform
   ```

2. **Run initial setup** (creates S3 bucket for state):
   ```bash
   chmod +x scripts/*.sh
   ./scripts/setup.sh
   ```

3. **Configure environment variables**:
   ```bash
   # Copy and edit environment configuration
   cp environments/dev.tfvars environments/dev.tfvars.local
   # Edit dev.tfvars.local with your settings
   ```

### Deployment

1. **Plan deployment**:
   ```bash
   ./scripts/deploy.sh dev plan
   ```

2. **Apply changes**:
   ```bash
   ./scripts/deploy.sh dev apply
   ```

3. **View outputs**:
   ```bash
   ./scripts/deploy.sh dev output
   ```

## 🔧 Configuration

### Environment Files

Edit `environments/{env}.tfvars` files to configure:

- **Domain settings**: Custom domain for Amplify
- **Database settings**: Instance size, backup retention
- **GitHub integration**: Repository URL and access token
- **Monitoring**: Log retention, detailed monitoring

### Required Variables

```hcl
# GitHub Configuration (required for Amplify)
github_repository = "https://github.com/your-org/malumz-movement"
github_access_token = "ghp_your_token_here"

# Domain Configuration (optional)
domain_name = "yourdomain.com"
```

## 📊 Environments

### Development (`dev`)
- Minimal resources for cost optimization
- Single DocumentDB instance
- Basic monitoring
- No custom domain

### Production (`prod`)
- High availability setup
- DocumentDB cluster with replicas
- Comprehensive monitoring
- Custom domain with SSL

## 🔐 Security

### Implemented Security Features

- **VPC**: Private networking for DocumentDB
- **Security Groups**: Minimal access rules
- **Secrets Manager**: Database credentials
- **IAM**: Least privilege roles
- **Encryption**: At rest and in transit

### Security Checklist

- [ ] Review security group rules
- [ ] Configure custom domain with SSL
- [ ] Set up API Gateway authentication (future)
- [ ] Enable AWS Config for compliance
- [ ] Set up CloudTrail for auditing

## 💰 Cost Optimization

### Development Environment (~$55-120/month)
- Single DocumentDB instance
- No NAT Gateway
- Minimal monitoring
- Short log retention

### Production Environment (~$125-405/month)
- DocumentDB cluster with replicas
- NAT Gateway for security
- Comprehensive monitoring
- Extended log retention

### Cost Reduction Tips
- Use `db.t3.medium` for DocumentDB in dev
- Set `enable_nat_gateway = false` for dev
- Reduce `log_retention_days` for dev
- Use reserved instances for production

## 🔍 Monitoring

### CloudWatch Resources
- Lambda function logs
- API Gateway access logs
- DocumentDB performance insights
- Custom metrics and alarms

### Accessing Logs
```bash
# View Lambda logs
aws logs tail /aws/lambda/malumz-dev-gap-test --follow

# View API Gateway logs
aws logs tail /aws/apigateway/malumz-dev --follow
```

## 🚨 Troubleshooting

### Common Issues

1. **Lambda Layer Build Fails**:
   ```bash
   cd lambda_layer
   python3 build_layer.py
   ```

2. **DocumentDB Connection Issues**:
   - Check security groups
   - Verify VPC configuration
   - Test from Lambda function

3. **Amplify Build Fails**:
   - Check GitHub token permissions
   - Verify repository access
   - Review build logs in Amplify console

### Useful Commands

```bash
# Validate Terraform configuration
terraform validate

# Format Terraform files
terraform fmt -recursive

# Show current state
terraform show

# Import existing resources
terraform import aws_s3_bucket.example bucket-name
```

## 🔄 CI/CD Integration

### GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Infrastructure
on:
  push:
    branches: [main]
    paths: ['terraform/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: hashicorp/setup-terraform@v2
      - name: Deploy to AWS
        run: |
          cd terraform
          ./scripts/deploy.sh prod apply
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

## 📚 Additional Resources

- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [Amazon DocumentDB Documentation](https://docs.aws.amazon.com/documentdb/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)

## 🆘 Support

For infrastructure issues:
1. Check CloudWatch logs
2. Review Terraform state
3. Validate AWS permissions
4. Check resource limits and quotas