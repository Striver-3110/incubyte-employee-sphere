
import React, { useEffect } from 'react';
import { useProfileForm } from '@/contexts/ProfileFormContext';
import { StepIndicator } from './StepIndicator';
import { BasicProfileStep } from './steps/BasicProfileStep';
import { TechStackStep } from './steps/TechStackStep';
import { IceBreakersStep } from './steps/IceBreakersStep';
import { SharedLearningsStep } from './steps/SharedLearningsStep';
import { FormNavigation } from './FormNavigation';
import { useToast } from '@/hooks/use-toast';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const ProfileFormContainer = () => {
  const { state, dispatch } = useProfileForm();
  const { toast } = useToast();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        console.log('Fetching profile data from:', `${BASE_URL}user.get_complete_profile_data`);
        const response = await fetch(`${BASE_URL}user.get_complete_profile_data`, {
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
        const profileData = apiResponse.message?.data || apiResponse.message || {};
        
        if (profileData) {
          dispatch({ type: 'INITIALIZE_DATA', payload: {
            image: profileData.image || '/placeholder.svg',
            full_name: profileData.employee_name || 'John Doe',
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">Fill in your details to complete your employee profile</p>
        </div>

        <StepIndicator currentStep={state.currentStep} />

        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          {renderCurrentStep()}
        </div>

        <FormNavigation />
      </div>
    </div>
  );
};
