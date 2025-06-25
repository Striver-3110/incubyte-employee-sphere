import React from 'react';
import { useProfileForm } from '@/contexts/ProfileFormContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { EmployeeAchievement } from '@/contexts/ProfileFormContext';

const eventTypes = [
  { value: 'Lightning talk', label: 'Lightning Talk' },
  { value: 'Gen AI Hours', label: 'Gen AI Hours' },
  { value: 'Sci Talk', label: 'Sci Talk' },
  { value: 'Other', label: 'Other' }
];

export const SharedLearningsStep = () => {
  const { state, updateFormData } = useProfileForm();

  const handleAchievementChange = (index: number, field: keyof EmployeeAchievement, value: string) => {
    const updatedAchievements = [...(state.formData.employee_achievements || [])];
    updatedAchievements[index] = { ...updatedAchievements[index], [field]: value };
    updateFormData({ employee_achievements: updatedAchievements });
  };

  const addAchievement = () => {
    const newAchievement: EmployeeAchievement = {
      event_type: '',
      event_date: '',
      event_description: '',
      event_link: ''
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

  const achievements = state.formData.employee_achievements || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Shared Learnings</h2>
        <Button type="button" variant="outline" size="sm" onClick={addAchievement}>
          <Plus className="w-4 h-4 mr-2" />
          Add Achievement
        </Button>
      </div>
      
      <p className="text-gray-600">
        Share your achievements, learnings, and contributions that you'd like your colleagues to know about.
      </p>

      <div className="space-y-6">
        {achievements.map((achievement, index) => (
          <div key={index} className="p-6 border border-gray-200 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-800">Achievement #{index + 1}</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeAchievement(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`event_type_${index}`}>Event Type *</Label>
                <Select
                  value={achievement.event_type || ''}
                  onValueChange={(value) => handleAchievementChange(index, 'event_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`event_date_${index}`}>Event Date *</Label>
                <div className="relative">
                  <Input
                    id={`event_date_${index}`}
                    type="date"
                    value={formatDateForInput(achievement.event_date || '')}
                    onChange={(e) => handleAchievementChange(index, 'event_date', e.target.value)}
                    className="pr-10"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`event_description_${index}`}>Description *</Label>
              <Textarea
                id={`event_description_${index}`}
                value={achievement.event_description || ''}
                onChange={(e) => handleAchievementChange(index, 'event_description', e.target.value)}
                placeholder="Describe your achievement, learning, or contribution..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`event_link_${index}`}>Related Link *</Label>
              <Input
                id={`event_link_${index}`}
                type="url"
                value={achievement.event_link || ''}
                onChange={(e) => handleAchievementChange(index, 'event_link', e.target.value)}
                placeholder="https://example.com/your-achievement"
              />
            </div>
          </div>
        ))}

        {achievements.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements added yet</h3>
            <p className="text-gray-500 mb-4">Share your learnings, talks, certifications, and contributions.</p>
            <Button type="button" variant="outline" onClick={addAchievement}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Achievement
            </Button>
          </div>
        )}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Examples of Shared Learnings</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Lightning talks you've given</li>
          <li>• Contributions to Gen AI Hours sessions</li>
          <li>• Scientific talks or presentations</li>
          <li>• Certifications and courses completed</li>
          <li>• Open source contributions</li>
          <li>• Conference presentations</li>
        </ul>
      </div>
    </div>
  );
};
