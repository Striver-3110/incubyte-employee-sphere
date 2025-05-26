// API service for employee data
import { useState, useEffect } from 'react';

// Extracted base URL as a separate constant
const BASE_URL = import.meta.env.VITE_BASE_URL

export interface PlatformLink {
  name: string;
  platform_name: string;
  url: string;
}

export interface PassionateAbout {
  name: string;
  passionate_about: string;
}

export interface TechStack {
  name: string;
  skill: string;
  proficiency_level: 'Expert' | 'Intermediate' | 'Beginner' | 'Learning';
}

export interface IcebreakerQuestion {
  name: string;
  question: string;
  answer: string;
}

export interface Project {
  title: string;
  pod: string;
  role: string;
  expected_start_date: string;
  expected_end_date: string;
  status: string;
  project_link: string;
  description: string;
  name: string;
}

export interface CalibrationSkill {
  skill: string;
  level: string;
}

export interface Calibration {
  performance: string;
  potential: string;
  calibration_skill_categories: CalibrationSkill[];
  modified: string;
}

export interface Feedback {
  name: string;
  for_employee: string;
  employee_name: string;
  reviewer_name: string;
  reviewer: string;
  rag_status: string;
}

export interface FeedbackData {
  initiated_by_me: Feedback[];
  given_to_me: Feedback[];
  given_by_me: Feedback[];
  pending_to_give: Feedback[];
}

export interface EmployeeDetails {
  name: string;
  employee: string;
  employee_name: string;
  designation: string;
  image: string;
  custom_about: string;
  date_of_joining: string;
  custom_platforms: PlatformLink[];
  custom_passionate_about: PassionateAbout[];
  custom_tech_stack: TechStack[];
  custom_employee_icebreaker_question: IcebreakerQuestion[];
  custom_project: Project[];
  custom_team?: string;
  custom_pod?: string;
  custom_tech_lead?: string;
  custom_buddy?: string;
  custom_tech_advisor?: string;
  personal_email: string;
  company_email: string;
  cell_number: string;
  current_address: string;
  custom_city: string;
  custom_state: string;
  custom_pin: string;
}

// Mock data for calibration
const mockCalibrationData: Calibration = {
  performance: 'High',
  potential: 'Medium',
  modified: '2025-01-06T12:00:00Z',
  calibration_skill_categories: [
    { skill: 'JavaScript', level: 'L4' },
    { skill: 'React', level: 'L3' },
    { skill: 'TypeScript', level: 'L3' },
    { skill: 'Node.js', level: 'L2' },
    { skill: 'Testing', level: 'L2' },
    { skill: 'Database Design', level: 'L3' },
  ]
};

// Mock data for tech stacks
const mockTechStacks: string[] = [
  'JavaScript',
  'TypeScript',
  'React',
  'Angular',
  'Vue',
  'Node.js',
  'Express',
  'MongoDB',
  'PostgreSQL',
  'Redis',
  'AWS',
  'Docker',
  'Kubernetes',
  'GraphQL',
  'REST API',
  'HTML',
  'CSS',
  'Sass',
  'Tailwind CSS',
  'Jest',
  'React Testing Library',
  'Cypress',
  'Jenkins',
  'Git',
  'GitHub Actions',
  'CircleCI',
];

// Cache for employee data
let cachedEmployeeData: any = null;
let cachedFeedbackData: any = null;
let cachedTeamEmployees: any = null;

// Fetch employee details from the API
const fetchEmployeeDetails = async () => {
  if (cachedEmployeeData) {
    return cachedEmployeeData;
  }

  try {
    const response = await fetch(`${BASE_URL}user.get_employee_details`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch employee details');
    }

    const data = await response.json();

    console.log('Response:', data);
    if (!data.message) {
      throw new Error('Invalid employee data received');
    }

    // Cache the response
    cachedEmployeeData = data.message;
    return data.message;
  } catch (error) {
    console.error('Error fetching employee details:', error);
    // For development, return mock data if API fails
    return {
      name: "E0190",
      employee: "E0190",
      employee_name: "Jay Prajapati",
      designation: "Intern",
      image: "/placeholder.svg",
      custom_about: "Frontend developer with expertise in React and TypeScript.",
      date_of_joining: "2025-01-06",
      custom_platforms: [],
      custom_passionate_about: [],
      custom_tech_stack: [],
      custom_employee_icebreaker_question: [],
      custom_project: [],
      custom_team: "Kyruus",
      custom_pod: "Practice Optimization",
      personal_email: "",
      company_email: "",
      cell_number: "",
      current_address: "",
      custom_city: "",
      custom_state: "",
      custom_pin: "",
    };
  }
};

