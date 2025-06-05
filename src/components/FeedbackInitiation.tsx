
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Users, Send } from "lucide-react";
import { fetchAllEmployees, fetchFeedbackTemplates, sendFeedbackForm, Employee, FeedbackTemplate } from "@/api/employeeService";
import { useToast } from "@/hooks/use-toast";

interface FeedbackInitiationProps {
  currentEmployeeId: string;
  onSuccess: () => void;
}

const FeedbackInitiation = ({ currentEmployeeId, onSuccess }: FeedbackInitiationProps) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [templates, setTemplates] = useState<FeedbackTemplate[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [employeesData, templatesData] = await Promise.all([
          fetchAllEmployees(),
          fetchFeedbackTemplates()
        ]);
        setEmployees(employeesData);
        setTemplates(templatesData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const filteredEmployees = employees.filter(emp => 
    emp.name !== currentEmployeeId && 
    emp.employee_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map(emp => emp.name));
    }
  };

  const handleSubmit = async () => {
    if (selectedEmployees.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one employee.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTemplate) {
      toast({
        title: "Error",
        description: "Please select a feedback template.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await sendFeedbackForm(currentEmployeeId, selectedEmployees, selectedTemplate);
      toast({
        title: "Success",
        description: "Feedback forms have been sent successfully!",
      });
      
      // Reset form
      setSelectedEmployees([]);
      setSelectedTemplate("");
      setSearchTerm("");
      
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send feedback forms. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Initiate Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Initiate Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Selection */}
        <div className="space-y-2">
          <Label htmlFor="template-select">Feedback Template</Label>
          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <SelectTrigger>
              <SelectValue placeholder="Select feedback template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.name} value={template.name}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Employee Selection */}
        <div className="space-y-2">
          <Label>Select Employees</Label>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Select All */}
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="select-all"
              checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="select-all" className="text-sm font-medium">
              Select All ({filteredEmployees.length} employees)
            </Label>
          </div>

          {/* Employee List */}
          <ScrollArea className="h-64 border rounded-md p-2">
            <div className="space-y-2">
              {filteredEmployees.map((employee) => (
                <div key={employee.name} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                  <Checkbox
                    id={employee.name}
                    checked={selectedEmployees.includes(employee.name)}
                    onCheckedChange={() => handleEmployeeToggle(employee.name)}
                  />
                  <Label htmlFor={employee.name} className="flex-1 cursor-pointer">
                    <div>
                      <div className="font-medium">{employee.employee_name}</div>
                      <div className="text-sm text-gray-500">{employee.name}</div>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Selected Count */}
          {selectedEmployees.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Users className="h-4 w-4" />
              {selectedEmployees.length} employee(s) selected
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || selectedEmployees.length === 0 || !selectedTemplate}
          className="w-full"
        >
          {isSubmitting ? "Sending..." : "Send Feedback Forms"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FeedbackInitiation;
