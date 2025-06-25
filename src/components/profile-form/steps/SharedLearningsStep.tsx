import React, { useState } from 'react';
import { useProfileForm } from '@/contexts/ProfileFormContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Lightbulb, AlertCircle } from 'lucide-react';
import { EmployeeAchievement } from '@/contexts/ProfileFormContext';

const eventTypes = [
  { value: 'Lightning talk', label: 'Lightning Talk' },
  { value: 'Gen AI Hours', label: 'Gen AI Hours' },
  { value: 'Sci Talk', label: 'Sci Talk' },
  { value: 'Certification', label: 'Certification/Course' },
  { value: 'Project', label: 'Project/Contribution' },
  { value: 'Blog/Article', label: 'Blog/Article' },
  { value: 'Mentoring', label: 'Mentoring/Teaching' },
  { value: 'Other', label: 'Other' }
];

export const SharedLearningsStep = () => {
  const { state, updateFormData } = useProfileForm();
  const [validationErrors, setValidationErrors] = useState<{ [index: number]: { [field: string]: string } }>({});
  const [showValidation, setShowValidation] = useState(false);

  React.useEffect(() => {
    (window as any).validateSharedLearnings = () => {
      const errors: { [index: number]: { [field: string]: string } } = {};
      (state.formData.employee_achievements || []).forEach((achievement, idx) => {
        const entryErrors: { [field: string]: string } = {};
        if (!achievement.event_type || achievement.event_type.trim() === '') {
          entryErrors.event_type = 'Type is required';
        }
        if (achievement.event_type === 'Other' && (!achievement.custom_event_type || achievement.custom_event_type.trim() === '')) {
          entryErrors.custom_event_type = 'Custom type is required';
        }
        if (!achievement.event_date || achievement.event_date.trim() === '') {
          entryErrors.event_date = 'Date is required';
        }
        if (!achievement.event_description || achievement.event_description.trim() === '') {
          entryErrors.event_description = 'Description is required';
        }
        if (!achievement.event_link || achievement.event_link.trim() === '') {
          entryErrors.event_link = 'Related link is required';
        }
        if (Object.keys(entryErrors).length > 0) {
          errors[idx] = entryErrors;
        }
      });
      setValidationErrors(errors);
      setShowValidation(true);
      return Object.keys(errors).length === 0;
    };
    return () => {
      delete (window as any).validateSharedLearnings;
    };
  }, [state.formData.employee_achievements]);

  const handleAchievementChange = (index: number, field: keyof EmployeeAchievement, value: string) => {
    const updatedAchievements = [...(state.formData.employee_achievements || [])];
    const currentAchievement = updatedAchievements[index];
    
    // When changing event_type, preserve custom_event_type if it was set
    if (field === 'event_type' && value !== 'Other' && currentAchievement.custom_event_type) {
      updatedAchievements[index] = { ...currentAchievement, [field]: value, custom_event_type: '' };
    } else {
      updatedAchievements[index] = { ...currentAchievement, [field]: value };
    }
    
    updateFormData({ employee_achievements: updatedAchievements });
    // Clear validation error for this field
    if (showValidation && validationErrors[index]?.[field]) {
      const newErrors = { ...validationErrors };
      if (newErrors[index]) {
        delete newErrors[index][field];
        if (Object.keys(newErrors[index]).length === 0) {
          delete newErrors[index];
        }
      }
      setValidationErrors(newErrors);
    }
  };

  const handleCustomEventTypeChange = (index: number, value: string) => {
    const updatedAchievements = [...(state.formData.employee_achievements || [])];
    updatedAchievements[index] = { 
      ...updatedAchievements[index], 
      custom_event_type: value,
      event_type: 'Other'
    };
    updateFormData({ employee_achievements: updatedAchievements });
    // Clear validation error for custom_event_type
    if (showValidation && validationErrors[index]?.custom_event_type) {
      const newErrors = { ...validationErrors };
      if (newErrors[index]) {
        delete newErrors[index].custom_event_type;
        if (Object.keys(newErrors[index]).length === 0) {
          delete newErrors[index];
        }
      }
      setValidationErrors(newErrors);
    }
  };

  const addAchievement = () => {
    const newAchievement: EmployeeAchievement = {
      event_type: '',
      event_date: '',
      event_description: '',
      event_link: '',
      custom_event_type: ''
    };
    const updatedAchievements = [...(state.formData.employee_achievements || []), newAchievement];
    updateFormData({ employee_achievements: updatedAchievements });
  };

  const removeAchievement = (index: number) => {
    const updatedAchievements = (state.formData.employee_achievements || []).filter((_, i) => i !== index);
    updateFormData({ employee_achievements: updatedAchievements });
  };

  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    // If it's already in YYYY-MM-DD format, return as is
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) return dateString;
    // Otherwise, try to parse and format
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  const getTodaysDate = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleDateChange = (index: number, value: string) => {
    const today = getTodaysDate();
    
    // Check if the selected date is in the future
    if (value > today) {
      // Don't update the value if it's a future date
      return;
    }
    
    handleAchievementChange(index, 'event_date', value);
    // Clear validation error for event_date
    if (showValidation && validationErrors[index]?.event_date) {
      const newErrors = { ...validationErrors };
      if (newErrors[index]) {
        delete newErrors[index].event_date;
        if (Object.keys(newErrors[index]).length === 0) {
          delete newErrors[index];
        }
      }
      setValidationErrors(newErrors);
    }
  };

  const achievements = state.formData.employee_achievements || [];

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="text-2xl font-bold text-brandBlueDarkest">Shared Learnings</h2>
      </div>
      
      <p className="text-textMuted">
        Share any learnings, contributions, or experiences that you'd like your colleagues to know about. <strong className="text-brandBlue">Learnings can be of any type</strong> — from formal presentations to personal projects, certifications to creative pursuits. Every learning journey is valuable and worth sharing!
      </p>

      <div className="bg-highlightBg p-4 rounded-lg border border-borderMid shadow-subtle">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-4 h-4 text-brandBlue" />
          <h4 className="font-bold text-brandBlueLighterDark">Examples of Shared Learnings (All Types Welcome!)</h4>
        </div>
        <ul className="text-sm text-textMuted space-y-1">
          <li><strong className="text-brandBlue font-sans">Talks & Presentations:</strong> Lightning talks, Gen AI Hours, Sci talks, conference presentations</li>
          <li><strong className="text-brandBlue font-sans">Learning & Development:</strong> Certifications, courses, workshops, bootcamps</li>
          <li><strong className="text-brandBlue font-sans">Projects & Contributions:</strong> Open source contributions, side projects, research work</li>
          <li><strong className="text-brandBlue font-sans">Creative & Personal:</strong> Blog posts, tutorials, mentoring, community involvement</li>
          <li><strong className="text-brandBlue font-sans">Any other learning:</strong> Book clubs, study groups, skill development — share what matters to you!</li>
        </ul>
      </div>

      <div className="space-y-6">
        {achievements.map((achievement, index) => (
          <div key={index} className="p-6 border border-borderSoft rounded-lg space-y-4 bg-cardBg shadow-subtle">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-brandBlue">Learning {index + 1}</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeAchievement(index)}
                className="text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`event_type_${index}`} className={`text-textMuted font-semibold text-sm ${showValidation && validationErrors[index]?.event_type ? 'text-red-600' : ''}`}>Type *</Label>
                <Select
                  value={achievement.event_type || ''}
                  onValueChange={(value) => handleAchievementChange(index, 'event_type', value)}
                >
                  <SelectTrigger className={`border-borderSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-1 ${showValidation && validationErrors[index]?.event_type ? 'border-red-500 focus-visible:ring-red-500' : ''}`}>
                    <SelectValue placeholder="Select event type">
                      {achievement.event_type === 'Other' && achievement.custom_event_type ? 
                        achievement.custom_event_type : 
                        achievement.event_type || 'Select event type'
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {showValidation && validationErrors[index]?.event_type && (
                  <div className="flex items-center space-x-1 text-red-600 text-sm mt-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{validationErrors[index].event_type}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`event_date_${index}`} className={`text-textMuted font-semibold text-sm ${showValidation && validationErrors[index]?.event_date ? 'text-red-600' : ''}`}>Date *</Label>
                <Input
                  id={`event_date_${index}`}
                  type="date"
                  value={formatDateForInput(achievement.event_date || '')}
                  onChange={(e) => handleDateChange(index, e.target.value)}
                  max={getTodaysDate()}
                  className={`border-borderSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-1 text-brandBlueDarker [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 ${showValidation && validationErrors[index]?.event_date ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
                {showValidation && validationErrors[index]?.event_date && (
                  <div className="flex items-center space-x-1 text-red-600 text-sm mt-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{validationErrors[index].event_date}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`event_description_${index}`} className={`text-textMuted font-semibold text-sm ${showValidation && validationErrors[index]?.event_description ? 'text-red-600' : ''}`}>Description *</Label>
              <Textarea
                id={`event_description_${index}`}
                value={achievement.event_description || ''}
                onChange={(e) => handleAchievementChange(index, 'event_description', e.target.value)}
                placeholder="Describe your learning or contribution..."
                className={`min-h-[100px] border-borderSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-1 text-brandBlueDarker ${showValidation && validationErrors[index]?.event_description ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {showValidation && validationErrors[index]?.event_description && (
                <div className="flex items-center space-x-1 text-red-600 text-sm mt-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{validationErrors[index].event_description}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`event_link_${index}`} className={`text-textMuted font-semibold text-sm ${showValidation && validationErrors[index]?.event_link ? 'text-red-600' : ''}`}>Related Link *</Label>
              <Input
                id={`event_link_${index}`}
                type="url"
                value={achievement.event_link || ''}
                onChange={(e) => handleAchievementChange(index, 'event_link', e.target.value)}
                placeholder="https://example.com/your-learning"
                className={`border-borderSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-1 text-brandBlueDarker ${showValidation && validationErrors[index]?.event_link ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {showValidation && validationErrors[index]?.event_link && (
                <div className="flex items-center space-x-1 text-red-600 text-sm mt-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{validationErrors[index].event_link}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {achievements.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-brandBlueLight rounded-lg bg-sidebarBg">
            <div className="mx-auto w-12 h-12 bg-brandBlueLighter rounded-full flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-brandBlueDarkest" />
            </div>
            <h3 className="text-lg font-bold text-brandBlueDarkest mb-2">No learnings added yet</h3>
            {/* <p className="text-brandBlueDark mb-4">Share any type of learning — talks, projects, certifications, or personal growth experiences.</p> */}
           <Button 
              type="button" 
              variant="outline" 
              onClick={addAchievement}
              className="border-brandBlue text-brandBlue hover:bg-brandBlue hover:text-white transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Learning
            </Button>
          </div>
        )}

        {/* Add Learning Button */}
        {achievements.length > 0 && (
          <div className="flex justify-end pt-4">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={addAchievement}
              className="border-brandBlue text-brandBlue hover:bg-brandBlue hover:text-white transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Learning
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
