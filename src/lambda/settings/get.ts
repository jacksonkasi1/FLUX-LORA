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

    // Get user settings
    const userSettings = await DynamoDBService.get(Tables.USER_SETTINGS, { userId: decoded.userId });
    
    if (!userSettings) {
      return ResponseBuilder.error('User settings not found', 404);
    }

    // Don't return sensitive data like passwords or raw API keys
    const safeSettings = {
      userId: userSettings.userId,
      displayName: userSettings.displayName,
      avatarUrl: userSettings.avatarUrl,
      preferences: userSettings.preferences || {},
      hasApiKeys: Object.keys(userSettings.apiKeys || {}).length > 0,
      apiKeyServices: Object.keys(userSettings.apiKeys || {}),
    };

    return ResponseBuilder.success(safeSettings);

  } catch (error: any) {
    console.error('Get settings error:', error);
    return ResponseBuilder.error('Failed to get settings', 500, error.message);
  }
};
