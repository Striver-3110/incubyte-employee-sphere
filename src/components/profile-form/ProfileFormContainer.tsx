import React, { useEffect } from 'react';
import { useProfileForm } from '@/contexts/ProfileFormContext';
import { StepIndicator } from './StepIndicator';
import { BasicProfileStep } from './steps/BasicProfileStep';
import { TechStackStep } from './steps/TechStackStep';
import { IceBreakersStep } from './steps/IceBreakersStep';
import { SharedLearningsStep } from './steps/SharedLearningsStep';
import { FormNavigation } from './FormNavigation';
import { ThankYouPage } from './ThankYouPage';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const ProfileFormContainer = () => {
  const { state, dispatch } = useProfileForm();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetch(`${BASE_URL}profile.get_full_profile`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const apiResponse = await response.json();
        console.log('API Response:', apiResponse);
        
        // Handle the nested structure: message.data
        const profileData = apiResponse.message?.data;
        
        if (profileData) {
          dispatch({ type: 'INITIALIZE_DATA', payload: {
            image: profileData.image || '/placeholder.svg',
            full_name: profileData.employee_name || 'John Doe',
            designation: profileData.designation || '',
            current_address: profileData.current_address || '',
            custom_city: profileData.custom_city || '',
            custom_state: profileData.custom_state || '',
            custom_pin: profileData.custom_pin || '',
            custom_about: profileData.custom_about || '',
            custom_platforms: profileData.custom_platforms || [],
            custom_tech_stack: profileData.custom_tech_stack || [],
            custom_employee_icebreaker_question: profileData.custom_employee_icebreaker_question || [],
            employee_achievements: profileData.employee_achievements || []
          }});
          console.log('Profile data initialized successfully');
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        // Initialize with default data
        dispatch({ type: 'INITIALIZE_DATA', payload: {
          image: '/placeholder.svg',
          full_name: 'John Doe',
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
        }});
      }
    };

    fetchInitialData();
  }, [dispatch]);

  // Handler for step click
  const handleStepClick = (targetStep: number) => {
    if (targetStep === state.currentStep) return;

    // Validation logic for current step
    let isValid = true;
    if (state.currentStep === 1 && typeof window.validateBasicProfile === 'function') {
      isValid = window.validateBasicProfile();
    } else if (state.currentStep === 2 && typeof window.validateTechStack === 'function') {
      isValid = window.validateTechStack();
    } else if (state.currentStep === 3 && typeof window.validateIceBreakers === 'function') {
      isValid = window.validateIceBreakers();
    } else if (state.currentStep === 4 && typeof window.validateSharedLearnings === 'function') {
      isValid = window.validateSharedLearnings();
    }

    if (isValid) {
      dispatch({ type: 'SET_STEP', payload: targetStep });
    } else {
      toast({
        title: 'Please fix the errors before proceeding.',
        variant: 'destructive',
      });
    }
  };

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 1:
        return <BasicProfileStep />;
      case 2:
        return <TechStackStep />;
      case 3:
        return <IceBreakersStep />;
      case 4:
        return <SharedLearningsStep />;
      default:
        return <BasicProfileStep />;
    }
  };

  return (
    <div className="min-h-screen bg-sidebarBg p-6 font-sans relative">
      {isSubmitting && !state.isSubmissionSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-brandBlue animate-spin mb-4" />
            <span className="text-white text-lg font-semibold">Submitting your profile...</span>
          </div>
        </div>
      )}
      <div className={`max-w-6xl mx-auto ${isSubmitting ? 'pointer-events-none' : ''}`}>
        {state.isSubmissionSuccess ? (
          <ThankYouPage />
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-brandBlueDarkest mb-2">Complete Your Profile</h1>
              <p className="text-brandBlueDark">Fill in your profile form and all the details filled here will be populated in your employee profile.</p>
            </div>

            <StepIndicator currentStep={state.currentStep} onStepClick={handleStepClick} />

            <div className="bg-white rounded-lg shadow-sm p-8 mb-6 border border-brandBlue">
              {renderCurrentStep()}
            </div>

            <FormNavigation onSubmittingChange={setIsSubmitting} />
          </>
        )}
      </div>
    </div>
  );
};
