
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchAllEmployees, fetchFeedbackTemplates, sendFeedbackForm } from "@/api/employeeService";
import { toast } from "sonner";

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
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [employeesData, templatesData] = await Promise.all([
          fetchAllEmployees(),
          fetchFeedbackTemplates()
        ]);
        setEmployees(employeesData);
        setFeedbackTemplates(templatesData);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSubmit = async () => {
    if (!selectedEmployee || selectedEmployees.length === 0 || !selectedTemplate) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await sendFeedbackForm(selectedEmployee, selectedEmployees, selectedTemplate);
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
                <SelectItem key={employee.name} value={employee.name}>
                  {employee.employee_name} ({employee.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Select employees to give feedback */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Select employees to provide feedback <span className="text-red-500">*</span>
          </label>
          <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
            {employees.map((employee) => (
              <div key={employee.name} className="flex items-center space-x-2">
                <Checkbox
                  id={employee.name}
                  checked={selectedEmployees.includes(employee.name)}
                  onCheckedChange={() => handleEmployeeToggle(employee.name)}
                />
                <label htmlFor={employee.name} className="text-sm cursor-pointer">
                  {employee.employee_name} ({employee.name})
                </label>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Selected: {selectedEmployees.length} employee(s)
          </p>
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
                <SelectItem key={template.name} value={template.name}>
                  {template.name}
                </SelectItem>
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
