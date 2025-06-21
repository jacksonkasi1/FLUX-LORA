import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBService, Tables } from '../../lib/aws/dynamodb';
import { AuthService } from '../../lib/aws/cognito';
import { ResponseBuilder } from '../../lib/aws/response';
import { GeneratedImage } from '../../types/database';
import { randomBytes } from 'crypto';

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

    const { 
      prompt, 
      negativePrompt, 
      imageUrl, 
      trainingModelId, 
      generationConfig = {},
      isFavorite = false 
    } = JSON.parse(event.body);

    if (!prompt || !imageUrl) {
      return ResponseBuilder.error('Prompt and image URL are required', 400);
    }

    // Verify training model ownership if provided
    if (trainingModelId) {
      const model = await DynamoDBService.get(Tables.TRAINING_MODELS, { id: trainingModelId });
      if (!model || model.userId !== decoded.userId) {
        return ResponseBuilder.error('Invalid training model', 400);
      }
    }

    // Create new generated image record
    const imageId = randomBytes(16).toString('hex');
    
    const generatedImage: GeneratedImage = {
      id: imageId,
      userId: decoded.userId,
      trainingModelId,
      prompt,
      negativePrompt,
      imageUrl,
      generationConfig,
      isFavorite,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await DynamoDBService.put(Tables.GENERATED_IMAGES, generatedImage);

    return ResponseBuilder.success(generatedImage, 201);

  } catch (error: any) {
    console.error('Create generated image error:', error);
    return ResponseBuilder.error('Failed to create generated image', 500, error.message);
  }
};
