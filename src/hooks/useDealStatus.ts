import { useQuery } from '@tanstack/react-query';
import { getDealStatus } from '@/api/client';
import type { DealStatus } from '@/types';

interface UseDealStatusOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
}

export function useDealStatus(dealId: string | undefined, options: UseDealStatusOptions = {}) {
  const { enabled = true, refetchInterval } = options;

  return useQuery<DealStatus>({
    queryKey: ['deal-status', dealId],
    queryFn: () => getDealStatus(dealId!),
    enabled: enabled && !!dealId,
    refetchInterval: refetchInterval,
    // Automatically poll while extraction is in progress
    refetchIntervalInBackground: true,
  });
}

// Helper hook that automatically polls during extraction
export function useDealStatusPolling(dealId: string | undefined) {
  const query = useQuery<DealStatus>({
    queryKey: ['deal-status', dealId],
    queryFn: () => getDealStatus(dealId!),
    enabled: !!dealId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Poll every 2 seconds while pending/extracting/storing
      if (status === 'pending' || status === 'extracting' || status === 'storing') {
        return 2000;
      }
      // Stop polling when complete or error
      return false;
    },
    refetchIntervalInBackground: true,
    retry: (failureCount) => {
      // Retry a few times in case backend isn't ready
      return failureCount < 3;
    },
    retryDelay: 1000,
  });

  const isProcessing = query.data?.status === 'pending' || 
                       query.data?.status === 'extracting' || 
                       query.data?.status === 'storing';

  const hasError = query.data?.status === 'error' || 
                   (query.data?.error_message != null) ||
                   (query.data?.error != null);

  return {
    ...query,
    isProcessing,
    isComplete: query.data?.status === 'complete',
    isError: query.data?.status === 'error',
    hasError,
  };
}
