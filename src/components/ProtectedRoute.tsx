import React, { useEffect } from 'react';
import { useAuthAndRoleGuard } from '@/hooks/useAuthAndRoleGuard';
import { redirectToLogin } from '@/api/authService';
import { AlertCircle, Shield, Loader2, LogIn } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const { isAuthenticated, hasAccess, isLoading, error, userEmail } = useAuthAndRoleGuard();

  // Redirect to login if not authenticated (once loading is complete)
  useEffect(() => {
    if (!isLoading && isAuthenticated === false) {
      console.log('User is not authenticated, redirecting to login...');
      redirectToLogin();
    }
  }, [isLoading, isAuthenticated]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">
            {isAuthenticated === null ? 'Checking authentication...' : 'Checking access permissions...'}
          </p>
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
            Access Check Failed
          </h1>
          <p className="text-gray-600 mb-4">
            Unable to verify your authentication and access permissions. Please try refreshing the page.
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

  // No access (authenticated but lacks required role)
  if (isAuthenticated === true && hasAccess === false) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-100">
        <div className="text-center max-w-md mx-auto p-6">
          <Shield className="h-12 w-12 text-orange-600 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Access Restricted
          </h1>
          <p className="text-gray-600 mb-4">
            You don't have the required permissions to access this page. 
            Please contact your administrator if you believe this is an error.
          </p>
          <div className="text-sm text-gray-500 mb-4">
            <div>Logged in as: <span className="font-medium">{userEmail}</span></div>
            <div>Required role: <span className="font-medium">Profile Test</span></div>
          </div>
          <button 
            onClick={() => redirectToLogin()}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            Switch Account
          </button>
        </div>
      </div>
    );
  }

  // Has authentication and access - render children
  return <>{children}</>;
};
