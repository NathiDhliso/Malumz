#!/bin/bash

# Malumz Movement - Terraform Deployment Script
# Usage: ./deploy.sh [environment] [action]
# Example: ./deploy.sh dev plan
# Example: ./deploy.sh prod apply

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-dev}
ACTION=${2:-plan}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TERRAFORM_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}🚀 Malumz Movement - Terraform Deployment${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}Action: ${ACTION}${NC}"
echo ""

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    echo -e "${RED}❌ Invalid environment: $ENVIRONMENT${NC}"
    echo -e "${YELLOW}Valid environments: dev, staging, prod${NC}"
    exit 1
fi

# Validate action
if [[ ! "$ACTION" =~ ^(plan|apply|destroy|init|validate|output)$ ]]; then
    echo -e "${RED}❌ Invalid action: $ACTION${NC}"
    echo -e "${YELLOW}Valid actions: plan, apply, destroy, init, validate, output${NC}"
    exit 1
fi

# Check if tfvars file exists
TFVARS_FILE="$TERRAFORM_DIR/environments/${ENVIRONMENT}.tfvars"
if [[ ! -f "$TFVARS_FILE" ]]; then
    echo -e "${RED}❌ Environment file not found: $TFVARS_FILE${NC}"
    exit 1
fi

# Change to terraform directory
cd "$TERRAFORM_DIR"

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}❌ Terraform is not installed${NC}"
    echo -e "${YELLOW}Please install Terraform: https://www.terraform.io/downloads${NC}"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured${NC}"
    echo -e "${YELLOW}Please configure AWS credentials: aws configure${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo ""

# Build Lambda layer if it doesn't exist
LAYER_ZIP="lambda_layer/lambda_layer.zip"
if [[ ! -f "$LAYER_ZIP" ]]; then
    echo -e "${YELLOW}📦 Building Lambda layer...${NC}"
    cd lambda_layer
    python3 build_layer.py
    cd ..
    echo ""
fi

# Initialize Terraform if needed
if [[ ! -d ".terraform" ]] || [[ "$ACTION" == "init" ]]; then
    echo -e "${YELLOW}🔧 Initializing Terraform...${NC}"
    terraform init
    echo ""
fi

# Execute Terraform command
case $ACTION in
    "plan")
        echo -e "${YELLOW}📋 Planning infrastructure changes...${NC}"
        terraform plan -var-file="$TFVARS_FILE" -out="${ENVIRONMENT}.tfplan"
        echo ""
        echo -e "${GREEN}✅ Plan completed. Review the changes above.${NC}"
        echo -e "${BLUE}To apply: ./deploy.sh $ENVIRONMENT apply${NC}"
        ;;
    "apply")
        if [[ -f "${ENVIRONMENT}.tfplan" ]]; then
            echo -e "${YELLOW}🚀 Applying planned changes...${NC}"
            terraform apply "${ENVIRONMENT}.tfplan"
            rm -f "${ENVIRONMENT}.tfplan"
        else
            echo -e "${YELLOW}🚀 Planning and applying changes...${NC}"
            terraform apply -var-file="$TFVARS_FILE" -auto-approve
        fi
        echo ""
        echo -e "${GREEN}✅ Infrastructure deployed successfully!${NC}"
        echo -e "${BLUE}Getting outputs...${NC}"
        terraform output
        ;;
    "destroy")
        echo -e "${RED}⚠️  WARNING: This will destroy all infrastructure!${NC}"
        read -p "Are you sure you want to destroy $ENVIRONMENT environment? (yes/no): " confirm
        if [[ "$confirm" == "yes" ]]; then
            echo -e "${YELLOW}💥 Destroying infrastructure...${NC}"
            terraform destroy -var-file="$TFVARS_FILE" -auto-approve
            echo -e "${GREEN}✅ Infrastructure destroyed${NC}"
        else
            echo -e "${YELLOW}❌ Destroy cancelled${NC}"
        fi
        ;;
    "validate")
        echo -e "${YELLOW}🔍 Validating Terraform configuration...${NC}"
        terraform validate
        echo -e "${GREEN}✅ Configuration is valid${NC}"
        ;;
    "output")
        echo -e "${YELLOW}📊 Getting infrastructure outputs...${NC}"
        terraform output
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Deployment script completed!${NC}"