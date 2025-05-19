
// Mock API service for employee data
import { useState, useEffect } from 'react';

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
  skills: CalibrationSkill[];
}

export interface Feedback {
  id: string;
  from: string;
  to: string;
  date_initiated: string;
  status: 'Pending' | 'Completed';
  content?: string;
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

// Mock employee data
const mockEmployeeData: EmployeeDetails = {
  name: "E0190",
  employee: "E0190",
  employee_name: "Jay Prajapati",
  designation: "Intern",
  image: "/private/files/A lifelike humanoid cat hybrid with soft fur, fel…077ad3.jpeg",
  custom_about: "I am a passionate software engineer with experience in building web and mobile applications. I enjoy solving complex problems and learning new technologies.",
  date_of_joining: "2025-01-06",
  personal_email: "prajapatijay31100@gmail.com",
  company_email: "jay@incubyte.co",
  cell_number: "9099285709",
  current_address: "408- Hostel Block- E , L.D. College of Engineering, Navrangpura, Ahmedabad, 380009",
  custom_city: "Ahmedabad",
  custom_state: "Gujarat",
  custom_pin: "380009",
  custom_team: "Kyruus",
  custom_pod: "Practice Optimization",
  custom_tech_lead: "E0028",
  custom_buddy: "E0196",
  custom_tech_advisor: "E0009",
  custom_platforms: [
    {
      name: "lqn79h7h79",
      platform_name: "Linkedin",
      url: "https://linkedin.com"
    },
    {
      name: "r1e22llg4o",
      platform_name: "Github",
      url: "https://github.com"
    }
  ],
  custom_passionate_about: [
    {
      name: "i8p4imloiu",
      passionate_about: "Reading Books"
    }
  ],
  custom_tech_stack: [
    {
      name: "1v2mrl5m4n",
      skill: "React",
      proficiency_level: "Expert"
    },
    {
      name: "4k6jl0k214",
      skill: "Next.js",
      proficiency_level: "Expert"
    },
    {
      name: "22r13ppqp8",
      skill: "React Native",
      proficiency_level: "Expert"
    },
    {
      name: "ubcrau9bur",
      skill: "Angular",
      proficiency_level: "Beginner"
    },
    {
      name: "3dg1i8dls1",
      skill: "Django",
      proficiency_level: "Expert"
    },
    {
      name: "3vjl12vprh",
      skill: "StackOvefflow",
      proficiency_level: "Learning"
    }
  ],
  custom_employee_icebreaker_question: [
    {
      name: "3e55ru1m33",
      question: "If you were a superhero, what would your costume look like?",
      answer: "A sleek, minimalist design with integrated tech features and adaptable materials."
    },
    {
      name: "3e5cv305f8",
      question: "What's your favorite productivity hack?",
      answer: "Time blocking and the Pomodoro technique combined with a no-distractions environment."
    },
    {
      name: "3e5m5lll97",
      question: "What was your first job ever?",
      answer: "Teaching coding to middle school students during summer break."
    },
    {
      name: "3e5t4tcsvq",
      question: "If you could have dinner with any historical figure, who would it be?",
      answer: "Ada Lovelace - I'd love to discuss how she envisioned computing before computers existed."
    },
    {
      name: "3e5s0et1eh",
      question: "What's your most-used emoji?",
      answer: "🤔 - The thinking face, because I'm always contemplating solutions to problems."
    }
  ],
  custom_project: [
    {
      title: "Project Athena",
      expected_start_date: "2025-01-15",
      expected_end_date: "2025-04-15",
      status: "Completed",
      project_link: "https://project-athena.com",
      description: "AI-powered data analytics platform",
      name: "Athena"
    },
    {
      title: "Project Phoenix",
      expected_start_date: "2025-04-20",
      expected_end_date: "",
      status: "Open",
      project_link: "https://project-phoenix.com",
      description: "Cloud migration and infrastructure redesign",
      name: "Phoenix"
    },
    {
      title: "Project Horizon",
      expected_start_date: "2025-04-20",
      expected_end_date: "",
      status: "Open",
      project_link: "https://project-horizon.com",
      description: "Mobile application for healthcare providers",
      name: "Horizon"
    }
  ]
};

// Mock feedback data
const mockFeedbacks: Feedback[] = [
  {
    id: "1",
    from: "E0190",
    to: "E0028",
    date_initiated: "2025-03-15",
    status: "Completed",
    content: "Great teamwork and technical contributions on Project Athena."
  },
  {
    id: "2",
    from: "E0028",
    to: "E0190",
    date_initiated: "2025-03-20",
    status: "Completed",
    content: "Excellent problem-solving skills and quick learning abilities."
  },
  {
    id: "3",
    from: "E0190",
    to: "E0196",
    date_initiated: "2025-04-10",
    status: "Pending"
  },
  {
    id: "4", 
    from: "E0009",
    to: "E0190",
    date_initiated: "2025-04-05",
    status: "Pending"
  }
];

// Mock calibration data
const mockCalibrationData = {
  performance: "High",
  potential: "High",
  skills: [
    { skill: "Technology", level: "L2" },
    { skill: "Craft Code", level: "L3" },
    { skill: "Communication", level: "L2" },
    { skill: "Mentoring", level: "L3" },
    { skill: "Learning, Sharing and Community", level: "L0" },
    { skill: "Represents and Contributes to Incubyte's Growth", level: "L0" },
    { skill: "Tooling", level: "L0" },
    { skill: "Technical Practices", level: "L2" },
    { skill: "Overall Level", level: "L2" }
  ]
};

// Mock tech stacks and skills
const mockTechStacks = [
  "JavaScript", "TypeScript", "React", "Angular", "Vue", "Node.js", "Python",
  "Java", "Spring Boot", "Django", "GraphQL", "REST", "PostgreSQL", "MongoDB",
  "Docker", "Kubernetes", "AWS", "Azure", "GCP", "CI/CD", "Git", "Jenkins",
  "GitHub Actions", "Redux", "Next.js", "Express", "TDD", "Jest", "React Native"
];

// Use this hook to get employee details
export const useEmployeeDetails = () => {
  const [employee, setEmployee] = useState<EmployeeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call with a delay
    const fetchData = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setEmployee(mockEmployeeData);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch employee details");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { employee, loading, error };
};

// Get feedback data
export const useFeedbackData = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call with a delay
    const fetchData = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setFeedbacks(mockFeedbacks);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch feedback data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { feedbacks, loading, error };
};

// Get calibration data
export const useCalibrationData = () => {
  const [calibration, setCalibration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call with a delay
    const fetchData = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setCalibration(mockCalibrationData);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch calibration data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { calibration, loading, error };
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
      } catch (err) {
        setError("Failed to fetch tech stacks");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { techStacks, loading, error };
};
