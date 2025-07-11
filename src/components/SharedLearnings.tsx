import React, { useState, useEffect } from "react";
import { useTestEmployee } from "@/contexts/TestEmployeeContext";
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
  const { employee } = useTestEmployee();
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
  const uniqueEventTypes = Array.from(new Set((allLearnings || []).map(l => l.event_type))).sort();
  const uniqueEmployees = Array.from(new Set((allLearnings || []).map(l => l.employee_name).filter(Boolean))).sort();

  // Check if any operation is in progress
  const isAnyOperationInProgress = isLoading || isSubmitting;

  const fetchAllLearnings = async () => {
    setIsLoading(true);
    try {
      // For test context, use empty array or mock data
      setAllLearnings([]);
      setDataFetched(true);
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
        learning.employee_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Event type filter
    if (selectedEventType !== "all") {
      filtered = filtered.filter(learning => learning.event_type === selectedEventType);
    }

    // Employee filter
    if (selectedEmployee !== "all") {
      filtered = filtered.filter(learning => learning.employee_name === selectedEmployee);
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

  const hasActiveFilters = !!(searchTerm || selectedEventType !== "all" || selectedEmployee !== "all" || showMyLearningsOnly);

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

      // For test context, just show success message
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
      // For test context, just show success message
      toast.success("Shared learning deleted successfully", {
        position: "top-right",
        style: {
          background: "#D1F7C4",
          border: "1px solid #9AE86B",
          color: "#2B7724",
        },
      });
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
      {/* Loading overlay for general loading */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg z-10">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      )}
      
      {/* Loading overlay for API operations (only for submitting, not general loading) */}
      {isSubmitting && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}
      
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
          isDisabled={isAnyOperationInProgress}
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
          <div className="flex justify-end mt-6">
            <Button
              onClick={handleAddNew}
              size="lg"
              disabled={isLoading || isSubmitting}
              className="rounded-md hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4" />
              Add
            </Button>
          </div>
        </>
      )}

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
