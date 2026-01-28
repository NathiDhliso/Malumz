# AWS Infrastructure Plan - Malumz Movement

## 🎯 Objective
Deploy Malumz Movement application on AWS using Amplify for frontend and supporting services for backend, with Terraform for infrastructure as code.

## 🏗️ Architecture Overview

### Frontend (React)
- **AWS Amplify**: Hosting, CI/CD, custom domain
- **CloudFront**: CDN (managed by Amplify)
- **Route 53**: DNS management
- **Certificate Manager**: SSL certificates

### Backend (FastAPI)
- **AWS Lambda**: Serverless backend
- **API Gateway**: REST API management
- **Lambda Layers**: Python dependencies
- **CloudWatch**: Logging and monitoring

### Database
- **DocumentDB**: MongoDB-compatible database
- **VPC**: Private network for database
- **Security Groups**: Network access control

### Storage & Assets
- **S3**: File storage, backups
- **CloudWatch**: Logs and metrics

### Security & Access
- **IAM**: Roles and policies
- **Secrets Manager**: Database credentials
- **Parameter Store**: Configuration values

## 📋 Resource Requirements

### Core Infrastructure
1. **VPC & Networking**
   - VPC with public/private subnets
   - Internet Gateway
   - NAT Gateway (for private subnets)
   - Route Tables
   - Security Groups

2. **Database Layer**
   - DocumentDB Cluster
   - DocumentDB Instances
   - Subnet Groups
   - Parameter Groups

3. **Compute Layer**
   - Lambda Functions (API endpoints)
   - Lambda Layers (dependencies)
   - API Gateway REST API
   - Lambda permissions

4. **Frontend Layer**
   - Amplify App
   - Amplify Branch (main)
   - Custom Domain
   - SSL Certificate

5. **Storage & Monitoring**
   - S3 Buckets (backups, assets)
   - CloudWatch Log Groups
   - CloudWatch Alarms

6. **Security & Configuration**
   - IAM Roles and Policies
   - Secrets Manager secrets
   - Parameter Store parameters

## 🔗 App Feature Mapping

### Gap Test System
- **Frontend**: Amplify hosted React app
- **Backend**: Lambda function (`/api/gap-test`)
- **Storage**: DocumentDB collection `gap_tests`
- **Monitoring**: CloudWatch logs for submissions

### Contact System
- **Frontend**: Contact form in React
- **Backend**: Lambda function (`/api/contact`)
- **Storage**: DocumentDB collection `contact_forms`
- **Future**: SES integration for email notifications

### Book Purchase
- **Frontend**: Purchase form in React
- **Backend**: Lambda function (`/api/mock-purchase`)
- **Storage**: DocumentDB collection `purchases`
- **Future**: Stripe integration

### Static Content
- **Frontend**: All pages served via Amplify
- **Assets**: Images via Amplify CDN
- **Domain**: Custom domain via Route 53

## 🚀 Deployment Strategy

### Phase 1: Core Infrastructure
1. VPC and networking
2. DocumentDB cluster
3. Lambda functions and API Gateway
4. Basic monitoring

### Phase 2: Frontend Deployment
1. Amplify app setup
2. Custom domain configuration
3. SSL certificate
4. CI/CD pipeline

### Phase 3: Integration & Testing
1. Connect frontend to backend APIs
2. Database connectivity testing
3. End-to-end functionality testing
4. Performance optimization

## 📊 Cost Estimation (Monthly)

### Development/POC Environment
- **Amplify**: ~$1-5 (depending on traffic)
- **Lambda**: ~$1-10 (pay per request)
- **DocumentDB**: ~$50-100 (smallest instance)
- **API Gateway**: ~$1-5 (per million requests)
- **Route 53**: ~$0.50 per hosted zone
- **Total**: ~$55-120/month

### Production Environment
- **Amplify**: ~$5-20
- **Lambda**: ~$10-50
- **DocumentDB**: ~$100-300 (with replicas)
- **API Gateway**: ~$5-20
- **CloudWatch**: ~$5-15
- **Total**: ~$125-405/month

## 🔧 Environment Configuration

### Development
- Single DocumentDB instance
- Basic Lambda configuration
- Simple monitoring
- Development domain

### Production
- DocumentDB cluster with replicas
- Lambda with reserved concurrency
- Comprehensive monitoring
- Production domain with CDN

## 📝 Implementation Tasks

### Task 1: Terraform Setup
- [ ] Create Terraform directory structure
- [ ] Configure AWS provider
- [ ] Set up remote state (S3 + DynamoDB)
- [ ] Create variable definitions

### Task 2: Core Infrastructure
- [ ] VPC and networking resources
- [ ] Security groups and NACLs
- [ ] DocumentDB cluster and instances
- [ ] IAM roles and policies

### Task 3: Serverless Backend
- [ ] Lambda functions for each API endpoint
- [ ] Lambda layers for dependencies
- [ ] API Gateway configuration
- [ ] Lambda-DocumentDB connectivity

### Task 4: Frontend Infrastructure
- [ ] Amplify app configuration
- [ ] Custom domain setup
- [ ] SSL certificate management
- [ ] Build and deployment settings

### Task 5: Monitoring & Security
- [ ] CloudWatch log groups and alarms
- [ ] Secrets Manager for database credentials
- [ ] Parameter Store for configuration
- [ ] Security hardening

### Task 6: Integration & Testing
- [ ] Environment variable configuration
- [ ] API endpoint testing
- [ ] Frontend-backend integration
- [ ] End-to-end testing

## 🔐 Security Considerations

### Network Security
- Private subnets for DocumentDB
- Security groups with minimal access
- VPC endpoints for AWS services

### Application Security
- Lambda execution roles with minimal permissions
- Secrets Manager for sensitive data
- API Gateway throttling and authentication ready

### Data Security
- DocumentDB encryption at rest
- SSL/TLS for all communications
- Regular security updates

## 📈 Scalability & Performance

### Auto Scaling
- Lambda auto-scales by default
- DocumentDB read replicas for scaling reads
- Amplify CDN for global performance

### Performance Optimization
- Lambda cold start optimization
- DocumentDB connection pooling
- CloudFront caching strategies

## 🔄 CI/CD Pipeline

### Amplify CI/CD
- Automatic builds on git push
- Environment-specific deployments
- Build notifications

### Backend Deployment
- Terraform for infrastructure updates
- Lambda deployment packages
- Database migration scripts

---

**Next Steps**: Implement Terraform configuration following this plan, starting with core infrastructure and progressing through each phase.