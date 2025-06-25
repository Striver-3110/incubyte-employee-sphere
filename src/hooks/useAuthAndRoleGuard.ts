import { useState, useEffect } from 'react';
import { checkAuthentication } from '@/api/authService';
import { checkProfileTestAccess } from '@/api/userRoleService';

interface UseAuthAndRoleGuardResult {
  isAuthenticated: boolean | null; // null = loading
  hasAccess: boolean | null; // null = loading
  isLoading: boolean;
  error: string | null;
  userEmail: string | null;
}

/**
 * Custom hook to check both authentication and role access
 * First checks if user is authenticated, then checks role access
 */
export const useAuthAndRoleGuard = (): UseAuthAndRoleGuardResult => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndRole = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // First check authentication
        console.log('Checking authentication status...');
        const authStatus = await checkAuthentication();
        console.log('Authentication status:', authStatus);
        
        setIsAuthenticated(authStatus.is_authenticated);
        setUserEmail(authStatus.user_email);
        
        if (!authStatus.is_authenticated) {
          // If not authenticated, we don't need to check roles
          setHasAccess(false);
          return;
        }
        
        // If authenticated, check role access
        console.log('User is authenticated, checking role access...');
        const access = await checkProfileTestAccess();
        console.log('Profile Test access:', access);
        setHasAccess(access);
        
      } catch (err) {
        console.error('Auth and role guard error:', err);
        setError(err instanceof Error ? err.message : 'Failed to check authentication and access');
        setIsAuthenticated(false);
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndRole();
  }, []);

  return { isAuthenticated, hasAccess, isLoading, error, userEmail };
};
