import json
import boto3
import os
import logging
from datetime import datetime, timezone

# Configure logging
logger = logging.getLogger()
logger.setLevel(os.environ.get('LOG_LEVEL', 'INFO'))

# Initialize AWS clients
secrets_client = boto3.client('secretsmanager')

def get_db_credentials():
    """Get database credentials from Secrets Manager"""
    try:
        secret_arn = os.environ['DOCDB_SECRET_ARN']
        response = secrets_client.get_secret_value(SecretId=secret_arn)
        return json.loads(response['SecretString'])
    except Exception as e:
        logger.error(f"Error getting DB credentials: {str(e)}")
        raise

def test_docdb_connection():
    """Test DocumentDB connection"""
    try:
        credentials = get_db_credentials()
        # Import pymongo here to avoid cold start issues
        from pymongo import MongoClient
        
        connection_string = f"mongodb://{credentials['username']}:{credentials['password']}@{credentials['host']}:{credentials['port']}/{credentials['dbname']}?retryWrites=false"
        client = MongoClient(connection_string, serverSelectionTimeoutMS=5000)
        
        # Test connection
        client.server_info()
        db = client[credentials['dbname']]
        
        # Get collection stats
        stats = {
            'gap_tests': db.gap_tests.count_documents({}),
            'contact_forms': db.contact_forms.count_documents({}),
            'purchases': db.purchases.count_documents({})
        }
        
        return {'status': 'connected', 'collections': stats}
    except Exception as e:
        logger.error(f"DocumentDB connection failed: {str(e)}")
        return {'status': 'disconnected', 'error': str(e)}

def lambda_handler(event, context):
    """Lambda handler for system status checks"""
    
    # CORS headers
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,OPTIONS'
    }
    
    try:
        # Handle OPTIONS request for CORS
        if event.get('httpMethod') == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': 'CORS preflight'})
            }
        
        logger.info("Status check requested")
        
        # System status
        status = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'environment': os.environ.get('ENVIRONMENT', 'unknown'),
            'region': os.environ.get('AWS_REGION', 'unknown'),
            'lambda_version': context.function_version if context else 'unknown',
            'services': {
                'lambda': 'healthy',
                'secrets_manager': 'unknown',
                'documentdb': 'unknown'
            }
        }
        
        # Test Secrets Manager
        try:
            get_db_credentials()
            status['services']['secrets_manager'] = 'healthy'
        except Exception as e:
            status['services']['secrets_manager'] = f'error: {str(e)}'
        
        # Test DocumentDB
        db_status = test_docdb_connection()
        if db_status['status'] == 'connected':
            status['services']['documentdb'] = 'healthy'
            status['database_stats'] = db_status['collections']
        else:
            status['services']['documentdb'] = f"error: {db_status.get('error', 'unknown')}"
        
        # Overall health
        all_healthy = all(
            service == 'healthy' 
            for service in status['services'].values()
        )
        status['overall_status'] = 'healthy' if all_healthy else 'degraded'
        
        logger.info(f"Status check completed: {status['overall_status']}")
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(status)
        }
        
    except Exception as e:
        logger.error(f"Error in status check: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'overall_status': 'error',
                'error': str(e)
            })
        }