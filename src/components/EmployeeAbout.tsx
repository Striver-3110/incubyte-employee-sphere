
import { useState } from "react";
import { useTestEmployee } from "@/contexts/TestEmployeeContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { User, Edit, Save, X } from "lucide-react";
import { toast } from "sonner";

const EmployeeAbout = () => {
  const { employee, loading, setEmployee } = useTestEmployee();
  const [isEditing, setIsEditing] = useState(false);
  const [editedAbout, setEditedAbout] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (loading || !employee) {
    return <EmployeeAboutSkeleton />;
  }

  if (!employee.custom_about && !isEditing) {
    return null;
  }

  const handleEdit = () => {
    setEditedAbout(employee.custom_about || "");
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // Mock save for test data
      setEmployee((prevEmployee) => ({
        ...prevEmployee!,
        custom_about: editedAbout,
      }));
      
      toast.success("About section updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating about:", error);
      toast.error("Failed to update about section");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedAbout("");
    setIsEditing(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-50 rounded-md flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          About
        </h2>
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <Textarea
            value={editedAbout}
            onChange={(e) => setEditedAbout(e.target.value)}
            placeholder="Tell us about yourself..."
            className="min-h-[100px] resize-none"
            disabled={isSaving}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-gray-700 leading-relaxed">
          {employee.custom_about || "No information provided yet."}
        </p>
      )}
    </div>
  );
};

const EmployeeAboutSkeleton = () => (
  <div className="bg-white p-6 rounded-lg border border-gray-200">
    <div className="flex items-center gap-2 mb-4">
      <Skeleton className="h-6 w-6 rounded-md" />
      <Skeleton className="h-5 w-16" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  </div>
);

export default EmployeeAbout;
