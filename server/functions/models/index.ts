/**
 * Training models management Lambda function
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
import type { TrainingModel, CreateTrainingModelRequest, UpdateTrainingModelRequest, LambdaHandler } from '@server/types';

/**
 * Get all training models for user
 */
const getModels = async (userId: string): Promise<APIGatewayProxyResult> => {
  try {
    const models = await databaseService.queryItems<TrainingModel>(
      serverEnv.database.tables.trainingModels,
      'UserIdIndex',
      '#userId = :userId',
      { '#userId': 'userId' },
      { ':userId': userId }
    );

    return createSuccessResponse(models);
  } catch (error) {
    console.error('Get models error:', error);
    return createErrorResponse('Failed to get models', 500);
  }
};

/**
 * Create new training model
 */
const createModel = async (userId: string, modelData: CreateTrainingModelRequest): Promise<APIGatewayProxyResult> => {
  try {
    const model: TrainingModel = {
      id: uuidv4(),
      userId,
      name: modelData.name,
      description: modelData.description,
      status: 'pending',
      triggerWord: modelData.triggerWord,
      imageCount: 0,
      trainingConfig: {
        steps: modelData.trainingConfig?.steps || 1000,
        learningRate: modelData.trainingConfig?.learningRate || 1e-4,
        batchSize: modelData.trainingConfig?.batchSize || 1,
      },
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await databaseService.putItem(serverEnv.database.tables.trainingModels, model);
    return createSuccessResponse(model);
  } catch (error) {
    console.error('Create model error:', error);
    return createErrorResponse('Failed to create model', 500);
  }
};

/**
 * Get single training model
 */
const getModel = async (userId: string, modelId: string): Promise<APIGatewayProxyResult> => {
  try {
    const model = await databaseService.getItem<TrainingModel>(
      serverEnv.database.tables.trainingModels,
      modelId
    );

    if (!model || model.userId !== userId) {
      return createErrorResponse('Model not found', 404);
    }

    return createSuccessResponse(model);
  } catch (error) {
    console.error('Get model error:', error);
    return createErrorResponse('Failed to get model', 500);
  }
};

/**
 * Update training model
 */
const updateModel = async (userId: string, modelId: string, updates: UpdateTrainingModelRequest): Promise<APIGatewayProxyResult> => {
  try {
    // First check if model exists and belongs to user
    const existingModel = await databaseService.getItem<TrainingModel>(
      serverEnv.database.tables.trainingModels,
      modelId
    );

    if (!existingModel || existingModel.userId !== userId) {
      return createErrorResponse('Model not found', 404);
    }

    const updatedModel = await databaseService.updateItem<TrainingModel>(
      serverEnv.database.tables.trainingModels,
      modelId,
      updates
    );

    return createSuccessResponse(updatedModel);
  } catch (error) {
    console.error('Update model error:', error);
    return createErrorResponse('Failed to update model', 500);
  }
};

/**
 * Delete training model
 */
const deleteModel = async (userId: string, modelId: string): Promise<APIGatewayProxyResult> => {
  try {
    // First check if model exists and belongs to user
    const existingModel = await databaseService.getItem<TrainingModel>(
      serverEnv.database.tables.trainingModels,
      modelId
    );

    if (!existingModel || existingModel.userId !== userId) {
      return createErrorResponse('Model not found', 404);
    }

    await databaseService.deleteItem(serverEnv.database.tables.trainingModels, modelId);
    
    // TODO: Also delete associated training images and S3 files
    
    return createSuccessResponse({ message: 'Model deleted successfully' });
  } catch (error) {
    console.error('Delete model error:', error);
    return createErrorResponse('Failed to delete model', 500);
  }
};

/**
 * Main models handler
 */
const modelsHandler: LambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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
    const modelId = event.pathParameters?.id;

    switch (method) {
      case 'GET':
        if (modelId) {
          return await getModel(userId, modelId);
        } else {
          return await getModels(userId);
        }
        
      case 'POST':
        if (!event.body) {
          return createErrorResponse('Request body is required', 400);
        }
        
        const modelData: CreateTrainingModelRequest = JSON.parse(event.body);
        return await createModel(userId, modelData);
        
      case 'PUT':
        if (!modelId) {
          return createErrorResponse('Model ID is required', 400);
        }
        
        if (!event.body) {
          return createErrorResponse('Request body is required', 400);
        }
        
        const updates: UpdateTrainingModelRequest = JSON.parse(event.body);
        return await updateModel(userId, modelId, updates);
        
      case 'DELETE':
        if (!modelId) {
          return createErrorResponse('Model ID is required', 400);
        }
        
        return await deleteModel(userId, modelId);
        
      default:
        return createErrorResponse('Method not allowed', 405);
    }
  } catch (error) {
    console.error('Models handler error:', error);
    return createErrorResponse('Internal server error', 500);
  }
};

// Export handler with middleware
export const handler = createMiddlewareStack({
  cors: true,
  requireAuth: true,
})(modelsHandler);