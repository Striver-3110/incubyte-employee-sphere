const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface UserRole {
  user_email: string;
  roles: string[];
  has_profile_test_role: boolean;
}

export interface UserRoleResponse {
  status: string;
  message: {
    status: string;
    message: string;
    data: UserRole;
  } | string;
  data?: UserRole;
}

/**
 * Fetch current user's roles from the backend
 */
export const fetchUserRoles = async (): Promise<UserRoleResponse> => {
  try {
    const response = await fetch(`${BASE_URL}user.get_user_roles`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user roles');
    }

    const data = await response.json();
    
    if (data.status === 'error') {
      throw new Error(data.message || 'Failed to fetch user roles');
    }

    return data;
  } catch (error) {
    console.error('Error fetching user roles:', error);
    throw error;
  }
};

/**
 * Check if user has Profile Test role access
 */
export const checkProfileTestAccess = async (): Promise<boolean> => {
  try {
    const response = await fetchUserRoles();
    console.log('Full API response:', response);
    
    // Handle nested response structure: response.message.data
    let userData: UserRole | undefined;
    
    if (typeof response.message === 'object' && response.message.data) {
      userData = response.message.data;
    } else if (response.data) {
      userData = response.data;
    }
    
    console.log('User data:', userData);
    
    return userData?.has_profile_test_role || false;
  } catch (error) {
    console.error('Error checking profile test access:', error);
    // Default to false for security - don't allow access if we can't verify
    return false;
  }
};
