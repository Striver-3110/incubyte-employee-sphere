
import { useEmployeeDetails } from "@/api/employeeService";
import { Skeleton } from "@/components/ui/skeleton";

interface PeopleItemProps {
  label: string;
  value: string;
}

const PeopleItem = ({ label, value }: PeopleItemProps) => (
  <div className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-gray-100">
    <span className="text-sm font-medium text-gray-500 sm:w-1/3">{label}</span>
    <span className="font-medium text-gray-800">{value || "—"}</span>
  </div>
);

const MyPeople = () => {
  const { employee, loading } = useEmployeeDetails();
  
  // Check if the employee is in a technical role based on designation
  const isTechnicalRole = employee && 
    ['Software Craftsperson', 'Software Craftsperson - Tech Lead', 
     'Software Craftsperson - Tech Advisor', 'AI Craftsperson', 
     'Test Craftsperson', 'Test Craftsperson (Manual)', 
     'Test Craftsperson (Automation)', 'BQA', 'Intern'].includes(employee.designation);
  
  // Check if the employee is a co-founder
  const isCoFounder = employee && employee.designation === 'Co-Founder';

  if (loading || !employee) {
    return <MyPeopleSkeleton />;
  }
  
  // If co-founder, don't show any fields
  if (isCoFounder) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">My People</h2>
        <p className="text-gray-600 italic">This section is not applicable for co-founders.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">My People</h2>
      
      <div className="space-y-1">
        <PeopleItem label="Team" value={employee.custom_team || ""} />
        <PeopleItem label="Pod" value={employee.custom_pod || ""} />
        <PeopleItem label="Lead" value={employee.custom_tech_lead || ""} />
        <PeopleItem label="Buddy" value={employee.custom_buddy || ""} />
        
        {/* Only show Tech Advisor for technical roles */}
        {isTechnicalRole && (
          <PeopleItem label="Tech Advisor" value={employee.custom_tech_advisor || ""} />
        )}
      </div>
    </div>
  );
};

const MyPeopleSkeleton = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <Skeleton className="h-7 w-32 mb-4" />
    <div className="space-y-2">
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-full" />
    </div>
  </div>
);

export default MyPeople;
