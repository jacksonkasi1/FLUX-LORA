/**
 * Lambda-specific type definitions
 * Types for AWS Lambda functions and serverless operations
 */

import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

// ** Lambda Handler Types
export type LambdaHandler = (
  event: APIGatewayProxyEvent,
  context: Context
) => Promise<APIGatewayProxyResult>;

// ** API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    pagination?: PaginationMeta;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ** Request Types
export interface AuthenticatedEvent extends APIGatewayProxyEvent {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ** Database Operation Types
export interface DatabaseItem {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemRequest<T> {
  data: Omit<T, keyof DatabaseItem>;
}

export interface UpdateItemRequest<T> {
  id: string;
  data: Partial<Omit<T, keyof DatabaseItem>>;
}

export interface DeleteItemRequest {
  id: string;
}

export interface ListItemsRequest extends PaginationQuery {
  filters?: Record<string, any>;
}

// ** File Upload Types (Generic ones - specific types are in upload.ts)
export interface GenericPresignedUrlRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
  folder?: string;
}

export interface GenericPresignedUrlResponse {
  url: string;
  fields: Record<string, string>;
  key: string;
  expiresIn: number;
}

// ** Error Types
export interface LambdaError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

// ** Middleware Types
export type MiddlewareFunction = (
  event: APIGatewayProxyEvent,
  context: Context
) => Promise<APIGatewayProxyEvent | APIGatewayProxyResult>;

export interface MiddlewareOptions {
  requireAuth?: boolean;
  validateBody?: any; // JSON schema or validation function
  cors?: boolean;
  rateLimit?: {
    windowMs: number;
    max: number;
  };
}
