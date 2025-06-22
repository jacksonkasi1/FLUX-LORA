/**
 * User settings related type definitions
 */

export interface UserSettings {
  userId: string;
  displayName?: string;
  avatarUrl?: string;
  apiKeys: Record<string, string>;
  preferences: UserPreferences;
  hasApiKeys: boolean;
  apiKeyServices: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  notifications?: NotificationSettings;
  defaultModelType?: string;
  autoSave?: boolean;
}

export interface NotificationSettings {
  email?: boolean;
  push?: boolean;
  trainingComplete?: boolean;
  generationComplete?: boolean;
}

export interface UpdateUserSettingsRequest {
  displayName?: string;
  avatarUrl?: string;
  apiKeys?: Record<string, string>;
  preferences?: Partial<UserPreferences>;
}

export interface ApiKeyConfig {
  service: string;
  key: string;
  encrypted?: boolean;
}
