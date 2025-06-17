
import React, { useState, useEffect } from "react";
import { useEmployeeDetails } from "@/api/employeeService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash, Calendar as CalendarIcon, ExternalLink } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const BASE_URL = import.meta.env.VITE_BASE_URL;

interface SharedLearning {
  name: string;
  employee?: string;
  event_type: string;
  event_date: string;
  event_description: string;
  event_link?: string;
}

interface SharedLearningFormData {
  event_type: string;
  event_date: Date;
  event_description: string;
  event_link?: string;
}

const eventTypes = [
  "Lightning Talk",
  "GenAI Hour", 
  "Webinar",
  "Workshop",
  "Conference",
  "Tech Talk",
  "Knowledge Sharing Session"
];

const SharedLearnings = () => {
  const { employee } = useEmployeeDetails();
  const [activeTab, setActiveTab] = useState("mine");
  const [myLearnings, setMyLearnings] = useState<SharedLearning[]>([]);
  const [allLearnings, setAllLearnings] = useState<SharedLearning[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLearning, setEditingLearning] = useState<SharedLearning | null>(null);

  const form = useForm<SharedLearningFormData>();

  const fetchMyLearnings = async () => {
    if (!employee?.name) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}incubyte_ui.api.achievements.get_employee_achievements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ employee: employee.name }),
      });

      const data = await response.json();
      if (data.message?.status === "success") {
        setMyLearnings(data.message.achievements || []);
      }
    } catch (error) {
      console.error("Error fetching my learnings:", error);
      toast.error("Failed to fetch your shared learnings");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllLearnings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}incubyte_ui.api.achievements.get_all_achievements`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await response.json();
      if (data.message?.status === "success") {
        setAllLearnings(data.message.achievements || []);
      }
    } catch (error) {
      console.error("Error fetching all learnings:", error);
      toast.error("Failed to fetch all shared learnings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "mine") {
      fetchMyLearnings();
    } else {
      fetchAllLearnings();
    }
  }, [activeTab, employee?.name]);

  const onSubmit = async (data: SharedLearningFormData) => {
    if (!employee?.name) return;

    setIsLoading(true);
    try {
      const payload = {
        employee: employee.name,
        event_type: data.event_type,
        event_date: format(data.event_date, "yyyy-MM-dd"),
        event_description: data.event_description,
        event_link: data.event_link || "",
      };

      let response;
      if (editingLearning) {
        response = await fetch(`${BASE_URL}incubyte_ui.api.achievements.edit_achievement`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name: editingLearning.name, ...payload }),
        });
      } else {
        response = await fetch(`${BASE_URL}incubyte_ui.api.achievements.push_achievement`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
      }

      const result = await response.json();
      if (result.message?.status === "success") {
        toast.success(editingLearning ? "Shared learning updated successfully" : "Shared learning added successfully");
        setIsDialogOpen(false);
        setEditingLearning(null);
        form.reset();
        fetchMyLearnings();
        if (activeTab === "all") fetchAllLearnings();
      } else {
        throw new Error(result.message?.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error saving learning:", error);
      toast.error("Failed to save shared learning");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (name: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}incubyte_ui.api.achievements.delete_achievement`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      });

      const result = await response.json();
      if (result.message?.status === "success") {
        toast.success("Shared learning deleted successfully");
        fetchMyLearnings();
        if (activeTab === "all") fetchAllLearnings();
      } else {
        throw new Error(result.message?.message || "Delete failed");
      }
    } catch (error) {
      console.error("Error deleting learning:", error);
      toast.error("Failed to delete shared learning");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (learning: SharedLearning) => {
    setEditingLearning(learning);
    form.reset({
      event_type: learning.event_type,
      event_date: new Date(learning.event_date),
      event_description: learning.event_description,
      event_link: learning.event_link || "",
    });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingLearning(null);
    form.reset({
      event_type: "",
      event_date: new Date(),
      event_description: "",
      event_link: "",
    });
    setIsDialogOpen(true);
  };

  const renderLearningCard = (learning: SharedLearning, showActions = false) => (
    <Card key={learning.name} className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Badge variant="secondary" className="text-xs font-medium">
              {learning.event_type}
            </Badge>
            <div className="text-sm text-gray-500">
              {format(new Date(learning.event_date), "MMM dd, yyyy")}
            </div>
            {activeTab === "all" && learning.employee && (
              <div className="text-sm font-medium text-blue-600">
                by {learning.employee}
              </div>
            )}
          </div>
          {showActions && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(learning)}
                disabled={isLoading}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(learning.name)}
                disabled={isLoading}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-gray-700 mb-3">{learning.event_description}</p>
        {learning.event_link && (
          <a
            href={learning.event_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
          >
            <ExternalLink className="h-3 w-3" />
            View Resource
          </a>
        )}
      </CardContent>
    </Card>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-12 text-gray-500">
      <div className="text-lg font-medium mb-2">No shared learnings yet</div>
      <p>{message}</p>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Shared Learnings</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingLearning ? "Edit Shared Learning" : "Add Shared Learning"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="event_type"
                  rules={{ required: "Event type is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select event type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {eventTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="event_date"
                  rules={{ required: "Event date is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="event_description"
                  rules={{ required: "Event description is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what was shared..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="event_link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Link (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://..."
                          type="url"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : editingLearning ? "Update" : "Add"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mine">Mine</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value="mine" className="mt-6">
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : myLearnings.length === 0 ? (
            <EmptyState message="You haven't shared any learnings yet. Click the + Add button to get started." />
          ) : (
            <div className="grid gap-4">
              {myLearnings.map((learning) => renderLearningCard(learning, true))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : allLearnings.length === 0 ? (
            <EmptyState message="No shared learnings have been posted yet." />
          ) : (
            <div className="grid gap-4">
              {allLearnings.map((learning) => renderLearningCard(learning, false))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SharedLearnings;
