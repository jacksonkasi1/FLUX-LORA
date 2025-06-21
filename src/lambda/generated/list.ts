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

    // Get user's generated images
    const images = await DynamoDBService.query(
      Tables.GENERATED_IMAGES,
      'UserIdIndex',
      '#userId = :userId',
      { '#userId': 'userId' },
      { ':userId': decoded.userId }
    );

    // Sort by creation date (newest first)
    images.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Enrich with training model information if available
    const enrichedImages = await Promise.all(
      images.map(async (image) => {
        if (image.trainingModelId) {
          try {
            const model = await DynamoDBService.get(Tables.TRAINING_MODELS, { id: image.trainingModelId });
            return {
              ...image,
              training_model: model ? {
                id: model.id,
                name: model.name,
                trigger_word: model.triggerWord,
              } : null,
            };
          } catch (error) {
            console.warn('Failed to fetch training model:', error);
            return image;
          }
        }
        return image;
      })
    );

    return ResponseBuilder.success(enrichedImages);

  } catch (error: any) {
    console.error('List generated images error:', error);
    return ResponseBuilder.error('Failed to list generated images', 500, error.message);
  }
};
