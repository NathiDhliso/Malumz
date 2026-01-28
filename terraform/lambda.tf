# Lambda Functions for Malumz Movement Backend

# IAM Role for Lambda Functions
resource "aws_iam_role" "lambda_execution_role" {
  name = "${local.name_prefix}-lambda-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = local.common_tags
}

# IAM Policy for Lambda Functions
resource "aws_iam_role_policy" "lambda_policy" {
  name = "${local.name_prefix}-lambda-policy"
  role = aws_iam_role.lambda_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:*"
      },
      {
        Effect = "Allow"
        Action = [
          "ec2:CreateNetworkInterface",
          "ec2:DescribeNetworkInterfaces",
          "ec2:DeleteNetworkInterface"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = aws_secretsmanager_secret.docdb_credentials.arn
      }
    ]
  })
}

# Attach AWS managed policy for VPC access
resource "aws_iam_role_policy_attachment" "lambda_vpc_access" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# Lambda Layer for Python dependencies
resource "aws_lambda_layer_version" "python_dependencies" {
  filename         = "lambda_layer.zip"
  layer_name       = "${local.name_prefix}-python-deps"
  source_code_hash = data.archive_file.lambda_layer.output_base64sha256

  compatible_runtimes = [var.lambda_runtime]
  description         = "Python dependencies for Malumz Movement"

  depends_on = [data.archive_file.lambda_layer]
}

# Archive for Lambda Layer (dependencies)
data "archive_file" "lambda_layer" {
  type        = "zip"
  output_path = "lambda_layer.zip"
  source_dir  = "${path.module}/lambda_layer"
}

# CloudWatch Log Groups for Lambda Functions
resource "aws_cloudwatch_log_group" "gap_test" {
  name              = "/aws/lambda/${local.name_prefix}-gap-test"
  retention_in_days = var.log_retention_days
  tags              = local.common_tags
}

resource "aws_cloudwatch_log_group" "contact" {
  name              = "/aws/lambda/${local.name_prefix}-contact"
  retention_in_days = var.log_retention_days
  tags              = local.common_tags
}

resource "aws_cloudwatch_log_group" "mock_purchase" {
  name              = "/aws/lambda/${local.name_prefix}-mock-purchase"
  retention_in_days = var.log_retention_days
  tags              = local.common_tags
}

resource "aws_cloudwatch_log_group" "status" {
  name              = "/aws/lambda/${local.name_prefix}-status"
  retention_in_days = var.log_retention_days
  tags              = local.common_tags
}

# Lambda Function: Gap Test
resource "aws_lambda_function" "gap_test" {
  filename         = "gap_test_lambda.zip"
  function_name    = "${local.name_prefix}-gap-test"
  role            = aws_iam_role.lambda_execution_role.arn
  handler         = "lambda_function.lambda_handler"
  source_code_hash = data.archive_file.gap_test_lambda.output_base64sha256
  runtime         = var.lambda_runtime
  timeout         = var.lambda_timeout
  memory_size     = var.lambda_memory_size

  layers = [aws_lambda_layer_version.python_dependencies.arn]

  vpc_config {
    subnet_ids         = module.vpc.private_subnets
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DOCDB_SECRET_ARN = aws_secretsmanager_secret.docdb_credentials.arn
      ENVIRONMENT      = var.environment
      LOG_LEVEL        = var.environment == "prod" ? "INFO" : "DEBUG"
    }
  }

  depends_on = [
    aws_cloudwatch_log_group.gap_test,
    data.archive_file.gap_test_lambda
  ]

  tags = local.common_tags
}

# Lambda Function: Contact
resource "aws_lambda_function" "contact" {
  filename         = "contact_lambda.zip"
  function_name    = "${local.name_prefix}-contact"
  role            = aws_iam_role.lambda_execution_role.arn
  handler         = "lambda_function.lambda_handler"
  source_code_hash = data.archive_file.contact_lambda.output_base64sha256
  runtime         = var.lambda_runtime
  timeout         = var.lambda_timeout
  memory_size     = var.lambda_memory_size

  layers = [aws_lambda_layer_version.python_dependencies.arn]

  vpc_config {
    subnet_ids         = module.vpc.private_subnets
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DOCDB_SECRET_ARN = aws_secretsmanager_secret.docdb_credentials.arn
      ENVIRONMENT      = var.environment
      LOG_LEVEL        = var.environment == "prod" ? "INFO" : "DEBUG"
    }
  }

  depends_on = [
    aws_cloudwatch_log_group.contact,
    data.archive_file.contact_lambda
  ]

  tags = local.common_tags
}

# Lambda Function: Mock Purchase
resource "aws_lambda_function" "mock_purchase" {
  filename         = "mock_purchase_lambda.zip"
  function_name    = "${local.name_prefix}-mock-purchase"
  role            = aws_iam_role.lambda_execution_role.arn
  handler         = "lambda_function.lambda_handler"
  source_code_hash = data.archive_file.mock_purchase_lambda.output_base64sha256
  runtime         = var.lambda_runtime
  timeout         = var.lambda_timeout
  memory_size     = var.lambda_memory_size

  layers = [aws_lambda_layer_version.python_dependencies.arn]

  vpc_config {
    subnet_ids         = module.vpc.private_subnets
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DOCDB_SECRET_ARN = aws_secretsmanager_secret.docdb_credentials.arn
      ENVIRONMENT      = var.environment
      LOG_LEVEL        = var.environment == "prod" ? "INFO" : "DEBUG"
    }
  }

  depends_on = [
    aws_cloudwatch_log_group.mock_purchase,
    data.archive_file.mock_purchase_lambda
  ]

  tags = local.common_tags
}

# Lambda Function: Status Check
resource "aws_lambda_function" "status" {
  filename         = "status_lambda.zip"
  function_name    = "${local.name_prefix}-status"
  role            = aws_iam_role.lambda_execution_role.arn
  handler         = "lambda_function.lambda_handler"
  source_code_hash = data.archive_file.status_lambda.output_base64sha256
  runtime         = var.lambda_runtime
  timeout         = 10  # Status check should be fast
  memory_size     = 128 # Minimal memory for status check

  layers = [aws_lambda_layer_version.python_dependencies.arn]

  vpc_config {
    subnet_ids         = module.vpc.private_subnets
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DOCDB_SECRET_ARN = aws_secretsmanager_secret.docdb_credentials.arn
      ENVIRONMENT      = var.environment
      LOG_LEVEL        = var.environment == "prod" ? "INFO" : "DEBUG"
    }
  }

  depends_on = [
    aws_cloudwatch_log_group.status,
    data.archive_file.status_lambda
  ]

  tags = local.common_tags
}

# Archive files for Lambda functions (these will be created by build process)
data "archive_file" "gap_test_lambda" {
  type        = "zip"
  output_path = "gap_test_lambda.zip"
  source_dir  = "${path.module}/lambda_functions/gap_test"
}

data "archive_file" "contact_lambda" {
  type        = "zip"
  output_path = "contact_lambda.zip"
  source_dir  = "${path.module}/lambda_functions/contact"
}

data "archive_file" "mock_purchase_lambda" {
  type        = "zip"
  output_path = "mock_purchase_lambda.zip"
  source_dir  = "${path.module}/lambda_functions/mock_purchase"
}

data "archive_file" "status_lambda" {
  type        = "zip"
  output_path = "status_lambda.zip"
  source_dir  = "${path.module}/lambda_functions/status"
}