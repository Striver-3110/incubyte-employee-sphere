// API service for employee data
import { useState, useEffect } from 'react';

// Extracted base URL as a separate constant
const BASE_URL = import.meta.env.VITE_BASE_URL || '/api/method/';

console.log('BASE_URL:', BASE_URL);

export interface PlatformLink {
  name: string;
  platform_name: string;
  url: string;
}

export interface PassionateAbout {
  name?: string;
  passionate_about: string;
}

export interface TechStack {
  name: string;
  skill: string;
  proficiency_level: 'Expert' | 'Intermediate' | 'Beginner' | 'Learning';
}

export interface IcebreakerQuestion {
  name?: string;
  question: string;
  answer: string;
}

export interface Project {
  project: string;
  pod: string;
  role: string;
  allocation_start_date: string;
  allocation_end_date: string;
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
  name?: string;
  creation?: string;
  modified: string;
  modified_by?: string;
  owner?: string;
  docstatus?: number;
  idx?: number;
  employee_name?: string;
  role?: string;
  tech_lead?: string;
  performance: string;
  potential: string;
  "9_grid"?: string;
  calibration_template?: string;
  notes?: string;
  self_evaluation_sheet?: string;
  calibration_skill_categories: CalibrationSkill[];
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

export interface LightningTalk {
  id: string;
  title: string;
  description: string;
  date_presented: string;
  audience: string;
  recording_link?: string;
}

export interface SCITalk {
  id: string;
  title: string;
  description: string;
  date: string;
  organizing_team: string;
  feedback_received?: string;
}

export interface Volunteering {
  id: string;
  activity_name: string;
  description: string;
  date: string;
  hours_spent: number;
  impact: string;
  organization: string;
}

export type ContributionType = 'lightning_talk' | 'sci_talk' | 'volunteering';

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
  custom_tech_lead_name?: string;
  custom_buddy_name?: string;
  custom_tech_advisor_name?: string;
  personal_email: string;
  company_email: string;
  cell_number: string;
  current_address: string;
  custom_city: string;
  custom_state: string;
  custom_pin: string;
}

// New interfaces for feedback functionality
export interface Employee {
  name: string;
  employee_name: string;
}

