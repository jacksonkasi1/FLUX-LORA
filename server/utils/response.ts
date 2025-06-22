/**
 * Server response utilities
 * Helper functions for creating consistent API responses
 */

import type { APIGatewayProxyResult } from 'aws-lambda';
import type { ApiResponse } from '@server/types/lambda';

// ** import server config
import { serverEnv } from '@server/config/env';

/**
 * Create a successful API response
 */
export const createSuccessResponse = <T>(
  data: T,
  statusCode: number = 200,
  meta?: any
): APIGatewayProxyResult => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
      ...meta,
    },
  };

  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': serverEnv.cors.origin,
      'Access-Control-Allow-Methods': serverEnv.cors.methods.join(', '),
      'Access-Control-Allow-Headers': serverEnv.cors.allowedHeaders.join(', '),
    },
    body: JSON.stringify(response),
  };
};

/**
 * Create an error API response
 */
export const createErrorResponse = (
  message: string,
  statusCode: number = 400,
  code?: string,
  details?: any
): APIGatewayProxyResult => {
  const response: ApiResponse = {
    success: false,
    error: {
      message,
      code,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
    },
  };

  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': serverEnv.cors.origin,
      'Access-Control-Allow-Methods': serverEnv.cors.methods.join(', '),
      'Access-Control-Allow-Headers': serverEnv.cors.allowedHeaders.join(', '),
    },
    body: JSON.stringify(response),
  };
};

/**
 * Create a CORS preflight response
 */
export const createCorsResponse = (): APIGatewayProxyResult => {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': serverEnv.cors.origin,
      'Access-Control-Allow-Methods': serverEnv.cors.methods.join(', '),
      'Access-Control-Allow-Headers': serverEnv.cors.allowedHeaders.join(', '),
      'Access-Control-Max-Age': '86400',
    },
    body: '',
  };
};

/**
 * Generate a unique request ID
 */
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Handle common HTTP errors
 */
export const handleCommonErrors = (error: any): APIGatewayProxyResult => {
  console.error('API Error:', error);

  // Handle specific error types
  if (error.name === 'ValidationError') {
    return createErrorResponse(
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      error.details
    );
  }

  if (error.name === 'UnauthorizedError') {
    return createErrorResponse(
      'Unauthorized access',
      401,
      'UNAUTHORIZED'
    );
  }

  if (error.name === 'ForbiddenError') {
    return createErrorResponse(
      'Forbidden access',
      403,
      'FORBIDDEN'
    );
  }

  if (error.name === 'NotFoundError') {
    return createErrorResponse(
      'Resource not found',
      404,
      'NOT_FOUND'
    );
  }

  if (error.name === 'ConflictError') {
    return createErrorResponse(
      'Resource conflict',
      409,
      'CONFLICT'
    );
  }

  // Handle AWS errors
  if (error.code) {
    return createErrorResponse(
      error.message || 'AWS service error',
      500,
      error.code
    );
  }

  // Generic server error
  return createErrorResponse(
    'Internal server error',
    500,
    'INTERNAL_ERROR'
  );
};
