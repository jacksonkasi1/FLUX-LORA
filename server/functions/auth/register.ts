/**
 * User registration Lambda function
 */

import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
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
import type { User, RegisterCredentials, UserSettings, LambdaHandler } from '@server/types';

/**
 * Handle user registration
 */
const registerHandler: LambdaHandler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    // Parse request body
    if (!event.body) {
      return createErrorResponse('Request body is required', 400);
    }

    const { email, password, displayName }: RegisterCredentials = JSON.parse(event.body);

    // Validate required fields
    if (!email || !password) {
      return createErrorResponse('Email and password are required', 400);
    }

    // Validate email format (basic validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return createErrorResponse('Invalid email format', 400);
    }

    // Validate password strength
    if (password.length < 8) {
      return createErrorResponse('Password must be at least 8 characters long', 400);
    }

    // Check if user already exists
    const existingUsers = await databaseService.scanItems<UserSettings>(
      serverEnv.database.tables.userSettings,
      '#email = :email',
      { '#email': 'email' },
      { ':email': email.toLowerCase() }
    );

    if (existingUsers.length > 0) {
      return createErrorResponse('User already exists with this email', 409);
    }

    // Create new user
    const userId = uuidv4();
    const hashedPassword = await AuthService.hashPassword(password);
    const finalDisplayName = displayName || email.split('@')[0];

    // Store user settings
    const userSettings: UserSettings = {
      id: userId,
      userId,
      email: email.toLowerCase(),
      displayName: finalDisplayName,
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

    // Store user data (we need to add password hash to the user settings)
    const userRecord = {
      ...userSettings,
      passwordHash: hashedPassword,
    };

    await databaseService.putItem(serverEnv.database.tables.userSettings, userRecord);

    // Generate JWT token
    const token = AuthService.generateToken({
      userId,
      email: email.toLowerCase(),
    });

    // Return success response
    return createSuccessResponse({
      user: {
        id: userId,
        email: email.toLowerCase(),
        displayName: finalDisplayName,
        createdAt: userSettings.createdAt,
        updatedAt: userSettings.updatedAt,
      },
      token,
    }, 201);

  } catch (error) {
    console.error('Registration error:', error);
    return createErrorResponse('Internal server error', 500);
  }
};

// Export handler with middleware
export const handler = createMiddlewareStack({
  cors: true,
  validateBody: (body: any) => {
    const required = ['email', 'password'];
    const missing = required.filter(field => !body || !body[field]);
    return {
      isValid: missing.length === 0,
      errors: missing.length > 0 ? { missingFields: missing } : undefined,
    };
  },
})(registerHandler);
