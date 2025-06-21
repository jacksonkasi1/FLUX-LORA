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

    const { email, password, displayName } = JSON.parse(event.body);

    if (!email || !password) {
      return ResponseBuilder.error('Email and password are required', 400);
    }

    // Check if user already exists
    const existingUsers = await DynamoDBService.scan(
      Tables.USER_SETTINGS,
      '#email = :email',
      { '#email': 'email' },
      { ':email': email }
    );

    if (existingUsers.length > 0) {
      return ResponseBuilder.error('User already exists with this email', 409);
    }

    // Create new user
    const userId = AuthService.generateUserId();
    const hashedPassword = AuthService.hashPassword(password);

    const user: User = {
      id: userId,
      email,
      displayName: displayName || email.split('@')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store user credentials (in production, use proper password hashing)
    await DynamoDBService.put(Tables.USER_SETTINGS, {
      userId,
      email,
      password: hashedPassword,
      displayName: user.displayName,
      apiKeys: {},
      preferences: {},
    });

    // Generate JWT token
    const token = AuthService.generateToken(user);

    return ResponseBuilder.success({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
      token,
    }, 201);

  } catch (error: any) {
    console.error('Registration error:', error);
    return ResponseBuilder.error('Registration failed', 500, error.message);
  }
};
