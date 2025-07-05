import React, { useState } from "react";
import { useEmployee } from "@/contexts/EmployeeContext";
import { fetchEmployeeDetails } from "@/api/employeeService";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Edit, Check, X, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Define the character limit before showing "See More"
const CHARACTER_LIMIT = 150;

const AboutSection = () => {
  const { employee, loading, error, setEmployee, isViewingOtherEmployee } = useEmployee();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSave = async () => {
    // Validate input - don't allow empty or whitespace-only content
    const trimmedAbout = employee?.custom_about?.trim();
    
    console.log(trimmedAbout, "\nEmployee\n", employee)
    if (!trimmedAbout) {
      toast.error("About section cannot be empty.", {
        position: "top-right",
        style: {
          background: "#F8D7DA",
          border: "1px solid #F5C6CB",
          color: "#721C24",
        },
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${BASE_URL}user.set_employee_details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          custom_about: trimmedAbout,
        }),
        credentials: "include",
      });

      const aboutData = await response.json();

      if (aboutData.message?.status === "success") {
        toast.success(aboutData.message.message || "About section updated successfully", {
          position: "top-right",
          style: {
            background: "#D1F7C4",
            border: "1px solid #9AE86B",
            color: "#2B7724",
          },
        });
        
        try {
          const updatedEmployeeData = await fetchEmployeeDetails();
          setEmployee(updatedEmployeeData);
        } catch (fetchError) {
          console.error("Error fetching updated employee data:", fetchError);
        }
        
        setIsEditing(false);
      } else {
        throw new Error(aboutData.message?.message || "Failed to update About section");
      }
    } catch (error) {
      console.error("Error updating About section:", error);
      toast.error("Failed to update About section", {
        position: "top-right",
        style: {
          background: "#F8D7DA",
          border: "1px solid #F5C6CB",
          color: "#721C24",
        },
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isSaveDisabled = !employee?.custom_about?.trim() || isSaving;

  if (loading || !employee) {
    return <AboutSkeleton />;
  }

  if (error) {
    return <p className="text-red-500">Error loading employee details: {error}</p>;
  }

  const aboutText = employee.custom_about || "No information provided.";
  const shouldShowSeeMore = aboutText.length > CHARACTER_LIMIT;
  const displayText = !isExpanded && shouldShowSeeMore 
    ? `${aboutText.slice(0, CHARACTER_LIMIT)}...` 
    : aboutText;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm relative">
      {isSaving && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg z-10">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      )}
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">About</h2>
        {!isEditing && !isViewingOtherEmployee && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1"
            disabled={isSaving}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
        )}
      </div>

      {isEditing && !isViewingOtherEmployee ? (
        <div>
          <Textarea
            value={employee.custom_about || ""}
            onChange={(e) =>
              setEmployee((prevEmployee) => ({
                ...prevEmployee,
                custom_about: e.target.value,
              }))
            }
            placeholder="Write something about yourself..."
            className="min-h-[100px] w-full"
            disabled={isSaving}
          />
          <div className="flex justify-end gap-2 mt-3">
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaveDisabled}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" /> Save
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-gray-600 whitespace-pre-line">
            {displayText}
          </p>
          {shouldShowSeeMore && (
            <span
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              {isExpanded ? (
                <>
                  See Less
                </>
              ) : (
                <>
                  See More
                </>
              )}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const AboutSkeleton = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <Skeleton className="h-7 w-32 mb-4" />
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-3/4" />
  </div>
);

export default AboutSection;