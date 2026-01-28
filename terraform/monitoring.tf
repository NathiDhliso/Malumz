# Monitoring and Alerting Configuration for Malumz Movement

# CloudWatch Alarms for Lambda Functions
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  for_each = {
    gap_test      = aws_lambda_function.gap_test.function_name
    contact       = aws_lambda_function.contact.function_name
    mock_purchase = aws_lambda_function.mock_purchase.function_name
    status        = aws_lambda_function.status.function_name
  }

  alarm_name          = "${local.name_prefix}-lambda-${each.key}-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = "300"
  statistic           = "Sum"
  threshold           = "5"
  alarm_description   = "This metric monitors lambda errors for ${each.key}"
  alarm_actions       = var.enable_detailed_monitoring ? [aws_sns_topic.alerts[0].arn] : []

  dimensions = {
    FunctionName = each.value
  }

  tags = local.common_tags
}

# CloudWatch Alarms for Lambda Duration
resource "aws_cloudwatch_metric_alarm" "lambda_duration" {
  for_each = {
    gap_test      = aws_lambda_function.gap_test.function_name
    contact       = aws_lambda_function.contact.function_name
    mock_purchase = aws_lambda_function.mock_purchase.function_name
    status        = aws_lambda_function.status.function_name
  }

  alarm_name          = "${local.name_prefix}-lambda-${each.key}-duration"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "Duration"
  namespace           = "AWS/Lambda"
  period              = "300"
  statistic           = "Average"
  threshold           = "25000"  # 25 seconds
  alarm_description   = "This metric monitors lambda duration for ${each.key}"
  alarm_actions       = var.enable_detailed_monitoring ? [aws_sns_topic.alerts[0].arn] : []

  dimensions = {
    FunctionName = each.value
  }

  tags = local.common_tags
}

# CloudWatch Alarm for API Gateway 4XX Errors
resource "aws_cloudwatch_metric_alarm" "api_gateway_4xx" {
  alarm_name          = "${local.name_prefix}-api-gateway-4xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "4XXError"
  namespace           = "AWS/ApiGateway"
  period              = "300"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "This metric monitors API Gateway 4XX errors"
  alarm_actions       = var.enable_detailed_monitoring ? [aws_sns_topic.alerts[0].arn] : []

  dimensions = {
    ApiName = aws_api_gateway_rest_api.main.name
    Stage   = local.api_stage_name
  }

  tags = local.common_tags
}

# CloudWatch Alarm for API Gateway 5XX Errors
resource "aws_cloudwatch_metric_alarm" "api_gateway_5xx" {
  alarm_name          = "${local.name_prefix}-api-gateway-5xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "5XXError"
  namespace           = "AWS/ApiGateway"
  period              = "300"
  statistic           = "Sum"
  threshold           = "1"
  alarm_description   = "This metric monitors API Gateway 5XX errors"
  alarm_actions       = var.enable_detailed_monitoring ? [aws_sns_topic.alerts[0].arn] : []

  dimensions = {
    ApiName = aws_api_gateway_rest_api.main.name
    Stage   = local.api_stage_name
  }

  tags = local.common_tags
}

# CloudWatch Alarm for DocumentDB CPU
resource "aws_cloudwatch_metric_alarm" "docdb_cpu" {
  alarm_name          = "${local.name_prefix}-docdb-cpu-utilization"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/DocDB"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors DocumentDB CPU utilization"
  alarm_actions       = var.enable_detailed_monitoring ? [aws_sns_topic.alerts[0].arn] : []

  dimensions = {
    DBClusterIdentifier = aws_docdb_cluster.main.cluster_identifier
  }

  tags = local.common_tags
}

# CloudWatch Alarm for DocumentDB Connections
resource "aws_cloudwatch_metric_alarm" "docdb_connections" {
  alarm_name          = "${local.name_prefix}-docdb-connections"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/DocDB"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors DocumentDB connections"
  alarm_actions       = var.enable_detailed_monitoring ? [aws_sns_topic.alerts[0].arn] : []

  dimensions = {
    DBClusterIdentifier = aws_docdb_cluster.main.cluster_identifier
  }

  tags = local.common_tags
}

# SNS Topic for Alerts (conditional)
resource "aws_sns_topic" "alerts" {
  count = var.enable_detailed_monitoring ? 1 : 0
  name  = "${local.name_prefix}-alerts"

  tags = local.common_tags
}

# CloudWatch Dashboard
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${local.name_prefix}-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/Lambda", "Invocations", "FunctionName", aws_lambda_function.gap_test.function_name],
            [".", "Errors", ".", "."],
            [".", "Duration", ".", "."],
            ["AWS/Lambda", "Invocations", "FunctionName", aws_lambda_function.contact.function_name],
            [".", "Errors", ".", "."],
            [".", "Duration", ".", "."],
            ["AWS/Lambda", "Invocations", "FunctionName", aws_lambda_function.mock_purchase.function_name],
            [".", "Errors", ".", "."],
            [".", "Duration", ".", "."],
            ["AWS/Lambda", "Invocations", "FunctionName", aws_lambda_function.status.function_name],
            [".", "Errors", ".", "."],
            [".", "Duration", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "Lambda Functions"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/ApiGateway", "Count", "ApiName", aws_api_gateway_rest_api.main.name, "Stage", local.api_stage_name],
            [".", "4XXError", ".", ".", ".", "."],
            [".", "5XXError", ".", ".", ".", "."],
            [".", "Latency", ".", ".", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "API Gateway"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 12
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/DocDB", "CPUUtilization", "DBClusterIdentifier", aws_docdb_cluster.main.cluster_identifier],
            [".", "DatabaseConnections", ".", "."],
            [".", "ReadLatency", ".", "."],
            [".", "WriteLatency", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "DocumentDB"
          period  = 300
        }
      }
    ]
  })
}

# CloudWatch Insights Queries
resource "aws_cloudwatch_query_definition" "lambda_errors" {
  name = "${local.name_prefix}-lambda-errors"

  log_group_names = [
    aws_cloudwatch_log_group.gap_test.name,
    aws_cloudwatch_log_group.contact.name,
    aws_cloudwatch_log_group.mock_purchase.name,
    aws_cloudwatch_log_group.status.name
  ]

  query_string = <<EOF
fields @timestamp, @message, @requestId
| filter @message like /ERROR/
| sort @timestamp desc
| limit 100
EOF
}

resource "aws_cloudwatch_query_definition" "api_gateway_errors" {
  name = "${local.name_prefix}-api-gateway-errors"

  log_group_names = [
    aws_cloudwatch_log_group.api_gateway.name
  ]

  query_string = <<EOF
fields @timestamp, @message, requestId, status, httpMethod, resourcePath
| filter status >= 400
| sort @timestamp desc
| limit 100
EOF
}

# CloudWatch Dashboard for Cost Monitoring
resource "aws_cloudwatch_dashboard" "cost_monitoring" {
  count          = var.enable_detailed_monitoring ? 1 : 0
  dashboard_name = "${local.name_prefix}-cost-monitoring"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/Lambda", "Duration", "FunctionName", aws_lambda_function.gap_test.function_name],
            ["AWS/Lambda", "Invocations", "FunctionName", aws_lambda_function.gap_test.function_name],
            ["AWS/Lambda", "Errors", "FunctionName", aws_lambda_function.gap_test.function_name]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "Lambda Metrics"
          period  = 300
        }
      }
    ]
  })
}