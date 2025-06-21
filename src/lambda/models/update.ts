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

    if (!event.body) {
      return ResponseBuilder.error('Request body is required', 400);
    }

    // Get the existing model to verify ownership
    const existingModel = await DynamoDBService.get(Tables.TRAINING_MODELS, { id: modelId });
    
    if (!existingModel) {
      return ResponseBuilder.error('Model not found', 404);
    }

    if (existingModel.userId !== decoded.userId) {
      return ResponseBuilder.error('Access denied', 403);
    }

    const updates = JSON.parse(event.body);
    const allowedFields = ['name', 'description', 'status', 'modelUrl', 'thumbnailUrl', 'trainingConfig', 'imageCount'];
    
    const filteredUpdates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return ResponseBuilder.error('No valid fields to update', 400);
    }

    // Update the model
    const updatedModel = await DynamoDBService.update(
      Tables.TRAINING_MODELS,
      { id: modelId },
      filteredUpdates
    );

    return ResponseBuilder.success(updatedModel);

  } catch (error: any) {
    console.error('Update model error:', error);
    return ResponseBuilder.error('Failed to update model', 500, error.message);
  }
};
