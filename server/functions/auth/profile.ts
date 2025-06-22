/**
 * User profile management Lambda functions
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBService, Tables, AuthService, ResponseBuilder } from '@server/lib/aws';
import { sanitizeInput, isValidUrl } from '@server/utils';

/**
 * Get user profile
 */
export const getProfile = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return ResponseBuilder.cors();
    }

    // Verify authentication
    const decoded = AuthService.validateAuthHeader(event.headers.Authorization || event.headers.authorization);
    if (!decoded) {
      return ResponseBuilder.unauthorized('Invalid or expired token');
    }

    // Get user profile
    const userSettings = await DynamoDBService.getItem(Tables.USER_SETTINGS, { userId: decoded.userId });
    
    if (!userSettings) {
      return ResponseBuilder.notFound('User not found');
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
    return ResponseBuilder.internalError('Failed to get profile');
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return ResponseBuilder.cors();
    }

    // Verify authentication
    const decoded = AuthService.validateAuthHeader(event.headers.Authorization || event.headers.authorization);
    if (!decoded) {
      return ResponseBuilder.unauthorized('Invalid or expired token');
    }

    // Validate request body
    if (!event.body) {
      return ResponseBuilder.validationError('Request body is required');
    }

    const updates = JSON.parse(event.body);
    const allowedFields = ['displayName', 'avatarUrl', 'preferences'];
    
    const filteredUpdates: Record<string, any> = {};
    
    // Validate and sanitize updates
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        switch (field) {
          case 'displayName':
            if (typeof updates[field] === 'string') {
              const sanitized = sanitizeInput(updates[field]);
              if (sanitized.length >= 2 && sanitized.length <= 50) {
                filteredUpdates[field] = sanitized;
              } else {
                return ResponseBuilder.validationError('Display name must be between 2 and 50 characters');
              }
            }
            break;
          case 'avatarUrl':
            if (typeof updates[field] === 'string') {
              if (updates[field] === '' || isValidUrl(updates[field])) {
                filteredUpdates[field] = updates[field];
              } else {
                return ResponseBuilder.validationError('Invalid avatar URL format');
              }
            }
            break;
          case 'preferences':
            if (typeof updates[field] === 'object' && updates[field] !== null) {
              filteredUpdates[field] = updates[field];
            }
            break;
        }
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return ResponseBuilder.validationError('No valid fields to update');
    }

    // Update user profile
    const updatedUser = await DynamoDBService.updateItem(
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
    return ResponseBuilder.internalError('Failed to update profile');
  }
};

// Export handlers for serverless.yml
export const handler = getProfile;
export const updateHandler = updateProfile;
