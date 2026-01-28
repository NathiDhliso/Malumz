#!/bin/bash

# Malumz Movement - Initial Setup Script
# Sets up remote state and prepares for deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Malumz Movement - Initial Setup${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v terraform &> /dev/null; then
    echo -e "${RED}ERROR: Terraform is not installed${NC}"
    exit 1
fi

if ! command -v aws &> /dev/null; then
    echo -e "${RED}ERROR: AWS CLI is not installed${NC}"
    exit 1
fi

if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}ERROR: AWS credentials not configured${NC}"
    exit 1
fi

echo -e "${GREEN}Prerequisites check passed${NC}"
echo ""

# Get AWS account info
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=$(aws configure get region || echo "us-east-1")

echo -e "${BLUE}AWS Account: $ACCOUNT_ID${NC}"
echo -e "${BLUE}Region: $REGION${NC}"
echo ""

# Create S3 bucket for Terraform state
BUCKET_NAME="malumz-terraform-state-$ACCOUNT_ID"
echo -e "${YELLOW}Creating S3 bucket for Terraform state...${NC}"

if aws s3 ls "s3://$BUCKET_NAME" 2>&1 | grep -q 'NoSuchBucket'; then
    aws s3 mb "s3://$BUCKET_NAME" --region "$REGION"
    aws s3api put-bucket-versioning --bucket "$BUCKET_NAME" --versioning-configuration Status=Enabled
    aws s3api put-bucket-encryption --bucket "$BUCKET_NAME" --server-side-encryption-configuration '{
        "Rules": [
            {
                "ApplyServerSideEncryptionByDefault": {
                    "SSEAlgorithm": "AES256"
                }
            }
        ]
    }'
    echo -e "${GREEN}✅ S3 bucket created: $BUCKET_NAME${NC}"
else
    echo -e "${YELLOW}⚠️  S3 bucket already exists: $BUCKET_NAME${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Setup completed!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo -e "${BLUE}1. Update environments/*.tfvars with your configuration${NC}"
echo -e "${BLUE}2. Run: ./scripts/deploy.sh dev plan${NC}"