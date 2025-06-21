import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBService, Tables } from '../../lib/aws/dynamodb';
import { AuthService } from '../../lib/aws/cognito';
import { ResponseBuilder } from '../../lib/aws/response';
import { TrainingModel } from '../../types/database';
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

    const { name, description, triggerWord, modelType = 'lora', trainingConfig = {} } = JSON.parse(event.body);

    if (!name || !triggerWord) {
      return ResponseBuilder.error('Name and trigger word are required', 400);
    }

    // Create new training model
    const modelId = randomBytes(16).toString('hex');
    
    const model: TrainingModel = {
      id: modelId,
      userId: decoded.userId,
      name,
      description,
      status: 'pending',
      modelType,
      triggerWord,
      trainingConfig,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await DynamoDBService.put(Tables.TRAINING_MODELS, model);

    return ResponseBuilder.success(model, 201);

  } catch (error: any) {
    console.error('Create model error:', error);
    return ResponseBuilder.error('Failed to create model', 500, error.message);
  }
};
