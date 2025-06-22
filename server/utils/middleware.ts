/**
 * Server middleware utilities
 * Common middleware functions for Lambda handlers
 */

import jwt from 'jsonwebtoken';
import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import type { AuthenticatedEvent, LambdaHandler, MiddlewareOptions } from '@server/types/lambda';

// ** import server config
import { serverEnv } from '@server/config/env';

// ** import response utilities
import { createErrorResponse, createCorsResponse } from '@server/utils/response';

/**
 * Authentication middleware
 */
export const withAuth = (handler: LambdaHandler): LambdaHandler => {
  return async (event: APIGatewayProxyEvent, context: Context) => {
    try {
      // Handle CORS preflight
      if (event.httpMethod === 'OPTIONS') {
        return createCorsResponse();
      }

      // Extract token from Authorization header
      const authHeader = event.headers.Authorization || event.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return createErrorResponse('Missing or invalid authorization header', 401, 'UNAUTHORIZED');
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verify JWT token
      const decoded = jwt.verify(token, serverEnv.auth.jwtSecret) as any;
      
      // Add user info to event
      const authenticatedEvent: AuthenticatedEvent = {
        ...event,
        user: {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role,
        },
      };

      return handler(authenticatedEvent, context);
    } catch (error) {
      console.error('Authentication error:', error);
      return createErrorResponse('Invalid or expired token', 401, 'UNAUTHORIZED');
    }
  };
};

/**
 * CORS middleware
 */
export const withCors = (handler: LambdaHandler): LambdaHandler => {
  return async (event: APIGatewayProxyEvent, context: Context) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return createCorsResponse();
    }

    return handler(event, context);
  };
};

/**
 * Body validation middleware
 */
export const withBodyValidation = (
  handler: LambdaHandler,
  validator: (body: any) => { isValid: boolean; errors?: any }
): LambdaHandler => {
  return async (event: APIGatewayProxyEvent, context: Context) => {
    try {
      // Parse request body
      let body;
      if (event.body) {
        body = JSON.parse(event.body);
      }

      // Validate body
      const validation = validator(body);
      if (!validation.isValid) {
        return createErrorResponse(
          'Request validation failed',
          400,
          'VALIDATION_ERROR',
          validation.errors
        );
      }

      return handler(event, context);
    } catch (error) {
      console.error('Body validation error:', error);
      return createErrorResponse('Invalid request body', 400, 'INVALID_BODY');
    }
  };
};

/**
 * Error handling middleware
 */
export const withErrorHandling = (handler: LambdaHandler): LambdaHandler => {
  return async (event: APIGatewayProxyEvent, context: Context) => {
    try {
      return await handler(event, context);
    } catch (error) {
      console.error('Lambda handler error:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('ValidationError')) {
          return createErrorResponse(error.message, 400, 'VALIDATION_ERROR');
        }
        if (error.message.includes('NotFound')) {
          return createErrorResponse(error.message, 404, 'NOT_FOUND');
        }
        if (error.message.includes('Unauthorized')) {
          return createErrorResponse(error.message, 401, 'UNAUTHORIZED');
        }
      }

      return createErrorResponse('Internal server error', 500, 'INTERNAL_ERROR');
    }
  };
};

/**
 * Compose multiple middleware functions
 */
export const compose = (...middlewares: ((handler: LambdaHandler) => LambdaHandler)[]): ((handler: LambdaHandler) => LambdaHandler) => {
  return (handler: LambdaHandler) => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
  };
};

/**
 * Create a middleware stack with common options
 */
export const createMiddlewareStack = (options: MiddlewareOptions = {}) => {
  const middlewares: ((handler: LambdaHandler) => LambdaHandler)[] = [];

  // Always add error handling
  middlewares.push(withErrorHandling);

  // Add CORS if enabled (default: true)
  if (options.cors !== false) {
    middlewares.push(withCors);
  }

  // Add authentication if required
  if (options.requireAuth) {
    middlewares.push(withAuth);
  }

  // Add body validation if provided
  if (options.validateBody) {
    middlewares.push((handler) => withBodyValidation(handler, options.validateBody));
  }

  return compose(...middlewares);
};
