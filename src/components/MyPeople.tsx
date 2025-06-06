import { useEmployeeDetails, useTeamEmployees } from "@/api/employeeService";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { shouldShowTechAdvisor, isTechnicalRole } from "@/utils/roleUtils";
import { useEffect } from "react";

const BASE_URL = import.meta.env.VITE_BASE_URL;

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
  const { employee, loading: employeeLoading } = useEmployeeDetails();
  const { employees, loading: teamLoading } = useTeamEmployees();

  const loading = employeeLoading || teamLoading;

  // Check if the employee is in a technical role based on role utils
  const isTechnical = employee ? isTechnicalRole(employee.designation) : false;

  // Check if tech advisor should be shown
  const showTechAdvisor = employee ? shouldShowTechAdvisor(employee.designation) : false;

  // Check if the employee is a co-founder
  const isCoFounder = employee && employee.designation === "Co-Founder";

  if (loading || !employee) {
    return <MyPeopleSkeleton />;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">My People</h2>

      <div className="space-y-4">
        {/* Employee's direct relationships */}
        <div className="space-y-1">
          <PeopleItem label="Team" value={employee.custom_team || ""} />
          <PeopleItem label="Pod" value={employee.custom_pod || ""} />

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

        {/* Team members table */}
        {!isCoFounder && employee.custom_team && employees.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Team Members</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Designation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((teamMember, index) => (
                    <TableRow key={teamMember.name}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{teamMember.employee_name}</TableCell>
                      <TableCell>{teamMember.designation}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
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