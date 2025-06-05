import React, { useState, useEffect } from "react";
import { useEmployeeDetails } from "@/api/employeeService";
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
  const { employee, loading, setEmployee } = useEmployeeDetails();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPursuit, setNewPursuit] = useState("");
  const [pursuits, setPursuits] = useState<PassionateAbout[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Use useEffect to set pursuits state when employee data loads
  useEffect(() => {
    if (!loading && employee?.custom_passionate_about) {
      setPursuits(employee.custom_passionate_about);
    }
  }, [loading, employee]);

  const updatePursuitsInAPI = async (updatedPursuits: PassionateAbout[]) => {
    setIsSaving(true);
    try {
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
        toast.success("Pursuits updated successfully.");
        setEmployee((prev) => ({
          ...prev,
          custom_passionate_about: data.message.data.custom_passionate_about,
        }));
        setPursuits(data.message.data.custom_passionate_about);
      } else {
        throw new Error(data.message?.message || "Failed to update pursuits.");
      }
    } catch (error) {
      console.error("Error updating pursuits:", error);
      toast.error("Failed to update creative pursuits.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPursuit = async () => {
    const trimmedPursuit = newPursuit.trim();

    if (!trimmedPursuit) {
      toast.error("Pursuit cannot be empty.");
      return;
    }

    // Check for duplicates in a case-insensitive manner
    const isDuplicate = pursuits.some(
      (pursuit) =>
        pursuit.passionate_about.trim().toLowerCase() === trimmedPursuit.toLowerCase()
    );

    if (isDuplicate) {
      toast.error(`"${newPursuit}" already exists as a creative pursuit.`);
      return;
    }

    const newItem = {
      passionate_about: trimmedPursuit,
    };

    const updatedPursuits = [...pursuits, newItem];
    setNewPursuit("");
    setIsAddDialogOpen(false);
    await updatePursuitsInAPI(updatedPursuits);
  };

  const handleDeletePursuit = async (name: string) => {
    const updatedPursuits = pursuits.filter((p) => p.name !== name);
    await updatePursuitsInAPI(updatedPursuits);
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeletePursuit(pursuit.name)}
                className="h-8 w-8 text-gray-500 hover:text-red-500"
                disabled={isSaving}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add Dialog */}
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
            <Button onClick={handleAddPursuit} disabled={isSaving}>
              {isSaving ? "Saving..." : "Add"}
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
