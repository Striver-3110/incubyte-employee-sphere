
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchAllEmployees, fetchFeedbackTemplates, useEmployeeDetails } from "@/api/employeeService";
import { toast } from "sonner";
import { X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EmployeeDropdown } from "./EmployeeDropdown";

const BASE_URL = import.meta.env.VITE_BASE_URL;

interface Employee {
  name: string;
  employee_name: string;
}

interface FeedbackInitiationProps {
  onClose: () => void;
  onSuccess?: () => Promise<void>;
}

// Function to seek feedback
const seekFeedbackForm = async (employee: string, reviewers: string[]) => {
  try {
    const response = await fetch(`${BASE_URL}user.seek_feedback_form`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employee,
        reviewers
      }),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to seek feedback');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error seeking feedback:', error);
    throw error;
  }
};

export const FeedbackInitiation: React.FC<FeedbackInitiationProps> = ({ onClose, onSuccess }) => {
  const { employee: currentEmployee } = useEmployeeDetails();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const employeesData = await fetchAllEmployees();
        
        console.log('Loaded employees:', employeesData);
        
        // Ensure we always have arrays, even if API returns null/undefined
        setEmployees(Array.isArray(employeesData) ? employeesData : []);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load data");
        // Set empty arrays as fallback
        setEmployees([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);
  
  // Filter out already selected employees with better safety checks
  const availableEmployees = React.useMemo(() => {
    console.log('Computing available employees, all employees:', employees);
    console.log('Selected employees:', selectedEmployees);
    
    if (!Array.isArray(employees)) {
      console.log('Employees is not an array:', employees);
      return [];
    }
    
    const filtered = employees.filter(employee => {
      // Skip if employee is null/undefined or missing required fields
      if (!employee || typeof employee !== 'object' || !employee.name) {
        console.log('Skipping invalid employee:', employee);
        return false;
      }
      
      // Skip if already selected
      const isSelected = selectedEmployees.some(selected => 
        selected && selected.name === employee.name
      );
      
      // Skip if it's the current employee (can't seek feedback from yourself)
      const isCurrentEmployee = currentEmployee && employee.name === currentEmployee.name;
      
      return !isSelected && !isCurrentEmployee;
    });
    
    console.log('Available employees after filtering:', filtered);
    return filtered;
  }, [employees, selectedEmployees, currentEmployee]);

  const handleRemoveEmployee = (employeeId: string) => {
    setSelectedEmployees(prev => prev.filter(emp => emp?.name !== employeeId));
  };

  const handleAddEmployee = (employee: Employee) => {
    console.log('Adding employee:', employee);
    if (employee && employee.name) {
      setSelectedEmployees(prev => [...prev, employee]);
      setOpen(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedEmployees.length === 0 || !currentEmployee) {
      toast.error("Please select at least one employee to seek feedback from");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedEmployeeIds = selectedEmployees.map(emp => emp.name).filter(Boolean);
      await seekFeedbackForm(currentEmployee.name, selectedEmployeeIds);
      toast.success("Feedback request sent successfully!", {
        position: "top-right",
        style: {
          background: "#F0F9FF",
          border: "1px solid #BAE6FD",
          color: "#1E40AF",
        },
      });
      
      // Call onSuccess if provided to refresh feedback data
      if (onSuccess) {
        await onSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error("Error seeking feedback:", error);
      toast.error("Failed to send feedback request", {
        position: "top-right",
        style: {
          background: "#F0F9FF",
          border: "1px solid #BAE6FD",
          color: "#1E40AF",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <DialogHeader>
          <DialogTitle>Seek Feedback</DialogTitle>
        </DialogHeader>
        <div className="text-center py-8">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle>Seek Feedback</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {/* Select employees to seek feedback from - Multi-select with chips */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Select employee from whom you want to seek feedback <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <div 
                  className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[80px] cursor-text focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                  onClick={() => setOpen(true)}
                >
                  {selectedEmployees.length > 0 && selectedEmployees.map(employee => (
                    employee?.name && (
                      <Badge 
                        key={employee.name} 
                        variant="secondary" 
                        className="px-2 py-1 flex items-center gap-1"
                      >
                        {employee.employee_name || employee.name}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-destructive" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveEmployee(employee.name);
                          }} 
                        />
                      </Badge>
                    )
                  ))}
                  <div className={cn(
                    "flex-1 h-8 flex items-center",
                    !selectedEmployees.length && "w-full"
                  )}>
                    <span className="text-muted-foreground text-sm">
                      {selectedEmployees.length ? "Add more employees..." : "Search employees..."}
                    </span>
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <EmployeeDropdown
                  employees={availableEmployees}
                  onSelect={handleAddEmployee}
                  placeholder="Search employees..."
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-gray-500 mt-1">
              Selected: {selectedEmployees.length} employee(s)
            </p>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || selectedEmployees.length === 0}
        >
          {isSubmitting ? "Sending..." : "Send Feedback Request"}
        </Button>
      </DialogFooter>
    </div>
  );
};
