/**
 * Settings related types
 */

import type { DatabaseItem } from './lambda';

export interface UserSettings extends DatabaseItem {
  userId: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  apiKeys: {
    falaiApiKey?: string; // Encrypted
  };
  preferences: {
    theme?: 'light' | 'dark' | 'system';
    notifications?: {
      email?: boolean;
      trainingComplete?: boolean;
      generationReady?: boolean;
    };
  };
}

export interface UpdateSettingsRequest {
  displayName?: string;
  avatarUrl?: string;
  apiKeys?: {
    falaiApiKey?: string;
  };
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    notifications?: {
      email?: boolean;
      trainingComplete?: boolean;
      generationReady?: boolean;
    };
  };
}