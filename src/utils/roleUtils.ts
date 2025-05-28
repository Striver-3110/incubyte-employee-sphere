
// Role categories and role mappings
export const roleCategories = {
  "Technical": [
    "Software Craftsperson",
    "Software Craftsperson - Tech Lead",
    "Software Craftsperson - Tech Advisor",
    "Engineer Manager",
    "AI Craftsperson",
    "UI/UX Craftsperson"
  ],
  "Quality Assurance": [
    "Test Craftsperson (Automation)",
    "Test Craftsperson (Manual)",
    "Test Craftsperson",
    "BQA"
  ],
  "Product": [
    "Product Craftsperson",
    "Product Manager",
    "Product Analyst",
    "Product Manager - Guild Lead",
    "Product Kick-off Specialist"
  ],
  "PSM": [
    "People Success Manager",
    "People Success Specialist",
    "Talent Acquisition Specialist",
    "Executive Assistant"
  ],
  "Business": [
    "Co-Founder",
    "Operation Head",
    "Operations Manager",
    "Accountant"
  ],
  "Internship": [
    "Intern"
  ]
};

// Get role category for a designation
export const getRoleCategory = (designation: string | undefined): string | undefined => {
  if (!designation) return undefined;
  
  for (const [category, roles] of Object.entries(roleCategories)) {
    if (roles.includes(designation)) {
      return category;
    }
  }
  
  return undefined;
};

// Check if the role is technical
export const isTechnicalRole = (designation: string | undefined): boolean => {
  if (!designation) return false;
  
  return roleCategories.Technical.includes(designation) || 
         roleCategories["Quality Assurance"].includes(designation) ||
         designation === "Intern"; // Including intern as technical
};

// Check if the role should display tech advisor
export const shouldShowTechAdvisor = (designation: string | undefined): boolean => {
  if (!designation) return false;
  
  const category = getRoleCategory(designation);
  return category !== "PSM" && category !== "Business" && designation !== "Software Craftsperson - Tech Advisor";
};
