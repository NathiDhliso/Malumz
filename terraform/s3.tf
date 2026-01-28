# S3 Configuration for Malumz Movement

# S3 Bucket for Assets
resource "aws_s3_bucket" "assets" {
  bucket = "${local.name_prefix}-assets-${random_id.bucket_suffix.hex}"

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-assets"
    Purpose     = "Static assets and uploads"
    Environment = var.environment
  })
}

# S3 Bucket for Backups
resource "aws_s3_bucket" "backups" {
  bucket = "${local.name_prefix}-backups-${random_id.bucket_suffix.hex}"

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-backups"
    Purpose     = "Database backups and archives"
    Environment = var.environment
  })
}

# Random ID for bucket naming
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# S3 Bucket Versioning - Assets
resource "aws_s3_bucket_versioning" "assets" {
  bucket = aws_s3_bucket.assets.id
  versioning_configuration {
    status = "Enabled"
  }
}

# S3 Bucket Versioning - Backups
resource "aws_s3_bucket_versioning" "backups" {
  bucket = aws_s3_bucket.backups.id
  versioning_configuration {
    status = "Enabled"
  }
}

# S3 Bucket Encryption - Assets
resource "aws_s3_bucket_server_side_encryption_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

# S3 Bucket Encryption - Backups
resource "aws_s3_bucket_server_side_encryption_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

# S3 Bucket Public Access Block - Assets
resource "aws_s3_bucket_public_access_block" "assets" {
  bucket = aws_s3_bucket.assets.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 Bucket Public Access Block - Backups
resource "aws_s3_bucket_public_access_block" "backups" {
  bucket = aws_s3_bucket.backups.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 Bucket Lifecycle Configuration - Assets
resource "aws_s3_bucket_lifecycle_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id

  rule {
    id     = "assets_lifecycle"
    status = "Enabled"

    filter {
      prefix = ""
    }

    # Transition to IA after 30 days
    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    # Transition to Glacier after 90 days
    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    # Delete old versions after 365 days
    noncurrent_version_expiration {
      noncurrent_days = 365
    }
  }
}

# S3 Bucket Lifecycle Configuration - Backups
resource "aws_s3_bucket_lifecycle_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id

  rule {
    id     = "backups_lifecycle"
    status = "Enabled"

    filter {
      prefix = ""
    }

    # Transition to IA after 30 days
    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    # Transition to Glacier after 60 days
    transition {
      days          = 60
      storage_class = "GLACIER"
    }

    # Transition to Deep Archive after 180 days (90 days more than Glacier)
    transition {
      days          = 180
      storage_class = "DEEP_ARCHIVE"
    }

    # Keep backups for 7 years
    expiration {
      days = 2555
    }

    # Delete old versions after 30 days
    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

# IAM Policy for Lambda to access S3
resource "aws_iam_role_policy" "lambda_s3_policy" {
  name = "${local.name_prefix}-lambda-s3-policy"
  role = aws_iam_role.lambda_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = [
          "${aws_s3_bucket.assets.arn}/*",
          "${aws_s3_bucket.backups.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.assets.arn,
          aws_s3_bucket.backups.arn
        ]
      }
    ]
  })
}