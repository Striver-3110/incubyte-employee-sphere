import React, { useEffect, useState } from 'react';
import { checkAuthentication, redirectToLogin } from '@/api/authService';
import { AlertCircle, Loader2, LogIn } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * AuthGuard component that only checks authentication (not roles)
 * Use this for routes that need login but not specific roles
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  fallback 
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('AuthGuard: Checking authentication...');
        const authStatus = await checkAuthentication();
        console.log('AuthGuard authentication status:', authStatus);
        
        setIsAuthenticated(authStatus.is_authenticated);
        
        if (!authStatus.is_authenticated) {
          console.log('AuthGuard: User not authenticated, redirecting to login...');
          redirectToLogin();
        }
        
      } catch (err) {
        console.error('AuthGuard error:', err);
        setError(err instanceof Error ? err.message : 'Failed to check authentication');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Redirect to login if not authenticated (once loading is complete)
  useEffect(() => {
    if (!isLoading && isAuthenticated === false) {
      console.log('AuthGuard: User is not authenticated, redirecting to login...');
      redirectToLogin();
    }
  }, [isLoading, isAuthenticated]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Not authenticated (will redirect to login via useEffect)
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <LogIn className="h-8 w-8 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Check Failed
          </h1>
          <p className="text-gray-600 mb-4">
            Unable to verify your authentication status. Please try refreshing the page.
          </p>
          <p className="text-sm text-red-600">{error}</p>
          <div className="flex gap-2 justify-center mt-4">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Refresh Page
            </button>
            <button 
              onClick={() => redirectToLogin()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated - render children
  return <>{children}</>;
};
