
import { useEmployeeDetails } from "@/api/employeeService";
import { useState } from "react";
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

const CreativePursuits = () => {
  const { employee, loading } = useEmployeeDetails();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPursuit, setNewPursuit] = useState("");
  const [pursuits, setPursuits] = useState<PassionateAbout[]>([]);
  
  // When employee data loads, initialize pursuits state
  if (!loading && employee && pursuits.length === 0) {
    setPursuits(employee.custom_passionate_about || []);
  }

  const handleAddPursuit = () => {
    if (newPursuit.trim()) {
      const newItem = {
        name: `new-${Date.now()}`,
        passionate_about: newPursuit.trim()
      };
      
      setPursuits([...pursuits, newItem]);
      setNewPursuit("");
      setIsAddDialogOpen(false);
      
      // In a real app, this would make an API call to save the new pursuit
    }
  };

  const handleDeletePursuit = (name: string) => {
    setPursuits(pursuits.filter(p => p.name !== name));
    // In a real app, this would make an API call to delete the pursuit
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
        >
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      {pursuits.length === 0 ? (
        <p className="text-gray-500 italic">No creative pursuits added yet.</p>
      ) : (
        <div className="space-y-2">
          {pursuits.map((pursuit) => (
            <div key={pursuit.name} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
              <span>{pursuit.passionate_about}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeletePursuit(pursuit.name)}
                className="h-8 w-8 text-gray-500 hover:text-red-500"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Creative Pursuit</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input 
              value={newPursuit}
              onChange={(e) => setNewPursuit(e.target.value)}
              placeholder="E.g., Photography, Writing, Playing Guitar..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddPursuit}>Add</Button>
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
