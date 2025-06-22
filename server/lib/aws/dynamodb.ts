/**
 * DynamoDB service with improved organization
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  GetCommand, 
  PutCommand, 
  UpdateCommand, 
  DeleteCommand, 
  QueryCommand, 
  ScanCommand 
} from '@aws-sdk/lib-dynamodb';
import { AWS_REGION, DYNAMODB_TABLES } from './config';

// ** Initialize DynamoDB client
const client = new DynamoDBClient({ region: AWS_REGION });
export const dynamodb = DynamoDBDocumentClient.from(client);

// ** Export table names for easy access
export const Tables = DYNAMODB_TABLES;

/**
 * DynamoDB service class with organized methods
 */
export class DynamoDBService {
  /**
   * Get a single item by key
   */
  static async getItem<T = any>(tableName: string, key: Record<string, any>): Promise<T | null> {
    try {
      const command = new GetCommand({
        TableName: tableName,
        Key: key,
      });
      
      const result = await dynamodb.send(command);
      return result.Item as T || null;
    } catch (error) {
      console.error(`Error getting item from ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Put an item with automatic timestamps
   */
  static async putItem<T = any>(tableName: string, item: Record<string, any>): Promise<T> {
    try {
      const timestamp = new Date().toISOString();
      const itemWithTimestamps = {
        ...item,
        createdAt: item.createdAt || timestamp,
        updatedAt: timestamp,
      };

      const command = new PutCommand({
        TableName: tableName,
        Item: itemWithTimestamps,
      });
      
      await dynamodb.send(command);
      return itemWithTimestamps as T;
    } catch (error) {
      console.error(`Error putting item to ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Update an item with automatic updatedAt timestamp
   */
  static async updateItem<T = any>(
    tableName: string, 
    key: Record<string, any>, 
    updates: Record<string, any>
  ): Promise<T> {
    try {
      const updateExpression = [];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, any> = {};

      // Build update expression
      for (const [field, value] of Object.entries(updates)) {
        updateExpression.push(`#${field} = :${field}`);
        expressionAttributeNames[`#${field}`] = field;
        expressionAttributeValues[`:${field}`] = value;
      }

      // Always update the updatedAt timestamp
      updateExpression.push('#updatedAt = :updatedAt');
      expressionAttributeNames['#updatedAt'] = 'updatedAt';
      expressionAttributeValues[':updatedAt'] = new Date().toISOString();

      const command = new UpdateCommand({
        TableName: tableName,
        Key: key,
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      });

      const result = await dynamodb.send(command);
      return result.Attributes as T;
    } catch (error) {
      console.error(`Error updating item in ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Delete an item
   */
  static async deleteItem(tableName: string, key: Record<string, any>): Promise<void> {
    try {
      const command = new DeleteCommand({
        TableName: tableName,
        Key: key,
      });
      
      await dynamodb.send(command);
    } catch (error) {
      console.error(`Error deleting item from ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Query items with optional index
   */
  static async queryItems<T = any>(
    tableName: string,
    keyCondition: string,
    expressionAttributeNames: Record<string, string>,
    expressionAttributeValues: Record<string, any>,
    indexName?: string
  ): Promise<T[]> {
    try {
      const command = new QueryCommand({
        TableName: tableName,
        IndexName: indexName,
        KeyConditionExpression: keyCondition,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      });

      const result = await dynamodb.send(command);
      return (result.Items || []) as T[];
    } catch (error) {
      console.error(`Error querying items from ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Scan items with optional filter
   */
  static async scanItems<T = any>(
    tableName: string,
    filterExpression?: string,
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

      const result = await dynamodb.send(command);
      return (result.Items || []) as T[];
    } catch (error) {
      console.error(`Error scanning items from ${tableName}:`, error);
      throw error;
    }
  }
}
