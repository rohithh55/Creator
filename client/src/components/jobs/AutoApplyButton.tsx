import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Alert,
  AlertDescription,
  AlertTitle 
} from '@/components/ui/alert';
import { Loader2, Check, ExternalLink } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface AutoApplyButtonProps {
  jobId: number;
  isEasyApply: boolean | null;
  originalUrl: string;
  sourceName?: string;
}

export function AutoApplyButton({ 
  jobId, 
  isEasyApply, 
  originalUrl,
  sourceName
}: AutoApplyButtonProps) {
  const [showResult, setShowResult] = useState(false);
  const [applyResult, setApplyResult] = useState<{
    success: boolean;
    message: string;
    redirectUrl?: string;
  } | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const autoApplyMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/jobs/${jobId}/auto-apply`);
    },
    onSuccess: (data) => {
      setApplyResult({
        success: true,
        message: data.message || "Application submitted successfully"
      });
      setShowResult(true);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/applications/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      
      toast({
        title: "Application Submitted",
        description: `Your application was successfully submitted via ${sourceName || "Easy Apply"}.`,
        variant: "default",
      });
    },
    onError: (error: any) => {
      setApplyResult({
        success: false,
        message: error.message || "Failed to apply for this job",
        redirectUrl: originalUrl
      });
      setShowResult(true);
      
      toast({
        title: "Application Failed",
        description: error.message || "There was an error applying for this job. Please try the manual application link.",
        variant: "destructive",
      });
    }
  });
  
  const handleApply = () => {
    autoApplyMutation.mutate();
  };
  
  const handleManualApply = () => {
    window.open(originalUrl, '_blank');
  };
  
  if (!isEasyApply) {
    return (
      <Button onClick={handleManualApply} className="w-full">
        Apply <ExternalLink className="ml-2 h-4 w-4" />
      </Button>
    );
  }
  
  if (showResult) {
    return (
      <div className="space-y-2">
        <Alert variant={applyResult?.success ? "default" : "destructive"}>
          <AlertTitle className="flex items-center">
            {applyResult?.success ? 
              <><Check className="mr-2 h-4 w-4" /> Application Submitted</> : 
              "Application Failed"}
          </AlertTitle>
          <AlertDescription>
            {applyResult?.message}
            {!applyResult?.success && applyResult?.redirectUrl && (
              <Button 
                variant="link" 
                onClick={handleManualApply}
                className="p-0 ml-2 h-auto"
              >
                Apply Manually <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <Button 
      onClick={handleApply} 
      disabled={autoApplyMutation.isPending}
      className="w-full"
    >
      {autoApplyMutation.isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Applying...
        </>
      ) : (
        <>Easy Apply</>
      )}
    </Button>
  );
}