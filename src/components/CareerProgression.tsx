import { useEmployeeDetails } from "@/api/employeeService";
import { formatDate } from "@/utils/dateUtils";
import { Skeleton } from "@/components/ui/skeleton";

const CareerProgression = () => {
  const { employee, loading } = useEmployeeDetails();

  if (loading || !employee) {
    return <CareerProgressionSkeleton />;
  }

  // Sort projects by start date (newest first)
  const sortedProjects = [...(employee.custom_project || [])].sort((a, b) => {
    return new Date(b.expected_start_date).getTime() - new Date(a.expected_start_date).getTime();
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Career Progression</h2>

      {sortedProjects.length === 0 ? (
        <p className="text-gray-500 italic">No career progression data available.</p>
      ) : (
        <div className="relative space-y-4">
          {/* Timeline bar */}
          <div className="absolute left-4 top-1 bottom-0 w-0.5 bg-gray-200"></div>

          {sortedProjects.map((project, index) => (
            <div key={project.name || index} className="relative pl-12">
              {/* Timeline dot */}
              <div
                className={`absolute left-2 top-1.5 w-5 h-5 rounded-full border-2 ${
                  project.status === "Active"
                    ? "bg-green-500 border-green-600"
                    : "bg-yellow-500 border-yellow-600"
                }`}
              ></div>

              {/* Project card */}
              <div
                className={`p-4 rounded-lg border ${
                  project.status === "Active"
                    ? "bg-green-50 border-green-200"
                    : "bg-yellow-50 border-yellow-200"
                }`}
              >
                <h3 className="font-medium text-gray-800 mb-1">{project.title || project.name}</h3>
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Role:</span> {project.role} <br />
                  <span className="font-semibold">Pod:</span> {project.pod}
                </div>
                <div className="text-sm text-gray-600">
                  {formatDate(project.expected_start_date)} —{" "}
                  {project.expected_end_date ? formatDate(project.expected_end_date) : "Present"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CareerProgressionSkeleton = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <Skeleton className="h-7 w-40 mb-4" />

    <div className="space-y-6 pl-8">
      <div>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  </div>
);

export default CareerProgression;