import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBService, Tables } from '../../lib/aws/dynamodb';
import { AuthService, User } from '../../lib/aws/cognito';
import { ResponseBuilder } from '../../lib/aws/response';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return ResponseBuilder.cors();
    }

    if (!event.body) {
      return ResponseBuilder.error('Request body is required', 400);
    }

    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      return ResponseBuilder.error('Email and password are required', 400);
    }

    // Find user by email
    const users = await DynamoDBService.scan(
      Tables.USER_SETTINGS,
      '#email = :email',
      { '#email': 'email' },
      { ':email': email }
    );

    if (users.length === 0) {
      return ResponseBuilder.error('Invalid email or password', 401);
    }

    const userRecord = users[0];
    const hashedPassword = AuthService.hashPassword(password);

    if (userRecord.password !== hashedPassword) {
      return ResponseBuilder.error('Invalid email or password', 401);
    }

    const user: User = {
      id: userRecord.userId,
      email: userRecord.email,
      displayName: userRecord.displayName,
      createdAt: userRecord.createdAt,
      updatedAt: userRecord.updatedAt,
    };

    // Generate JWT token
    const token = AuthService.generateToken(user);

    return ResponseBuilder.success({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
      token,
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return ResponseBuilder.error('Login failed', 500, error.message);
  }
};
