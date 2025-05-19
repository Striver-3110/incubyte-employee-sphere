
import { useCalibrationData } from "@/api/employeeService";
import { Skeleton } from "@/components/ui/skeleton";

const CalibrationSection = () => {
  const { calibration, loading } = useCalibrationData();

  if (loading || !calibration) {
    return <CalibrationSectionSkeleton />;
  }

  // Helper function to determine the cell's style based on position
  const getCellStyle = (row: number, col: number) => {
    const rowLabels = ['Low', 'Medium', 'High'];
    const colLabels = ['Low', 'Medium', 'High'];
    
    const isHighlighted = 
      (calibration.performance === colLabels[col]) && 
      (calibration.potential === rowLabels[2 - row]); // Reverse because grid is top to bottom
    
    return isHighlighted 
      ? "bg-blue-500 text-white font-medium" 
      : "bg-white border-gray-300";
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Calibration</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 9-Grid Section */}
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Performance & Potential</h3>
          
          <div className="relative">
            {/* Y-axis label */}
            <div className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 text-sm font-medium text-gray-600">
              Potential
            </div>
            
            {/* X-axis label */}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 text-sm font-medium text-gray-600">
              Performance
            </div>
            
            {/* Grid */}
            <div className="grid grid-cols-3 gap-1 mb-10 ml-4">
              {Array(9).fill(0).map((_, index) => {
                const row = Math.floor(index / 3);
                const col = index % 3;
                return (
                  <div 
                    key={index}
                    className={`w-16 h-16 flex items-center justify-center border text-center ${getCellStyle(row, col)}`}
                  />
                );
              })}
              
              {/* Row labels */}
              <div className="absolute right-full top-0 h-16 flex items-center pr-2 text-sm text-gray-700">High</div>
              <div className="absolute right-full top-1/3 h-16 flex items-center pr-2 text-sm text-gray-700">Medium</div>
              <div className="absolute right-full top-2/3 h-16 flex items-center pr-2 text-sm text-gray-700">Low</div>
              
              {/* Column labels */}
              <div className="absolute bottom-full left-4 w-16 flex justify-center pb-2 text-sm text-gray-700">Low</div>
              <div className="absolute bottom-full left-1/3 w-16 flex justify-center pb-2 text-sm text-gray-700">Medium</div>
              <div className="absolute bottom-full left-2/3 w-16 flex justify-center pb-2 text-sm text-gray-700">High</div>
            </div>
          </div>
        </div>
        
        {/* Skills Section */}
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Skills Assessment</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
                  <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skill</th>
                  <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {calibration.skills.map((skill: any, index: number) => (
                  <tr key={index}>
                    <td className="py-2 text-sm">{index + 1}</td>
                    <td className="py-2 text-sm">{skill.skill}</td>
                    <td className="py-2 text-sm font-medium">
                      <span className={`
                        px-2 py-0.5 rounded-full text-xs
                        ${skill.level === 'L0' ? 'bg-gray-100 text-gray-800' :
                          skill.level === 'L1' ? 'bg-red-100 text-red-800' :
                          skill.level === 'L2' ? 'bg-yellow-100 text-yellow-800' :
                          skill.level === 'L3' ? 'bg-green-100 text-green-800' :
                          skill.level === 'L4' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'}
                      `}>
                        {skill.level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const CalibrationSectionSkeleton = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <Skeleton className="h-7 w-36 mb-4" />
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <Skeleton className="h-5 w-48 mb-4" />
        <div className="grid grid-cols-3 gap-1">
          {Array(9).fill(0).map((_, i) => (
            <Skeleton key={i} className="w-16 h-16" />
          ))}
        </div>
      </div>
      
      <div>
        <Skeleton className="h-5 w-48 mb-4" />
        <Skeleton className="h-8 w-full mb-2" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-full mb-2" />
      </div>
    </div>
  </div>
);

export default CalibrationSection;
