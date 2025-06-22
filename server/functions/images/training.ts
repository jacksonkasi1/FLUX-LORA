/**
 * Training images management Lambda function
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
import type { TrainingImage, TrainingModel, UploadTrainingImageRequest, LambdaHandler } from '@server/types';

/**
 * Get training images for a model
 */
const getTrainingImages = async (userId: string, modelId: string): Promise<APIGatewayProxyResult> => {
  try {
    // First verify user owns the model
    const model = await databaseService.getItem<TrainingModel>(
      serverEnv.database.tables.trainingModels,
      modelId
    );

    if (!model || model.userId !== userId) {
      return createErrorResponse('Model not found', 404);
    }

    const images = await databaseService.queryItems<TrainingImage>(
      serverEnv.database.tables.trainingImages,
      'ModelIdIndex',
      '#modelId = :modelId',
      { '#modelId': 'modelId' },
      { ':modelId': modelId }
    );

    return createSuccessResponse(images);
  } catch (error) {
    console.error('Get training images error:', error);
    return createErrorResponse('Failed to get training images', 500);
  }
};

/**
 * Upload training image metadata
 */
const uploadTrainingImage = async (userId: string, modelId: string, imageData: UploadTrainingImageRequest): Promise<APIGatewayProxyResult> => {
  try {
    // First verify user owns the model
    const model = await databaseService.getItem<TrainingModel>(
      serverEnv.database.tables.trainingModels,
      modelId
    );

    if (!model || model.userId !== userId) {
      return createErrorResponse('Model not found', 404);
    }

    // Generate unique image ID
    const imageId = uuidv4();

    // Create S3 URL (assuming the file was uploaded using presigned URL)
    const baseUrl = `https://${serverEnv.aws.s3.buckets.trainingImages}.s3.${serverEnv.aws.region}.amazonaws.com`;
    const imagePath = `${userId}/models/${modelId}/images/${imageData.filename}`;
    
    const trainingImage: TrainingImage = {
      id: imageId,
      modelId,
      userId,
      filename: imageData.filename,
      originalName: imageData.originalName,
      url: `${baseUrl}/${imagePath}`,
      size: imageData.size,
      mimeType: imageData.mimeType,
      width: imageData.width,
      height: imageData.height,
      hash: '', // TODO: Calculate hash for deduplication
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save image metadata
    await databaseService.putItem(serverEnv.database.tables.trainingImages, trainingImage);

    // Update model image count
    const currentImages = await databaseService.queryItems<TrainingImage>(
      serverEnv.database.tables.trainingImages,
      'ModelIdIndex',
      '#modelId = :modelId',
      { '#modelId': 'modelId' },
      { ':modelId': modelId }
    );

    await databaseService.updateItem(
      serverEnv.database.tables.trainingModels,
      modelId,
      { imageCount: currentImages.length + 1 }
    );

    return createSuccessResponse(trainingImage);
  } catch (error) {
    console.error('Upload training image error:', error);
    return createErrorResponse('Failed to upload training image', 500);
  }
};

/**
 * Delete training image
 */
const deleteTrainingImage = async (userId: string, imageId: string): Promise<APIGatewayProxyResult> => {
  try {
    // Get the image to verify ownership
    const image = await databaseService.getItem<TrainingImage>(
      serverEnv.database.tables.trainingImages,
      imageId
    );

    if (!image || image.userId !== userId) {
      return createErrorResponse('Image not found', 404);
    }

    // Delete from database
    await databaseService.deleteItem(serverEnv.database.tables.trainingImages, imageId);

    // Update model image count
    const remainingImages = await databaseService.queryItems<TrainingImage>(
      serverEnv.database.tables.trainingImages,
      'ModelIdIndex',
      '#modelId = :modelId',
      { '#modelId': 'modelId' },
      { ':modelId': image.modelId }
    );

    await databaseService.updateItem(
      serverEnv.database.tables.trainingModels,
      image.modelId,
      { imageCount: remainingImages.length - 1 }
    );

    // TODO: Delete from S3 as well

    return createSuccessResponse({ message: 'Training image deleted successfully' });
  } catch (error) {
    console.error('Delete training image error:', error);
    return createErrorResponse('Failed to delete training image', 500);
  }
};

/**
 * Main training images handler
 */
const trainingImagesHandler: LambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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
    const modelId = event.pathParameters?.modelId;
    const imageId = event.pathParameters?.id;

    switch (method) {
      case 'GET':
        if (!modelId) {
          return createErrorResponse('Model ID is required', 400);
        }
        return await getTrainingImages(userId, modelId);
        
      case 'POST':
        if (!modelId) {
          return createErrorResponse('Model ID is required', 400);
        }
        
        if (!event.body) {
          return createErrorResponse('Request body is required', 400);
        }
        
        const imageData: UploadTrainingImageRequest = JSON.parse(event.body);
        return await uploadTrainingImage(userId, modelId, imageData);
        
      case 'DELETE':
        if (!imageId) {
          return createErrorResponse('Image ID is required', 400);
        }
        
        return await deleteTrainingImage(userId, imageId);
        
      default:
        return createErrorResponse('Method not allowed', 405);
    }
  } catch (error) {
    console.error('Training images handler error:', error);
    return createErrorResponse('Internal server error', 500);
  }
};

// Export handler with middleware
export const handler = createMiddlewareStack({
  cors: true,
  requireAuth: true,
})(trainingImagesHandler);