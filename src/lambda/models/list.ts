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

    // Get user's training models
    const models = await DynamoDBService.query(
      Tables.TRAINING_MODELS,
      'UserIdIndex',
      '#userId = :userId',
      { '#userId': 'userId' },
      { ':userId': decoded.userId }
    );

    // Sort by creation date (newest first)
    models.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return ResponseBuilder.success(models);

  } catch (error: any) {
    console.error('List models error:', error);
    return ResponseBuilder.error('Failed to list models', 500, error.message);
  }
};
