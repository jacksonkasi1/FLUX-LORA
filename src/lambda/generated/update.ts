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

    const imageId = event.pathParameters?.id;
    if (!imageId) {
      return ResponseBuilder.error('Image ID is required', 400);
    }

    if (!event.body) {
      return ResponseBuilder.error('Request body is required', 400);
    }

    // Get the existing image to verify ownership
    const existingImage = await DynamoDBService.get(Tables.GENERATED_IMAGES, { id: imageId });
    
    if (!existingImage) {
      return ResponseBuilder.error('Generated image not found', 404);
    }

    if (existingImage.userId !== decoded.userId) {
      return ResponseBuilder.error('Access denied', 403);
    }

    const updates = JSON.parse(event.body);
    const allowedFields = ['isFavorite', 'prompt', 'negativePrompt', 'generationConfig'];
    
    const filteredUpdates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return ResponseBuilder.error('No valid fields to update', 400);
    }

    // Update the generated image
    const updatedImage = await DynamoDBService.update(
      Tables.GENERATED_IMAGES,
      { id: imageId },
      filteredUpdates
    );

    return ResponseBuilder.success(updatedImage);

  } catch (error: any) {
    console.error('Update generated image error:', error);
    return ResponseBuilder.error('Failed to update generated image', 500, error.message);
  }
};
