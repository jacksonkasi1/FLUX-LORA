/**
 * Database service
 * Centralized database operations for DynamoDB
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';

// ** import server config
import { serverEnv } from '@server/config/env';

// ** import types
import type { DatabaseItem, ListItemsRequest, PaginationMeta } from '@server/types/lambda';

/**
 * Database service class
 */
export class DatabaseService {
  private client: DynamoDBDocumentClient;

  constructor() {
    const dynamoClient = new DynamoDBClient({
      region: serverEnv.aws.region,
      credentials: {
        accessKeyId: serverEnv.aws.accessKeyId,
        secretAccessKey: serverEnv.aws.secretAccessKey,
      },
    });

    this.client = DynamoDBDocumentClient.from(dynamoClient);
  }

  /**
   * Get item by ID
   */
  async getItem<T extends DatabaseItem>(
    tableName: string,
    id: string
  ): Promise<T | null> {
    try {
      const command = new GetCommand({
        TableName: tableName,
        Key: { id },
      });

      const result = await this.client.send(command);
      return result.Item as T || null;
    } catch (error) {
      console.error(`Error getting item from ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Create new item
   */
  async createItem<T extends DatabaseItem>(
    tableName: string,
    item: Omit<T, 'createdAt' | 'updatedAt'>
  ): Promise<T> {
    try {
      const now = new Date().toISOString();
      const newItem = {
        ...item,
        createdAt: now,
        updatedAt: now,
      } as T;

      const command = new PutCommand({
        TableName: tableName,
        Item: newItem,
        ConditionExpression: 'attribute_not_exists(id)',
      });

      await this.client.send(command);
      return newItem;
    } catch (error) {
      console.error(`Error creating item in ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Update existing item
   */
  async updateItem<T extends DatabaseItem>(
    tableName: string,
    id: string,
    updates: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<T> {
    try {
      const updateExpression: string[] = [];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, any> = {};

      // Build update expression
      Object.entries(updates).forEach(([key, value], index) => {
        const attrName = `#attr${index}`;
        const attrValue = `:val${index}`;
        
        updateExpression.push(`${attrName} = ${attrValue}`);
        expressionAttributeNames[attrName] = key;
        expressionAttributeValues[attrValue] = value;
      });

      // Always update the updatedAt timestamp
      updateExpression.push('#updatedAt = :updatedAt');
      expressionAttributeNames['#updatedAt'] = 'updatedAt';
      expressionAttributeValues[':updatedAt'] = new Date().toISOString();

      const command = new UpdateCommand({
        TableName: tableName,
        Key: { id },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
        ConditionExpression: 'attribute_exists(id)',
      });

      const result = await this.client.send(command);
      return result.Attributes as T;
    } catch (error) {
      console.error(`Error updating item in ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Delete item
   */
  async deleteItem(tableName: string, id: string): Promise<void> {
    try {
      const command = new DeleteCommand({
        TableName: tableName,
        Key: { id },
        ConditionExpression: 'attribute_exists(id)',
      });

      await this.client.send(command);
    } catch (error) {
      console.error(`Error deleting item from ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * List items with pagination
   */
  async listItems<T extends DatabaseItem>(
    tableName: string,
    options: ListItemsRequest = {}
  ): Promise<{ items: T[]; pagination: PaginationMeta }> {
    try {
      const {
        page = '1',
        limit = '20',
        sortBy = 'createdAt',
        sortOrder = 'desc',
        filters = {},
      } = options;

      const pageNum = parseInt(page, 10);
      const limitNum = Math.min(parseInt(limit, 10), serverEnv.constants.defaultPagination.maxLimit);

      // Build filter expression
      let filterExpression = '';
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, any> = {};

      Object.entries(filters).forEach(([key, value], index) => {
        if (value !== undefined && value !== null) {
          const attrName = `#filter${index}`;
          const attrValue = `:filter${index}`;
          
          if (filterExpression) {
            filterExpression += ' AND ';
          }
          filterExpression += `${attrName} = ${attrValue}`;
          expressionAttributeNames[attrName] = key;
          expressionAttributeValues[attrValue] = value;
        }
      });

      const command = new ScanCommand({
        TableName: tableName,
        FilterExpression: filterExpression || undefined,
        ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
        ExpressionAttributeValues: Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : undefined,
      });

      const result = await this.client.send(command);
      const items = (result.Items as T[]) || [];

      // Sort items
      items.sort((a, b) => {
        const aValue = a[sortBy as keyof T];
        const bValue = b[sortBy as keyof T];
        
        if (sortOrder === 'desc') {
          return aValue > bValue ? -1 : 1;
        }
        return aValue > bValue ? 1 : -1;
      });

      // Paginate results
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedItems = items.slice(startIndex, endIndex);

      const totalPages = Math.ceil(items.length / limitNum);

      const pagination: PaginationMeta = {
        page: pageNum,
        limit: limitNum,
        total: items.length,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      };

      return {
        items: paginatedItems,
        pagination,
      };
    } catch (error) {
      console.error(`Error listing items from ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Query items by index
   */
  async queryItems<T extends DatabaseItem>(
    tableName: string,
    indexName: string,
    keyCondition: string,
    expressionAttributeNames: Record<string, string>,
    expressionAttributeValues: Record<string, any>
  ): Promise<T[]> {
    try {
      const command = new QueryCommand({
        TableName: tableName,
        IndexName: indexName,
        KeyConditionExpression: keyCondition,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      });

      const result = await this.client.send(command);
      return (result.Items as T[]) || [];
    } catch (error) {
      console.error(`Error querying items from ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Scan items with filter condition
   */
  async scanItems<T extends DatabaseItem>(
    tableName: string,
    filterExpression: string,
    expressionAttributeNames?: Record<string, string>,
    expressionAttributeValues?: Record<string, any>
  ): Promise<T[]> {
    try {
      const command = new ScanCommand({
        TableName: tableName,
        FilterExpression: filterExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      });

      const result = await this.client.send(command);
      return (result.Items as T[]) || [];
    } catch (error) {
      console.error(`Error scanning items from ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Put item (create or update)
   */
  async putItem<T extends DatabaseItem>(
    tableName: string,
    item: T
  ): Promise<void> {
    try {
      const command = new PutCommand({
        TableName: tableName,
        Item: item,
      });

      await this.client.send(command);
    } catch (error) {
      console.error(`Error putting item to ${tableName}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
