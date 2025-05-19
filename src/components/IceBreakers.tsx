
import { useEmployeeDetails } from "@/api/employeeService";
import { Skeleton } from "@/components/ui/skeleton";

const IceBreakers = () => {
  const { employee, loading } = useEmployeeDetails();

  if (loading || !employee) {
    return <IceBreakersSkeleton />;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Ice Breakers</h2>
      
      {employee.custom_employee_icebreaker_question.length === 0 ? (
        <p className="text-gray-500 italic">No ice breakers available.</p>
      ) : (
        <div className="space-y-4">
          {employee.custom_employee_icebreaker_question.map((item) => (
            <div key={item.name} className="bg-gray-50 p-4 rounded-md">
              <p className="font-medium text-gray-700 mb-2">{item.question}</p>
              <p className="text-gray-600">{item.answer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const IceBreakersSkeleton = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <Skeleton className="h-7 w-32 mb-4" />
    <div className="space-y-4">
      <div>
        <Skeleton className="h-5 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div>
        <Skeleton className="h-5 w-full mb-2" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div>
        <Skeleton className="h-5 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  </div>
);

export default IceBreakers;
