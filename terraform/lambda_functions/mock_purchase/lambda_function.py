import json
import boto3
import os
import logging
from datetime import datetime, timezone
import uuid

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

def connect_to_docdb():
    """Connect to DocumentDB"""
    try:
        credentials = get_db_credentials()
        # Import pymongo here to avoid cold start issues
        from pymongo import MongoClient
        
        connection_string = f"mongodb://{credentials['username']}:{credentials['password']}@{credentials['host']}:{credentials['port']}/{credentials['dbname']}?retryWrites=false"
        client = MongoClient(connection_string)
        db = client[credentials['dbname']]
        return db
    except Exception as e:
        logger.error(f"Error connecting to DocumentDB: {str(e)}")
        raise

def lambda_handler(event, context):
    """Lambda handler for Mock Purchase submissions"""
    
    # CORS headers
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
    }
    
    try:
        # Handle OPTIONS request for CORS
        if event.get('httpMethod') == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': 'CORS preflight'})
            }
        
        # Parse request body
        if 'body' not in event:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Missing request body'})
            }
        
        body = json.loads(event['body'])
        logger.info(f"Received mock purchase: {body.get('name', 'Unknown')}")
        
        # Validate required fields
        required_fields = ['name', 'email', 'phone', 'address', 'city', 'postalCode']
        for field in required_fields:
            if field not in body:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': f'Missing required field: {field}'})
                }
        
        # Create purchase record
        purchase = {
            'id': str(uuid.uuid4()),
            'name': body['name'],
            'email': body['email'],
            'phone': body['phone'],
            'address': body['address'],
            'city': body['city'],
            'postal_code': body['postalCode'],
            'book_title': 'Malumz Movement: A Guide to Personal Growth',
            'price': 299.00,  # R299 in cents would be 29900, but storing as decimal for clarity
            'currency': 'ZAR',
            'status': 'completed',  # Mock purchase is always successful
            'payment_method': 'mock',
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        
        # Save to DocumentDB
        db = connect_to_docdb()
        collection = db.purchases
        collection.insert_one(purchase.copy())
        
        logger.info(f"Mock purchase saved successfully: {purchase['id']}")
        
        # Return success response
        response = {
            'id': purchase['id'],
            'status': 'success',
            'message': 'Purchase completed successfully!',
            'order_number': purchase['id'][:8].upper(),
            'amount': purchase['price'],
            'currency': purchase['currency']
        }
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(response)
        }
        
    except json.JSONDecodeError:
        logger.error("Invalid JSON in request body")
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Invalid JSON in request body'})
        }
    except Exception as e:
        logger.error(f"Error processing mock purchase: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': 'Internal server error'})
        }