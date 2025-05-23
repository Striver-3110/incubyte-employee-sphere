
import { useCalibrationData } from "@/api/employeeService";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const CalibrationSection = () => {
  const { calibration, loading } = useCalibrationData();

  if (loading || !calibration) {
    return <CalibrationSectionSkeleton />;
  }

  // Determine the highlighted cell in the performance-potential matrix
  const getMatrixPosition = () => {
    const performance = calibration.performance || 'Medium';
    const potential = calibration.potential || 'Medium';
    
    const colMap: Record<string, number> = { 'Low': 0, 'Medium': 1, 'High': 2 };
    const rowMap: Record<string, number> = { 'Low': 2, 'Medium': 1, 'High': 0 }; // Reversed because grid is top to bottom
    
    return { row: rowMap[potential], col: colMap[performance] };
  };

  const position = getMatrixPosition();
  
  // Labels for the matrix
  const matrixRowLabels = ['High', 'Medium', 'Low'];
  const matrixColLabels = ['Low', 'Medium', 'High'];
  
  // Matrix cell titles
  const matrixCellTitles = [
    ['Underperformer', 'Potential Risk', 'Enigma'],
    ['Value Player', 'Core Player', 'High Potential'],
    ['Specialized Expert', 'Consistent Star', 'Top Talent'],
  ];

  // Determine progress bar value based on level
  const getProgressValue = (level: string) => {
    switch(level) {
      case 'L1': return 20;
      case 'L2': return 40;
      case 'L3': return 60;
      case 'L4': return 80;
      case 'L5': return 100;
      default: return 0; // L0
    }
  };

  // Get progress bar color based on level
  const getProgressColor = (level: string) => {
    switch(level) {
      case 'L0': return 'bg-gray-200';
      case 'L1': return 'bg-red-400';
      case 'L2': return 'bg-orange-400';
      case 'L3': return 'bg-yellow-400';
      case 'L4': return 'bg-blue-500';
      case 'L5': return 'bg-purple-500';
      default: return 'bg-gray-200';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Calibration</h2>
        <p className="text-sm text-gray-500">
          Last updated on: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance & Potential Matrix */}
        <div>
          <h3 className="font-medium text-gray-700 mb-4">Performance & Potential Matrix</h3>
          
          <div className="relative pl-8 pb-12">
            {/* The 3x3 grid */}
            <div className="grid grid-cols-3 gap-0.5 border border-gray-200">
              {Array(9).fill(0).map((_, idx) => {
                const row = Math.floor(idx / 3);
                const col = idx % 3;
                const isHighlighted = row === position.row && col === position.col;
                
                return (
                  <div 
                    key={idx} 
                    className={`
                      w-full h-24 p-2 flex items-center justify-center text-center transition-colors
                      ${isHighlighted 
                        ? 'bg-indigo-500 text-white' 
                        : 'bg-white text-gray-800 hover:bg-gray-50'}
                      ${row === 0 ? 'border-t-0' : 'border-t border-gray-200'}
                      ${col === 0 ? 'border-l-0' : 'border-l border-gray-200'}
                    `}
                  >
                    <span className="text-xs font-medium">
                      {matrixCellTitles[row][col]}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* Y-axis label */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-sm font-medium text-gray-600 whitespace-nowrap">
              Potential
            </div>
            
            {/* X-axis label */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-sm font-medium text-gray-600">
              Performance
            </div>
            
            {/* Row labels */}
            {matrixRowLabels.map((label, idx) => (
              <div 
                key={`row-${idx}`} 
                className="absolute -left-1 text-xs font-medium text-gray-600"
                style={{ top: `${idx * 33.33 + 16.5}%` }}
              >
                {label}
              </div>
            ))}
            
            {/* Column labels */}
            {matrixColLabels.map((label, idx) => (
              <div 
                key={`col-${idx}`} 
                className="absolute bottom-6 text-xs font-medium text-gray-600"
                style={{ left: `${idx * 33.33 + 16.5}%` }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
        
        {/* Skill Calibration Levels */}
        <div>
          <h3 className="font-medium text-gray-700 mb-4">Skill Calibration Levels</h3>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">No.</TableHead>
                <TableHead>Skill</TableHead>
                <TableHead className="w-32">Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calibration.skills.map((skill, index) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{skill.skill}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={getProgressValue(skill.level)} 
                        className={`h-2 ${getProgressColor(skill.level)}`}
                      />
                      <span className="text-xs font-medium">{skill.level}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

const CalibrationSectionSkeleton = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
      <Skeleton className="h-7 w-36" />
      <Skeleton className="h-5 w-48 mt-2 sm:mt-0" />
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <Skeleton className="h-5 w-48 mb-4" />
        <div className="grid grid-cols-3 gap-0.5">
          {Array(9).fill(0).map((_, i) => (
            <Skeleton key={i} className="w-full h-24" />
          ))}
        </div>
      </div>
      
      <div>
        <Skeleton className="h-5 w-48 mb-4" />
        <Skeleton className="h-8 w-full mb-2" />
        <Skeleton className="h-12 w-full mb-1" />
        <Skeleton className="h-12 w-full mb-1" />
        <Skeleton className="h-12 w-full mb-1" />
        <Skeleton className="h-12 w-full mb-1" />
        <Skeleton className="h-12 w-full mb-1" />
        <Skeleton className="h-12 w-full mb-1" />
        <Skeleton className="h-12 w-full mb-1" />
        <Skeleton className="h-12 w-full mb-1" />
        <Skeleton className="h-12 w-full mb-1" />
      </div>
    </div>
  </div>
);

export default CalibrationSection;
