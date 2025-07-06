
import { useTestEmployee } from "@/contexts/TestEmployeeContext";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "lucide-react";

const EmployeeAbout = () => {
  const { employee, loading } = useTestEmployee();

  if (loading || !employee) {
    return <EmployeeAboutSkeleton />;
  }

  if (!employee.custom_about) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <div className="w-6 h-6 bg-blue-50 rounded-md flex items-center justify-center">
          <User className="w-4 h-4 text-blue-600" />
        </div>
        About
      </h2>
      <p className="text-gray-700 leading-relaxed">{employee.custom_about}</p>
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
