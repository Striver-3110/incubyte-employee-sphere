
import { useEmployeeDetails, useAvailableTechStacks } from "@/api/employeeService";
import { useState, useEffect } from "react";
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
import { TechStack } from "@/api/employeeService";

const proficiencyLevels = ["Expert", "Intermediate", "Beginner", "Learning"];

// Check if employee is in a technical role
const isTechnicalRole = (designation: string | undefined) => {
  if (!designation) return false;
  
  const technicalRoles = [
    'Software Craftsperson',
    'Software Craftsperson - Tech Lead',
    'Software Craftsperson - Tech Advisor',
    'AI Craftsperson',
    'Test Craftsperson',
    'Test Craftsperson (Manual)',
    'Test Craftsperson (Automation)',
    'BQA',
    'Intern'
  ];
  
  return technicalRoles.includes(designation);
};

const SkillsMatrix = () => {
  const { employee, loading } = useEmployeeDetails();
  const { techStacks, loading: loadingTechStacks } = useAvailableTechStacks();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [selectedProficiency, setSelectedProficiency] = useState("");
  const [skills, setSkills] = useState<TechStack[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewSkill, setIsNewSkill] = useState(false);
  
  // Use useEffect to initialize skills when employee data loads
  useEffect(() => {
    if (!loading && employee?.custom_tech_stack && skills.length === 0) {
      setSkills(employee.custom_tech_stack);
    }
  }, [loading, employee, skills.length]);
  
  const isTechnical = isTechnicalRole(employee?.designation);
  const componentTitle = isTechnical ? "Tech Stack" : "Competency Map";
  
  const groupedSkills = skills.reduce((acc: Record<string, TechStack[]>, skill) => {
    const category = skill.proficiency_level;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {});
  
  // Get filtered tech stacks based on search term
  const filteredTechStacks = techStacks.filter(stack => 
    stack.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleAddSkill = () => {
    if ((newSkill || isNewSkill) && selectedProficiency) {
      const skillToAdd = isNewSkill ? searchTerm : newSkill;
      
      if (skillToAdd.trim()) {
        const newItem: TechStack = {
          name: `new-${Date.now()}`,
          skill: skillToAdd.trim(),
          proficiency_level: selectedProficiency as any
        };
        
        setSkills([...skills, newItem]);
        setNewSkill("");
        setSearchTerm("");
        setSelectedProficiency("");
        setIsNewSkill(false);
        setIsAddDialogOpen(false);
        
        // In a real app, this would make an API call to save the new skill
      }
    }
  };

  const handleDeleteSkill = (name: string) => {
    setSkills(skills.filter(s => s.name !== name));
    // In a real app, this would make an API call to delete the skill
  };

  const handleOpenAddDialog = (category: string) => {
    setSelectedCategory(category);
    setSelectedProficiency(category);
    setIsAddDialogOpen(true);
  };

  if (loading) {
    return <SkillsMatrixSkeleton />;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{componentTitle}</h2>
      
      <div className="space-y-6">
        {proficiencyLevels.map((level) => (
          <div key={level} className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-700">{level}</h3>
              <Button 
                onClick={() => handleOpenAddDialog(level)}
                className="h-8"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            
            {groupedSkills[level]?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {groupedSkills[level].map((skill) => (
                  <div key={skill.name} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    <span>{skill.skill}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSkill(skill.name)}
                      className="h-8 w-8 text-gray-500 hover:text-red-500"
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

      {/* Add Skill Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add {selectedCategory} Skill</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Search Skills</label>
              <Input 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsNewSkill(true);
                }}
                placeholder="Type to search or enter a new skill"
              />
            </div>
            
            {searchTerm && (
              <div className="max-h-32 overflow-y-auto border rounded-md">
                {filteredTechStacks.length > 0 ? (
                  <div className="divide-y">
                    {filteredTechStacks.map((stack, index) => (
                      <div 
                        key={index} 
                        className="p-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          setNewSkill(stack);
                          setSearchTerm(stack);
                          setIsNewSkill(false);
                        }}
                      >
                        {stack}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-2 text-sm text-gray-600">
                    No matching skills. You can add "{searchTerm}" as a new skill.
                  </div>
                )}
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium mb-1 block">Proficiency Level</label>
              <Select 
                value={selectedProficiency} 
                onValueChange={setSelectedProficiency}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {proficiencyLevels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSkill}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const SkillsMatrixSkeleton = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <Skeleton className="h-7 w-40 mb-4" />
    
    <div className="space-y-6">
      {Array(4).fill(0).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-8 w-16" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
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
