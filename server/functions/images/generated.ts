/**
 * Generated images management Lambda function
 */

import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';

// ** Import server utilities
import { createSuccessResponse, createErrorResponse, createMiddlewareStack } from '@server/utils';

// ** Import server services
import { databaseService } from '@server/services';

// ** Import server config
import { serverEnv } from '@server/config';

// ** Import server lib
import { AuthService } from '@server/lib/aws';

// ** Import types
import type { GeneratedImage, TrainingModel, GenerateImageRequest, UpdateGeneratedImageRequest, LambdaHandler } from '@server/types';

/**
 * Get generated images for user
 */
const getGeneratedImages = async (userId: string): Promise<APIGatewayProxyResult> => {
  try {
    const images = await databaseService.queryItems<GeneratedImage>(
      serverEnv.database.tables.generatedImages,
      'UserIdIndex',
      '#userId = :userId',
      { '#userId': 'userId' },
      { ':userId': userId }
    );

    // Sort by creation date (newest first)
    images.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return createSuccessResponse(images);
  } catch (error) {
    console.error('Get generated images error:', error);
    return createErrorResponse('Failed to get generated images', 500);
  }
};

/**
 * Generate new image using FAL.AI
 */
const generateImage = async (userId: string, request: GenerateImageRequest): Promise<APIGatewayProxyResult> => {
  try {
    // Verify user owns the model
    const model = await databaseService.getItem<TrainingModel>(
      serverEnv.database.tables.trainingModels,
      request.modelId
    );

    if (!model || model.userId !== userId) {
      return createErrorResponse('Model not found', 404);
    }

    if (model.status !== 'completed') {
      return createErrorResponse('Model is not ready for generation', 400);
    }

    // TODO: Integrate with FAL.AI API to generate image
    // For now, create a placeholder entry
    const imageId = uuidv4();
    
    // Mock generated image URL (in real implementation, this would come from FAL.AI)
    const baseUrl = `https://${serverEnv.aws.s3.buckets.generatedImages}.s3.${serverEnv.aws.region}.amazonaws.com`;
    const imagePath = `${userId}/generated/${imageId}.jpg`;
    
    const generatedImage: GeneratedImage = {
      id: imageId,
      userId,
      modelId: request.modelId,
      prompt: request.prompt,
      negativePrompt: request.negativePrompt,
      imageUrl: `${baseUrl}/${imagePath}`,
      thumbnailUrl: `${baseUrl}/${imagePath}`, // TODO: Generate thumbnail
      generationConfig: {
        steps: request.generationConfig?.steps || 50,
        guidanceScale: request.generationConfig?.guidanceScale || 7.5,
        seed: request.generationConfig?.seed || Math.floor(Math.random() * 1000000),
      },
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await databaseService.putItem(serverEnv.database.tables.generatedImages, generatedImage);

    // TODO: Trigger actual image generation with FAL.AI
    // This would typically be done asynchronously
    console.log('TODO: Integrate with FAL.AI for image generation');

    return createSuccessResponse(generatedImage);
  } catch (error) {
    console.error('Generate image error:', error);
    return createErrorResponse('Failed to generate image', 500);
  }
};

/**
 * Update generated image
 */
const updateGeneratedImage = async (userId: string, imageId: string, updates: UpdateGeneratedImageRequest): Promise<APIGatewayProxyResult> => {
  try {
    // Verify user owns the image
    const existingImage = await databaseService.getItem<GeneratedImage>(
      serverEnv.database.tables.generatedImages,
      imageId
    );

    if (!existingImage || existingImage.userId !== userId) {
      return createErrorResponse('Image not found', 404);
    }

    const updatedImage = await databaseService.updateItem<GeneratedImage>(
      serverEnv.database.tables.generatedImages,
      imageId,
      updates
    );

    return createSuccessResponse(updatedImage);
  } catch (error) {
    console.error('Update generated image error:', error);
    return createErrorResponse('Failed to update image', 500);
  }
};

/**
 * Delete generated image
 */
const deleteGeneratedImage = async (userId: string, imageId: string): Promise<APIGatewayProxyResult> => {
  try {
    // Verify user owns the image
    const existingImage = await databaseService.getItem<GeneratedImage>(
      serverEnv.database.tables.generatedImages,
      imageId
    );

    if (!existingImage || existingImage.userId !== userId) {
      return createErrorResponse('Image not found', 404);
    }

    await databaseService.deleteItem(serverEnv.database.tables.generatedImages, imageId);

    // TODO: Delete from S3 as well

    return createSuccessResponse({ message: 'Generated image deleted successfully' });
  } catch (error) {
    console.error('Delete generated image error:', error);
    return createErrorResponse('Failed to delete image', 500);
  }
};

/**
 * Main generated images handler
 */
const generatedImagesHandler: LambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Extract user ID from JWT token
    const authHeader = event.headers.Authorization || event.headers.authorization;
    if (!authHeader) {
      return createErrorResponse('Authorization header required', 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = AuthService.verifyToken(token);
    const userId = decoded.userId;

    const method = event.httpMethod;
    const imageId = event.pathParameters?.id;

    switch (method) {
      case 'GET':
        return await getGeneratedImages(userId);
        
      case 'POST':
        if (!event.body) {
          return createErrorResponse('Request body is required', 400);
        }
        
        const generateRequest: GenerateImageRequest = JSON.parse(event.body);
        return await generateImage(userId, generateRequest);
        
      case 'PUT':
        if (!imageId) {
          return createErrorResponse('Image ID is required', 400);
        }
        
        if (!event.body) {
          return createErrorResponse('Request body is required', 400);
        }
        
        const updates: UpdateGeneratedImageRequest = JSON.parse(event.body);
        return await updateGeneratedImage(userId, imageId, updates);
        
      case 'DELETE':
        if (!imageId) {
          return createErrorResponse('Image ID is required', 400);
        }
        
        return await deleteGeneratedImage(userId, imageId);
        
      default:
        return createErrorResponse('Method not allowed', 405);
    }
  } catch (error) {
    console.error('Generated images handler error:', error);
    return createErrorResponse('Internal server error', 500);
  }
};

// Export handler with middleware
export const handler = createMiddlewareStack({
  cors: true,
  requireAuth: true,
})(generatedImagesHandler);