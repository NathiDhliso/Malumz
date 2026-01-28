# Deployment Guide

## Pre-Deployment Checklist ✅

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

## AWS Deployment Architecture

### Frontend (React)
- **Service**: S3 + CloudFront
- **Domain**: Route 53
- **SSL**: Certificate Manager
- **Build**: `npm run build` → upload to S3

### Backend (FastAPI)
- **Service**: ECS Fargate or Lambda
- **Load Balancer**: Application Load Balancer
- **Container**: Docker image with Python 3.13
- **Environment**: Production environment variables

### Database
- **Service**: DocumentDB or MongoDB Atlas
- **Backup**: Automated daily backups
- **Security**: VPC, Security Groups

### Infrastructure as Code
- **Tool**: AWS CDK or Terraform
- **CI/CD**: GitHub Actions or AWS CodePipeline

## Environment Variables

### Production Backend
```bash
MONGO_URL=mongodb://production-cluster:27017
DB_NAME=malumz_production
CORS_ORIGINS=https://malumz.co.za
```

### Production Frontend
```bash
REACT_APP_BACKEND_URL=https://api.malumz.co.za
```

## Build Commands

### Frontend
```bash
cd frontend
npm install
npm run build
# Upload build/ folder to S3
```

### Backend
```bash
cd backend
pip install -r requirements.txt
# Deploy to ECS/Lambda
```

## Monitoring & Logging
- **Frontend**: CloudWatch (via CloudFront)
- **Backend**: CloudWatch Logs
- **Database**: DocumentDB CloudWatch metrics
- **Uptime**: Route 53 health checks

## Domain Configuration
- **Primary**: malumz.co.za
- **API**: api.malumz.co.za
- **SSL**: Wildcard certificate (*.malumz.co.za)

## Post-Deployment Testing
1. Test all pages load correctly
2. Test Gap Test functionality end-to-end
3. Test contact form submission
4. Test book purchase flow
5. Verify responsive design on mobile
6. Check SSL certificate
7. Test API endpoints directly

## Rollback Plan
1. Keep previous S3 deployment
2. Keep previous ECS task definition
3. Database backup before deployment
4. DNS TTL set to 300 seconds for quick changes