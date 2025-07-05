
import { useTestEmployee } from "@/contexts/TestEmployeeContext";
import { Skeleton } from "@/components/ui/skeleton";
import { shouldShowTechAdvisor, isTechnicalRole } from "@/utils/roleUtils";
import { Users, User, UserCheck, Crown, Code } from "lucide-react";

const BASE_URL = import.meta.env.VITE_BASE_URL;

interface PeopleItemProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

const PeopleItem = ({ label, value, icon }: PeopleItemProps) => (
  <div className="bg-white p-4 rounded-lg border border-borderSoft shadow-sm hover:shadow-md transition-all duration-200">
    <div className="flex items-center gap-3 mb-2">
      <div className="w-8 h-8 bg-gradient-to-br from-brandBlue to-brandBlueLighter rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <span className="text-sm font-semibold text-brandBlueDark">{label}</span>
    </div>
    <p className="text-brandBlueDarkest font-medium">{value || "—"}</p>
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
    <div className="bg-cardBg p-8 rounded-xl border border-borderSoft">
      <h2 className="text-2xl font-bold text-brandBlueDarkest mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-brandGreen to-brandBlue rounded-lg flex items-center justify-center">
          <Users className="w-5 h-5 text-white" />
        </div>
        My People
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PeopleItem 
          label="Team" 
          value={employee.custom_team || ""} 
          icon={<Users className="w-4 h-4 text-white" />}
        />
        <PeopleItem 
          label="POD" 
          value={employee.custom_pod || ""} 
          icon={<User className="w-4 h-4 text-white" />}
        />

        {!isCoFounder && (
          <>
            <PeopleItem 
              label="Lead" 
              value={employee.custom_tech_lead_name || ""} 
              icon={<Crown className="w-4 h-4 text-white" />}
            />
            <PeopleItem 
              label="Buddy" 
              value={employee.custom_buddy_name || ""} 
              icon={<UserCheck className="w-4 h-4 text-white" />}
            />

            {showTechAdvisor && (
              <PeopleItem 
                label="Tech Advisor" 
                value={employee.custom_tech_advisor_name || ""} 
                icon={<Code className="w-4 h-4 text-white" />}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

const MyPeopleSkeleton = () => (
  <div className="bg-cardBg p-8 rounded-xl border border-borderSoft">
    <div className="flex items-center gap-3 mb-6">
      <Skeleton className="h-10 w-10 rounded-lg" />
      <Skeleton className="h-8 w-32" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white p-4 rounded-lg border border-borderSoft">
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
