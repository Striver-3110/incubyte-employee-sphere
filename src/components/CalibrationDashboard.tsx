import React, { useState } from "react";
import { roleCategories } from "@/utils/roleUtils";
import CalibrationSection from "./CalibrationSection";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Modal from "./ui/modal";
import { useEmployeeDetails, useCalibrationDataForAllEmployees } from "@/api/employeeService";
import { Users, UserCheck, BarChart3, ArrowLeft, Clock, AlertTriangle } from "lucide-react";
import { formatDate } from "@/utils/dateUtils";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CalibrationDashboard = () => {
    const { employee, loading: employeeLoading, error: employeeError } = useEmployeeDetails();
    const { calibrationDataForAllEmployees, loading: calibrationLoading, error: calibrationError } =
        useCalibrationDataForAllEmployees();

    console.log("Calibration Data for All Employees:", calibrationDataForAllEmployees);

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const [showCalibratedModal, setShowCalibratedModal] = useState(false);
    const [showNotCalibratedModal, setShowNotCalibratedModal] = useState(false);

    if (employeeLoading || calibrationLoading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-center h-32">
                    <p className="text-gray-500 italic">Loading calibration data...</p>
                </div>
            </div>
        );
    }

    if (employeeError || calibrationError) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-center h-32">
                    <p className="text-red-500 italic">
                        Error loading data: {employeeError || calibrationError}
                    </p>
                </div>
            </div>
        );
    }

    const userRole = employee?.designation || "";
    const hasAccess = roleCategories.Business.includes(userRole);

    if (!hasAccess) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-center h-32">
                    <p className="text-gray-500 italic">You do not have access to this dashboard.</p>
                </div>
            </div>
        );
    }

    // Filter data
    const calibrated = calibrationDataForAllEmployees.filter(
        (data) => data.status === "success" && data.data?.performance && data.data?.potential
    );
    const notCalibrated = calibrationDataForAllEmployees.filter(
        (data) => data.status === "error" || !data.data?.performance
    );

    // Check if calibration is older than 6 months
    const isOldCalibration = (modifiedDate: string) => {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        return new Date(modifiedDate) < sixMonthsAgo;
    };

    // Sort calibrated employees by modified date (oldest first)
    const sortedCalibratedEmployees = [...calibrated].sort((a, b) => {
        const dateA = new Date(a.data.modified);
        const dateB = new Date(b.data.modified);
        return dateA.getTime() - dateB.getTime();
    });

    // Map categories
    const categoryMapping = [
        ["Enigma", "Growth Employee", "Future Leader"],
        ["Dilemma", "Core Employee", "High Impact Performer"],
        ["Under Performer", "Effective", "Trusted Professional"],
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
                    "#fef2f2", "#fdf2f8", "#eff6ff", "#f0fdf4", "#fffbeb",
                    "#fff7ed", "#f3f4f6", "#ecfdf5", "#fefce8",
                ],
                borderColor: [
                    "#dc2626", "#be185d", "#2563eb", "#059669", "#d97706",
                    "#ea580c", "#6b7280", "#10b981", "#ca8a04",
                ],
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top" as const,
                labels: {
                    font: {
                        size: 12,
                    },
                },
            },
            title: {
                display: true,
                text: "Performance & Potential Categories",
                font: {
                    size: 16,
                    weight: 'bold' as const,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                },
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
        <div className="space-y-6">
            {!selectedCategory ? (
                <>
                    {/* Header */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <BarChart3 className="h-6 w-6 text-blue-600" />
                            <h1 className="text-2xl font-semibold text-gray-800">Calibration Dashboard</h1>
                        </div>
                        <p className="text-gray-600">Overview of employee calibration status and performance distribution</p>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card
                            className="border-green-200 bg-green-50 cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => setShowCalibratedModal(true)}
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-green-700">Calibrated Employees</CardTitle>
                                <UserCheck className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-800">{calibrated.length}</div>
                                <p className="text-xs text-green-600 mt-1">
                                    Click to view details
                                </p>
                            </CardContent>
                        </Card>

                        <Card
                            className="border-red-200 bg-red-50 cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => setShowNotCalibratedModal(true)}
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-red-700">Pending Calibration</CardTitle>
                                <Users className="h-4 w-4 text-red-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-800">{notCalibrated.length}</div>
                                <p className="text-xs text-red-600 mt-1">
                                    Click to view details
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Chart Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-gray-800">
                                Performance Distribution
                            </CardTitle>
                            <p className="text-sm text-gray-600">
                                Click on any category to view employees in that group
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="h-96">
                                <Bar data={chartData} options={chartOptions} />
                            </div>
                        </CardContent>
                    </Card>
                </>
            ) : (
                /* Category Detail View */
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedCategory(null)}
                                    className="mb-4"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Dashboard
                                </Button>
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Category: <span className="text-blue-600">{selectedCategory}</span>
                                </h2>
                                <p className="text-gray-600 mt-1">
                                    {employeesInCategory.length} employee{employeesInCategory.length !== 1 ? 's' : ''} in this category
                                </p>
                            </div>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Employees in {selectedCategory}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {employeesInCategory.length > 0 ? (
                                <div className="grid gap-3">
                                    {employeesInCategory.map((record) => (
                                        <div
                                            key={record.employee_name}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <div>
                                                <h3 className="font-medium text-gray-800">{record.employee_name}</h3>
                                                <p className="text-sm text-gray-600">
                                                    Performance: {record.data.performance} | Potential: {record.data.potential}
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSelectedEmployee(record)}
                                            >
                                                View Details
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 italic">No employees found in this category</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Modal for Calibrated Employees */}
            {showCalibratedModal && (
                <Modal
                    open={showCalibratedModal}
                    onClose={() => setShowCalibratedModal(false)}
                    title="Calibrated Employees"
                >
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {sortedCalibratedEmployees.map((record) => {
                            const needsRecalibration = isOldCalibration(record.data.modified);
                            return (
                                <div
                                    key={record.employee_name}
                                    className={`flex items-center justify-between p-3 border rounded-lg ${needsRecalibration ? 'border-orange-200 bg-orange-50' : 'hover:bg-gray-50'
                                        } transition-colors`}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium text-gray-800">{record.employee_name}</h3>
                                            {needsRecalibration && (
                                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <Clock className="h-3 w-3" />
                                            <span>Last updated on: {formatDate(record.data.modified)}</span>
                                        </div>
                                        {needsRecalibration && (
                                            <p className="text-xs text-orange-600 mt-1">
                                                This employee should be recalibrated
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedEmployee(record);
                                            setShowCalibratedModal(false);
                                        }}
                                    >
                                        View
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </Modal>
            )}

            {/* Modal for Non-Calibrated Employees */}
            {showNotCalibratedModal && (
                <Modal
                    open={showNotCalibratedModal}
                    onClose={() => setShowNotCalibratedModal(false)}
                    title="Employees Pending Calibration"
                >
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {notCalibrated.map((record) => (
                            <div
                                key={record.employee_name}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div>
                                    <h3 className="font-medium text-gray-800">{record.employee_name}</h3>
                                    <p className="text-sm text-gray-600">Calibration pending</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Modal>
            )}

      {/* Modal for Employee Details */}
      {selectedEmployee && (
        <Modal 
          open={!!selectedEmployee} 
          onClose={() => setSelectedEmployee(null)}
          title={`Calibration Details - ${selectedEmployee.employee_name}`}
        >
          <CalibrationSection 
            employeeCalibration={selectedEmployee.data}
            showPerformanceMatrix={true}
            showSelfEvaluationUpload={false}
            isAdminView={true}
          />
        </Modal>
      )}
    </div>
  );
};

export default CalibrationDashboard;
