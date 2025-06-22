/**
 * User login Lambda function
 * Updated to use new server structure
 */

import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

// ** import server utilities
import { createSuccessResponse, createErrorResponse, createMiddlewareStack } from '@server/utils';

// ** import server services
import { databaseService } from '@server/services';

// ** import server config
import { serverEnv } from '@server/config';

// ** import server lib
import { AuthService } from '@server/lib/aws';

// ** import types
import type { User, LoginCredentials } from '@server/types';
import type { LambdaHandler } from '@server/types';

/**
 * Handle user login
 */
const loginHandler: LambdaHandler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    // Parse request body
    if (!event.body) {
      return createErrorResponse('Request body is required', 400);
    }

    const credentials: LoginCredentials = JSON.parse(event.body);

    // Validate credentials
    if (!credentials.email || !credentials.password) {
      return createErrorResponse('Email and password are required', 400);
    }

    // Get user from database by scanning for email
    const users = await databaseService.scanItems<any>(
      serverEnv.database.tables.userSettings,
      '#email = :email',
      { '#email': 'email' },
      { ':email': credentials.email.toLowerCase() }
    );

    if (users.length === 0) {
      return createErrorResponse('Invalid credentials', 401);
    }

    const userRecord = users[0];

    // Verify password
    const isValidPassword = await AuthService.verifyPassword(
      credentials.password,
      userRecord.passwordHash
    );

    if (!isValidPassword) {
      return createErrorResponse('Invalid credentials', 401);
    }

    // Generate JWT token
    const token = AuthService.generateToken({
      userId: userRecord.userId,
      email: userRecord.email,
    });

    // Return success response
    return createSuccessResponse({
      user: {
        id: userRecord.userId,
        email: userRecord.email,
        displayName: userRecord.displayName,
        avatarUrl: userRecord.avatarUrl,
        createdAt: userRecord.createdAt,
        updatedAt: userRecord.updatedAt,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
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
})(loginHandler);
