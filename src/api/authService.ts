const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface AuthStatus {
  is_authenticated: boolean;
  user_email: string | null;
  session_id: string | null;
}

export interface AuthResponse {
  message: {
    status: string;
    message: string;
    data: AuthStatus;
  };
}

/**
 * Check if the user is authenticated
 */
export const checkAuthentication = async (): Promise<AuthStatus> => {
  try {
    const response = await fetch(`${BASE_URL}user.check_authentication_status`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      // If the request fails, assume user is not authenticated
      return {
        is_authenticated: false,
        user_email: null,
        session_id: null
      };
    }

    const data: Partial<AuthResponse> = await response.json();
    console.log('Raw API response:', data); // Debug log
    
    // Detailed validation debugging
    console.log('Validation checks:');
    console.log('  data exists:', !!data);
    console.log('  data.message exists:', !!data?.message);
    console.log('  data.message.status:', data?.message?.status);
    console.log('  data.message.data exists:', !!data?.message?.data);
    console.log('  data.message.data.is_authenticated type:', typeof data?.message?.data?.is_authenticated);
    console.log('  data.message.data.is_authenticated value:', data?.message?.data?.is_authenticated);
    
    // Defensive: ensure we always return a valid AuthStatus object
    if (
      data &&
      data.message &&
      data.message.status === 'success' &&
      data.message.data &&
      typeof data.message.data.is_authenticated === 'boolean'
    ) {
      console.log('Valid response, returning data:', data.message.data);
      return data.message.data;
    } else {
      // Covers error status, missing data, or malformed response
      console.error('Authentication check error or malformed response:', data?.message?.message || 'Unknown error', data);
      return {
        is_authenticated: false,
        user_email: null,
        session_id: null
      };
    }
  } catch (error) {
    console.error('Error checking authentication:', error);
    // Default to not authenticated on error for security
    return {
      is_authenticated: false,
      user_email: null,
      session_id: null
    };
  }
};

/**
 * Redirect to Frappe's login page with current URL as redirect
 */
export const redirectToLogin = (): void => {
  const currentPath = window.location.pathname + window.location.search + window.location.hash;
  const encodedRedirect = encodeURIComponent(currentPath);
  
  // Frappe's standard login URL format
  const loginUrl = `/login?redirect-to=${encodedRedirect}`;
  
  // Use location.replace to prevent back button issues
  window.location.replace(loginUrl);
};

/**
 * Check authentication and redirect to login if not authenticated
 * Returns true if authenticated, false if redirecting to login
 */
export const ensureAuthenticated = async (): Promise<boolean> => {
  const authStatus = await checkAuthentication();
  
  if (!authStatus.is_authenticated) {
    redirectToLogin();
    return false;
  }
  
  return true;
};
