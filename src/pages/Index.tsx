
import { useState, useEffect } from "react";
import ProfileHeader from "@/components/ProfileHeader";
import AboutSection from "@/components/AboutSection";
import CreativePursuits from "@/components/CreativePursuits";
import IceBreakers from "@/components/IceBreakers";
import SharedLearnings from "@/components/SharedLearnings";
import MyPeople from "@/components/MyPeople";
import SkillsMatrix from "@/components/SkillsMatrix";
import CareerProgression from "@/components/CareerProgression";
import FeedbackSection from "@/components/FeedbackSection";
import CalibrationSection from "@/components/CalibrationSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CalibrationDashboard from "@/components/CalibrationDashboard";
import Tasks from "./Tasks";
import { useEmployee } from "@/contexts/EmployeeContext";
import { roleCategories, shouldShowCalibrationTab, hasTechLeadAdvisorRole, hasPSMRole } from "@/utils/roleUtils";

const Index = () => {
  const [activeTab, setActiveTab] = useState("about");
  const [testCounter, setTestCounter] = useState(0); // Temporary state for debugging
  const [hasTechLeadAdvisorAccess, setHasTechLeadAdvisorAccess] = useState(false);
  const [hasPSMAccess, setHasPSMAccess] = useState(false);
  const { employee, loading, isViewingOtherEmployee, viewEmployeeById } = useEmployee();

  // Check if user has business role access for calibration dashboard
  const userRole = employee?.designation || "";
  const hasBusinessAccess = roleCategories.Business.includes(userRole);
  const showCalibrationTab = shouldShowCalibrationTab(userRole);

  // Check Tech Lead/Advisor and PSM roles from backend
  useEffect(() => {
    const checkRoles = async () => {
      try {
        const [techLeadAccess, psmAccess] = await Promise.all([
          hasTechLeadAdvisorRole(),
          hasPSMRole()
        ]);
        setHasTechLeadAdvisorAccess(techLeadAccess);
        setHasPSMAccess(psmAccess);
      } catch (error) {
        console.error('Error checking roles:', error);
        setHasTechLeadAdvisorAccess(false);
        setHasPSMAccess(false);
      }
    };

    checkRoles();
  }, []);

  // Temporary debugging - remove after fixing
  console.log('Index component render:', {
    employeeName: employee?.employee_name,
    employeeId: employee?.name,
    isViewingOtherEmployee,
    loading,
    testCounter,
    hasTechLeadAdvisorAccess,
    hasPSMAccess
  });

  // Temporary test function - remove after fixing
  const testFetchEmployee = async () => {
    try {
      console.log('Testing fetchEmployeeById with hardcoded ID...');
      setTestCounter(prev => prev + 1); // Force re-render
      await viewEmployeeById('E0034'); // Test with a known employee ID
    } catch (error) {
      console.error('Test failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Temporary test button - remove after fixing */}
        <div className="mb-4">
          <button 
            onClick={testFetchEmployee}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test Fetch Employee E0034
          </button>
        </div>
        
        <ProfileHeader />
        
        <div className="mt-6">
          {isViewingOtherEmployee ? (
            // When viewing other employees, show tabs for Tech Lead/Advisor and PSM roles
            (hasTechLeadAdvisorAccess || hasPSMAccess) ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="calibration">Calibration</TabsTrigger>
                </TabsList>
                
                {/* About Tab */}
                <TabsContent value="about" className="space-y-6 mt-6">
                  {/* About Section - Only show if filled */}
                  {employee?.custom_about && <AboutSection />}
                  
                  {/* MyPeople - Always show */}
                  <MyPeople />
                  
                  {/* TechStack - Show read-only version */}
                  {employee?.custom_tech_stack && employee.custom_tech_stack.length > 0 && (
                    <SkillsMatrix />
                  )}
                  
                  {/* Career Progression - Always show */}
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Career at Incubyte</h2>
                    <CareerProgression />
                  </div>
                  
                  {/* IceBreakers - Only show if filled */}
                  {employee?.custom_employee_icebreaker_question && 
                   employee.custom_employee_icebreaker_question.length > 0 && 
                   employee.custom_employee_icebreaker_question.some(q => q.answer && q.answer.trim()) && (
                    <IceBreakers />
                  )}
                  
                  {/* SharedLearnings - Hidden when viewing other employees */}
                </TabsContent>
                
                {/* Calibration Tab */}
                <TabsContent value="calibration" className="mt-6">
                  <CalibrationSection 
                    employeeId={employee?.name}
                    showPerformanceMatrix={true}
                    showSelfEvaluationUpload={false}
                    isAdminView={true}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              // When viewing other employees without special roles, show only About tab content without tabs
              <div className="space-y-6">
                {/* About Section - Only show if filled */}
                {employee?.custom_about && <AboutSection />}
                
                {/* MyPeople - Always show */}
                <MyPeople />
                
                {/* TechStack - Show read-only version */}
                {employee?.custom_tech_stack && employee.custom_tech_stack.length > 0 && (
                  <SkillsMatrix />
                )}
                
                {/* Career Progression - Always show */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Career at Incubyte</h2>
                  <CareerProgression />
                </div>
                
                {/* IceBreakers - Only show if filled */}
                {employee?.custom_employee_icebreaker_question && 
                 employee.custom_employee_icebreaker_question.length > 0 && 
                 employee.custom_employee_icebreaker_question.some(q => q.answer && q.answer.trim()) && (
                  <IceBreakers />
                )}
                
                {/* SharedLearnings - Hidden when viewing other employees */}
              </div>
            )
          ) : (
            // Normal tabbed interface for own profile
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="feedback">Feedback</TabsTrigger>
                {showCalibrationTab && (
                  <TabsTrigger value="calibration">Calibration</TabsTrigger>
                )}
                {hasBusinessAccess && (
                  <TabsTrigger value="calibration-dashboard">Calibration Dashboard</TabsTrigger>
                )}
              </TabsList>
              
              {/* About Tab */}
              <TabsContent value="about" className="space-y-6 mt-6">
                <AboutSection />
                <MyPeople />
                <SkillsMatrix />

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">My Career at Incubyte</h2>
                  <CareerProgression />
                </div>
                <IceBreakers />
                <SharedLearnings />
              </TabsContent>
              
              {/* Tasks Tab */}
              <TabsContent value="tasks" className="mt-6">
                <Tasks />
              </TabsContent>
              
              {/* Feedback Tab */}
              <TabsContent value="feedback" className="mt-6">
                <FeedbackSection />
              </TabsContent>
              
              {/* Calibration Tab - Only show if user doesn't have dashboard access */}
              {showCalibrationTab && (
                <TabsContent value="calibration" className="mt-6">
                  <CalibrationSection 
                    showPerformanceMatrix={false}
                    showSelfEvaluationUpload={true}
                  />
                </TabsContent>
              )}

              {/* Calibration Dashboard Tab - Only for Business roles */}
              {hasBusinessAccess && (
                <TabsContent value="calibration-dashboard" className="mt-6">
                  <CalibrationDashboard />
                </TabsContent>
              )}
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
