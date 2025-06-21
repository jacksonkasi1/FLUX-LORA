import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBService, Tables } from '../../lib/aws/dynamodb';
import { AuthService } from '../../lib/aws/cognito';
import { ResponseBuilder } from '../../lib/aws/response';
import { TrainingImage } from '../../types/database';
import { randomBytes, createHash } from 'crypto';

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

    const modelId = event.pathParameters?.modelId;
    if (!modelId) {
      return ResponseBuilder.error('Model ID is required', 400);
    }

    if (!event.body) {
      return ResponseBuilder.error('Request body is required', 400);
    }

    // Verify model ownership
    const model = await DynamoDBService.get(Tables.TRAINING_MODELS, { id: modelId });
    if (!model) {
      return ResponseBuilder.error('Training model not found', 404);
    }

    if (model.userId !== decoded.userId) {
      return ResponseBuilder.error('Access denied', 403);
    }

    const { imageUrl, caption, originalFilename, fileSize } = JSON.parse(event.body);

    if (!imageUrl) {
      return ResponseBuilder.error('Image URL is required', 400);
    }

    // Generate image hash for deduplication
    const imageHash = createHash('md5').update(imageUrl + modelId).digest('hex');

    // Check for duplicate images
    const existingImages = await DynamoDBService.query(
      Tables.TRAINING_IMAGES,
      'TrainingModelIdIndex',
      '#trainingModelId = :trainingModelId',
      { '#trainingModelId': 'trainingModelId' },
      { ':trainingModelId': modelId }
    );

    const duplicateImage = existingImages.find(img => img.imageHash === imageHash);
    if (duplicateImage) {
      return ResponseBuilder.error('This image has already been uploaded for this model', 409);
    }

    // Create new training image record
    const imageId = randomBytes(16).toString('hex');
    
    const trainingImage: TrainingImage = {
      id: imageId,
      userId: decoded.userId,
      trainingModelId: modelId,
      imageUrl,
      caption,
      originalFilename,
      fileSize,
      imageHash,
      createdAt: new Date().toISOString(),
    };

    await DynamoDBService.put(Tables.TRAINING_IMAGES, trainingImage);

    // Update model's image count
    const currentImageCount = existingImages.length + 1;
    await DynamoDBService.update(
      Tables.TRAINING_MODELS,
      { id: modelId },
      { imageCount: currentImageCount }
    );

    return ResponseBuilder.success(trainingImage, 201);

  } catch (error: any) {
    console.error('Upload training image error:', error);
    return ResponseBuilder.error('Failed to upload training image', 500, error.message);
  }
};
