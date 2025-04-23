import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { Application, Job, JobStatus } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface ApplicationWithJob extends Application {
  job: Job;
}

interface ApplicationStats {
  applied: number;
  inReview: number;
  interview: number;
  rejected: number;
  offered: number;
  total: number;
}

interface UseApplicationsReturn {
  applications: ApplicationWithJob[] | undefined;
  stats: ApplicationStats | undefined;
  isLoading: boolean;
  isLoadingStats: boolean;
  applyToJob: (jobId: number) => Promise<void>;
  updateApplicationStatus: (applicationId: number, status: string, notes?: string) => Promise<void>;
  isApplying: boolean;
  isUpdating: boolean;
}

export const useApplications = (filter?: string): UseApplicationsReturn => {
  const { toast } = useToast();

  const { data: applications, isLoading } = useQuery<ApplicationWithJob[]>({
    queryKey: ['/api/applications', filter],
  });

  const { data: stats, isLoading: isLoadingStats } = useQuery<ApplicationStats>({
    queryKey: ['/api/applications/stats'],
  });

  const applyMutation = useMutation({
    mutationFn: (jobId: number) => apiRequest('POST', '/api/applications', { jobId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/applications/stats'] });
      toast({
        title: 'Application Submitted',
        description: 'Your application has been successfully submitted.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Application Failed',
        description: error.message || 'Failed to submit application. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ applicationId, status, notes }: { applicationId: number; status: string; notes?: string }) => 
      apiRequest('PATCH', `/api/applications/${applicationId}`, { status, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/applications/stats'] });
      toast({
        title: 'Status Updated',
        description: 'Application status has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update application status.',
        variant: 'destructive',
      });
    },
  });

  const applyToJob = async (jobId: number): Promise<void> => {
    await applyMutation.mutateAsync(jobId);
  };

  const updateApplicationStatus = async (
    applicationId: number, 
    status: string, 
    notes?: string
  ): Promise<void> => {
    await updateStatusMutation.mutateAsync({ applicationId, status, notes });
  };

  return {
    applications,
    stats,
    isLoading,
    isLoadingStats,
    applyToJob,
    updateApplicationStatus,
    isApplying: applyMutation.isPending,
    isUpdating: updateStatusMutation.isPending,
  };
};

export default useApplications;
