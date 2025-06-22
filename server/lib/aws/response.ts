/**
 * API response builder with consistent structure
 */

import { ENV } from '@server/config/env';
import type { ApiResponse } from '@server/types';

export interface LambdaResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

/**
 * Response builder class for consistent API responses
 */
export class ResponseBuilder {
  /**
   * Default CORS headers
   */
  private static getCorsHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': ENV.cors.origin,
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    };
  }

  /**
   * Build success response
   */
  static success<T>(data: T, statusCode: number = 200): LambdaResponse {
    const response: ApiResponse<T> = {
      success: true,
      data,
    };

    return {
      statusCode,
      headers: this.getCorsHeaders(),
      body: JSON.stringify(response),
    };
  }

  /**
   * Build error response
   */
  static error(message: string, statusCode: number = 400, details?: any): LambdaResponse {
    const response: ApiResponse = {
      success: false,
      error: {
        message,
        details,
      },
    };

    return {
      statusCode,
      headers: this.getCorsHeaders(),
      body: JSON.stringify(response),
    };
  }

  /**
   * Build CORS preflight response
   */
  static cors(): LambdaResponse {
    return {
      statusCode: 200,
      headers: this.getCorsHeaders(),
      body: '',
    };
  }

  /**
   * Build unauthorized response
   */
  static unauthorized(message: string = 'Unauthorized'): LambdaResponse {
    return this.error(message, 401);
  }

  /**
   * Build forbidden response
   */
  static forbidden(message: string = 'Access denied'): LambdaResponse {
    return this.error(message, 403);
  }

  /**
   * Build not found response
   */
  static notFound(message: string = 'Resource not found'): LambdaResponse {
    return this.error(message, 404);
  }

  /**
   * Build validation error response
   */
  static validationError(message: string, details?: any): LambdaResponse {
    return this.error(message, 400, details);
  }

  /**
   * Build internal server error response
   */
  static internalError(message: string = 'Internal server error'): LambdaResponse {
    return this.error(message, 500);
  }
}
