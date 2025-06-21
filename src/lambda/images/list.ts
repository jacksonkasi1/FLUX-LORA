import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBService, Tables } from '../../lib/aws/dynamodb';
import { AuthService } from '../../lib/aws/cognito';
import { ResponseBuilder } from '../../lib/aws/response';

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

    const modelId = event.pathParameters?.modelId;
    if (!modelId) {
      return ResponseBuilder.error('Model ID is required', 400);
    }

    // Verify model ownership
    const model = await DynamoDBService.get(Tables.TRAINING_MODELS, { id: modelId });
    if (!model) {
      return ResponseBuilder.error('Training model not found', 404);
    }

    if (model.userId !== decoded.userId) {
      return ResponseBuilder.error('Access denied', 403);
    }

    // Get training images for this model
    const images = await DynamoDBService.query(
      Tables.TRAINING_IMAGES,
      'TrainingModelIdIndex',
      '#trainingModelId = :trainingModelId',
      { '#trainingModelId': 'trainingModelId' },
      { ':trainingModelId': modelId }
    );

    // Sort by creation date (newest first)
    images.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return ResponseBuilder.success(images);

  } catch (error: any) {
    console.error('List training images error:', error);
    return ResponseBuilder.error('Failed to list training images', 500, error.message);
  }
};
