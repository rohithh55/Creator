import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { JobSource } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface UseJobSourcesReturn {
  sources: JobSource[] | undefined;
  isLoading: boolean;
  addSource: (url: string) => Promise<void>;
  syncSource: (sourceId: number) => Promise<void>;
  removeSource: (sourceId: number) => Promise<void>;
  isAddingSource: boolean;
  isSyncingSource: boolean;
  isRemovingSource: boolean;
}

export const useJobSources = (): UseJobSourcesReturn => {
  const { toast } = useToast();

  const { data: sources, isLoading } = useQuery<JobSource[]>({
    queryKey: ['/api/job-sources'],
  });

  const addSourceMutation = useMutation({
    mutationFn: (url: string) => apiRequest('POST', '/api/job-sources', { url }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/job-sources'] });
      toast({
        title: 'Source Added',
        description: 'The job source has been added successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Add Source',
        description: error.message || 'Please check the URL and try again.',
        variant: 'destructive',
      });
    },
  });

  const syncSourceMutation = useMutation({
    mutationFn: (sourceId: number) => apiRequest('POST', `/api/job-sources/${sourceId}/sync`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/job-sources'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      toast({
        title: 'Source Synced',
        description: 'The job source has been synced successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Sync Failed',
        description: error.message || 'Failed to sync with the job source.',
        variant: 'destructive',
      });
    },
  });

  const removeSourceMutation = useMutation({
    mutationFn: (sourceId: number) => apiRequest('DELETE', `/api/job-sources/${sourceId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/job-sources'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      toast({
        title: 'Source Removed',
        description: 'The job source has been removed successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Removal Failed',
        description: error.message || 'Failed to remove the job source.',
        variant: 'destructive',
      });
    },
  });

  const addSource = async (url: string): Promise<void> => {
    if (!url.trim()) {
      toast({
        title: 'Empty URL',
        description: 'Please enter a valid job site URL.',
        variant: 'destructive',
      });
      return;
    }
    
    await addSourceMutation.mutateAsync(url);
  };

  const syncSource = async (sourceId: number): Promise<void> => {
    await syncSourceMutation.mutateAsync(sourceId);
  };

  const removeSource = async (sourceId: number): Promise<void> => {
    await removeSourceMutation.mutateAsync(sourceId);
  };

  return {
    sources,
    isLoading,
    addSource,
    syncSource,
    removeSource,
    isAddingSource: addSourceMutation.isPending,
    isSyncingSource: syncSourceMutation.isPending,
    isRemovingSource: removeSourceMutation.isPending,
  };
};

export default useJobSources;
