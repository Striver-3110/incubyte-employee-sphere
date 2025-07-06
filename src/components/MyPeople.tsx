
import { useTestEmployee } from "@/contexts/TestEmployeeContext";
import { Skeleton } from "@/components/ui/skeleton";
import { shouldShowTechAdvisor, isTechnicalRole } from "@/utils/roleUtils";
import { Users, User, UserCheck, Crown, Code } from "lucide-react";

interface PeopleItemProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

const PeopleItem = ({ label, value, icon }: PeopleItemProps) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3 mb-2">
      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
    <p className="text-gray-900 font-medium">{value || "—"}</p>
  </div>
);

const MyPeople = () => {
  const { employee, loading: employeeLoading } = useTestEmployee();

  const isTechnical = employee ? isTechnicalRole(employee.designation) : false;
  const showTechAdvisor = employee ? shouldShowTechAdvisor(employee.designation) : false;
  const isCoFounder = employee && employee.designation === "Co-Founder";

  if (employeeLoading || !employee) {
    return <MyPeopleSkeleton />;
  }

  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <Users className="w-4 h-4 text-blue-600" />
        </div>
        My People
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PeopleItem 
          label="Team" 
          value={employee.custom_team || ""} 
          icon={<Users className="w-4 h-4 text-blue-600" />}
        />
        <PeopleItem 
          label="POD" 
          value={employee.custom_pod || ""} 
          icon={<User className="w-4 h-4 text-blue-600" />}
        />

        {!isCoFounder && (
          <>
            <PeopleItem 
              label="Lead" 
              value={employee.custom_tech_lead_name || ""} 
              icon={<Crown className="w-4 h-4 text-blue-600" />}
            />
            <PeopleItem 
              label="Buddy" 
              value={employee.custom_buddy_name || ""} 
              icon={<UserCheck className="w-4 h-4 text-blue-600" />}
            />

            {showTechAdvisor && (
              <PeopleItem 
                label="Tech Advisor" 
                value={employee.custom_tech_advisor_name || ""} 
                icon={<Code className="w-4 h-4 text-blue-600" />}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

const MyPeopleSkeleton = () => (
  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
    <div className="flex items-center gap-3 mb-4">
      <Skeleton className="h-8 w-8 rounded-lg" />
      <Skeleton className="h-6 w-32" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-5 w-20" />
        </div>
      ))}
    </div>
  </div>
);

export default MyPeople;
