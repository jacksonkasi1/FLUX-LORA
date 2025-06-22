/**
 * Settings API methods
 */

import { apiClient } from './client';
import type { UserSettings, UpdateUserSettingsRequest } from '@/types';

/**
 * Settings API service
 */
export class SettingsAPI {
  /**
   * Get user settings
   */
  static async getSettings(): Promise<UserSettings> {
    return apiClient.get<UserSettings>('/settings');
  }

  /**
   * Update user settings
   */
  static async updateSettings(updates: UpdateUserSettingsRequest): Promise<UserSettings> {
    return apiClient.put<UserSettings>('/settings', updates);
  }
}
