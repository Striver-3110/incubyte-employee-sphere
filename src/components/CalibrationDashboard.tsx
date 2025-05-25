import React, { useState } from "react";
import { roleCategories } from "@/utils/roleUtils";
import CalibrationSection from "./CalibrationSection"; // Reusing CalibrationSection component
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Button } from "@/components/ui/button";
import Modal from "./ui/modal";
import { useEmployeeDetails, useCalibrationDataForAllEmployees } from "@/api/employeeService";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CalibrationDashboard = () => {
  const { employee, loading: employeeLoading, error: employeeError } = useEmployeeDetails();
  const { calibrationDataForAllEmployees, loading: calibrationLoading, error: calibrationError } =
    useCalibrationDataForAllEmployees();

  console.log("Calibration Data for All Employees:", calibrationDataForAllEmployees);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  if (employeeLoading || calibrationLoading) {
    return <p className="text-center text-gray-500 italic">Loading...</p>;
  }

  if (employeeError || calibrationError) {
    return (
      <p className="text-center text-red-500 italic">
        {employeeError || calibrationError}
      </p>
    );
  }

  const userRole = employee?.designation || "";
  const hasAccess = true || roleCategories.Business.includes(userRole);

  if (!hasAccess) {
    return <p className="text-center text-gray-500 italic">You do not have access to this dashboard.</p>;
  }

  // Filter data
  const calibrated = calibrationDataForAllEmployees.filter(
    (data) => data.status === "success" && data.data?.performance && data.data?.potential
  );
  const notCalibrated = calibrationDataForAllEmployees.filter(
    (data) => data.status === "error" || !data.data?.performance
  );

  // Map categories
  const categoryMapping = [
    ["Underperformer", "Potential Risk", "Enigma"],
    ["Value Player", "Core Employee", "High Potential"],
    ["Specialized Expert", "Consistent Star", "Top Talent"],
  ];

  const categoryCounts: Record<string, number> = {};
  calibrated.forEach((record) => {
    const { performance, potential } = record.data;
    const colMap: Record<string, number> = { Low: 0, Medium: 1, High: 2 };
    const rowMap: Record<string, number> = { Low: 2, Medium: 1, High: 0 };

    const col = colMap[performance];
    const row = rowMap[potential];
    const category = categoryMapping[row][col];

    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });

  // Prepare data for the chart
  const chartData = {
    labels: categoryMapping.flat(),
    datasets: [
      {
        label: "Employees per Category",
        data: categoryMapping.flat().map((category) => categoryCounts[category] || 0),
        backgroundColor: [
          "#FFCDD2",
          "#F8BBD0",
          "#BBDEFB",
          "#C8E6C9",
          "#FFF9C4",
          "#FFCCBC",
          "#D1C4E9",
          "#B2EBF2",
          "#FFECB3",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Performance & Potential Categories",
      },
    },
    onClick: (_, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const category = chartData.labels[index];
        setSelectedCategory(category as string);
      }
    },
  };

  // Filter employees in the selected category
  const employeesInCategory = calibrated.filter((record) => {
    const { performance, potential } = record.data;
    const colMap: Record<string, number> = { Low: 0, Medium: 1, High: 2 };
    const rowMap: Record<string, number> = { Low: 2, Medium: 1, High: 0 };

    const col = colMap[performance];
    const row = rowMap[potential];
    const category = categoryMapping[row][col];

    return category === selectedCategory;
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Calibration Dashboard</h1>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-100 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold">Calibrated Employees</h2>
          <p className="text-2xl font-bold">{calibrated.length}</p>
        </div>
        <div className="bg-red-100 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold">Not Calibrated Employees</h2>
          <p className="text-2xl font-bold">{notCalibrated.length}</p>
        </div>
      </div>

      {/* Graph */}
      <div className="mb-8">
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* Selected Category */}
      {selectedCategory && (
        <div>
          <Button variant="outline" onClick={() => setSelectedCategory(null)} className="mb-4">
            Go Back
          </Button>
          <h2 className="text-xl font-semibold mb-4">
            Employees in Category: <span className="text-blue-600">{selectedCategory}</span>
          </h2>
          {employeesInCategory.length > 0 ? (
            <ul className="list-disc pl-8">
              {employeesInCategory.map((record) => (
                <li key={record.employee_name} className="mb-2">
                  <Button
                    variant="link"
                    onClick={() => setSelectedEmployee(record)}
                    className="text-blue-600 hover:underline"
                  >
                    {record.employee_name}
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No employees found in this category.</p>
          )}
        </div>
      )}

      {/* Modal for Calibration Section */}
      {selectedEmployee && (
        <Modal open={!!selectedEmployee} onClose={() => setSelectedEmployee(null)}>
          <CalibrationSection employeeCalibration={selectedEmployee.data} />
        </Modal>
      )}
    </div>
  );
};

export default CalibrationDashboard;