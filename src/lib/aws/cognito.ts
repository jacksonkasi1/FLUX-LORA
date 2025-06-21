import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand, AdminInitiateAuthCommand, AdminGetUserCommand, AdminUpdateUserAttributesCommand, AdminDeleteUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { createHash, randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';

const client = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

// For development, we'll use a simple JWT approach instead of Cognito
// In production, you should use proper Cognito setup
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export interface User {
  id: string;
  email: string;
  displayName?: string;
  createdAt: string;
  updatedAt: string;
}

export class AuthService {
  static generateUserId(): string {
    return randomBytes(16).toString('hex');
  }

  static hashPassword(password: string): string {
    return createHash('sha256').update(password + JWT_SECRET).digest('hex');
  }

  static generateToken(user: User): string {
    return jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        displayName: user.displayName 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  static verifyToken(token: string): { userId: string; email: string; displayName?: string } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      return {
        userId: decoded.userId,
        email: decoded.email,
        displayName: decoded.displayName,
      };
    } catch (error) {
      return null;
    }
  }

  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}
