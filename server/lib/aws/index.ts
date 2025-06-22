/**
 * Central export for AWS services
 */

// ** Configuration
export { AWS_REGION, S3_BUCKET_NAME, DYNAMODB_TABLES, DYNAMODB_INDEXES } from './config';

// ** DynamoDB service
export { DynamoDBService, Tables, dynamodb } from './dynamodb';

// ** S3 service
export { S3Service } from './s3';

// ** Authentication service
export { AuthService } from './auth';

// ** Response builder
export { ResponseBuilder } from './response';
export type { LambdaResponse } from './response';
