# VPC and Networking Configuration for Malumz Movement

# VPC Module
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "${local.name_prefix}-vpc"
  cidr = "10.0.0.0/16"

  azs             = slice(data.aws_availability_zones.available.names, 0, 2)
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  # Internet connectivity
  create_igw         = true
  enable_nat_gateway = var.enable_nat_gateway
  single_nat_gateway = true  # Cost optimization
  enable_vpn_gateway = false

  # DNS
  enable_dns_hostnames = true
  enable_dns_support   = true

  # VPC Flow Logs (optional for monitoring)
  enable_flow_log                      = var.enable_detailed_monitoring
  create_flow_log_cloudwatch_log_group = var.enable_detailed_monitoring
  create_flow_log_cloudwatch_iam_role  = var.enable_detailed_monitoring

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-vpc"
  })

  public_subnet_tags = {
    Name = "${local.name_prefix}-public"
    Type = "Public"
  }

  private_subnet_tags = {
    Name = "${local.name_prefix}-private"
    Type = "Private"
  }
}

# Security Group for DocumentDB
resource "aws_security_group" "docdb" {
  name_prefix = "${local.name_prefix}-docdb-"
  vpc_id      = module.vpc.vpc_id
  description = "Security group for DocumentDB cluster"

  ingress {
    description = "DocumentDB access from Lambda"
    from_port   = 27017
    to_port     = 27017
    protocol    = "tcp"
    security_groups = [aws_security_group.lambda.id]
  }

  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-docdb-sg"
  })

  lifecycle {
    create_before_destroy = true
  }
}

# Security Group for Lambda Functions
resource "aws_security_group" "lambda" {
  name_prefix = "${local.name_prefix}-lambda-"
  vpc_id      = module.vpc.vpc_id
  description = "Security group for Lambda functions"

  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-lambda-sg"
  })

  lifecycle {
    create_before_destroy = true
  }
}

# VPC Endpoints for AWS services (cost optimization)
resource "aws_vpc_endpoint" "s3" {
  vpc_id       = module.vpc.vpc_id
  service_name = "com.amazonaws.${var.aws_region}.s3"
  
  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-s3-endpoint"
  })
}

resource "aws_vpc_endpoint" "secretsmanager" {
  count = var.enable_detailed_monitoring ? 1 : 0
  
  vpc_id              = module.vpc.vpc_id
  service_name        = "com.amazonaws.${var.aws_region}.secretsmanager"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = module.vpc.private_subnets
  security_group_ids  = [aws_security_group.lambda.id]
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = "*"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = "*"
      }
    ]
  })

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-secretsmanager-endpoint"
  })
}