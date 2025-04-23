import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { JobSource } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, Trash2 } from "lucide-react";

const JobSourceIntegration = () => {
  const [sourceUrl, setSourceUrl] = useState("");
  const { toast } = useToast();

  const { data: sources, isLoading } = useQuery<JobSource[]>({
    queryKey: ['/api/job-sources'],
  });

  const addSourceMutation = useMutation({
    mutationFn: (url: string) => apiRequest("POST", "/api/job-sources", { url }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/job-sources'] });
      setSourceUrl("");
      toast({
        title: "Source Added",
        description: "The job source has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Source",
        description: "Please check the URL and try again.",
        variant: "destructive",
      });
    },
  });

  const syncSourceMutation = useMutation({
    mutationFn: (sourceId: number) => apiRequest("POST", `/api/job-sources/${sourceId}/sync`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/job-sources'] });
      toast({
        title: "Source Synced",
        description: "The job source has been synced successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Sync Failed",
        description: "Failed to sync with the job source.",
        variant: "destructive",
      });
    },
  });

  const removeSourceMutation = useMutation({
    mutationFn: (sourceId: number) => apiRequest("DELETE", `/api/job-sources/${sourceId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/job-sources'] });
      toast({
        title: "Source Removed",
        description: "The job source has been removed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Removal Failed",
        description: "Failed to remove the job source.",
        variant: "destructive",
      });
    },
  });

  const handleAddSource = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sourceUrl.trim()) {
      toast({
        title: "Empty URL",
        description: "Please enter a valid job site URL.",
        variant: "destructive",
      });
      return;
    }
    
    addSourceMutation.mutate(sourceUrl);
  };

  const handleSyncSource = (sourceId: number) => {
    syncSourceMutation.mutate(sourceId);
  };

  const handleRemoveSource = (sourceId: number) => {
    removeSourceMutation.mutate(sourceId);
  };

  const getLogoUrl = (url: string) => {
    try {
      const hostname = new URL(url).hostname;
      return `https://logo.clearbit.com/${hostname}`;
    } catch (error) {
      return null;
    }
  };

  const getLastSyncedText = (source: JobSource) => {
    if (!source.lastSynced) return "Never synced";
    
    const lastSynced = new Date(source.lastSynced);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - lastSynced.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffHours < 48) return "1 day ago";
    return `${Math.floor(diffHours / 24)} days ago`;
  };

  return (
    <Card className="bg-white shadow rounded-lg">
      <CardContent className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium text-gray-900">Job Source Integration</h2>
        <p className="mt-1 text-sm text-gray-500">Add job boards and career sites to track positions.</p>
        
        <form onSubmit={handleAddSource} className="mt-4">
          <div className="flex rounded-md shadow-sm">
            <Input
              type="text"
              className="flex-1 min-w-0 block"
              placeholder="Enter job site URL (e.g., linkedin.com/jobs)"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
            />
            <Button 
              type="submit" 
              className="ml-3 inline-flex items-center"
              disabled={addSourceMutation.isPending}
            >
              {addSourceMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Source
            </Button>
          </div>
        </form>

        {/* Connected Sources List */}
        <div className="mt-6 space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Connected Sources</h3>
          
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : sources && sources.length > 0 ? (
            <div>
              {sources.map((source) => (
                <div key={source.id} className="flex justify-between items-center py-3 border-b">
                  <div className="flex items-center">
                    {getLogoUrl(source.url) ? (
                      <img 
                        src={getLogoUrl(source.url)!} 
                        alt={`${source.name} Logo`} 
                        className="h-6 w-6 rounded-sm mr-3"
                        onError={(e) => {
                          // If logo loading fails, replace with a fallback
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>';
                        }}
                      />
                    ) : (
                      <div className="h-6 w-6 rounded-sm mr-3 bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                        {source.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-medium text-gray-800">{source.name}</h4>
                      <p className="text-xs text-gray-500">Last sync: {getLastSyncedText(source)}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-sm text-gray-600 hover:text-gray-900"
                      onClick={() => handleSyncSource(source.id)}
                      disabled={syncSourceMutation.isPending}
                    >
                      {syncSourceMutation.isPending && syncSourceMutation.variables === source.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-1" />
                      )}
                      Sync
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-sm text-gray-600 hover:text-red-600"
                      onClick={() => handleRemoveSource(source.id)}
                      disabled={removeSourceMutation.isPending}
                    >
                      {removeSourceMutation.isPending && removeSourceMutation.variables === source.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-1" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 border border-dashed border-gray-300 rounded-md">
              <p className="text-sm text-gray-500">No job sources connected yet.</p>
              <p className="text-xs text-gray-400 mt-1">Add your first job source to start tracking positions.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default JobSourceIntegration;
