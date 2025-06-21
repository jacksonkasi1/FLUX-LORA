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

    const modelId = event.pathParameters?.id;
    if (!modelId) {
      return ResponseBuilder.error('Model ID is required', 400);
    }

    // Get the training model
    const model = await DynamoDBService.get(Tables.TRAINING_MODELS, { id: modelId });
    
    if (!model) {
      return ResponseBuilder.error('Model not found', 404);
    }

    // Verify ownership
    if (model.userId !== decoded.userId) {
      return ResponseBuilder.error('Access denied', 403);
    }

    return ResponseBuilder.success(model);

  } catch (error: any) {
    console.error('Get model error:', error);
    return ResponseBuilder.error('Failed to get model', 500, error.message);
  }
};
