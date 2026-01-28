# DocumentDB Configuration for Malumz Movement

# Random password for DocumentDB
resource "random_password" "docdb_password" {
  length  = 16
  special = true
}

# Secrets Manager secret for DocumentDB credentials
resource "aws_secretsmanager_secret" "docdb_credentials" {
  name        = "${local.name_prefix}-docdb-credentials"
  description = "DocumentDB credentials for Malumz Movement"
  
  tags = local.common_tags
}

resource "aws_secretsmanager_secret_version" "docdb_credentials" {
  secret_id = aws_secretsmanager_secret.docdb_credentials.id
  secret_string = jsonencode({
    username = "malumz_admin"
    password = random_password.docdb_password.result
    engine   = "docdb"
    host     = aws_docdb_cluster.main.endpoint
    port     = aws_docdb_cluster.main.port
    dbname   = "malumz_movement"
  })
}

# DocumentDB Subnet Group
resource "aws_docdb_subnet_group" "main" {
  name       = "${local.name_prefix}-docdb-subnet-group"
  subnet_ids = module.vpc.private_subnets

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-docdb-subnet-group"
  })
}

# DocumentDB Parameter Group
resource "aws_docdb_cluster_parameter_group" "main" {
  family = "docdb5.0"
  name   = "${local.name_prefix}-docdb-params"

  parameter {
    name  = "tls"
    value = "disabled"  # Simplified for development - enable for production
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-docdb-params"
  })
}

# DocumentDB Cluster
resource "aws_docdb_cluster" "main" {
  cluster_identifier      = "${local.name_prefix}-docdb-cluster"
  engine                  = "docdb"
  master_username         = "malumz_admin"
  master_password         = random_password.docdb_password.result
  backup_retention_period = var.docdb_backup_retention_period
  preferred_backup_window = "07:00-09:00"
  skip_final_snapshot     = var.docdb_skip_final_snapshot
  
  db_subnet_group_name            = aws_docdb_subnet_group.main.name
  db_cluster_parameter_group_name = aws_docdb_cluster_parameter_group.main.name
  vpc_security_group_ids          = [aws_security_group.docdb.id]
  
  storage_encrypted = true
  
  # Enable logging
  enabled_cloudwatch_logs_exports = ["audit", "profiler"]

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-docdb-cluster"
  })
}

# DocumentDB Cluster Instances
resource "aws_docdb_cluster_instance" "cluster_instances" {
  count              = var.docdb_instance_count
  identifier         = "${local.name_prefix}-docdb-${count.index}"
  cluster_identifier = aws_docdb_cluster.main.id
  instance_class     = var.docdb_instance_class

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-docdb-instance-${count.index}"
  })
}

# CloudWatch Log Groups for DocumentDB
resource "aws_cloudwatch_log_group" "docdb_audit" {
  name              = "/aws/docdb/${aws_docdb_cluster.main.cluster_identifier}/audit"
  retention_in_days = var.log_retention_days

  tags = local.common_tags
}

resource "aws_cloudwatch_log_group" "docdb_profiler" {
  name              = "/aws/docdb/${aws_docdb_cluster.main.cluster_identifier}/profiler"
  retention_in_days = var.log_retention_days

  tags = local.common_tags
}