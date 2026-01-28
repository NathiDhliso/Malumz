# Deployment Guide

## Pre-Deployment Checklist

### Code Quality
- [x] All Emergent references and watermarks removed
- [x] Unused files and dependencies cleaned up
- [x] No test files or development artifacts
- [x] Console errors only for debugging (no console.log)
- [x] All imports working correctly
- [x] Build process successful

### Environment Configuration
- [x] Environment variables properly configured
- [x] Backend .env.example provided
- [x] Frontend .env.example provided
- [x] CORS settings configured for production

### Database
- [x] In-memory storage for development
- [ ] MongoDB connection ready for production
- [ ] Database schema documented

### Security
- [x] No hardcoded secrets or API keys
- [x] Environment variables for sensitive data
- [x] CORS properly configured
- [ ] Rate limiting (recommended for production)
- [ ] Input validation (already implemented with Pydantic)

## AWS Deployment Architecture (Terraform)

### Complete Infrastructure as Code
The project includes comprehensive Terraform configuration for automated AWS deployment.

### Frontend (React)
- **Service**: AWS Amplify (with built-in CI/CD)
- **CDN**: CloudFront (managed by Amplify)
- **Domain**: Custom domain support with SSL
- **Build**: Automatic builds on git push

### Backend (Python FastAPI → Lambda)
- **Service**: AWS Lambda (4 functions)
- **API**: API Gateway with CORS
- **Functions**: gap-test, contact, mock-purchase, status
- **Dependencies**: Lambda Layer with pymongo

### Database
- **Service**: Amazon DocumentDB (MongoDB-compatible)
- **Security**: VPC with private subnets
- **Credentials**: AWS Secrets Manager
- **Backup**: Automated daily backups

### Infrastructure as Code
- **Tool**: Terraform with modular configuration
- **Environments**: dev, staging, prod configurations
- **State**: S3 backend with DynamoDB locking
- **Scripts**: Automated deployment scripts

## Quick Deployment

### Prerequisites
- AWS CLI configured with appropriate permissions
- Terraform >= 1.0 installed
- Python 3.11+ for Lambda functions
- GitHub repository with the code

### Automated Deployment

1. **Navigate to terraform directory**:
   ```bash
   cd terraform
   ```

2. **Initial setup** (creates S3 bucket for state):
   ```bash
   chmod +x scripts/*.sh
   ./scripts/setup.sh
   ```

3. **Configure environment**:
   ```bash
   # Edit environment configuration
   cp environments/dev.tfvars environments/dev.tfvars.local
   # Update with your GitHub repo URL and access token
   ```

4. **Deploy infrastructure**:
   ```bash
   # Plan deployment
   ./scripts/deploy.sh dev plan
   
   # Apply changes
   ./scripts/deploy.sh dev apply
   ```

5. **Get deployment outputs**:
   ```bash
   ./scripts/deploy.sh dev output
   ```

### What Gets Deployed

- **AWS Amplify**: Frontend hosting with CI/CD
- **AWS Lambda**: 4 serverless functions
- **API Gateway**: REST API with CORS support
- **DocumentDB**: MongoDB-compatible database
- **S3 Buckets**: Asset storage and backups
- **CloudWatch**: Logging and monitoring
- **VPC**: Secure networking
- **Secrets Manager**: Database credentials

See `terraform/README.md` for detailed documentation.

## Environment Variables

### Automatic Configuration
The Terraform deployment automatically configures environment variables:

### Frontend (Amplify)
```bash
REACT_APP_API_URL=https://api-gateway-url.execute-api.region.amazonaws.com/stage
```

### Backend (Lambda)
```bash
DOCDB_SECRET_ARN=arn:aws:secretsmanager:region:account:secret:name
AWS_REGION=us-east-1
ENVIRONMENT=dev|prod
LOG_LEVEL=INFO
```

### Manual Configuration Required

1. **GitHub Integration**:
   - Create GitHub personal access token
   - Add repository URL to tfvars file

2. **Custom Domain** (optional):
   - Update domain_name in tfvars
   - Configure DNS after deployment

## Build Commands

### Automated Builds
- **Frontend**: Amplify automatically builds on git push
- **Backend**: Lambda functions deployed via Terraform
- **Dependencies**: Lambda layer built automatically

### Manual Build (if needed)
```bash
# Build Lambda layer
cd terraform/lambda_layer
python3 build_layer.py

# Validate Terraform
cd terraform
terraform validate
terraform fmt -recursive
```

## Monitoring & Logging
- **Frontend**: Amplify build logs and CloudFront metrics
- **Backend**: CloudWatch Logs for each Lambda function
- **Database**: DocumentDB CloudWatch metrics
- **API**: API Gateway access logs and metrics
- **Status**: `/api/status` endpoint for health checks

## Domain Configuration
- **Primary**: Configured via Amplify (custom domain optional)
- **API**: API Gateway provides endpoint URL
- **SSL**: Managed by AWS (Amplify and API Gateway)

## Cost Monitoring
- **Development**: ~$55-120/month
- **Production**: ~$125-405/month
- **Main cost**: DocumentDB cluster (~$50-300/month)

## Post-Deployment Testing
1. Check Terraform outputs for URLs
2. Test Amplify app deployment
3. Test all API endpoints via API Gateway
4. Test Gap Test functionality end-to-end
5. Test contact form submission
6. Test book purchase flow
7. Verify DocumentDB connectivity
8. Check CloudWatch logs for errors

## Rollback Plan
1. **Infrastructure**: `terraform destroy` and redeploy from previous state
2. **Application**: Amplify keeps deployment history
3. **Database**: DocumentDB automated backups
4. **Emergency**: Use AWS Console to manually rollback resources