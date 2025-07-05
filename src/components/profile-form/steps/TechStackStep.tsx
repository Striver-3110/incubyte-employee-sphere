import React, { useState, useEffect } from 'react';
import { useProfileForm } from '@/contexts/ProfileFormContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, BookOpen } from 'lucide-react';
import { TechStackEntry } from '@/contexts/ProfileFormContext';
import { useToast } from '@/hooks/use-toast';
import { isTechnicalRole } from '@/utils/roleUtils';
import { Combobox } from '@/components/ui/combobox';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const proficiencyLevels = [
  { value: 'Expert', label: 'Expert' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Learning', label: 'Learning' }
];

export const TechStackStep = () => {
  const { state, updateFormData } = useProfileForm();
  const { toast } = useToast();
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState<'Expert' | 'Intermediate' | 'Beginner' | 'Learning'>('Intermediate');
  
  // Determine component name based on role
  const isUserTechnicalRole = isTechnicalRole(state.formData.designation);
  
  const componentTitle = isUserTechnicalRole ? "Tech Stack" : "Skills Matrix";
  const skillLabel = isUserTechnicalRole ? "Technology" : "Skill";
  const addButtonText = isUserTechnicalRole ? "Add Technology" : "Add Skill";

  // Fetch available skills from API
  useEffect(() => {
    const fetchAvailableSkills = async () => {
      try {
        setIsLoadingSkills(true);
        const response = await fetch(`${BASE_URL}tech_stack.get_tech_stack_list`, {
          method: 'GET',
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch skills');
        }
        
        const data = await response.json();
        const skills = Array.isArray(data.message) ? data.message : [];
        setAvailableSkills(skills.map((item: { skill_name: string }) => item.skill_name));
      } catch (error) {
        console.error('Error fetching available skills:', error);
        // Fallback to empty array
        setAvailableSkills([]);
      } finally {
        setIsLoadingSkills(false);
      }
    };

    fetchAvailableSkills();
  }, []);






  const handleTechStackChange = (index: number, field: keyof TechStackEntry, value: string) => {
    // Trim the value if it's a skill field
    const trimmedValue = field === 'skill' ? value.trim() : value;
    
    // If changing the skill field, check for duplicates
    if (field === 'skill') {
      const isDuplicate = state.formData.custom_tech_stack.some(
        (existingSkill, existingIndex) => 
          existingIndex !== index && 
          existingSkill.skill.toLowerCase().trim() === trimmedValue.toLowerCase()
      );
      
      if (isDuplicate) {
        toast({
          title: 'Duplicate Technology',
          description: `"${trimmedValue}" is already added to your list.`,
          variant: 'destructive',
        });
        return; // Don't allow the change
      }
      
      // Add the skill to available skills if it's not already there
      if (trimmedValue && !availableSkills.includes(trimmedValue)) {
        setAvailableSkills(prev => [...prev, trimmedValue].sort());
      }
    }

    const updatedTechStack = [...state.formData.custom_tech_stack];
    updatedTechStack[index] = { ...updatedTechStack[index], [field]: trimmedValue };
    updateFormData({ custom_tech_stack: updatedTechStack });
  };

  const addTechStack = () => {
    const trimmedSkillName = newSkillName.trim();
    
    if (!trimmedSkillName || !newSkillProficiency) {
      return;
    }

    // Check if skill is already added (case insensitive)
    const skillExists = state.formData.custom_tech_stack.some(
      existingSkill => existingSkill.skill.toLowerCase().trim() === trimmedSkillName.toLowerCase()
    );

    if (skillExists) {
      toast({
        title: 'Duplicate Technology',
        description: `"${trimmedSkillName}" is already added to your list.`,
        variant: 'destructive',
      });
      return;
    }

    const newTechStack: TechStackEntry = {
      skill: trimmedSkillName,
      proficiency_level: newSkillProficiency
    };
    
    const updatedTechStack = [...state.formData.custom_tech_stack, newTechStack];
    updateFormData({ custom_tech_stack: updatedTechStack });
    
    // Add the new skill to available skills list if it's not already there
    if (!availableSkills.includes(trimmedSkillName)) {
      setAvailableSkills(prev => [...prev, trimmedSkillName].sort());
    }
    
    // Reset form
    setNewSkillName('');
    setNewSkillProficiency('Intermediate');
  };

  const removeTechStack = (index: number) => {
    const updatedTechStack = state.formData.custom_tech_stack.filter((_, i) => i !== index);
    updateFormData({ custom_tech_stack: updatedTechStack });
  };

  const SkillInput = ({ techStack, index }: { techStack: TechStackEntry; index: number }) => {
    // Create a combined list of available skills + any custom skills already selected
    const getAllAvailableSkills = () => {
      const baseSkills = [...availableSkills];
      
      // Add any custom skills that are not in the predefined list
      state.formData.custom_tech_stack.forEach(entry => {
        if (entry.skill && !baseSkills.includes(entry.skill)) {
          baseSkills.push(entry.skill);
        }
      });
      
      return baseSkills.sort(); // Sort alphabetically for better UX
    };
    
    // Get already selected skills to filter them out from dropdown
    // but allow the current skill to be shown (in case user wants to keep it)
    const getFilteredOptions = () => {
      const allSkills = getAllAvailableSkills();
      const selectedSkills = state.formData.custom_tech_stack.map(tech => tech.skill).filter(Boolean);
      
      return allSkills
        .filter(skill => {
          const isCurrentSkill = skill === techStack.skill;
          const isAlreadySelected = selectedSkills.includes(skill);
          
          return isCurrentSkill || !isAlreadySelected;
        })
        .map(skill => ({ value: skill, label: skill }));
    };

    return (
      <div className="space-y-2">
        <Label className="text-textMuted font-semibold text-sm">{skillLabel} *</Label>
        <Combobox
          options={getFilteredOptions()}
          value={techStack.skill}
          onValueChange={(value) => handleTechStackChange(index, 'skill', value)}
          placeholder={`Select ${skillLabel.toLowerCase()}`}
          searchPlaceholder={`Search ${skillLabel.toLowerCase()}...`}
          emptyMessage={isLoadingSkills ? "Loading skills..." : "No skills available"}
          loading={isLoadingSkills}
          allowCustom={true}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6 font-sans">
      <h2 className="text-2xl font-bold text-brandBlueDark">{componentTitle}</h2>
      
      <div className="bg-highlightBg p-4 rounded-lg border border-borderMid shadow-subtle">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-4 h-4 text-brandBlue" />
          <h4 className="font-bold text-brandBlueLighterDark">Proficiency Levels Guide</h4>
        </div>
        <ul className="text-sm text-textMuted space-y-1">
          <li><strong className="text-brandBlue">Expert:</strong> Deep knowledge, can mentor others, handles complex problems</li>
          <li><strong className="text-brandBlue">Intermediate:</strong> Comfortable with most tasks, some guidance needed for complex issues</li>
          <li><strong className="text-brandBlue">Beginner:</strong> Basic understanding, needs guidance for most tasks</li>
          <li><strong className="text-brandBlue">Learning:</strong> Currently acquiring knowledge, limited practical experience</li>
        </ul>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-brandBlue">
            Your {isUserTechnicalRole ? 'Technical Skills' : 'Professional Skills'}
          </h3>
          {/* <Button type="button" variant="outline" size="sm" onClick={addTechStack}>
            <Plus className="w-4 h-4 mr-2" />
            {addButtonText}
          </Button> */}
        </div>

        {state.formData.custom_tech_stack.map((techStack, index) => (
          <div key={index} className="flex items-end space-x-2 p-4 bg-cardBg border border-borderSoft rounded-lg shadow-subtle">
            <div className="flex-1">
              <SkillInput techStack={techStack} index={index} />
            </div>
            <div className="flex-1 space-y-2">
              <Label className="text-textMuted font-semibold text-sm">Proficiency Level *</Label>
              <Select
                value={techStack.proficiency_level}
                onValueChange={(value) => handleTechStackChange(index, 'proficiency_level', value as TechStackEntry['proficiency_level'])}
              >
                <SelectTrigger className="border-borderSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-1">
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
              className="mb-0 border-brandBlue text-brandBlue hover:bg-brandBlue hover:text-white transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}

        {/* Add New Skill Form */}
        <div className="p-4 border border-borderSoft rounded-lg bg-cardBg shadow-subtle">
          <h4 className="font-bold text-brandBlue mb-3">{addButtonText}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label className="text-textMuted font-semibold text-sm">{skillLabel} Name</Label>
              <Combobox
                options={availableSkills.map(skill => ({ value: skill, label: skill }))}
                value={newSkillName}
                onValueChange={setNewSkillName}
                placeholder={`Enter ${skillLabel.toLowerCase()} name or search`}
                searchPlaceholder={`Search ${skillLabel.toLowerCase()}...`}
                emptyMessage={isLoadingSkills ? "Loading skills..." : "No skills available"}
                loading={isLoadingSkills}
                allowCustom={true}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-textMuted font-semibold text-sm">Proficiency Level</Label>
              <Select
                value={newSkillProficiency}
                onValueChange={(value) => setNewSkillProficiency(value as 'Expert' | 'Intermediate' | 'Beginner' | 'Learning')}
              >
                <SelectTrigger className="border-borderSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-1">
                  <SelectValue placeholder="Select proficiency" />
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
              onClick={addTechStack}
              disabled={!newSkillName.trim() || !newSkillProficiency}
              className="mb-0 bg-brandBlue hover:bg-brandBlueDark text-white disabled:opacity-50 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </div>

        {/* {state.formData.custom_tech_stack.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 mb-4">No {isUserTechnicalRole ? 'technologies' : 'skills'} added yet</p>
            <Button type="button" variant="outline" onClick={addTechStack}>
              <Plus className="w-4 h-4 mr-2" />
              {addButtonText}
            </Button>
          </div>
        )} */}
      </div>
    </div>
  );
};
