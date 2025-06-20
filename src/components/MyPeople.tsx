import { useEmployee } from "@/contexts/EmployeeContext";
import { Skeleton } from "@/components/ui/skeleton";
import { shouldShowTechAdvisor, isTechnicalRole } from "@/utils/roleUtils";

const BASE_URL = import.meta.env.VITE_BASE_URL;

interface PeopleItemProps {
  label: string;
  value: string;
}

const PeopleItem = ({ label, value }: PeopleItemProps) => (
  <div className="flex  items-center gap-2">
    <span className="text-md font-semibold text-gray-800">{label}:</span>
    <span className="text-md text-gray-800">{value || "—"}</span>
  </div>
);

const MyPeople = () => {
  const { employee, loading: employeeLoading } = useEmployee();

  // Check if the employee is in a technical role based on role utils
  const isTechnical = employee ? isTechnicalRole(employee.designation) : false;

  // Check if tech advisor should be shown
  const showTechAdvisor = employee ? shouldShowTechAdvisor(employee.designation) : false;

  // Check if the employee is a co-founder
  const isCoFounder = employee && employee.designation === "Co-Founder";

  if (employeeLoading || !employee) {
    return <MyPeopleSkeleton />;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">My People</h2>

      <div className="flex flex-wrap gap-x-8 gap-y-2">
        <PeopleItem label="Team" value={employee.custom_team || ""} />
        <PeopleItem label="POD" value={employee.custom_pod || ""} />

        {/* Show additional fields only if not a co-founder */}
        {!isCoFounder && (
          <>
            <PeopleItem label="Lead" value={employee.custom_tech_lead_name || ""} />
            <PeopleItem label="Buddy" value={employee.custom_buddy_name || ""} />

            {/* Only show Tech Advisor for technical roles and not PSM/Business */}
            {showTechAdvisor && (
              <PeopleItem label="Tech Advisor" value={employee.custom_tech_advisor_name || ""} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

const MyPeopleSkeleton = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <Skeleton className="h-7 w-32 mb-4" />
    <div className="flex flex-wrap gap-x-8 gap-y-2">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-5 w-20" />
      <Skeleton className="h-5 w-28" />
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-5 w-32" />
    </div>
  </div>
);

export default MyPeople;
