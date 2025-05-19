
import { useEmployeeDetails } from "@/api/employeeService";
import { Skeleton } from "@/components/ui/skeleton";

const AboutSection = () => {
  const { employee, loading } = useEmployeeDetails();

  if (loading || !employee) {
    return <AboutSkeleton />;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">About</h2>
      <p className="text-gray-600 whitespace-pre-line">
        {employee.custom_about || "No information provided."}
      </p>
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
