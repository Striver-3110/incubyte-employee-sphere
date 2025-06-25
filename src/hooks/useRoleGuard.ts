import { useState, useEffect } from 'react';
import { checkProfileTestAccess } from '@/api/userRoleService';

interface UseRoleGuardResult {
  hasAccess: boolean | null; // null = loading
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook to check if user has Profile Test role access
 */
export const useRoleGuard = (): UseRoleGuardResult => {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const access = await checkProfileTestAccess();
        console.log('Profile Test access:', access);
        setHasAccess(access);
      } catch (err) {
        console.error('Role guard error:', err);
        setError(err instanceof Error ? err.message : 'Failed to check access');
        setHasAccess(false); // Default to no access on error
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, []);

  return { hasAccess, isLoading, error };
};
