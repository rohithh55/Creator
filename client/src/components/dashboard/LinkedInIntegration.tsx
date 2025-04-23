import { useMutation, useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, Linkedin } from "lucide-react";
import useLinkedInAuth from "@/hooks/useLinkedInAuth";

const LinkedInIntegration = () => {
  const { toast } = useToast();
  const { connectLinkedIn, isConnecting } = useLinkedInAuth();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['/api/user/current'],
  });

  const disconnectMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/linkedin/disconnect", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/current'] });
      toast({
        title: "LinkedIn Disconnected",
        description: "Your LinkedIn account has been disconnected.",
      });
    },
    onError: () => {
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect your LinkedIn account.",
        variant: "destructive",
      });
    },
  });

  const handleDisconnect = () => {
    disconnectMutation.mutate();
  };

  const handleManageProfile = () => {
    window.open('/profile', '_blank');
  };

  if (isLoading) {
    return (
      <Card className="bg-white shadow rounded-lg">
        <CardContent className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900">LinkedIn Integration</h2>
          <p className="mt-1 text-sm text-gray-500">Connect your LinkedIn account to enable Easy Apply functionality.</p>
          <div className="mt-5 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const isConnected = user?.linkedinConnected;

  return (
    <Card className="bg-white shadow rounded-lg">
      <CardContent className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium text-gray-900">LinkedIn Integration</h2>
        <p className="mt-1 text-sm text-gray-500">Connect your LinkedIn account to enable Easy Apply functionality.</p>
        
        <div className="mt-5">
          {isConnected ? (
            // Connected State
            <div className="text-center border border-green-200 rounded-lg bg-green-50 px-4 py-3">
              <div className="flex items-center justify-center">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <h3 className="mt-2 text-sm font-medium text-green-800">LinkedIn Connected</h3>
              <p className="mt-1 text-xs text-green-700">Easy Apply is enabled for compatible jobs</p>
              
              <div className="mt-3 space-x-2">
                <Button 
                  onClick={handleManageProfile}
                  size="sm"
                >
                  Manage Profile
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDisconnect}
                  disabled={disconnectMutation.isPending}
                >
                  {disconnectMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : null}
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            // Disconnected State
            <div className="text-center border border-gray-200 rounded-lg bg-gray-50 px-4 py-3">
              <div className="flex items-center justify-center">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Linkedin className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-800">LinkedIn Not Connected</h3>
              <p className="mt-1 text-xs text-gray-600">Connect to enable one-click applications</p>
              
              <Button 
                className="mt-3" 
                onClick={connectLinkedIn}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : null}
                Connect LinkedIn
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LinkedInIntegration;
