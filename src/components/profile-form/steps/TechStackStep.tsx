
import React from 'react';
import { useProfileForm } from '@/contexts/ProfileFormContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { TechStackEntry } from '@/contexts/ProfileFormContext';

const proficiencyLevels = [
  { value: 'Expert', label: 'Expert' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Learning', label: 'Learning' }
];

export const TechStackStep = () => {
  const { state, updateFormData } = useProfileForm();

  const handleTechStackChange = (index: number, field: keyof TechStackEntry, value: string) => {
    const updatedTechStack = [...state.formData.custom_tech_stack];
    updatedTechStack[index] = { ...updatedTechStack[index], [field]: value };
    updateFormData({ custom_tech_stack: updatedTechStack });
  };

  const addTechStack = () => {
    const newTechStack = [...state.formData.custom_tech_stack, { skill: '', proficiency_level: 'Beginner' as const }];
    updateFormData({ custom_tech_stack: newTechStack });
  };

  const removeTechStack = (index: number) => {
    const updatedTechStack = state.formData.custom_tech_stack.filter((_, i) => i !== index);
    updateFormData({ custom_tech_stack: updatedTechStack });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Tech Stack & Skills</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-800">Your Technical Skills</h3>
          <Button type="button" variant="outline" size="sm" onClick={addTechStack}>
            <Plus className="w-4 h-4 mr-2" />
            Add Skill
          </Button>
        </div>

        {state.formData.custom_tech_stack.map((techStack, index) => (
          <div key={index} className="flex items-end space-x-2 p-4 border border-gray-200 rounded-lg">
            <div className="flex-1 space-y-2">
              <Label>Skill/Technology *</Label>
              <Input
                value={techStack.skill}
                onChange={(e) => handleTechStackChange(index, 'skill', e.target.value)}
                placeholder="e.g., React, Python, AWS"
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label>Proficiency Level *</Label>
              <Select
                value={techStack.proficiency_level}
                onValueChange={(value) => handleTechStackChange(index, 'proficiency_level', value as TechStackEntry['proficiency_level'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {proficiencyLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeTechStack(index)}
              className="mb-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}

        {state.formData.custom_tech_stack.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 mb-4">No skills added yet</p>
            <Button type="button" variant="outline" onClick={addTechStack}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Skill
            </Button>
          </div>
        )}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Proficiency Levels Guide</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li><strong>Expert:</strong> Deep knowledge, can mentor others, handles complex problems</li>
          <li><strong>Intermediate:</strong> Comfortable with most tasks, some guidance needed for complex issues</li>
          <li><strong>Beginner:</strong> Basic understanding, needs guidance for most tasks</li>
          <li><strong>Learning:</strong> Currently acquiring knowledge, limited practical experience</li>
        </ul>
      </div>
    </div>
  );
};