// Fetch employee feedback from the API
const fetchEmployeeFeedback = async () => {
  if (cachedFeedbackData) {
    return cachedFeedbackData;
  }

  try {
    const response = await fetch(`${BASE_URL}user.get_employee_feedback`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch employee feedback');
    }

    const data = await response.json();
    console.log("Feedback data are: ", data);

    if (!data.message) {
      throw new Error('Invalid feedback data received');
    }

    cachedFeedbackData = data.data || data.message;
    return data.data || data.message;
  } catch (error) {
    console.error('Error fetching employee feedback:', error);
    // For development, return mock data if API fails
    return {
      initiated_by_me: [],
      given_to_me: [],
      given_by_me: [],
      pending_to_give: []
    };
  }
};

// Fetch employees in the same team
export const fetchTeamEmployees = async () => {
  if (cachedTeamEmployees) {
    return cachedTeamEmployees;
  }

  try {
    // This is a placeholder. In a real application, you would have an API endpoint
    // that returns all employees in a specific team. For now, we'll mock this functionality
    // by fetching all employees and filtering them client-side.
    const response = await fetch(`${BASE_URL}user.get_team_employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error('Failed to fetch team employees');
    }

    const data = await response.json();

    if (!data.message) {
      throw new Error('Invalid team employees data received');
    }

    cachedTeamEmployees = data.message;
    console.log('Team Employees:', data.message);
    return data.message.data;
  } catch (error) {
    console.error('Error fetching team employees:', error);
    // Fallback to mock data for demonstration
    return [
      { name: "E0190", employee_name: "Jay Prajapati", designation: "Intern" },
      { name: "E0028", employee_name: "John Doe", designation: "Software Craftsperson" },
      { name: "E0196", employee_name: "Jane Smith", designation: "Test Craftsperson" },
      { name: "E0009", employee_name: "Alex Johnson", designation: "Software Craftsperson - Tech Advisor" }
    ];
  }
};

// Save employee ice breaker answers
export const saveIceBreakers = async (questions: IcebreakerQuestion[]) => {
  try {
    const response = await fetch(`${BASE_URL}user.set_employee_details`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        custom_employee_icebreaker_question: questions
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save ice breakers');
    }

    const data = await response.json();

    // Update the cached data
    if (cachedEmployeeData) {
      cachedEmployeeData.custom_employee_icebreaker_question = questions;
    }

    return data;
  } catch (error) {
    console.error('Error saving ice breakers:', error);
    throw error;
  }
};

// Save employee feedback
export const saveEmployeeFeedback = async (feedback: any) => {
  try {
    const response = await fetch(`${BASE_URL}user.set_employee_feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedback),
    });

    if (!response.ok) {
      throw new Error('Failed to save feedback');
    }

    const data = await response.json();

    // Update the cached data
    cachedFeedbackData = null; // Clear the cache to force a refresh on next fetch

    return data;
  } catch (error) {
    console.error('Error saving feedback:', error);
    throw error;
  }
};
// Use this hook to get employee details
export const useEmployeeDetails = () => {
  const [employee, setEmployee] = useState<EmployeeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchEmployeeDetails();
        setEmployee(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to fetch employee details");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { employee, loading, error, setEmployee };
};

// Get feedback data
export const useFeedbackData = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchEmployeeFeedback();
        setFeedbacks(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to fetch feedback data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { feedbacks, loading, error };
};

// Use this hook to get employees in the same team
export const useTeamEmployees = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
  
      try {
        setLoading(true);
        const data = await fetchTeamEmployees();
        setEmployees(data || []);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to fetch team employees");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { employees, loading, error };
};

// Get calibration data
export const useCalibrationData = () => {
  const [calibration, setCalibration] = useState<Calibration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BASE_URL}user.get_calibration_for_employee`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
          });
          const data = await response.json();
          console.log("Calibration data: ",data)
        setCalibration(data.message.data || mockCalibrationData);
      } catch (err: any) {
        setError("Failed to fetch calibration data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { calibration, loading, error };
};

export const useCalibrationDataForAllEmployees = () => {
  const [calibrationDataForAllEmployees, setCalibrationDataForAllEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalibrationData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}user.get_calibrations_for_active_employees`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error("Failed to fetch calibration data for all employees");
        }

        const data = await response.json();
        console.log("Calibration data for all employees: ", data.message.data);

        if (!data || !data.message) {
          throw new Error("Invalid calibration data received");
        }

        setCalibrationDataForAllEmployees(data.message.data); // Set calibration data for all employees
      } catch (err: any) {
        setError(err.message || "Failed to fetch calibration data for all employees");
      } finally {
        setLoading(false);
      }
    };

    fetchCalibrationData();
  }, []);

  return { calibrationDataForAllEmployees, loading, error };
};

// Get available tech stacks
export const useAvailableTechStacks = () => {
  const [techStacks, setTechStacks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call with a delay
    const fetchData = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setTechStacks(mockTechStacks);
        setLoading(false);
      } catch (err: any) {
        setError("Failed to fetch tech stacks");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { techStacks, loading, error };
};
