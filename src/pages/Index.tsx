
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
import { User, MapPin, Calendar, Building } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("about");
  const [testCounter, setTestCounter] = useState(0);
  const [hasTechLeadAdvisorAccess, setHasTechLeadAdvisorAccess] = useState(false);
  const [hasPSMAccess, setHasPSMAccess] = useState(false);
  const { employee, loading, isViewingOtherEmployee, viewEmployeeById } = useEmployee();

  const userRole = employee?.designation || "";
  const hasBusinessAccess = roleCategories.Business.includes(userRole);
  const showCalibrationTab = shouldShowCalibrationTab(userRole);

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

  console.log('Index component render:', {
    employeeName: employee?.employee_name,
    employeeId: employee?.name,
    isViewingOtherEmployee,
    loading,
    testCounter,
    hasTechLeadAdvisorAccess,
    hasPSMAccess
  });

  const testFetchEmployee = async () => {
    try {
      console.log('Testing fetchEmployeeById with hardcoded ID...');
      setTestCounter(prev => prev + 1);
      await viewEmployeeById('E0034');
    } catch (error) {
      console.error('Test failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brandBlue/5 to-brandGreen/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-brandBlue/20 border-t-brandBlue rounded-full animate-spin mx-auto"></div>
          <p className="text-brandBlueDark font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brandBlue/5 to-brandGreen/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-brandBlueDark font-medium">No employee data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brandBlue/5 via-white to-brandGreen/5">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-brandBlueDarkest via-brandBlue to-brandBlueLighter">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          {/* Temporary test button */}
          <div className="absolute top-4 right-4">
            <button 
              onClick={testFetchEmployee}
              className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-200 text-sm"
            >
              Test Fetch Employee E0034
            </button>
          </div>
          
          {/* Profile Header Content */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 text-white">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
              <div className="relative">
                <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
                  <User className="w-16 h-16 text-white/80" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-brandGreen rounded-full border-4 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              
              <div className="text-center lg:text-left space-y-2">
                <h1 className="text-3xl lg:text-4xl font-bold">
                  {employee.employee_name}
                </h1>
                <p className="text-xl text-white/90 font-medium">
                  {employee.designation}
                </p>
                <p className="text-lg text-white/80">
                  {employee.custom_team || "Team"}
                </p>
              </div>
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:ml-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
                <Building className="w-6 h-6 mx-auto mb-2 text-white/80" />
                <p className="text-sm text-white/70">Team</p>
                <p className="font-semibold text-white">{employee.custom_team || "—"}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
                <MapPin className="w-6 h-6 mx-auto mb-2 text-white/80" />
                <p className="text-sm text-white/70">Location</p>
                <p className="font-semibold text-white">{employee.custom_city || "—"}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
                <Calendar className="w-6 h-6 mx-auto mb-2 text-white/80" />
                <p className="text-sm text-white/70">Joined</p>
                <p className="font-semibold text-white">
                  {employee.date_of_joining ? new Date(employee.date_of_joining).getFullYear() : "—"}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
                <User className="w-6 h-6 mx-auto mb-2 text-white/80" />
                <p className="text-sm text-white/70">ID</p>
                <p className="font-semibold text-white">{employee.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-borderSoft overflow-hidden">
          {isViewingOtherEmployee ? (
            (hasTechLeadAdvisorAccess || hasPSMAccess) ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="border-b border-borderSoft bg-gradient-to-r from-highlightBg to-white">
                  <TabsList className="w-full justify-start bg-transparent h-auto p-0">
                    <TabsTrigger 
                      value="about" 
                      className="data-[state=active]:bg-brandBlue data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-brandBlue rounded-none px-8 py-4"
                    >
                      About
                    </TabsTrigger>
                    <TabsTrigger 
                      value="calibration"
                      className="data-[state=active]:bg-brandBlue data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-brandBlue rounded-none px-8 py-4"
                    >
                      Calibration
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="about" className="space-y-8 p-8">
                  {employee.custom_about && <AboutSection />}
                  <MyPeople />
                  {employee.custom_tech_stack && employee.custom_tech_stack.length > 0 && (
                    <SkillsMatrix />
                  )}
                  <div className="bg-cardBg p-8 rounded-xl border border-borderSoft">
                    <h2 className="text-2xl font-bold text-brandBlueDarkest mb-6 flex items-center gap-3">
                      <div className="w-1 h-8 bg-gradient-to-b from-brandBlue to-brandGreen rounded-full"></div>
                      Career at Incubyte
                    </h2>
                    <CareerProgression />
                  </div>
                  {employee.custom_employee_icebreaker_question && 
                   employee.custom_employee_icebreaker_question.length > 0 && 
                   employee.custom_employee_icebreaker_question.some(q => q.answer && q.answer.trim()) && (
                    <IceBreakers />
                  )}
                </TabsContent>
                
                <TabsContent value="calibration" className="p-8">
                  <CalibrationSection 
                    employeeId={employee.name}
                    showPerformanceMatrix={true}
                    showSelfEvaluationUpload={false}
                    isAdminView={true}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="space-y-8 p-8">
                {employee.custom_about && <AboutSection />}
                <MyPeople />
                {employee.custom_tech_stack && employee.custom_tech_stack.length > 0 && (
                  <SkillsMatrix />
                )}
                <div className="bg-cardBg p-8 rounded-xl border border-borderSoft">
                  <h2 className="text-2xl font-bold text-brandBlueDarkest mb-6 flex items-center gap-3">
                    <div className="w-1 h-8 bg-gradient-to-b from-brandBlue to-brandGreen rounded-full"></div>
                    Career at Incubyte
                  </h2>
                  <CareerProgression />
                </div>
                {employee.custom_employee_icebreaker_question && 
                 employee.custom_employee_icebreaker_question.length > 0 && 
                 employee.custom_employee_icebreaker_question.some(q => q.answer && q.answer.trim()) && (
                  <IceBreakers />
                )}
              </div>
            )
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b border-borderSoft bg-gradient-to-r from-highlightBg to-white">
                <TabsList className="w-full justify-start bg-transparent h-auto p-0 overflow-x-auto">
                  <TabsTrigger 
                    value="about"
                    className="data-[state=active]:bg-brandBlue data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-brandBlue rounded-none px-6 py-4 whitespace-nowrap"
                  >
                    About
                  </TabsTrigger>
                  <TabsTrigger 
                    value="tasks"
                    className="data-[state=active]:bg-brandBlue data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-brandBlue rounded-none px-6 py-4 whitespace-nowrap"
                  >
                    Tasks
                  </TabsTrigger>
                  <TabsTrigger 
                    value="feedback"
                    className="data-[state=active]:bg-brandBlue data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-brandBlue rounded-none px-6 py-4 whitespace-nowrap"
                  >
                    Feedback
                  </TabsTrigger>
                  {showCalibrationTab && (
                    <TabsTrigger 
                      value="calibration"
                      className="data-[state=active]:bg-brandBlue data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-brandBlue rounded-none px-6 py-4 whitespace-nowrap"
                    >
                      Calibration
                    </TabsTrigger>
                  )}
                  {hasBusinessAccess && (
                    <TabsTrigger 
                      value="calibration-dashboard"
                      className="data-[state=active]:bg-brandBlue data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-brandBlue rounded-none px-6 py-4 whitespace-nowrap"
                    >
                      Dashboard
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>
              
              <TabsContent value="about" className="space-y-8 p-8">
                <AboutSection />
                <MyPeople />
                <SkillsMatrix />
                <div className="bg-cardBg p-8 rounded-xl border border-borderSoft">
                  <h2 className="text-2xl font-bold text-brandBlueDarkest mb-6 flex items-center gap-3">
                    <div className="w-1 h-8 bg-gradient-to-b from-brandBlue to-brandGreen rounded-full"></div>
                    My Career at Incubyte
                  </h2>
                  <CareerProgression />
                </div>
                <IceBreakers />
                <SharedLearnings />
              </TabsContent>
              
              <TabsContent value="tasks" className="p-8">
                <div className="bg-cardBg rounded-xl border border-borderSoft">
                  <Tasks />
                </div>
              </TabsContent>
              
              <TabsContent value="feedback" className="p-8">
                <FeedbackSection />
              </TabsContent>
              
              {showCalibrationTab && (
                <TabsContent value="calibration" className="p-8">
                  <CalibrationSection 
                    showPerformanceMatrix={false}
                    showSelfEvaluationUpload={true}
                  />
                </TabsContent>
              )}

              {hasBusinessAccess && (
                <TabsContent value="calibration-dashboard" className="p-8">
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
