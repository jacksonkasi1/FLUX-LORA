import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBService, Tables } from '../../lib/aws/dynamodb';
import { AuthService } from '../../lib/aws/cognito';
import { ResponseBuilder } from '../../lib/aws/response';
import { createHash } from 'crypto';

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

    const updates = JSON.parse(event.body);
    const allowedFields = ['displayName', 'avatarUrl', 'preferences', 'apiKeys'];
    
    const filteredUpdates: Record<string, any> = {};
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        if (field === 'apiKeys') {
          // Encrypt API keys before storing
          const encryptedApiKeys: Record<string, string> = {};
          for (const [service, key] of Object.entries(updates[field] as Record<string, string>)) {
            if (key && key.trim()) {
              // Simple encryption - in production, use proper encryption
              encryptedApiKeys[service] = createHash('sha256').update(key + process.env.JWT_SECRET).digest('hex');
            }
          }
          filteredUpdates[field] = encryptedApiKeys;
        } else {
          filteredUpdates[field] = updates[field];
        }
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return ResponseBuilder.error('No valid fields to update', 400);
    }

    // Update user settings
    const updatedSettings = await DynamoDBService.update(
      Tables.USER_SETTINGS,
      { userId: decoded.userId },
      filteredUpdates
    );

    // Return safe settings (without sensitive data)
    const safeSettings = {
      userId: updatedSettings.userId,
      displayName: updatedSettings.displayName,
      avatarUrl: updatedSettings.avatarUrl,
      preferences: updatedSettings.preferences || {},
      hasApiKeys: Object.keys(updatedSettings.apiKeys || {}).length > 0,
      apiKeyServices: Object.keys(updatedSettings.apiKeys || {}),
    };

    return ResponseBuilder.success(safeSettings);

  } catch (error: any) {
    console.error('Update settings error:', error);
    return ResponseBuilder.error('Failed to update settings', 500, error.message);
  }
};
