import React, { useState, useEffect } from "react";
import { useEmployeeDetails } from "@/api/employeeService";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash, Calendar as CalendarIcon, ExternalLink, Loader2, Search, Filter, X } from "lucide-react";
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
  custom_event_type?: string;
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
  "Knowledge Sharing Session",
  "Other"
];

const SharedLearnings = () => {
  const { employee } = useEmployeeDetails();
  const [allLearnings, setAllLearnings] = useState<SharedLearning[]>([]);
  const [filteredLearnings, setFilteredLearnings] = useState<SharedLearning[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLearning, setEditingLearning] = useState<SharedLearning | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomEventType, setShowCustomEventType] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEventType, setSelectedEventType] = useState<string>("all");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [showMyLearningsOnly, setShowMyLearningsOnly] = useState(false);

  // Get unique values for filters
  const uniqueEventTypes = Array.from(new Set(allLearnings.map(l => l.event_type))).sort();
  const uniqueEmployees = Array.from(new Set(allLearnings.map(l => l.employee).filter(Boolean))).sort();

  const form = useForm<SharedLearningFormData>();
  const watchEventType = form.watch("event_type");

  useEffect(() => {
    if (watchEventType === "Other") {
      setShowCustomEventType(true);
    } else {
      setShowCustomEventType(false);
      form.setValue("custom_event_type", "");
    }
  }, [watchEventType, form]);

  const fetchAllLearnings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}achievements.get_all_achievements`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await response.json();
      if (data.message?.status === "success") {
        setAllLearnings(data.message.achievements || []);
        setDataFetched(true);
      } else {
        throw new Error(data.message?.message || "Failed to fetch learnings");
      }
    } catch (error) {
      console.error("Error fetching learnings:", error);
      toast.error("Failed to fetch shared learnings", {
        position: "top-right",
        style: {
          background: "#F8D7DA",
          border: "1px solid #F5C6CB",
          color: "#721C24",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!dataFetched) {
      fetchAllLearnings();
    }
  }, [dataFetched]);

  // Apply filters
  useEffect(() => {
    let filtered = [...allLearnings];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(learning => 
        learning.event_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        learning.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        learning.employee?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Event type filter
    if (selectedEventType !== "all") {
      filtered = filtered.filter(learning => learning.event_type === selectedEventType);
    }

    // Employee filter
    if (selectedEmployee !== "all") {
      filtered = filtered.filter(learning => learning.employee === selectedEmployee);
    }

    // My learnings only filter
    if (showMyLearningsOnly && employee?.name) {
      filtered = filtered.filter(learning => learning.employee === employee.name);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

    setFilteredLearnings(filtered);
  }, [allLearnings, searchTerm, selectedEventType, selectedEmployee, showMyLearningsOnly, employee?.name]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedEventType("all");
    setSelectedEmployee("all");
    setShowMyLearningsOnly(false);
  };

  const onSubmit = async (data: SharedLearningFormData) => {
    if (!employee?.name) return;

    setIsSubmitting(true);
    try {
      const eventType = data.event_type === "Other" ? data.custom_event_type : data.event_type;
      
      const payload = {
        employee: employee.name,
        event_type: eventType,
        event_date: format(data.event_date, "yyyy-MM-dd"),
        event_description: data.event_description,
        event_link: data.event_link || "",
      };

      let response;
      if (editingLearning) {
        response = await fetch(`${BASE_URL}achievements.edit_achievement`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name: editingLearning.name, ...payload }),
        });
      } else {
        response = await fetch(`${BASE_URL}achievements.push_achievement`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
      }

      const result = await response.json();
      if (result.message?.status === "success") {
        toast.success(editingLearning ? "Shared learning updated successfully" : "Shared learning added successfully", {
          position: "top-right",
          style: {
            background: "#D1F7C4",
            border: "1px solid #9AE86B",
            color: "#2B7724",
          },
        });
        setIsDialogOpen(false);
        setEditingLearning(null);
        form.reset();
        setShowCustomEventType(false);
        setDataFetched(false);
        fetchAllLearnings();
      } else {
        throw new Error(result.message?.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error saving learning:", error);
      toast.error("Failed to save shared learning", {
        position: "top-right",
        style: {
          background: "#F8D7DA",
          border: "1px solid #F5C6CB",
          color: "#721C24",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (name: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}achievements.delete_achievement`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      });

      const result = await response.json();
      if (result.message?.status === "success") {
        toast.success("Shared learning deleted successfully", {
          position: "top-right",
          style: {
            background: "#D1F7C4",
            border: "1px solid #9AE86B",
            color: "#2B7724",
          },
        });
        setDataFetched(false);
        fetchAllLearnings();
      } else {
        throw new Error(result.message?.message || "Delete failed");
      }
    } catch (error) {
      console.error("Error deleting learning:", error);
      toast.error("Failed to delete shared learning", {
        position: "top-right",
        style: {
          background: "#F8D7DA",
          border: "1px solid #F5C6CB",
          color: "#721C24",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (learning: SharedLearning) => {
    setEditingLearning(learning);
    const isCustomType = !eventTypes.includes(learning.event_type) || learning.event_type === "Other";
    
    form.reset({
      event_type: isCustomType ? "Other" : learning.event_type,
      custom_event_type: isCustomType ? learning.event_type : "",
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
      custom_event_type: "",
      event_date: new Date(),
      event_description: "",
      event_link: "",
    });
    setShowCustomEventType(false);
    setIsDialogOpen(true);
  };

  const canEditDelete = (learning: SharedLearning) => {
    return employee?.name === learning.employee;
  };

  const renderLearningCard = (learning: SharedLearning) => (
    <Card key={learning.name} className="shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-xs font-medium">
                {learning.event_type}
              </Badge>
              <div className="text-sm text-gray-500">
                {format(new Date(learning.event_date), "MMM dd, yyyy")}
              </div>
            </div>
            {learning.employee && (
              <div className="text-sm font-medium text-blue-600">
                by {learning.employee}
              </div>
            )}
          </div>
          {canEditDelete(learning) && (
            <div className="flex gap-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(learning)}
                disabled={isLoading || isSubmitting}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(learning.name)}
                disabled={isLoading || isSubmitting}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-gray-700 mb-3 leading-relaxed">{learning.event_description}</p>
        {learning.event_link && (
          <a
            href={learning.event_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            View Resource
          </a>
        )}
      </CardContent>
    </Card>
  );

  const SharedLearningsSkeleton = () => (
    <div className="grid gap-4">
      {[...Array(3)].map((_, index) => (
        <Card key={index} className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-3" />
            <Skeleton className="h-4 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-12 text-gray-500">
      <div className="text-lg font-medium mb-2">No shared learnings found</div>
      <p>
        {searchTerm || selectedEventType !== "all" || selectedEmployee !== "all" || showMyLearningsOnly
          ? "Try adjusting your filters to see more results."
          : "No shared learnings have been posted yet."}
      </p>
    </div>
  );

  const hasActiveFilters = searchTerm || selectedEventType !== "all" || selectedEmployee !== "all" || showMyLearningsOnly;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Shared Learnings</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} size="sm" disabled={isLoading || isSubmitting}>
              <Plus className="h-4 w-4 mr-1" />
              Add Learning
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" showOverlay={false}>
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

                {showCustomEventType && (
                  <FormField
                    control={form.control}
                    name="custom_event_type"
                    rules={{ required: showCustomEventType ? "Custom event type is required" : false }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Event Type</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter custom event type..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

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
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingLearning ? "Updating..." : "Adding..."}
                      </>
                    ) : (
                      editingLearning ? "Update" : "Add"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Section */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search learnings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Event Type Filter */}
          <Select value={selectedEventType} onValueChange={setSelectedEventType}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Event Types</SelectItem>
              {uniqueEventTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Employee Filter */}
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {uniqueEmployees.map((emp) => (
                <SelectItem key={emp} value={emp!}>
                  {emp}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showMyLearningsOnly}
                onChange={(e) => setShowMyLearningsOnly(e.target.checked)}
                className="rounded"
              />
              My learnings only
            </label>
          </div>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="self-start sm:self-auto"
            >
              <X className="h-4 w-4 mr-1" />
              Clear Filters
            </Button>
          )}
        </div>

        {hasActiveFilters && (
          <div className="text-sm text-gray-600">
            Showing {filteredLearnings.length} of {allLearnings.length} learnings
          </div>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <SharedLearningsSkeleton />
      ) : filteredLearnings.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4">
          {filteredLearnings.map((learning) => renderLearningCard(learning))}
        </div>
      )}
    </div>
  );
};

export default SharedLearnings;
