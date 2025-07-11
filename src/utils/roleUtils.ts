
// Role categories and role mappings
export const roleCategories = {
  "Technical": [
    "Software Craftsperson",
    "Senior Software Craftsperson", 
    "Lead Software Craftsperson",
    "Principal Software Craftsperson",
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
  "Calibration Dashboard Access": [
    "Co-Founder",
    "Operation Head",
    "Operations Manager",
    "Accountant",
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

// Check if the role should show calibration tab
export const shouldShowCalibrationTab = (designation: string | undefined): boolean => {
  if (!designation) return false;
  
  // Hide calibration tab if user has "Calibration Dashboard Access"
  return !roleCategories["Calibration Dashboard Access"].includes(designation);
};

import { checkTechLeadAccess, checkPSMAccess } from '../api/userRoleService';

// Check if the user has Tech Lead or Tech Advisor role (backend check)
export const hasTechLeadAdvisorRole = async (): Promise<boolean> => {
  try {
    return await checkTechLeadAccess();
  } catch (error) {
    console.error('Error checking Tech Lead/Advisor role:', error);
    return false;
  }
};

// Check if the user has PSM role (backend check)
export const hasPSMRole = async (): Promise<boolean> => {
  try {
    return await checkPSMAccess();
  } catch (error) {
    console.error('Error checking PSM role:', error);
    return false;
  }
};
