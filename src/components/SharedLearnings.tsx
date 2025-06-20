import React, { useState, useEffect } from "react";
import { useEmployeeDetails } from "@/api/employeeService";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import LearningsTable from "./shared-learnings/LearningsTable";
import LearningsFilters from "./shared-learnings/LearningsFilters";
import LearningViewModal from "./shared-learnings/LearningViewModal";
import LearningForm from "./shared-learnings/LearningForm";
import LearningsTableSkeleton from "./shared-learnings/LearningsTableSkeleton";

const BASE_URL = import.meta.env.VITE_BASE_URL;

interface SharedLearning {
  name: string;
  employee?: string;
  employee_name?: string;
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

const ITEMS_PER_PAGE = 10;

const SharedLearnings = () => {
  const { employee } = useEmployeeDetails();
  const [allLearnings, setAllLearnings] = useState<SharedLearning[]>([]);
  const [filteredLearnings, setFilteredLearnings] = useState<SharedLearning[]>([]);
  const [displayedLearnings, setDisplayedLearnings] = useState<SharedLearning[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLearning, setEditingLearning] = useState<SharedLearning | null>(null);
  const [viewingLearning, setViewingLearning] = useState<SharedLearning | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEventType, setSelectedEventType] = useState<string>("all");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [showMyLearningsOnly, setShowMyLearningsOnly] = useState(false);

  // Get unique values for filters
  const uniqueEventTypes = Array.from(new Set(allLearnings.map(l => l.event_type))).sort();
  const uniqueEmployees = Array.from(new Set(allLearnings.map(l => l.employee).filter(Boolean))).sort();

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
    setCurrentPage(1);
  }, [allLearnings, searchTerm, selectedEventType, selectedEmployee, showMyLearningsOnly, employee?.name]);

  // Update displayed learnings based on pagination
  useEffect(() => {
    const startIndex = 0;
    const endIndex = currentPage * ITEMS_PER_PAGE;
    setDisplayedLearnings(filteredLearnings.slice(startIndex, endIndex));
  }, [filteredLearnings, currentPage]);

  const handleShowMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const hasMoreItems = displayedLearnings.length < filteredLearnings.length;

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedEventType("all");
    setSelectedEmployee("all");
    setShowMyLearningsOnly(false);
  };

  const hasActiveFilters = searchTerm || selectedEventType !== "all" || selectedEmployee !== "all" || showMyLearningsOnly;

  const handleView = (learning: SharedLearning) => {
    setViewingLearning(learning);
    setIsViewModalOpen(true);
  };

  const handleEdit = (learning: SharedLearning) => {
    setEditingLearning(learning);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingLearning(null);
    setIsDialogOpen(true);
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

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm relative pb-20">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Shared Learnings</h2>

        <LearningsFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedEventType={selectedEventType}
          setSelectedEventType={setSelectedEventType}
          selectedEmployee={selectedEmployee}
          setSelectedEmployee={setSelectedEmployee}
          showMyLearningsOnly={showMyLearningsOnly}
          setShowMyLearningsOnly={setShowMyLearningsOnly}
          uniqueEventTypes={uniqueEventTypes}
          uniqueEmployees={uniqueEmployees}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
          resultsCount={displayedLearnings.length}
          totalCount={filteredLearnings.length}
        />
      </div>

      {/* Results */}
      {isLoading ? (
        <LearningsTableSkeleton />
      ) : (
        <>
          <LearningsTable
            learnings={displayedLearnings}
            currentEmployee={employee?.name}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
          
          {hasMoreItems && (
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                onClick={handleShowMore}
                disabled={isLoading}
                className="px-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Show More'
                )}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Floating Add Button - Positioned at bottom right */}
      <Button
        onClick={handleAddNew}
        size="lg"
        disabled={isLoading || isSubmitting}
        className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-200 z-50 bg-blue-600 hover:bg-blue-700"
        title="Add New Shared Learning"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Modals */}
      <LearningViewModal
        learning={viewingLearning}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingLearning(null);
        }}
      />

      <LearningForm
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingLearning(null);
        }}
        onSubmit={onSubmit}
        editingLearning={editingLearning}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default SharedLearnings;
