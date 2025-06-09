
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchAllEmployees, fetchFeedbackTemplates, sendFeedbackForm } from "@/api/employeeService";
import { toast } from "sonner";
import { X, Check } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Employee {
  name: string;
  employee_name: string;
}

interface FeedbackTemplate {
  name: string;
}

interface FeedbackInitiationProps {
  onClose: () => void;
}

export const FeedbackInitiation: React.FC<FeedbackInitiationProps> = ({ onClose }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [feedbackTemplates, setFeedbackTemplates] = useState<FeedbackTemplate[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [employeesData, templatesData] = await Promise.all([
          fetchAllEmployees(),
          fetchFeedbackTemplates()
        ]);
        
        // Ensure we always have arrays, even if API returns null/undefined
        setEmployees(Array.isArray(employeesData) ? employeesData : []);
        setFeedbackTemplates(Array.isArray(templatesData) ? templatesData : []);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load data");
        // Set empty arrays as fallback
        setEmployees([]);
        setFeedbackTemplates([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);
  
  // Filter out already selected employees
  const availableEmployees = React.useMemo(() => {
    if (!Array.isArray(employees)) return [];
    
    return employees.filter(employee => {
      // Skip if employee is null/undefined or missing required fields
      if (!employee || !employee.name) return false;
      
      // Skip if already selected
      return !selectedEmployees.some(selected => selected?.name === employee?.name);
    });
  }, [employees, selectedEmployees]);

  const handleRemoveEmployee = (employeeId: string) => {
    setSelectedEmployees(prev => prev.filter(emp => emp?.name !== employeeId));
  };

  const handleAddEmployee = (employee: Employee) => {
    if (employee && employee.name) {
      setSelectedEmployees(prev => [...prev, employee]);
      setOpen(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedEmployee || selectedEmployees.length === 0 || !selectedTemplate) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedEmployeeIds = selectedEmployees.map(emp => emp.name).filter(Boolean);
      await sendFeedbackForm(selectedEmployee, selectedEmployeeIds, selectedTemplate);
      toast.success("Feedback form sent successfully!");
      onClose();
    } catch (error) {
      console.error("Error sending feedback form:", error);
      toast.error("Failed to send feedback form");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <DialogHeader>
          <DialogTitle>Initiate Feedback</DialogTitle>
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
        <DialogTitle>Initiate Feedback</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {/* Select employee to give feedback for */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            For which employee? <span className="text-red-500">*</span>
          </label>
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger>
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((employee) => (
                employee?.name && (
                  <SelectItem key={employee.name} value={employee.name}>
                    {employee.employee_name || employee.name} ({employee.name})
                  </SelectItem>
                )
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Select employees to give feedback - Multi-select with chips */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Select employees to provide feedback <span className="text-red-500">*</span>
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
                <Command>
                  <CommandInput placeholder="Search employees..." />
                  <CommandEmpty>No employee found.</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-y-auto">
                    {availableEmployees.map((employee) => (
                      <CommandItem 
                        key={employee.name}
                        value={`${employee.employee_name || employee.name} ${employee.name}`}
                        onSelect={() => handleAddEmployee(employee)}
                        className="flex items-center gap-2"
                      >
                        <Check className="mr-2 h-4 w-4 opacity-0" />
                        {employee.employee_name || employee.name} ({employee.name})
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            <p className="text-xs text-gray-500 mt-1">
              Selected: {selectedEmployees.length} employee(s)
            </p>
          </div>
        </div>

        {/* Select feedback template */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Feedback Template <span className="text-red-500">*</span>
          </label>
          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <SelectTrigger>
              <SelectValue placeholder="Select feedback template" />
            </SelectTrigger>
            <SelectContent>
              {feedbackTemplates.map((template) => (
                template?.name && (
                  <SelectItem key={template.name} value={template.name}>
                    {template.name}
                  </SelectItem>
                )
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || !selectedEmployee || selectedEmployees.length === 0 || !selectedTemplate}
        >
          {isSubmitting ? "Sending..." : "Send Feedback Form"}
        </Button>
      </DialogFooter>
    </div>
  );
};
