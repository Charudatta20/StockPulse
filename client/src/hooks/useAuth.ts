import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function useAuth() {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      if (!token) throw new Error('No token');
      
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Authentication failed');
      }
      
      const data = await response.json();
      return data.user;
    },
    retry: false,
    enabled: !!token,
  });

  const login = (userData: any, authToken: string) => {
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(authToken);
    queryClient.setQueryData(["/api/auth/me"], userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    queryClient.setQueryData(["/api/auth/me"], null);
    queryClient.clear();
  };

  // Check for token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    error
  };
}
