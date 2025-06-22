/**
 * File upload Lambda function
 * Generates presigned URLs for S3 uploads
 */

import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';

// ** Import server utilities
import { createSuccessResponse, createErrorResponse, createMiddlewareStack } from '@server/utils';

// ** Import server lib
import { AuthService, S3Service } from '@server/lib/aws';

// ** Import server config
import { serverEnv } from '@server/config';

// ** Import types
import type { PresignedUrlRequest, PresignedUrlResponse, LambdaHandler } from '@server/types';

/**
 * Generate presigned URL for file upload
 */
const generatePresignedUrl = async (userId: string, request: PresignedUrlRequest): Promise<APIGatewayProxyResult> => {
  try {
    const { filename, contentType, type, modelId } = request;

    // Validate request
    if (!filename || !contentType || !type) {
      return createErrorResponse('Missing required fields: filename, contentType, type', 400);
    }

    if (type === 'training' && !modelId) {
      return createErrorResponse('modelId is required for training images', 400);
    }

    // Generate unique key
    const fileExtension = filename.split('.').pop();
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;
    
    let bucketName: string;
    let keyPrefix: string;

    switch (type) {
      case 'training':
        bucketName = `${serverEnv.aws.s3.buckets.trainingImages}`;
        keyPrefix = `${userId}/models/${modelId}/images`;
        break;
      case 'generated':
        bucketName = `${serverEnv.aws.s3.buckets.generatedImages}`;
        keyPrefix = `${userId}/generated`;
        break;
      case 'avatar':
        bucketName = `${serverEnv.aws.s3.buckets.trainingImages}`; // Reuse training bucket for avatars
        keyPrefix = `${userId}/avatars`;
        break;
      default:
        return createErrorResponse('Invalid upload type', 400);
    }

    const key = `${keyPrefix}/${uniqueFilename}`;

    // Generate presigned URL
    const presignedData = await S3Service.generatePresignedUrl({
      bucket: bucketName,
      key,
      contentType,
      expiresIn: 300, // 5 minutes
    });

    const response: PresignedUrlResponse = {
      uploadUrl: presignedData.url,
      fileUrl: `https://${bucketName}.s3.${serverEnv.aws.region}.amazonaws.com/${key}`,
      key,
      fields: presignedData.fields || {},
    };

    return createSuccessResponse(response);
  } catch (error) {
    console.error('Generate presigned URL error:', error);
    return createErrorResponse('Failed to generate upload URL', 500);
  }
};

/**
 * Main upload handler
 */
const uploadHandler: LambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Extract user ID from JWT token
    const authHeader = event.headers.Authorization || event.headers.authorization;
    if (!authHeader) {
      return createErrorResponse('Authorization header required', 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = AuthService.verifyToken(token);
    const userId = decoded.userId;

    const method = event.httpMethod;

    switch (method) {
      case 'POST':
        if (!event.body) {
          return createErrorResponse('Request body is required', 400);
        }
        
        const request: PresignedUrlRequest = JSON.parse(event.body);
        return await generatePresignedUrl(userId, request);
        
      default:
        return createErrorResponse('Method not allowed', 405);
    }
  } catch (error) {
    console.error('Upload handler error:', error);
    return createErrorResponse('Internal server error', 500);
  }
};

// Export handler with middleware
export const handler = createMiddlewareStack({
  cors: true,
  requireAuth: true,
  validateBody: (body: any) => {
    const required = ['filename', 'contentType', 'type'];
    const missing = required.filter(field => !body || !body[field]);
    
    // Check for modelId if type is training
    if (body?.type === 'training' && !body.modelId) {
      missing.push('modelId');
    }
    
    return {
      isValid: missing.length === 0,
      errors: missing.length > 0 ? { missingFields: missing } : undefined,
    };
  },
})(uploadHandler);