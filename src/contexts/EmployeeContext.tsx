import React, { createContext, useContext, useEffect, useState } from 'react';
import { EmployeeDetails, fetchEmployeeDetails, fetchEmployeeById } from '@/api/employeeService';

interface EmployeeContextType {
  employee: EmployeeDetails | null;
  loading: boolean;
  error: string | null;
  setEmployee: React.Dispatch<React.SetStateAction<EmployeeDetails | null>>;
  refreshEmployee: () => Promise<void>;
  viewEmployeeById: (employeeId: string) => Promise<void>;
  isViewingOtherEmployee: boolean;
  resetToOwnProfile: () => Promise<void>;
  currentUserId: string | null;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employee, setEmployee] = useState<EmployeeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isViewingOtherEmployee, setIsViewingOtherEmployee] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Debug effect to log employee state changes
  useEffect(() => {
    console.log('Employee state changed:', {
      employee: employee?.employee_name,
      employeeId: employee?.name,
      isViewingOtherEmployee,
      loading,
      error
    });
  }, [employee, isViewingOtherEmployee, loading, error]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchEmployeeDetails();
      setEmployee(data);
      setCurrentUserId(data.name); // Store current user's employee ID
      setIsViewingOtherEmployee(false);
    } catch (err: any) {
      setError(err.message || "Failed to fetch employee details");
    } finally {
      setLoading(false);
    }
  };

  const refreshEmployee = async () => {
    await fetchData();
  };

  const viewEmployeeById = async (employeeId: string) => {
    try {
      console.log('viewEmployeeById called with ID:', employeeId);
      setLoading(true);
      setError(null);
      
      const data = await fetchEmployeeById(employeeId);
      console.log('Data received from fetchEmployeeById:', data);
      
      if (!data) {
        throw new Error('No employee data received');
      }
      
      console.log('Setting employee data in context:', data);
      setEmployee(data);
      console.log('Employee state after setEmployee:', employee); // This will show the old state due to closure
      setIsViewingOtherEmployee(true);
      
      // Small delay to ensure state updates are processed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check state after delay
      console.log('Employee state after delay:', employee); // This will also show old state
      
    } catch (err: any) {
      console.error('Error in viewEmployeeById:', err);
      setError(err.message || "Failed to fetch employee details");
      // Keep the current employee data if there's an error
    } finally {
      setLoading(false);
    }
  };

  const resetToOwnProfile = async () => {
    // Call fetchData() to get complete profile data like when first visiting
    await fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const value = {
    employee,
    loading,
    error,
    setEmployee,
    refreshEmployee,
    viewEmployeeById,
    isViewingOtherEmployee,
    resetToOwnProfile,
    currentUserId
  };

  return (
    <EmployeeContext.Provider value={value}>
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployee = (): EmployeeContextType => {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error('useEmployee must be used within an EmployeeProvider');
  }
  return context;
};
