import React, { useState } from "react";
import { useEmployeeDetails } from "@/api/employeeService";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Edit, Check, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const AboutSection = () => {
  const { employee, loading, error, setEmployee } = useEmployeeDetails(); // Added `setEmployee` to update the employee state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // State to track saving progress

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Call the API to update the "About" section
      const response = await fetch(`${BASE_URL}user.set_employee_details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          custom_about: employee?.custom_about, // Use the existing `employee` object
        }),
        credentials: "include", // Include cookies for authentication
      });

      const aboutData = await response.json();

      // Check if the response indicates success
      if (aboutData.message?.status === "success") {
        toast.success(aboutData.message.message || "About section updated successfully");

        // Update the employee state with the new "About" value
        setEmployee((prevEmployee) => ({
          ...prevEmployee,
          custom_about: aboutData.message.data.custom_about,
        }));

        setIsEditing(false); // Exit editing mode
      } else {
        throw new Error(aboutData.message?.message || "Failed to update About section");
      }
    } catch (error) {
      console.error("Error updating About section:", error);
      toast.error("Failed to update About section");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !employee) {
    return <AboutSkeleton />;
  }

  if (error) {
    return <p className="text-red-500">Error loading employee details: {error}</p>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">About</h2>
        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1"
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
        )}
      </div>

      {isEditing ? (
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
            disabled={isSaving} // Disable textarea while saving
          />
          <div className="flex justify-end gap-2 mt-3">
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              disabled={isSaving} // Disable cancel button while saving
            >
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : <><Check className="h-4 w-4 mr-1" /> Save</>}
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-gray-600 whitespace-pre-line">
          {employee.custom_about || "No information provided."}
        </p>
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