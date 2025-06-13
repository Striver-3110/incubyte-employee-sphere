
import React, { useState, useEffect } from "react";
import { useEmployeeDetails } from "@/api/employeeService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const proficiencyLevels = ["Expert", "Intermediate", "Beginner", "Learning"];

const SkillsMatrix = () => {
  const { employee, loading, setEmployee } = useEmployeeDetails();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedProficiency, setSelectedProficiency] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingSkill, setDeletingSkill] = useState<string | null>(null);
  const [isComponentLoading, setIsComponentLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch available skills from the API
  useEffect(() => {
    const fetchAvailableSkills = async () => {
      try {
        const response = await fetch(`${BASE_URL}tech_stack.get_tech_stack_list`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        setAvailableSkills(data.message.map((item: { skill_name: string }) => item.skill_name));
      } catch (error) {
        console.error("Error fetching available skills:", error);
        toast.error("Failed to fetch available skills.");
      }
    };

    fetchAvailableSkills();
  }, []);

  // Group skills by proficiency level
  const groupedSkills = employee?.custom_tech_stack?.reduce(
    (acc: Record<string, typeof employee.custom_tech_stack>, skill) => {
      const category = skill.proficiency_level;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(skill);
      return acc;
    },
    {}
  ) || {};

  // Filter available skills to exclude already added skills
  const getFilteredSkills = () => {
    if (!searchTerm.trim()) return [];
    
    const addedSkillNames = (employee?.custom_tech_stack || []).map(skill => 
      skill.skill.toLowerCase().trim()
    );
    
    console.log("Current search term:", searchTerm);
    console.log("Already added skills:", addedSkillNames);
    console.log("Available skills:", availableSkills);
    
    const filtered = availableSkills
      .filter(skill => {
        const skillLower = skill.toLowerCase().trim();
        const searchLower = searchTerm.toLowerCase().trim();
        const matchesSearch = skillLower.includes(searchLower);
        const notAlreadyAdded = !addedSkillNames.includes(skillLower);
        
        console.log(`Skill: ${skill}, Matches search: ${matchesSearch}, Not already added: ${notAlreadyAdded}`);
        
        return matchesSearch && notAlreadyAdded;
      })
      .slice(0, 10);
    
    console.log("Filtered skills:", filtered);
    return filtered;
  };

  // Add a new skill
  const handleAddSkill = async () => {
    const trimmedSkill = searchTerm.trim();
    
    if (!trimmedSkill || !selectedProficiency) {
      toast.error("Please fill out all fields.");
      return;
    }

    // Check if skill already exists (case-insensitive)
    const existingSkill = employee?.custom_tech_stack?.find(
      skill => skill.skill.toLowerCase().trim() === trimmedSkill.toLowerCase()
    );
    
    if (existingSkill) {
      toast.error("This skill has already been added.");
      return;
    }

    const newSkill = {
      skill: trimmedSkill,
      proficiency_level: selectedProficiency,
    };

    const updatedSkills = [...(employee?.custom_tech_stack || []), newSkill];

    try {
      setIsSaving(true);
      setIsComponentLoading(true);
      console.log("Adding skill:", newSkill);
      
      const response = await fetch(`${BASE_URL}user.set_employee_details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          custom_tech_stack: updatedSkills,
        }),
        credentials: "include",
      });
      const data = await response.json();

      if (data.message?.status === "success") {
        toast.success(data.message.message || "Skill added successfully.");
        
        // Update the global state immediately with the API response
        setEmployee((prev) => ({
          ...prev,
          custom_tech_stack: data.message.data.custom_tech_stack,
        }));
        
        // Close dialog and reset form
        closeDialog();
      } else {
        throw new Error(data.message?.message || "Failed to add skill.");
      }
    } catch (error) {
      console.error("Error adding skill:", error);
      toast.error("Failed to add skill.");
    } finally {
      setIsSaving(false);
      setIsComponentLoading(false);
    }
  };

  // Delete a skill
  const handleDeleteSkill = async (skillName: string) => {
    const skillToDelete = employee?.custom_tech_stack?.find(skill => skill.name === skillName);
    if (!skillToDelete) return;

    // Filter out the skill to delete
    const updatedSkills = (employee?.custom_tech_stack || []).filter(
      skill => skill.name !== skillName
    );

    try {
      setDeletingSkill(skillName);
      setIsComponentLoading(true);
      console.log("Deleting skill:", skillName);
      
      const response = await fetch(`${BASE_URL}user.set_employee_details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          custom_tech_stack: updatedSkills,
        }),
        credentials: "include",
      });
      const data = await response.json();

      if (data.message?.status === "success") {
        toast.success(data.message.message || "Skill deleted successfully.");
        
        // Update the global state immediately with the API response
        setEmployee((prev) => ({
          ...prev,
          custom_tech_stack: data.message.data.custom_tech_stack,
        }));
      } else {
        throw new Error(data.message?.message || "Failed to delete skill.");
      }
    } catch (error) {
      console.error("Error deleting skill:", error);
      toast.error("Failed to delete skill.");
    } finally {
      setDeletingSkill(null);
      setIsComponentLoading(false);
    }
  };

  const handleSkillSelect = (skill: string) => {
    setSearchTerm(skill);
    setShowDropdown(false); // Close dropdown after selection
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowDropdown(e.target.value.trim().length > 0); // Show dropdown when typing
  };

  const handleInputFocus = () => {
    if (searchTerm.trim().length > 0) {
      setShowDropdown(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding dropdown to allow click events to register
    setTimeout(() => setShowDropdown(false), 150);
  };

  const closeDialog = () => {
    setIsAddDialogOpen(false);
    setSearchTerm("");
    setSelectedProficiency("");
    setShowDropdown(false);
  };

  const filteredSkills = getFilteredSkills();

  if (loading) {
    return <SkillsMatrixSkeleton />;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md relative">
      {isComponentLoading && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg z-10">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      )}
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Skills Matrix</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAddDialogOpen(true)}
          className="h-8"
          disabled={isSaving || isComponentLoading}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Skill
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {proficiencyLevels.map((level) => (
          <div key={level}>
            <h3 className="text-lg font-medium text-gray-700 mb-3">{level}</h3>
            {groupedSkills[level]?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {groupedSkills[level].map((skill) => (
                  <div
                    key={skill.name}
                    className="flex items-center bg-blue-50 p-2 rounded-md border border-blue-200 shadow-sm space-x-2"
                  >
                    <span className="text-blue-800 text-sm font-medium">{skill.skill}</span>
                    {deletingSkill === skill.name ? (
                      <div className="h-6 w-6 flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSkill(skill.name)}
                        className="h-6 w-6 text-blue-500 hover:text-red-500"
                        disabled={isSaving || deletingSkill !== null || isComponentLoading}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No {level.toLowerCase()} skills added yet.</p>
            )}
          </div>
        ))}
      </div>

      {/* Add Skill Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" showOverlay={false}>
          <DialogHeader>
            <DialogTitle>Add Skill</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <label className="text-sm font-medium mb-1 block">Skill Name</label>
              <Input
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder="Enter a new skill or search"
                disabled={isSaving}
              />
              {showDropdown && filteredSkills.length > 0 && (
                <div className="absolute top-full left-0 right-0 max-h-32 overflow-y-auto border rounded-md mt-1 bg-white shadow-lg z-50">
                  {filteredSkills.map((skill, index) => (
                    <div
                      key={index}
                      className="p-2 cursor-pointer hover:bg-gray-100 border-b last:border-b-0"
                      onMouseDown={() => handleSkillSelect(skill)} // Use onMouseDown to prevent blur from hiding dropdown first
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Proficiency Level</label>
              <Select
                value={selectedProficiency}
                onValueChange={setSelectedProficiency}
                disabled={isSaving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select proficiency" />
                </SelectTrigger>
                <SelectContent>
                  {proficiencyLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={isSaving}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddSkill} 
              disabled={isSaving || !searchTerm.trim() || !selectedProficiency}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Skill"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const SkillsMatrixSkeleton = () => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <Skeleton className="h-7 w-40 mb-4" />
    <div className="space-y-6">
      {Array(4)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-8 w-16" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ))}
    </div>
  </div>
);

export default SkillsMatrix;
