import React, { useState, useEffect } from "react";
import { useEmployee } from "@/contexts/EmployeeContext";
import { fetchEmployeeDetails } from "@/api/employeeService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PassionateAbout } from "@/api/employeeService";
import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const CreativePursuits = () => {
  const { employee, loading, setEmployee } = useEmployee();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPursuit, setNewPursuit] = useState("");
  const [pursuits, setPursuits] = useState<PassionateAbout[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingPursuit, setDeletingPursuit] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && employee?.custom_passionate_about) {
      setPursuits(employee.custom_passionate_about);
      console.log("Updated pursuits from employee data:", employee.custom_passionate_about);
    }
  }, [loading, employee?.custom_passionate_about]);

  const updatePursuitsInAPI = async (updatedPursuits: PassionateAbout[]) => {
    setIsSaving(true);
    try {
      console.log("Updating pursuits:", updatedPursuits);

      const response = await fetch(`${BASE_URL}user.set_employee_details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          custom_passionate_about: updatedPursuits,
        }),
        credentials: "include",
      });
      const data = await response.json();
      if (data.message?.status === "success") {

        toast.success("Creative pursuits updated successfully", {
          position: "top-right",
          style: {
            background: "#D1F7C4",
            border: "1px solid #9AE86B",
            color: "#2B7724",
          },
        });

        // Refresh employee data after successful update
        try {
          const updatedEmployeeData = await fetchEmployeeDetails();
          setEmployee(updatedEmployeeData);
        } catch (fetchError) {
          console.error("Error fetching updated employee data:", fetchError);
        }
      } else {
        throw new Error(data.message?.message || "Failed to update pursuits.");
      }
    } catch (error) {
      console.error("Error updating pursuits:", error);
      toast.error("Failed to update creative pursuits", {
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

  const handleAddPursuit = async () => {
    const trimmedPursuit = newPursuit.trim();

    if (!trimmedPursuit) {
      toast.error("Creative pursuit cannot be empty", {
        position: "top-right",
        style: {
          background: "#F8D7DA",
          border: "1px solid #F5C6CB",
          color: "#721C24",
        },
      });
      return;
    }

    const isDuplicate = pursuits.some(
      (pursuit) =>
        pursuit.passionate_about.trim().toLowerCase() === trimmedPursuit.toLowerCase()
    );

    if (isDuplicate) {
      toast.error(`"${trimmedPursuit}" already exists as a creative pursuit`, {
        position: "top-right",
        style: {
          background: "#F8D7DA",
          border: "1px solid #F5C6CB",
          color: "#721C24",
        },
      });
      return;
    }

    const newItem = {
      passionate_about: trimmedPursuit,
    };

    const updatedPursuits = [...pursuits, newItem];
    setNewPursuit("");
    setIsAddDialogOpen(false);
    await updatePursuitsInAPI(updatedPursuits);
    window.location.reload();

  };

  const handleDeletePursuit = async (name: string) => {
    const updatedPursuits = pursuits.filter((p) => p.name !== name);
    setDeletingPursuit(name);
    await updatePursuitsInAPI(updatedPursuits);
    setDeletingPursuit(null);
  };

  if (loading) {
    return <CreativePursuitsSkeleton />;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Creative Pursuits</h2>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="h-8"
          size="sm"
          disabled={isSaving}
        >
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      {pursuits.length === 0 ? (
        <p className="text-gray-500 italic">No creative pursuits added yet.</p>
      ) : (
        <div className="space-y-2">
          {pursuits.map((pursuit) => (
            <div
              key={pursuit.name}
              className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
            >
              <span>{pursuit.passionate_about}</span>
              {deletingPursuit === pursuit.name ? (
                <div className="h-8 w-8 flex items-center justify-center">
                  <div className="h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeletePursuit(pursuit.name)}
                  className="h-8 w-8 text-gray-500 hover:text-red-500"
                  disabled={isSaving || deletingPursuit !== null}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]" showOverlay={false}>
          <DialogHeader>
            <DialogTitle>Add Creative Pursuit</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newPursuit}
              onChange={(e) => setNewPursuit(e.target.value)}
              placeholder="E.g., Photography, Writing, Playing Guitar..."
              disabled={isSaving}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleAddPursuit} disabled={isSaving || !newPursuit.trim()}>
              {isSaving ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Adding...
                </>
              ) : (
                "Add"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const CreativePursuitsSkeleton = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <div className="flex justify-between items-center mb-4">
      <Skeleton className="h-7 w-40" />
      <Skeleton className="h-8 w-16" />
    </div>
    <Skeleton className="h-12 w-full mb-2" />
    <Skeleton className="h-12 w-full mb-2" />
    <Skeleton className="h-12 w-full" />
  </div>
);

export default CreativePursuits;
