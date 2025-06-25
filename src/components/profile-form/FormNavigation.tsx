
import React, { useState } from 'react';
import { useProfileForm } from '@/contexts/ProfileFormContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const FormNavigation = () => {
  const { state, goToNextStep, goToPrevStep } = useProfileForm();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateStep = (step: number): boolean => {
    const { formData } = state;
    
    switch (step) {
      case 1:
        // Basic Profile validation
        const hasValidAddress = formData.current_address.trim() !== '' &&
                              formData.custom_city.trim() !== '' &&
                              formData.custom_state.trim() !== '' &&
                              formData.custom_pin.trim() !== '';
        
        const hasAbout = formData.custom_about.trim() !== '';
        
        const hasValidPlatform = formData.custom_platforms.length > 0 &&
                               formData.custom_platforms.some(p => 
                                 p.platform_name.trim() !== '' && 
                                 p.url.trim() !== '' && 
                                 p.url.startsWith('http')
                               );
        
        const hasImage = formData.image !== '';
        
        return hasValidAddress && hasAbout && hasValidPlatform && hasImage;
      
      case 2:
        // Tech Stack validation
        return formData.custom_tech_stack.length > 0 &&
               formData.custom_tech_stack.every(tech => 
                 tech.skill.trim() !== '' && tech.proficiency_level !== ''
               );
      
      case 3:
        // Ice Breakers validation
        const answeredQuestions = formData.custom_employee_icebreaker_question.filter(
          q => q.answer && q.answer.trim() !== ''
        );
        return answeredQuestions.length >= 5;
      
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(state.currentStep)) {
      goToNextStep();
    } else {
      toast({
        title: "Validation Error",
        description: getValidationMessage(state.currentStep),
        variant: "destructive"
      });
    }
  };

  const getValidationMessage = (step: number): string => {
    switch (step) {
      case 1:
        return "Please fill in all address fields, add an about section, include at least one valid platform, and upload a profile image.";
      case 2:
        return "Please add at least one tech stack entry with both skill and proficiency level.";
      case 3:
        return "Please answer at least 5 ice breaker questions.";
      default:
        return "Please complete all required fields.";
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      toast({
        title: "Validation Error",
        description: getValidationMessage(3),
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      let finalImageUrl = state.formData.image;
      
      // Upload image if it was changed
      if (state.isImageChanged && state.formData.image.startsWith('data:')) {
        const formData = new FormData();
        const blob = await fetch(state.formData.image).then(r => r.blob());
        formData.append('file', blob, 'profile-image.jpg');
        
        const uploadResponse = await fetch(`${BASE_URL}user.upload_image`, {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          finalImageUrl = uploadData.message?.file_url || state.formData.image;
        }
      }

      // Submit complete profile data
      const profileData = {
        current_address: state.formData.current_address,
        custom_city: state.formData.custom_city,
        custom_state: state.formData.custom_state,
        custom_pin: state.formData.custom_pin,
        custom_about: state.formData.custom_about,
        image: finalImageUrl,
        custom_platforms: state.formData.custom_platforms,
        custom_tech_stack: state.formData.custom_tech_stack,
        custom_employee_icebreaker_question: state.formData.custom_employee_icebreaker_question
      };

      const response = await fetch(`${BASE_URL}user.set_complete_profile_data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Your profile has been updated successfully.",
        });
        // Optionally redirect to profile page
        window.location.href = '/';
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error submitting profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCurrentStepValid = validateStep(state.currentStep);
  const isLastStep = state.currentStep === 3;

  return (
    <div className="flex justify-between items-center">
      <div>
        {state.currentStep > 1 && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={goToPrevStep}
            disabled={isSubmitting}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
      </div>
      
      <div className="flex space-x-2">
        {isLastStep ? (
          <Button 
            type="button" 
            onClick={handleSubmit}
            disabled={!isCurrentStepValid || isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Upload className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Submit Profile
              </>
            )}
          </Button>
        ) : (
          <Button 
            type="button" 
            onClick={handleNext}
            disabled={!isCurrentStepValid}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};
