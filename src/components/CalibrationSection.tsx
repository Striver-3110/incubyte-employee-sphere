import { useCalibrationData, useCalibrationDataForAllEmployees, useEmployeeDetails } from "@/api/employeeService";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText } from "lucide-react";
import { getRoleCategory } from "@/utils/roleUtils";
import { useState } from "react";


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
  // console.log("Calibration data:", calibration, employeeCalibration);
  const { calibrationDataForAllEmployees } = useCalibrationDataForAllEmployees();
  const { employee } = useEmployeeDetails();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
    const rowMap: Record<string, number> = { Low: 2, Medium: 1, High: 0 }; // Reversed for top-to-bottom grid

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

  // Get progress bar color based on level
  const getProgressColor = (level: string) => {
    switch (level) {
      case "L0":
        return "bg-gray-200";
      case "L1":
        return "bg-red-400";
      case "L2":
        return "bg-orange-400";
      case "L3":
        return "bg-yellow-400";
      case "L4":
        return "bg-blue-500";
      case "L5":
        return "bg-purple-500";
      default:
        return "bg-gray-200";
    }
  };

  // Format the "Last updated on" date using the `modified` field
  const lastUpdatedOn = new Date(calibrationData.modified).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert("No file selected for upload.");
      return;
    }

    try {
      // Read the file as base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64FileData = reader.result?.toString().split(",")[1]; // Extract base64 content

        if (!base64FileData) {
          alert("Failed to process the selected file.");
          return;
        }

        // Make the API call to upload the file
        const response = await fetch(`${BASE_URL}user.upload_self_evaluation_sheet`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Include cookies for authentication
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

        // Show success message and reset selected file
        alert("Self-evaluation sheet uploaded successfully!");
        setSelectedFile(null);
      };

      reader.readAsDataURL(selectedFile); // Read the file as a Base64 Data URL
    } catch (error) {
      console.error("Error during file upload:", error);
      alert("An error occurred while uploading the file. Please try again.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Calibration</h2>
        <p className="text-sm text-gray-500">Last updated on: {lastUpdatedOn}</p>
      </div>

      {/* Self Evaluation Upload Section */}
      {showSelfEvaluationUpload && (
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

      <div className={`grid ${showPerformanceMatrix ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-8`}>
        {/* Performance & Potential Matrix - Only show if showPerformanceMatrix is true */}
        {showPerformanceMatrix && (
          <div>
            <h3 className="font-medium text-gray-700 mb-4">Performance & Potential Matrix</h3>

            <div className="relative pl-16 pb-12">
              {/* The 3x3 grid */}
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
                        className={`w-full h-24 p-2 flex items-center justify-center text-center transition-colors
                        ${isHighlighted ? "bg-indigo-500 text-white" : cellColors[row][col]}
                        border border-gray-200`}
                      >
                        <span className="text-sm font-medium">
                          {matrixCellTitles[row][col]}
                        </span>
                      </div>
                    );
                  })}
              </div>

              {/* Y-axis label */}
              <div className="absolute -left-10 top-1/2 -translate-y-6 -rotate-90 text-sm font-medium text-gray-600 whitespace-nowrap">
                Potential
              </div>

              {/* X-axis label */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-5 text-sm font-medium text-gray-600">
                Performance
              </div>

              {/* Row labels */}
              {matrixRowLabels.map((label, idx) => (
                <div
                  key={`row-${idx}`}
                  className="absolute -left-0 text-sm font-medium text-gray-600"
                  style={{ top: `${idx * 33.33 + 10}%` }}
                >
                  {label}
                </div>
              ))}

              {/* Column labels */}
              {matrixColLabels.map((label, idx) => (
                <div
                  key={`col-${idx}`}
                  className="absolute bottom-4 text-sm font-medium text-gray-600"
                  style={{ left: `${idx * 33.33 + 16.5}%` }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        )}

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
              {calibrationData.calibration_skill_categories.map((skill, index) => (
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

