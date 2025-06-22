/**
 * Async hook
 * Hook for managing async operations state
 */

import { useState, useCallback, useEffect } from 'react';

// ** import types
import type { AsyncStatus } from '@/types';

interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  status: AsyncStatus;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

/**
 * Hook for managing async operations
 */
export const useAsync = <T>(
  asyncFunction?: () => Promise<T>,
  immediate: boolean = true
) => {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    status: 'pending',
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  const execute = useCallback(
    async (asyncFn?: () => Promise<T>) => {
      const fn = asyncFn || asyncFunction;
      if (!fn) {
        throw new Error('No async function provided');
      }

      setState(prev => ({
        ...prev,
        status: 'pending',
        isLoading: true,
        isSuccess: false,
        isError: false,
        error: null,
      }));

      try {
        const data = await fn();
        setState({
          data,
          error: null,
          status: 'fulfilled',
          isLoading: false,
          isSuccess: true,
          isError: false,
        });
        return data;
      } catch (error) {
        setState({
          data: null,
          error: error as Error,
          status: 'rejected',
          isLoading: false,
          isSuccess: false,
          isError: true,
        });
        throw error;
      }
    },
    [asyncFunction]
  );

  // Execute immediately if requested
  useEffect(() => {
    if (immediate && asyncFunction) {
      execute();
    }
  }, [execute, immediate, asyncFunction]);

  return {
    ...state,
    execute,
  };
};
