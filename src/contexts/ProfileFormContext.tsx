
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface PlatformEntry {
  platform_name: string;
  url: string;
}

export interface TechStackEntry {
  skill: string;
  proficiency_level: 'Expert' | 'Intermediate' | 'Beginner' | 'Learning';
}

export interface IceBreakerEntry {
  question: string;
  answer: string;
}

export interface EmployeeAchievement {
  name?: string; // Only for existing achievements
  event_type: string;
  event_date: string;
  event_description: string;
  event_link: string;
  custom_event_type?: string; // For custom event types when "Other" is selected
}

export interface ProfileFormData {
  // Basic Profile
  image: string;
  full_name: string;
  designation: string;
  current_address: string;
  custom_city: string;
  custom_state: string;
  custom_pin: string;
  custom_about: string;
  custom_platforms: PlatformEntry[];
  
  // Tech Stack
  custom_tech_stack: TechStackEntry[];
  
  // Ice Breakers
  custom_employee_icebreaker_question: IceBreakerEntry[];
  
  // Shared Learnings
  employee_achievements: EmployeeAchievement[];
}

interface ProfileFormState {
  currentStep: number;
  formData: ProfileFormData;
  isImageChanged: boolean;
  originalImageUrl: string;
  selectedImageFile: File | null;
  isSubmissionSuccess: boolean;
}

type ProfileFormAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'UPDATE_FORM_DATA'; payload: Partial<ProfileFormData> }
  | { type: 'SET_IMAGE_CHANGED'; payload: boolean }
  | { type: 'INITIALIZE_DATA'; payload: ProfileFormData }
  | { type: 'SET_ORIGINAL_IMAGE'; payload: string }
  | { type: 'SET_SELECTED_IMAGE_FILE'; payload: File | null }
  | { type: 'SET_SUBMISSION_SUCCESS'; payload: boolean };

const initialState: ProfileFormState = {
  currentStep: 1,
  formData: {
    image: '',
    full_name: '',
    designation: '',
    current_address: '',
    custom_city: '',
    custom_state: '',
    custom_pin: '',
    custom_about: '',
    custom_platforms: [],
    custom_tech_stack: [],
    custom_employee_icebreaker_question: [],
    employee_achievements: []
  },
  isImageChanged: false,
  originalImageUrl: '',
  selectedImageFile: null,
  isSubmissionSuccess: false
};

const profileFormReducer = (state: ProfileFormState, action: ProfileFormAction): ProfileFormState => {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'UPDATE_FORM_DATA':
      return {
        ...state,
        formData: { ...state.formData, ...action.payload }
      };
    case 'SET_IMAGE_CHANGED':
      return { ...state, isImageChanged: action.payload };
    case 'INITIALIZE_DATA':
      return {
        ...state,
        formData: action.payload,
        originalImageUrl: action.payload.image
      };
    case 'SET_ORIGINAL_IMAGE':
      return { ...state, originalImageUrl: action.payload };
    case 'SET_SELECTED_IMAGE_FILE':
      return { ...state, selectedImageFile: action.payload };
    case 'SET_SUBMISSION_SUCCESS':
      return { ...state, isSubmissionSuccess: action.payload };
    default:
      return state;
  }
};

interface ProfileFormContextType {
  state: ProfileFormState;
  dispatch: React.Dispatch<ProfileFormAction>;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  updateFormData: (data: Partial<ProfileFormData>) => void;
  setImageChanged: (changed: boolean) => void;
  setSelectedImageFile: (file: File | null) => void;
  setSubmissionSuccess: (success: boolean) => void;
}

const ProfileFormContext = createContext<ProfileFormContextType | undefined>(undefined);

export const ProfileFormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(profileFormReducer, initialState);

  const goToNextStep = () => {
    if (state.currentStep < 4) {
      dispatch({ type: 'SET_STEP', payload: state.currentStep + 1 });
    }
  };

  const goToPrevStep = () => {
    if (state.currentStep > 1) {
      dispatch({ type: 'SET_STEP', payload: state.currentStep - 1 });
    }
  };

  const updateFormData = (data: Partial<ProfileFormData>) => {
    dispatch({ type: 'UPDATE_FORM_DATA', payload: data });
  };

  const setImageChanged = (changed: boolean) => {
    dispatch({ type: 'SET_IMAGE_CHANGED', payload: changed });
  };

  const setSelectedImageFile = (file: File | null) => {
    dispatch({ type: 'SET_SELECTED_IMAGE_FILE', payload: file });
  };

  const setSubmissionSuccess = (success: boolean) => {
    dispatch({ type: 'SET_SUBMISSION_SUCCESS', payload: success });
  };

  const value = {
    state,
    dispatch,
    goToNextStep,
    goToPrevStep,
    updateFormData,
    setImageChanged,
    setSelectedImageFile,
    setSubmissionSuccess
  };

  return (
    <ProfileFormContext.Provider value={value}>
      {children}
    </ProfileFormContext.Provider>
  );
};

export const useProfileForm = (): ProfileFormContextType => {
  const context = useContext(ProfileFormContext);
  if (context === undefined) {
    throw new Error('useProfileForm must be used within a ProfileFormProvider');
  }
  return context;
};
