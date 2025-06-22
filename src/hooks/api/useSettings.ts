/**
 * Settings hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { UserSettings } from '@/types';

/**
 * Get user settings
 */
export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => apiClient.get<UserSettings>('/settings'),
  });
};

/**
 * Update settings mutation
 */
export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Partial<UserSettings>) => apiClient.put('/settings', updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};