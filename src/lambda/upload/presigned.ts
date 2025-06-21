import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AuthService } from '../../lib/aws/cognito';
import { ResponseBuilder } from '../../lib/aws/response';
import { S3Service } from '../../lib/aws/s3';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return ResponseBuilder.cors();
    }

    // Verify authentication
    const token = AuthService.extractTokenFromHeader(event.headers.Authorization || event.headers.authorization);
    if (!token) {
      return ResponseBuilder.error('Authorization token required', 401);
    }

    const decoded = AuthService.verifyToken(token);
    if (!decoded) {
      return ResponseBuilder.error('Invalid or expired token', 401);
    }

    if (!event.body) {
      return ResponseBuilder.error('Request body is required', 400);
    }

    const { filename, contentType, type = 'training' } = JSON.parse(event.body);

    if (!filename || !contentType) {
      return ResponseBuilder.error('Filename and content type are required', 400);
    }

    // Validate content type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(contentType.toLowerCase())) {
      return ResponseBuilder.error('Invalid file type. Only JPEG, PNG, and WebP images are allowed', 400);
    }

    // Validate type parameter
    if (!['training', 'generated'].includes(type)) {
      return ResponseBuilder.error('Invalid type. Must be "training" or "generated"', 400);
    }

    // Generate S3 key
    const key = S3Service.generateKey(decoded.userId, type as 'training' | 'generated', filename);

    // Generate presigned URL for upload
    const uploadUrl = await S3Service.getPresignedUploadUrl(key, contentType, 3600); // 1 hour expiry

    // Generate the final public URL
    const publicUrl = S3Service.getPublicUrl(key);

    return ResponseBuilder.success({
      uploadUrl,
      publicUrl,
      key,
    });

  } catch (error: any) {
    console.error('Get presigned URL error:', error);
    return ResponseBuilder.error('Failed to generate upload URL', 500, error.message);
  }
};
