import React, { createContext, useContext, useEffect, useState } from 'react';
import { EmployeeDetails, fetchEmployeeDetails } from '@/api/employeeService';

interface EmployeeContextType {
  employee: EmployeeDetails | null;
  loading: boolean;
  error: string | null;
  setEmployee: React.Dispatch<React.SetStateAction<EmployeeDetails | null>>;
  refreshEmployee: () => Promise<void>;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employee, setEmployee] = useState<EmployeeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchEmployeeDetails();
      setEmployee(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch employee details");
    } finally {
      setLoading(false);
    }
  };

  const refreshEmployee = async () => {
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
    refreshEmployee
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
