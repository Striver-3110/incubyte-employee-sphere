import React, { createContext, useContext, useState } from 'react';

interface EmployeeDetails {
  name: string;
  employee_name: string;
  designation: string;
  custom_team: string;
  custom_city: string;
  date_of_joining: string;
  custom_about: string;
  custom_tech_stack: Array<{ technology: string; proficiency: string }>;
  custom_employee_icebreaker_question: Array<{ question: string; answer: string }>;
  custom_pod: string;
  custom_tech_lead_name: string;
  custom_buddy_name: string;
  custom_tech_advisor_name: string;
}

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

const testEmployee: EmployeeDetails = {
  name: "EMP001",
  employee_name: "John Doe",
  designation: "Senior Software Engineer",
  custom_team: "Engineering",
  custom_city: "San Francisco",
  date_of_joining: "2022-01-15",
  custom_about: "Passionate software engineer with 5+ years of experience in full-stack development. I love building scalable applications and mentoring junior developers.",
  custom_tech_stack: [
    { technology: "React", proficiency: "Expert" },
    { technology: "TypeScript", proficiency: "Advanced" },
    { technology: "Node.js", proficiency: "Intermediate" },
    { technology: "Python", proficiency: "Intermediate" },
    { technology: "PostgreSQL", proficiency: "Advanced" }
  ],
  custom_employee_icebreaker_question: [
    { question: "What's your favorite hobby?", answer: "Playing guitar and hiking on weekends" },
    { question: "What's your dream vacation?", answer: "Backpacking through Europe and exploring different cultures" },
    { question: "What's your favorite programming language?", answer: "TypeScript - it combines the best of both worlds" }
  ],
  custom_pod: "Alpha Pod",
  custom_tech_lead_name: "Jane Smith",
  custom_buddy_name: "Mike Johnson",
  custom_tech_advisor_name: "Sarah Wilson"
};

const TestEmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export const TestEmployeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employee, setEmployee] = useState<EmployeeDetails | null>(testEmployee);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  const [isViewingOtherEmployee] = useState(false);
  const [currentUserId] = useState<string | null>("EMP001");

  const refreshEmployee = async () => {
    // Mock refresh - just keep the test data
    setEmployee(testEmployee);
  };

  const viewEmployeeById = async (employeeId: string) => {
    // Mock viewing another employee
    console.log('Viewing employee:', employeeId);
    setEmployee(testEmployee);
  };

  const resetToOwnProfile = async () => {
    setEmployee(testEmployee);
  };

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
    <TestEmployeeContext.Provider value={value}>
      {children}
    </TestEmployeeContext.Provider>
  );
};

export const useTestEmployee = (): EmployeeContextType => {
  const context = useContext(TestEmployeeContext);
  if (context === undefined) {
    throw new Error('useTestEmployee must be used within a TestEmployeeProvider');
  }
  return context;
};
