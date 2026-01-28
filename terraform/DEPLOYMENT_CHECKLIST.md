# Malumz Movement - Deployment Checklist

## 📋 Pre-Deployment Checklist

### Prerequisites
- [ ] AWS CLI installed and configured
- [ ] Terraform >= 1.0 installed
- [ ] Python 3.11+ installed
- [ ] Git repository set up
- [ ] GitHub personal access token created (for Amplify)

### Configuration
- [ ] Updated `environments/dev.tfvars` with your settings
- [ ] Updated `environments/prod.tfvars` with your settings
- [ ] Set GitHub repository URL in tfvars files
- [ ] Set GitHub access token (via environment variable or Terraform Cloud)
- [ ] Configured custom domain (optional)

### Security Review
- [ ] Reviewed security group configurations
- [ ] Verified IAM roles and policies
- [ ] Confirmed secrets management setup
- [ ] Checked VPC and subnet configurations

## 🚀 Deployment Steps

### Step 1: Initial Setup
```bash
cd terraform
./scripts/setup.sh
```
- [ ] S3 bucket created for Terraform state
- [ ] AWS credentials verified
- [ ] Prerequisites checked

### Step 2: Development Deployment
```bash
./scripts/deploy.sh dev plan
./scripts/deploy.sh dev apply
```
- [ ] Terraform plan reviewed
- [ ] Infrastructure deployed successfully
- [ ] Outputs captured and verified

### Step 3: Testing
- [ ] Lambda functions responding
- [ ] API Gateway endpoints accessible
- [ ] DocumentDB connection working
- [ ] Amplify app building and deploying
- [ ] Frontend connecting to backend APIs

### Step 4: Production Deployment (when ready)
```bash
./scripts/deploy.sh prod plan
./scripts/deploy.sh prod apply
```
- [ ] Production configuration reviewed
- [ ] Custom domain configured
- [ ] SSL certificate validated
- [ ] High availability setup verified

## ✅ Post-Deployment Verification

### Infrastructure Health
- [ ] All Lambda functions healthy
- [ ] API Gateway returning 200 responses
- [ ] DocumentDB cluster accessible
- [ ] CloudWatch logs flowing
- [ ] S3 buckets created and accessible

### Application Testing
- [ ] Frontend loads without errors
- [ ] Gap Test form submits successfully
- [ ] Contact form submits successfully
- [ ] Mock purchase completes successfully
- [ ] Status endpoint returns healthy status

### Monitoring Setup
- [ ] CloudWatch dashboards configured
- [ ] Log groups created and retaining logs
- [ ] Alarms configured (production)
- [ ] Cost monitoring enabled

## 🔧 Configuration Updates

### Environment Variables
Update these in your application:
- [ ] `REACT_APP_API_URL` - API Gateway URL
- [ ] Backend environment variables configured
- [ ] Database connection strings secured

### DNS Configuration (if using custom domain)
- [ ] Domain DNS pointed to Amplify
- [ ] SSL certificate validated
- [ ] API subdomain configured

## 📊 Cost Monitoring

### Expected Costs
- **Development**: ~$55-120/month
- **Production**: ~$125-405/month

### Cost Optimization
- [ ] DocumentDB instance size appropriate
- [ ] Lambda memory allocation optimized
- [ ] Log retention periods set correctly
- [ ] Unused resources cleaned up

## 🚨 Rollback Plan

### If Deployment Fails
1. Check Terraform error messages
2. Review CloudWatch logs
3. Verify AWS permissions
4. Rollback using previous Terraform state

### Emergency Rollback
```bash
# Destroy current deployment
./scripts/deploy.sh dev destroy

# Redeploy from known good state
git checkout <previous-commit>
./scripts/deploy.sh dev apply
```

## 📞 Support Contacts

### AWS Support
- Check AWS Service Health Dashboard
- Review AWS documentation
- Contact AWS support if needed

### Application Support
- Check application logs in CloudWatch
- Review Terraform state for resource issues
- Verify GitHub integration for Amplify

## 🎉 Success Criteria

Deployment is successful when:
- [ ] All infrastructure resources created
- [ ] Application accessible via Amplify URL
- [ ] All API endpoints responding correctly
- [ ] Database connections working
- [ ] Monitoring and logging operational
- [ ] No critical errors in CloudWatch logs

---

**Note**: Keep this checklist updated as you add new features or modify the infrastructure.