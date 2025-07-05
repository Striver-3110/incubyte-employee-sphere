import React, { useState } from "react";
import { useTestEmployee } from "@/contexts/TestEmployeeContext";
import { fetchEmployeeDetails } from "@/api/employeeService";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Edit, Check, X, Loader2, User } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const CHARACTER_LIMIT = 150;

const AboutSection = () => {
  const { employee, loading, error, setEmployee, isViewingOtherEmployee } = useTestEmployee();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSave = async () => {
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
    <div className="bg-white p-8 rounded-xl shadow-sm border border-borderSoft relative">
      {isSaving && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl z-10">
          <Loader2 className="h-8 w-8 animate-spin text-brandBlue" />
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-brandBlueDarkest flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-brandBlue to-brandBlueLighter rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          About Me
        </h2>
        {!isEditing && !isViewingOtherEmployee && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 border-brandBlue/20 text-brandBlue hover:bg-brandBlue hover:text-white transition-all duration-200"
            disabled={isSaving}
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        )}
      </div>

      {isEditing && !isViewingOtherEmployee ? (
        <div className="space-y-4">
          <Textarea
            value={employee.custom_about || ""}
            onChange={(e) =>
              setEmployee((prevEmployee) => ({
                ...prevEmployee,
                custom_about: e.target.value,
              }))
            }
            placeholder="Write something about yourself..."
            className="min-h-[120px] w-full border-borderSoft focus-visible:ring-brandBlue focus-visible:border-brandBlue"
            disabled={isSaving}
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
              className="border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaveDisabled}
              className="bg-brandBlue hover:bg-brandBlueDark text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" /> Save
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-highlightBg p-6 rounded-lg border border-borderMid">
            <p className="text-brandBlueDarker whitespace-pre-line leading-relaxed">
              {displayText}
            </p>
            {shouldShowSeeMore && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-3 text-brandBlue hover:text-brandBlueDark font-medium transition-colors duration-200"
              >
                {isExpanded ? "Show Less" : "Show More"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const AboutSkeleton = () => (
  <div className="bg-white p-8 rounded-xl shadow-sm border border-borderSoft">
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-8 w-32" />
      </div>
      <Skeleton className="h-8 w-16" />
    </div>
    <div className="bg-highlightBg p-6 rounded-lg border border-borderMid space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  </div>
);

export default AboutSection;
