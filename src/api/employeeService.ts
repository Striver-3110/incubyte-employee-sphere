
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
const fetchEmployeeDetails = async () => {
  if (cachedEmployeeData) {
    return cachedEmployeeData;
  }

  try {
    fetch('/api/method/frappe.auth.get_logged_user', {
      method: 'GET',
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        // console.log("Logged-in user:", data.message);
      })
      .catch(error => {
        console.error("Error fetching logged-in user:", error);
      });
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

    // console.log('Response:', data);
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
    // console.log("Feedback data are: ", data);

    if (!data.message) {
      throw new Error('Invalid feedback data received');
    }

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

        if (!response.ok) {
          throw new Error("Failed to fetch calibration data");
        }

        const data = await response.json();
        // console.log("Calibration data: -------------------------------", data);

        // Check if the data is valid before setting it
        if (data.message.status === "error" || !data?.message?.data) {
          console.error("Invalid calibration data received:", data);
          throw new Error(data?.message || "Failed to fetch calibration data. Please try again later.");
        }

        setCalibration(data.message.data);
      } catch (err: any) {
        console.error("Error fetching calibration data:", err);
        setError(err.message || "Failed to fetch calibration data");
      } finally {
        // Ensure that loading is set to false regardless of success or failure
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
