import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useQuery, useMutation, UseMutationResult } from '@tanstack/react-query';
import { User } from '@shared/schema';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  user: LoginResponse | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<LoginResponse, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<RegisterResponse, Error, RegisterData>;
  isAuthorized: boolean;
};

type LoginData = {
  username: string;
  password: string;
};

type LoginResponse = {
  id: number;
  username: string;
  preferredField?: string;
};

type RegisterData = {
  username: string;
  password: string;
  preferredField?: string;
};

type RegisterResponse = {
  id: number;
  username: string;
  preferredField?: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  const {
    data: user = null,
    error,
    isLoading,
    refetch,
  } = useQuery<LoginResponse | null, Error>({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/auth/user', {
          credentials: 'include',
        });
        
        if (res.status === 401) {
          setIsAuthorized(false);
          return null;
        }
        
        if (!res.ok) {
          throw new Error('Failed to fetch user');
        }
        
        const userData = await res.json();
        setIsAuthorized(true);
        return userData;
      } catch (err) {
        setIsAuthorized(false);
        throw err;
      }
    },
    staleTime: 300000, // 5 minutes
  });

  const loginMutation = useMutation<LoginResponse, Error, LoginData>({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest('POST', '/api/auth/login', credentials);
      return await res.json();
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(['/api/auth/user'], userData);
      setIsAuthorized(true);
      toast({
        title: 'Login successful',
        description: `Welcome back, ${userData.username}!`,
      });
    },
    onError: (error: Error) => {
      setIsAuthorized(false);
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const registerMutation = useMutation<RegisterResponse, Error, RegisterData>({
    mutationFn: async (userData: RegisterData) => {
      const res = await apiRequest('POST', '/api/auth/register', userData);
      return await res.json();
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(['/api/auth/user'], userData);
      setIsAuthorized(true);
      toast({
        title: 'Registration successful',
        description: `Welcome, ${userData.username}!`,
      });
    },
    onError: (error: Error) => {
      setIsAuthorized(false);
      toast({
        title: 'Registration failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      await apiRequest('POST', '/api/auth/logout');
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/auth/user'], null);
      setIsAuthorized(false);
      queryClient.invalidateQueries();
      toast({
        title: 'Logout successful',
        description: 'You have been logged out.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Logout failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        isAuthorized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}