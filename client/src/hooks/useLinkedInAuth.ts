import { useState, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface UseLinkedInAuthReturn {
  connectLinkedIn: () => void;
  isConnecting: boolean;
}

const useLinkedInAuth = (): UseLinkedInAuthReturn => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  // LinkedIn OAuth configuration
  const initiateLinkedInAuth = () => {
    // LinkedIn requires a redirect URI that's registered with LinkedIn's developer console
    // In a production app, this would be registered and verified by LinkedIn
    const redirectUri = window.location.origin + '/auth/linkedin/callback';
    
    // These environment variables would be provided in a real application
    const clientId = process.env.LINKEDIN_CLIENT_ID || 'linkedin_client_id';
    
    // Standard OAuth 2.0 parameters for LinkedIn
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'r_liteprofile r_emailaddress w_member_social',
      state: crypto.randomUUID(), // Prevent CSRF attacks
    });

    // Store the state in localStorage to verify in the callback
    localStorage.setItem('linkedin_oauth_state', params.get('state')!);
    
    // Redirect to LinkedIn's OAuth authorization page
    window.location.href = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  };

  const connectLinkedIn = useCallback(() => {
    setIsConnecting(true);
    
    // For the implementation in this environment, we'll have a backend endpoint
    // that handles the OAuth flow and just returns success/failure
    apiRequest('GET', '/api/linkedin/auth-url')
      .then(async (response) => {
        const data = await response.json();
        // The backend provides the authorization URL to redirect to
        if (data && data.authUrl) {
          window.location.href = data.authUrl;
        } else {
          throw new Error('Failed to get LinkedIn authorization URL');
        }
      })
      .catch((error) => {
        setIsConnecting(false);
        toast({
          title: 'LinkedIn Connection Failed',
          description: error.message || 'Could not connect to LinkedIn. Please try again.',
          variant: 'destructive',
        });
      });
  }, [toast]);

  return { connectLinkedIn, isConnecting };
};

export default useLinkedInAuth;
