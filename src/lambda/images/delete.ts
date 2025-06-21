import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBService, Tables } from '../../lib/aws/dynamodb';
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

    const imageId = event.pathParameters?.id;
    if (!imageId) {
      return ResponseBuilder.error('Image ID is required', 400);
    }

    // Get the existing image to verify ownership
    const existingImage = await DynamoDBService.get(Tables.TRAINING_IMAGES, { id: imageId });
    
    if (!existingImage) {
      return ResponseBuilder.error('Training image not found', 404);
    }

    if (existingImage.userId !== decoded.userId) {
      return ResponseBuilder.error('Access denied', 403);
    }

    // Delete image from S3 if it's stored there
    if (existingImage.imageUrl && existingImage.imageUrl.includes('amazonaws.com')) {
      try {
        const url = new URL(existingImage.imageUrl);
        const key = url.pathname.substring(1); // Remove leading slash
        await S3Service.deleteObject(key);
      } catch (s3Error) {
        console.warn('Failed to delete image from S3:', s3Error);
      }
    }

    // Delete the image record from database
    await DynamoDBService.delete(Tables.TRAINING_IMAGES, { id: imageId });

    // Update model's image count
    const remainingImages = await DynamoDBService.query(
      Tables.TRAINING_IMAGES,
      'TrainingModelIdIndex',
      '#trainingModelId = :trainingModelId',
      { '#trainingModelId': 'trainingModelId' },
      { ':trainingModelId': existingImage.trainingModelId }
    );

    await DynamoDBService.update(
      Tables.TRAINING_MODELS,
      { id: existingImage.trainingModelId },
      { imageCount: remainingImages.length }
    );

    return ResponseBuilder.success({ message: 'Training image deleted successfully' });

  } catch (error: any) {
    console.error('Delete training image error:', error);
    return ResponseBuilder.error('Failed to delete training image', 500, error.message);
  }
};
