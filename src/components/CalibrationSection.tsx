import { useCalibrationData, useCalibrationDataForAllEmployees, useEmployeeDetails } from "@/api/employeeService";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, BarChart3, Radar } from "lucide-react";
import { getRoleCategory } from "@/utils/roleUtils";
import { useState } from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar as RechartsRadar, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const BASE_URL = import.meta.env.VITE_BASE_URL

interface CalibrationSectionProps {
  employeeCalibration?: any;
  showPerformanceMatrix?: boolean;
  showSelfEvaluationUpload?: boolean;
  isAdminView?: boolean;
}

const CalibrationSection = ({
  employeeCalibration,
  showPerformanceMatrix = true,
  showSelfEvaluationUpload = false,
  isAdminView = false
}: CalibrationSectionProps) => {
  const { calibration, loading, error } = useCalibrationData();
  const { calibrationDataForAllEmployees } = useCalibrationDataForAllEmployees();
  const { employee } = useEmployeeDetails();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [chartView, setChartView] = useState<'table' | 'radar' | 'bar'>('table');

  // Check if current user is business role
  const userRoleCategory = getRoleCategory(employee?.designation);
  const isBusinessRole = userRoleCategory === "Business";

  // Use the passed employeeCalibration if available, otherwise use the current user's calibration
  const calibrationData = employeeCalibration || calibration;
  const isLoading = !employeeCalibration && loading;

  // Handle loading state
  if (isLoading) {
    return <CalibrationSectionSkeleton />;
  }

  // If not a business role and no specific employee calibration is passed, don't show
  if (calibrationData === null) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Calibration Pending</h2>
          <p className="text-gray-500">Your calibration is pending. Stay tuned for updates.</p>
        </div>
      </div>
    );
  }

  // Determine the highlighted cell in the performance-potential matrix
  const getMatrixPosition = () => {
    const performance = calibrationData.performance || "Medium";
    const potential = calibrationData.potential || "Medium";

    const colMap: Record<string, number> = { Low: 0, Medium: 1, High: 2 };
    const rowMap: Record<string, number> = { Low: 2, Medium: 1, High: 0 };

    return { row: rowMap[potential], col: colMap[performance] };
  };

  const position = getMatrixPosition();

  // Labels for the matrix
  const matrixRowLabels = ["High", "Medium", "Low"];
  const matrixColLabels = ["Low", "Medium", "High"];

  // Matrix cell titles
  const matrixCellTitles = [
    ["Enigma", "Growth Employee", "Future Leader"],
    ["Dilemma", "Core Employee", "High Impact Performer"],
    ["Under Performer", "Effective", "Trusted Professional"],
  ];

  // Background colors for the grid cells
  const cellColors = [
    ["bg-red-50", "bg-yellow-50", "bg-green-50"],
    ["bg-orange-50", "bg-gray-50", "bg-blue-50"],
    ["bg-purple-50", "bg-pink-50", "bg-teal-50"],
  ];

  // Determine progress bar value based on level
  const getProgressValue = (level: string) => {
    switch (level) {
      case "L1":
        return 20;
      case "L2":
        return 40;
      case "L3":
        return 60;
      case "L4":
        return 80;
      case "L5":
        return 100;
      default:
        return 0; // L0
    }
  };

  // Get progress bar color based on level - updated to match page color scheme
  const getProgressColor = (level: string) => {
    switch (level) {
      case "L0":
        return "bg-gray-400";
      case "L1":
        return "bg-red-500";
      case "L2":
        return "bg-orange-500";
      case "L3":
        return "bg-yellow-500";
      case "L4":
        return "bg-blue-600";
      case "L5":
        return "bg-indigo-600";
      default:
        return "bg-gray-400";
    }
  };

  // Get background color for level badge
  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case "L0":
        return "bg-gray-100 text-gray-700 border-gray-300";
      case "L1":
        return "bg-red-50 text-red-700 border-red-200";
      case "L2":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "L3":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "L4":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "L5":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  // Format the "Last updated on" date using the `modified` field
  const lastUpdatedOn = new Date(calibrationData.modified).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Extract overall level and other skills
  const skillCategories = calibrationData.calibration_skill_categories || [];
  const overallLevel = skillCategories.find(skill => 
    skill.skill.toLowerCase().includes('overall') || 
    skill.skill.toLowerCase().includes('total') ||
    skill.skill === 'Overall Level'
  );
  const otherSkills = skillCategories.filter(skill => 
    !skill.skill.toLowerCase().includes('overall') && 
    !skill.skill.toLowerCase().includes('total') &&
    skill.skill !== 'Overall Level'
  );

  // Prepare data for charts
  const chartData = otherSkills.map(skill => ({
    skill: skill.skill,
    level: getProgressValue(skill.level),
    levelText: skill.level,
    fullMark: 100
  }));

  const chartConfig = {
    level: {
      label: "Skill Level",
      color: "hsl(var(--chart-1))",
    },
  };

  // Handle file change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert("No file selected for upload.");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64FileData = reader.result?.toString().split(",")[1];

        if (!base64FileData) {
          alert("Failed to process the selected file.");
          return;
        }

        const response = await fetch(`${BASE_URL}user.upload_self_evaluation_sheet`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            filedata: base64FileData,
            filename: selectedFile.name,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error uploading file:", errorData);
          alert("Failed to upload the self-evaluation sheet.");
          return;
        }

        const responseData = await response.json();

        alert("Self-evaluation sheet uploaded successfully!");
        setSelectedFile(null);
      };

      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error("Error during file upload:", error);
      alert("An error occurred while uploading the file. Please try again.");
    }
  };

  // Get compact styling for admin view
  const containerPadding = isAdminView ? "p-2" : "p-6";
  const headerMargin = isAdminView ? "mb-2" : "mb-4";
  const gridGap = isAdminView ? "gap-2" : "gap-8";
  const matrixSize = isAdminView ? "h-8" : "h-24";
  const chartHeight = isAdminView ? "h-[400px]" : "h-[400px]";

  return (
    <div className={`bg-white ${containerPadding} rounded-lg shadow-sm`}>
      <div className={`flex flex-col sm:flex-row justify-between items-start ${headerMargin}`}>
        <h2 className={`${isAdminView ? 'text-sm' : 'text-xl'} font-semibold text-gray-800`}>Calibration</h2>
        {!isAdminView && (
          <p className="text-sm text-gray-500">Last updated on: {lastUpdatedOn}</p>
        )}
      </div>

      {/* Self Evaluation Upload Section */}
      {showSelfEvaluationUpload && !isAdminView && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="font-medium text-gray-700 mb-3">Self-Evaluation Sheet</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="self-evaluation" className="text-sm font-medium text-gray-600">
                Upload your self-evaluation document
              </Label>
              <Input
                id="self-evaluation"
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
                className="mt-1"
              />
            </div>
            {selectedFile && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="h-4 w-4" />
                <span>{selectedFile.name}</span>
                <Button
                  onClick={handleFileUpload}
                  size="sm"
                  className="ml-2"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Upload
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overall Level Section */}
      {overallLevel && (
        <div className={`${isAdminView ? "mb-2 p-2" : "mb-4 p-3"} border border-gray-200 rounded-lg bg-gray-50`}>
          <div className="flex items-center justify-between">
            <h3 className={`font-medium text-gray-700 ${isAdminView ? "text-xs" : "text-sm"}`}>Overall Level</h3>
            <div className="flex items-center gap-2">
              <Progress
                value={getProgressValue(overallLevel.level)}
                className={`${isAdminView ? "h-1 w-12" : "h-2 w-24"}`}
              />
              <span className={`px-2 py-1 text-xs font-medium rounded border ${getLevelBadgeColor(overallLevel.level)}`}>
                {overallLevel.level}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className={`grid ${showPerformanceMatrix ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"} ${gridGap}`}>
        {/* Performance & Potential Matrix */}
        {showPerformanceMatrix && (
          <div>
            <h3 className={`font-medium text-gray-700 ${isAdminView ? "mb-1 text-xs" : "mb-4"}`}>Performance & Potential Matrix</h3>

            <div className={`relative ${isAdminView ? "pl-6 pb-4" : "pl-16 pb-12"}`}>
              <div className="grid grid-cols-3 gap-0.5 border border-gray-200">
                {Array(9)
                  .fill(0)
                  .map((_, idx) => {
                    const row = Math.floor(idx / 3);
                    const col = idx % 3;
                    const isHighlighted = row === position.row && col === position.col;

                    return (
                      <div
                        key={idx}
                        className={`w-full ${matrixSize} ${isAdminView ? "p-1" : "p-2"} flex items-center justify-center text-center transition-colors
                        ${isHighlighted ? "bg-indigo-500 text-white" : cellColors[row][col]}
                        border border-gray-200`}
                      >
                        <span className={`${isAdminView ? "text-xs" : "text-sm"} font-medium`}>
                          {isAdminView ? matrixCellTitles[row][col].split(' ')[0] : matrixCellTitles[row][col]}
                        </span>
                      </div>
                    );
                  })}
              </div>

              {/* Y-axis label */}
              <div className={`absolute ${isAdminView ? "-left-4" : "-left-10"} top-1/2 -translate-y-6 -rotate-90 ${isAdminView ? "text-xs" : "text-sm"} font-medium text-gray-600 whitespace-nowrap`}>
                {isAdminView ? "Pot" : "Potential"}
              </div>

              {/* X-axis label */}
              <div className={`absolute ${isAdminView ? "-bottom-1" : "-bottom-2"} left-1/2 -translate-x-5 ${isAdminView ? "text-xs" : "text-sm"} font-medium text-gray-600`}>
                {isAdminView ? "Perf" : "Performance"}
              </div>

              {/* Row labels */}
              {matrixRowLabels.map((label, idx) => (
                <div
                  key={`row-${idx}`}
                  className={`absolute -left-0 ${isAdminView ? "text-xs" : "text-sm"} font-medium text-gray-600`}
                  style={{ top: `${idx * 33.33 + (isAdminView ? 2 : 10)}%` }}
                >
                  {isAdminView ? label.substring(0, 1) : label}
                </div>
              ))}

              {/* Column labels */}
              {matrixColLabels.map((label, idx) => (
                <div
                  key={`col-${idx}`}
                  className={`absolute ${isAdminView ? "bottom-1" : "bottom-4"} ${isAdminView ? "text-xs" : "text-sm"} font-medium text-gray-600`}
                  style={{ left: `${idx * 33.33 + (isAdminView ? 6 : 16.5)}%` }}
                >
                  {isAdminView ? label.substring(0, 1) : label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skill Calibration Levels */}
        <div>
          <div className={`flex items-center justify-between ${isAdminView ? "mb-1" : "mb-4"}`}>
            <h3 className={`font-medium text-gray-700 ${isAdminView ? "text-xs" : ""}`}>Skill Levels</h3>
            {!isAdminView && (
              <div className="flex gap-2">
                <Button
                  variant={chartView === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartView('table')}
                >
                  Table
                </Button>
                <Button
                  variant={chartView === 'radar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartView('radar')}
                >
                  <Radar className="h-4 w-4 mr-1" />
                  Radar
                </Button>
                <Button
                  variant={chartView === 'bar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartView('bar')}
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Bar
                </Button>
              </div>
            )}
          </div>

          {(chartView === 'table' || isAdminView) && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">No.</TableHead>
                  <TableHead>Skill</TableHead>
                  <TableHead className="w-24">Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {otherSkills.slice(0, isAdminView ? 3 : otherSkills.length).map((skill, index) => (
                  <TableRow key={index} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-xs">{index + 1}</TableCell>
                    <TableCell className={`${isAdminView ? "text-xs" : ""} truncate max-w-[120px]`} title={skill.skill}>
                      {isAdminView && skill.skill.length > 15 ? `${skill.skill.substring(0, 15)}...` : skill.skill}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Progress
                          value={getProgressValue(skill.level)}
                          className={`${isAdminView ? "h-1 w-8" : "h-2"} flex-1`}
                        />
                        <span className={`px-1 py-0.5 text-xs font-medium rounded border ${getLevelBadgeColor(skill.level)}`}>
                          {skill.level}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {chartView === 'radar' && !isAdminView && (
            <ChartContainer config={chartConfig} className="h-[400px]">
              <RadarChart data={chartData}>
                <ChartTooltip 
                  content={
                    <ChartTooltipContent 
                      formatter={(value, name, props) => [
                        `${props.payload.levelText} (${value}%)`,
                        "Level"
                      ]}
                    />
                  }
                />
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" className="text-xs" />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  className="text-xs"
                />
                <RechartsRadar
                  name="Skill Level"
                  dataKey="level"
                  stroke="hsl(var(--chart-1))"
                  fill="hsl(var(--chart-1))"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ChartContainer>
          )}

          {chartView === 'bar' && !isAdminView && (
            <ChartContainer config={chartConfig} className="h-[400px]">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="skill" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  className="text-xs"
                />
                <YAxis domain={[0, 100]} className="text-xs" />
                <ChartTooltip 
                  content={
                    <ChartTooltipContent 
                      formatter={(value, name, props) => [
                        `${props.payload.levelText} (${value}%)`,
                        "Level"
                      ]}
                    />
                  }
                />
                <Bar 
                  dataKey="level" 
                  fill="hsl(var(--chart-1))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          )}
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
          {Array(9)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="w-full h-24" />
            ))}
        </div>
      </div>

      <div>
        <Skeleton className="h-5 w-48 mb-4" />
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full mb-1" />
        ))}
      </div>
    </div>
  </div>
);

export default CalibrationSection;
