/**
 * Settings management Lambda function
 */

import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// ** Import server utilities
import { createSuccessResponse, createErrorResponse, createMiddlewareStack } from '@server/utils';

// ** Import server services
import { databaseService } from '@server/services';

// ** Import server config
import { serverEnv } from '@server/config';

// ** Import server lib
import { AuthService } from '@server/lib/aws';

// ** Import types
import type { UserSettings, UpdateSettingsRequest, LambdaHandler } from '@server/types';

/**
 * Get user settings
 */
const getSettings = async (userId: string): Promise<APIGatewayProxyResult> => {
  try {
    const settings = await databaseService.getItem<UserSettings>(
      serverEnv.database.tables.userSettings,
      userId
    );

    if (!settings) {
      // Create default settings
      const defaultSettings: UserSettings = {
        id: userId,
        userId,
        email: '', // Will be populated from user data
        displayName: '',
        avatarUrl: '',
        apiKeys: {},
        preferences: {
          theme: 'system',
          notifications: {
            email: true,
            trainingComplete: true,
            generationReady: true,
          },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await databaseService.putItem(serverEnv.database.tables.userSettings, defaultSettings);
      return createSuccessResponse(defaultSettings);
    }

    return createSuccessResponse(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    return createErrorResponse('Failed to get settings', 500);
  }
};

/**
 * Update user settings
 */
const updateSettings = async (userId: string, updates: UpdateSettingsRequest): Promise<APIGatewayProxyResult> => {
  try {
    // Encrypt API keys if provided
    const processedUpdates: any = { ...updates };
    if (updates.apiKeys?.falaiApiKey) {
      processedUpdates.apiKeys = {
        ...processedUpdates.apiKeys,
        falaiApiKey: AuthService.encryptApiKey(updates.apiKeys.falaiApiKey),
      };
    }

    const updatedSettings = await databaseService.updateItem<UserSettings>(
      serverEnv.database.tables.userSettings,
      userId,
      processedUpdates
    );

    return createSuccessResponse(updatedSettings);
  } catch (error) {
    console.error('Update settings error:', error);
    return createErrorResponse('Failed to update settings', 500);
  }
};

/**
 * Main settings handler
 */
const settingsHandler: LambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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

    switch (method) {
      case 'GET':
        return await getSettings(userId);
        
      case 'PUT':
        if (!event.body) {
          return createErrorResponse('Request body is required', 400);
        }
        
        const updates: UpdateSettingsRequest = JSON.parse(event.body);
        return await updateSettings(userId, updates);
        
      default:
        return createErrorResponse('Method not allowed', 405);
    }
  } catch (error) {
    console.error('Settings handler error:', error);
    return createErrorResponse('Internal server error', 500);
  }
};

// Export handler with middleware
export const handler = createMiddlewareStack({
  cors: true,
  requireAuth: true,
})(settingsHandler);