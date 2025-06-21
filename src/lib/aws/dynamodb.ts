import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

export const dynamodb = DynamoDBDocumentClient.from(client);

const TABLE_PREFIX = process.env.DYNAMODB_TABLE_PREFIX || 'flux-lora-api-dev';

export const Tables = {
  USER_SETTINGS: `${TABLE_PREFIX}-user-settings`,
  TRAINING_MODELS: `${TABLE_PREFIX}-training-models`,
  TRAINING_IMAGES: `${TABLE_PREFIX}-training-images`,
  GENERATED_IMAGES: `${TABLE_PREFIX}-generated-images`,
};

export class DynamoDBService {
  static async get(tableName: string, key: Record<string, any>) {
    const command = new GetCommand({
      TableName: tableName,
      Key: key,
    });
    
    const result = await dynamodb.send(command);
    return result.Item;
  }

  static async put(tableName: string, item: Record<string, any>) {
    const command = new PutCommand({
      TableName: tableName,
      Item: {
        ...item,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
    
    await dynamodb.send(command);
    return item;
  }

  static async update(tableName: string, key: Record<string, any>, updates: Record<string, any>) {
    const updateExpression = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

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
    return result.Attributes;
  }

  static async delete(tableName: string, key: Record<string, any>) {
    const command = new DeleteCommand({
      TableName: tableName,
      Key: key,
    });
    
    await dynamodb.send(command);
  }

  static async query(tableName: string, indexName: string | undefined, keyCondition: string, expressionAttributeNames: Record<string, string>, expressionAttributeValues: Record<string, any>) {
    const command = new QueryCommand({
      TableName: tableName,
      IndexName: indexName,
      KeyConditionExpression: keyCondition,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    });

    const result = await dynamodb.send(command);
    return result.Items || [];
  }

  static async scan(tableName: string, filterExpression?: string, expressionAttributeNames?: Record<string, string>, expressionAttributeValues?: Record<string, any>) {
    const command = new ScanCommand({
      TableName: tableName,
      FilterExpression: filterExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    });

    const result = await dynamodb.send(command);
    return result.Items || [];
  }
}
