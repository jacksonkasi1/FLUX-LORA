/**
 * Training models hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ModelsAPI } from '@/lib/api';
import type { TrainingModel, CreateTrainingModelRequest, UpdateTrainingModelRequest } from '@/types';

/**
 * Get all training models
 */
export const useTrainingModels = () => {
  return useQuery({
    queryKey: ['training-models'],
    queryFn: ModelsAPI.getModels,
  });
};

/**
 * Get specific training model
 */
export const useTrainingModel = (id: string) => {
  return useQuery({
    queryKey: ['training-model', id],
    queryFn: () => ModelsAPI.getModel(id),
    enabled: !!id,
  });
};

/**
 * Create training model mutation
 */
export const useCreateTrainingModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (model: CreateTrainingModelRequest) => ModelsAPI.createModel(model),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-models'] });
    },
  });
};

/**
 * Update training model mutation
 */
export const useUpdateTrainingModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateTrainingModelRequest }) =>
      ModelsAPI.updateModel(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['training-models'] });
      queryClient.invalidateQueries({ queryKey: ['training-model', id] });
    },
  });
};

/**
 * Delete training model mutation
 */
export const useDeleteTrainingModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ModelsAPI.deleteModel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-models'] });
    },
  });
};