export interface FeedbackTemplate {
  name: string;
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

// Mock data for contributions
const mockContributions = {
  lightning_talk: [
    {
      id: '1',
      title: 'React Best Practices',
      description: 'Discussing modern React patterns and best practices',
      date_presented: '2024-12-15',
      audience: 'Development Team',
      recording_link: 'https://example.com/recording1'
    }
  ],
  sci_talk: [
    {
      id: '1',
      title: 'AI in Software Development',
      description: 'Exploring AI tools for developers',
      date: '2024-11-20',
      organizing_team: 'Innovation Team',
      feedback_received: 'Very informative session'
    }
  ],
  volunteering: [
    {
      id: '1',
      activity_name: 'Code for Good',
      description: 'Teaching programming to underprivileged children',
      date: '2024-10-05',
      hours_spent: 8,
      impact: 'Helped 20 children learn basic programming',
      organization: 'Local NGO'
    }
  ]
};

// Cache for employee data
let cachedEmployeeData: any = null;
let cachedFeedbackData: any = null;
let cachedTeamEmployees: any = null;

// Fetch employee details from the API
export const fetchEmployeeDetails = async () => {
  try {
    const response = await fetch(`${BASE_URL}profile.get_employee_details`, {
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

    if (!data.message || !data.message.data) {
      throw new Error('Invalid employee data received');
    }

    // Update cache with fresh data
    cachedEmployeeData = data.message.data;
    return data.message.data;
  } catch (error) {
    console.error('Error fetching employee details:', error);
    // For development, return mock data if API fails
    return {
      name: "E0190",
      employee: "E0190",
      employee_name: "Jay Prajapati--",
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
export const fetchEmployeeFeedback = async () => {
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
    // console.log("Feedback data are: ", data);

    if (!data.message) {
      throw new Error('Invalid feedback data received');
    }

    // Update cache with fresh data
    cachedFeedbackData = data.data || data.message.data;
    return data.data || data.message.data;
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
  // if (cachedTeamEmployees) {
  //   console.log('Returning cached team employees:', cachedTeamEmployees);
  //   return cachedTeamEmployees;
  // }

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
    // console.log('Team Employees:', data.message);
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

// Contribution API functions
export const fetchContributions = async (type: ContributionType) => {
  try {
    const response = await fetch(`${BASE_URL}user.get_contributions?type=${type}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${type} contributions`);
    }

    const data = await response.json();
    return data.message.data || [];
  } catch (error) {
    console.error(`Error fetching ${type} contributions:`, error);
    return mockContributions[type] || [];
  }
};

export const createContribution = async (type: ContributionType, contribution: any) => {
  try {
    const response = await fetch(`${BASE_URL}user.create_contribution`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ type, ...contribution }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create ${type} contribution`);
    }

    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error(`Error creating ${type} contribution:`, error);
    throw error;
  }
};

export const updateContribution = async (type: ContributionType, id: string, contribution: any) => {
  try {
    const response = await fetch(`${BASE_URL}user.update_contribution`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ type, id, ...contribution }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update ${type} contribution`);
    }

    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error(`Error updating ${type} contribution:`, error);
    throw error;
  }
};

export const deleteContribution = async (type: ContributionType, id: string) => {
  try {
    const response = await fetch(`${BASE_URL}user.delete_contribution`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ type, id }),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete ${type} contribution`);
    }

    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error(`Error deleting ${type} contribution:`, error);
    throw error;
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

  return { feedbacks, loading, error, setFeedbacks };
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

// Use this hook to get contributions
export const useContributions = (type: ContributionType) => {
  const [contributions, setContributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContributions = async () => {
    try {
      setLoading(true);
      const data = await fetchContributions(type);
      setContributions(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || `Failed to fetch ${type} contributions`);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContributions();
  }, [type]);

  return { contributions, loading, error, refetch: loadContributions };
};

// Get calibration data
export const useCalibrationData = (employeeId?: string) => {
  const [calibration, setCalibration] = useState<Calibration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = employeeId 
          ? `${BASE_URL}user.get_calibration_for_employee`
          : `${BASE_URL}user.get_calibration_for_employee`;
        
        const requestBody = employeeId ? { employee_id: employeeId } : {};
        
        const response = await fetch(url, {
          method: employeeId ? 'POST' : 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          ...(employeeId && { body: JSON.stringify(requestBody) })
        });

        if (!response.ok) {
          throw new Error("Failed to fetch calibration data");
        }

        const data = await response.json();
        console.log("Calibration API response:", data);
        
        // Handle nested response structure: data.message.data
        let calibrationData: any = null;
        
        if (data.message && data.message.status === "success" && data.message.data) {
          calibrationData = data.message.data;
        } else if (data.status === "success" && data.data) {
          calibrationData = data.data;
        } else if (data.status === "error" || (data.message && data.message.status === "error")) {
          const errorMessage = data.message?.message || data.message || "Failed to fetch calibration data. Please try again later.";
          throw new Error(errorMessage);
        } else {
          console.error("Invalid calibration data received:", data);
          throw new Error("Failed to fetch calibration data. Please try again later.");
        }

        setCalibration(calibrationData);
      } catch (err: any) {
        console.error("Error fetching calibration data:", err);
        setError(err.message || "Failed to fetch calibration data");
      } finally {
        // Ensure that loading is set to false regardless of success or failure
        setLoading(false);
      }
    };

    fetchData();
  }, [employeeId]);

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
        // console.log("Calibration data for all employees: ", data.message.data);

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

// New API functions for feedback functionality
export const fetchAllEmployees = async (): Promise<Employee[]> => {
  try {
    const response = await fetch(`${BASE_URL}user.get_all_employees`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch employees');
    }

    const data = await response.json();
    return data.message || [];
  } catch (error) {
    console.error('Error fetching employees:', error);
    // Return mock data for development
    return [
      { name: 'E0034', employee_name: 'Sachin Tripathi' },
      { name: 'E0009', employee_name: 'Akshay Vadher' },
      { name: 'E0002', employee_name: 'Arohi Shah' },
    ];
  }
};

// Fetch employee details by ID for public profile viewing
export const fetchEmployeeById = async (employeeId: string): Promise<EmployeeDetails> => {
  try {
    console.log('Fetching employee by ID:', employeeId);
    const url = `${BASE_URL}user.get_employee_by_id`;
    console.log('Full URL:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ employee_id: employeeId }),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      throw new Error('Failed to fetch employee details');
    }

    const data = await response.json();
    console.log('API Response for fetchEmployeeById:', data);
    
    // Check different possible response structures
    if (data.status === 'error') {
      throw new Error(data.message || 'Failed to fetch employee details');
    }

    // Check if data is directly in data field (main structure)
    if (data.data) {
      console.log('Found data in data field:', data.data);
      const employeeData = data.data;
      
      // Add missing fields that the frontend expects
      const enhancedData: EmployeeDetails = {
        ...employeeData,
        custom_project: employeeData.employee_achievements || [], // Map employee_achievements to custom_project
        custom_team: employeeData.custom_team || "",
        custom_pod: employeeData.custom_pod || "",
        custom_tech_lead: employeeData.custom_tech_lead || "",
        custom_buddy: employeeData.custom_buddy || "",
        custom_tech_advisor: employeeData.custom_tech_advisor || "",
        custom_tech_lead_name: employeeData.custom_tech_lead_name || "",
        custom_buddy_name: employeeData.custom_buddy_name || "",
        custom_tech_advisor_name: employeeData.custom_tech_advisor_name || "",
        personal_email: employeeData.personal_email || "",
        custom_passionate_about: employeeData.custom_passionate_about || []
      };
      
      console.log('Enhanced data:', enhancedData);
      return enhancedData;
    }

    // Check if data is in message.data structure (fallback)
    if (data.message && data.message.data) {
      console.log('Found data in message.data:', data.message.data);
      return data.message.data;
    }

    // Check if data is directly in message field (fallback)
    if (data.message) {
      console.log('Found data in message field:', data.message);
      return data.message;
    }

    console.error('No valid data structure found in response:', data);
    throw new Error('No employee data received');
  } catch (error) {
    console.error('Error fetching employee by ID:', error);
    throw error;
  }
};

export const fetchFeedbackTemplates = async (): Promise<FeedbackTemplate[]> => {
  try {
    const response = await fetch(`${BASE_URL}user.get_feedback_template_list`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch feedback templates');
    }

    const data = await response.json();
    console.log("Feedback Templates are:",data)
    return data.message || [];
  } catch (error) {
    console.error('Error fetching feedback templates:', error);
    // Return mock data for development
    return [
      { name: 'Future Leaders Readiness Feedback' },
      { name: 'Milestone Feedback' },
      { name: 'Lead Effectiveness Feedback' },
      { name: 'Peer Feedback' },
    ];
  }
};


export const sendFeedbackForm = async (initiator: string, recipients: string[], template: string) => {
  try {
    const response = await fetch(`${"/api/method/incubyte_customizations.overrides."}employee.send_feedback_form`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        employee: initiator,
        reviewers: recipients,
        template: template
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send feedback form');
    }

    const data = await response.json();

    // window.location.reload()
    return data.message;
  } catch (error) {
    console.error('Error sending feedback form:', error);
    throw error;
  }
};
