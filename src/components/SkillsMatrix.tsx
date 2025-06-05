import React, { useState, useEffect } from "react";
import { useEmployeeDetails } from "@/api/employeeService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash } from "lucide-react";
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

  // Add a new skill
  const handleAddSkill = async () => {
    const trimmedSkill = searchTerm.trim();
    
    if (!trimmedSkill || !selectedProficiency) {
      toast.error("Please fill out all fields.");
      return;
    }

    const newSkill = {
      skill: trimmedSkill,
      proficiency_level: selectedProficiency,
    };

    const updatedSkills = [...(employee?.custom_tech_stack || []), newSkill];

    try {
      setIsSaving(true);
      // Call API to save the new skill
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
        setEmployee((prev) => ({
          ...prev,
          custom_tech_stack: data.message.data.custom_tech_stack,
        }));
        // Auto-close modal and reset form
        closeDialog();
      } else {
        throw new Error(data.message?.message || "Failed to add skill.");
      }
    } catch (error) {
      console.error("Error adding skill:", error);
      toast.error("Failed to add skill.");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete a skill
  const handleDeleteSkill = async (name: string) => {
    const updatedSkills = (employee?.custom_tech_stack || []).map((skill) =>
      skill.name === name ? { ...skill, skill: "", proficiency_level: "" } : skill
    );

    try {
      setIsSaving(true);
      // Call API to delete the skill
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
      setIsSaving(false);
    }
  };

  const handleSkillSelect = (skill: string) => {
    setSearchTerm(skill);
  };

  const closeDialog = () => {
    setIsAddDialogOpen(false);
    setSearchTerm("");
    setSelectedProficiency("");
  };

  if (loading) {
    return <SkillsMatrixSkeleton />;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Skills Matrix</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAddDialogOpen(true)}
          className="h-8"
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
                    className="flex items-center bg-gray-50 p-2 rounded-md border shadow-sm space-x-2"
                  >
                    <span className="text-gray-800 text-sm">{skill.skill}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSkill(skill.name)}
                      className="h-6 w-6 text-gray-500 hover:text-red-500"
                      disabled={isSaving}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No {level.toLowerCase()} skills added yet.</p>
            )}
          </div>
        ))}
      </div>

      {/* Add Skill Dialog - No backdrop */}
      <Dialog open={isAddDialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-md" showOverlay={false}>
          <DialogHeader>
            <DialogTitle>Add Skill</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Skill Name</label>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter a new skill or search"
              />
              {searchTerm && (
                <div className="max-h-32 overflow-y-auto border rounded-md mt-2 bg-white z-50">
                  {availableSkills
                    .filter((skill) =>
                      skill.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((skill, index) => (
                      <div
                        key={index}
                        className="p-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSkillSelect(skill)}
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
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleAddSkill} disabled={isSaving}>
              {isSaving ? "Saving..." : "Add Skill"}
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
