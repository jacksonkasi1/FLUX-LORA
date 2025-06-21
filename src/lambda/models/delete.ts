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

    const modelId = event.pathParameters?.id;
    if (!modelId) {
      return ResponseBuilder.error('Model ID is required', 400);
    }

    // Get the existing model to verify ownership
    const existingModel = await DynamoDBService.get(Tables.TRAINING_MODELS, { id: modelId });
    
    if (!existingModel) {
      return ResponseBuilder.error('Model not found', 404);
    }

    if (existingModel.userId !== decoded.userId) {
      return ResponseBuilder.error('Access denied', 403);
    }

    // Get all training images for this model
    const trainingImages = await DynamoDBService.query(
      Tables.TRAINING_IMAGES,
      'TrainingModelIdIndex',
      '#trainingModelId = :trainingModelId',
      { '#trainingModelId': 'trainingModelId' },
      { ':trainingModelId': modelId }
    );

    // Delete training images from S3 and database
    for (const image of trainingImages) {
      try {
        // Extract S3 key from URL
        const url = new URL(image.imageUrl);
        const key = url.pathname.substring(1); // Remove leading slash
        await S3Service.deleteObject(key);
      } catch (s3Error) {
        console.warn('Failed to delete S3 object:', s3Error);
      }
      
      await DynamoDBService.delete(Tables.TRAINING_IMAGES, { id: image.id });
    }

    // Delete model file from S3 if it exists
    if (existingModel.modelUrl) {
      try {
        const url = new URL(existingModel.modelUrl);
        const key = url.pathname.substring(1);
        await S3Service.deleteObject(key);
      } catch (s3Error) {
        console.warn('Failed to delete model file from S3:', s3Error);
      }
    }

    // Delete thumbnail from S3 if it exists
    if (existingModel.thumbnailUrl) {
      try {
        const url = new URL(existingModel.thumbnailUrl);
        const key = url.pathname.substring(1);
        await S3Service.deleteObject(key);
      } catch (s3Error) {
        console.warn('Failed to delete thumbnail from S3:', s3Error);
      }
    }

    // Delete the model from database
    await DynamoDBService.delete(Tables.TRAINING_MODELS, { id: modelId });

    return ResponseBuilder.success({ message: 'Model deleted successfully' });

  } catch (error: any) {
    console.error('Delete model error:', error);
    return ResponseBuilder.error('Failed to delete model', 500, error.message);
  }
};
