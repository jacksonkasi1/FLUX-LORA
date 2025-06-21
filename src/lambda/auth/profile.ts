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

    // Get user profile
    const userSettings = await DynamoDBService.get(Tables.USER_SETTINGS, { userId: decoded.userId });
    
    if (!userSettings) {
      return ResponseBuilder.error('User not found', 404);
    }

    return ResponseBuilder.success({
      id: userSettings.userId,
      email: userSettings.email,
      displayName: userSettings.displayName,
      avatarUrl: userSettings.avatarUrl,
      preferences: userSettings.preferences || {},
    });

  } catch (error: any) {
    console.error('Get profile error:', error);
    return ResponseBuilder.error('Failed to get profile', 500, error.message);
  }
};

export const updateHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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

    const updates = JSON.parse(event.body);
    const allowedFields = ['displayName', 'avatarUrl', 'preferences'];
    
    const filteredUpdates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return ResponseBuilder.error('No valid fields to update', 400);
    }

    // Update user profile
    const updatedUser = await DynamoDBService.update(
      Tables.USER_SETTINGS,
      { userId: decoded.userId },
      filteredUpdates
    );

    return ResponseBuilder.success({
      id: updatedUser.userId,
      email: updatedUser.email,
      displayName: updatedUser.displayName,
      avatarUrl: updatedUser.avatarUrl,
      preferences: updatedUser.preferences || {},
    });

  } catch (error: any) {
    console.error('Update profile error:', error);
    return ResponseBuilder.error('Failed to update profile', 500, error.message);
  }
};
