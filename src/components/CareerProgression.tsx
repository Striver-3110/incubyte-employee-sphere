
import { useEmployee } from "@/contexts/EmployeeContext";
import { formatDate } from "@/utils/dateUtils";
import { Skeleton } from "@/components/ui/skeleton";

type JoiningEntry = {
  title: string;
  role: string;
  pod: string;
  expected_start_date: string;
  expected_end_date: null;
  status: string;
  isJoining: true;
};

type ProjectEntry = {
  name: string;
  title?: string;
  role: string;
  pod: string;
  expected_start_date: string;
  expected_end_date: string | null;
  status: string;
  isJoining?: false;
};

type CareerEntry = JoiningEntry | ProjectEntry;

const CareerProgression = () => {
  const { employee, loading } = useEmployee();

  if (loading || !employee) {
    return <CareerProgressionSkeleton />;
  }

  // Create joining entry
  const joiningEntry: JoiningEntry = {
    title: "Joined Incubyte",
    role: employee.designation || "Employee",
    pod: "—",
    expected_start_date: employee.date_of_joining,
    expected_end_date: null,
    status: "Completed",
    isJoining: true
  };

  // Get projects
  const projects: ProjectEntry[] = [...(employee.custom_project || [])];

  // Combine all entries and sort chronologically (oldest first)
  const allEntries: CareerEntry[] = employee.date_of_joining ? [...projects, joiningEntry] : projects;
  
  // Sort by start date (oldest first for chronological order)
  const sortedEntries = allEntries.sort((a, b) => {
    return new Date(b.expected_start_date).getTime() - new Date(a.expected_start_date).getTime();
  });

  // Type guard to check if entry is joining entry
  const isJoiningEntry = (entry: CareerEntry): entry is JoiningEntry => {
    return 'isJoining' in entry && entry.isJoining === true;
  };

  return (
    <div>
      {sortedEntries.length === 0 ? (
        <p className="text-gray-500 italic">No career progression data available.</p>
      ) : (
        <div className="relative space-y-4">
          {/* Timeline bar */}
          <div className="absolute left-4 top-1 bottom-0 w-0.5 bg-gray-200"></div>

          {sortedEntries.map((entry, index) => (
            <div key={isJoiningEntry(entry) ? 'joining' : (entry.name || index)} className="relative pl-12">
              {/* Timeline dot */}
              <div
                className={`absolute left-2 top-1.5 w-5 h-5 rounded-full border-2 ${
                  isJoiningEntry(entry)
                    ? "bg-blue-500 border-blue-600"
                    : entry.status === "Active"
                    ? "bg-green-500 border-green-600"
                    : "bg-yellow-500 border-yellow-600"
                }`}
              ></div>

              {/* Entry card */}
              <div
                className={`p-4 rounded-lg border ${
                  isJoiningEntry(entry)
                    ? "bg-blue-50 border-blue-200"
                    : entry.status === "Active"
                    ? "bg-green-50 border-green-200"
                    : "bg-yellow-50 border-yellow-200"
                }`}
              >
                <h3 className="font-medium text-gray-800 mb-1">
                  {isJoiningEntry(entry) ? entry.title : (entry.title || entry.name)}
                </h3>
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Role:</span> {entry.role} <br />
                  <span className="font-semibold">Pod:</span> {entry.pod}
                </div>
                <div className="text-sm text-gray-600">
                  {formatDate(entry.expected_start_date)} —{" "}
                  {entry.expected_end_date ? formatDate(entry.expected_end_date) : "Present"}
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
  <div>
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
