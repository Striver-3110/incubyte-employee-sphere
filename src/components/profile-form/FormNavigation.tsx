import React, { useState } from 'react';
import { useProfileForm } from '@/contexts/ProfileFormContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const FormNavigation = () => {
  const { state, goToNextStep, goToPrevStep, setSubmissionSuccess } = useProfileForm();
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
        
        // Platform validation: if any platforms are added, ALL must be complete and valid
        const platformsValid = formData.custom_platforms.length === 0 || 
                              formData.custom_platforms.every(p => 
                                p.platform_name.trim() !== '' && 
                                p.url.trim() !== '' && 
                                p.url.startsWith('http')
                              );
        
        const hasImage = formData.image !== '';
        
        return hasValidAddress && hasAbout && platformsValid && hasImage;
      
      case 2:
        // Tech Stack validation
        return formData.custom_tech_stack.length > 0 &&
               formData.custom_tech_stack.every(tech => 
                 tech.skill.trim() !== '' && tech.proficiency_level !== undefined && tech.proficiency_level !== null
               );
      
      case 3:
        // Ice Breakers validation - step is optional, always valid
        return true;
      
      case 4:
        // Shared Learnings validation - step is optional, but if achievements are added, they must be complete
        if (formData.employee_achievements.length === 0) {
          return true; // No achievements is allowed
        }
        
        return formData.employee_achievements.every(achievement => {
          const eventTypeValid = achievement.event_type.trim() !== '' &&
            (achievement.event_type !== 'Other' || (achievement.custom_event_type && achievement.custom_event_type.trim() !== ''));
          
          return eventTypeValid &&
            achievement.event_date.trim() !== '' &&
            achievement.event_description.trim() !== '' &&
            achievement.event_link.trim() !== '' &&
            achievement.event_link.startsWith('http');
        });
      
      default:
        return false;
    }
  };

  const handleNext = () => {
    // For step 1, call the validation function if available
    if (state.currentStep === 1 && (window as any).validateBasicProfile) {
      const isValid = (window as any).validateBasicProfile();
      if (isValid) {
        goToNextStep();
      }
      // If validation fails, the BasicProfileStep will handle highlighting the errors
      return;
    }
    
    // For other steps, use the existing validation logic
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
        return "Please fill in all address fields, add an about section, upload a profile image, and ensure all added platforms have valid URLs.";
      case 2:
        return "Please add at least one tech stack entry with both skill and proficiency level.";
      case 3:
        return "Ice breaker questions are optional - you can proceed to the next step.";
      case 4:
        return "Shared learnings are optional, but if you add any, please complete all required fields and ensure URLs are valid.";
      default:
        return "Please complete all required fields.";
    }
  };

  const handleSubmit = async () => {
    // Validate the current step before submission
    if (state.currentStep === 4 && typeof (window as any).validateSharedLearnings === 'function') {
      const isValid = (window as any).validateSharedLearnings();
      if (!isValid) {
        toast({
          title: "Validation Error",
          description: getValidationMessage(4),
          variant: "destructive"
        });
        return;
      }
    }
    if (!validateStep(4)) {
      toast({
        title: "Validation Error",
        description: getValidationMessage(4),
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      let finalImageUrl = state.formData.image;
      
      // Upload image if it was changed and we have a file
      if (state.isImageChanged && state.selectedImageFile) {
        const formData = new FormData();
        formData.append('file', state.selectedImageFile);
        
        const uploadResponse = await fetch(`${BASE_URL}profile.upload_image`, {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          finalImageUrl = uploadData.file_url || uploadData.message?.file_url;
        } else {
          throw new Error('Failed to upload image');
        }
      }

      // Transform employee achievements for API submission
      const transformedAchievements = state.formData.employee_achievements.map(achievement => ({
        ...achievement,
        // If event_type is "Other" and custom_event_type is provided, use the custom type
        event_type: achievement.event_type === 'Other' && achievement.custom_event_type?.trim() 
          ? achievement.custom_event_type.trim() 
          : achievement.event_type,
        // Remove custom_event_type from the final payload
        custom_event_type: undefined
      }));

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
        custom_employee_icebreaker_question: state.formData.custom_employee_icebreaker_question,
        employee_achievements: transformedAchievements
      };

      const response = await fetch(`${BASE_URL}profile.update_full_profile`, {
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
        // Set submission success to show thank you page
        setSubmissionSuccess(true);
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

  const isLastStep = state.currentStep === 4;

  return (
    <div className="flex justify-between items-center">
      <div>
        {state.currentStep > 1 && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={goToPrevStep}
            disabled={isSubmitting}
            className="border-brandBlue text-brandBlue hover:bg-brandBlue hover:text-white transition-colors"
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
            disabled={isSubmitting}
            className="min-w-[120px] bg-brandGreen hover:bg-brandGreen/90 text-white transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
            className="bg-brandBlue hover:bg-brandBlueDark text-white transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};
