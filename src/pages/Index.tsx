
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

// Test employee data
const testEmployee = {
  name: "EMP001",
  employee_name: "John Doe",
  designation: "Senior Software Engineer",
  custom_team: "Engineering",
  custom_city: "San Francisco",
  date_of_joining: "2022-01-15",
  custom_about: "Passionate software engineer with 5+ years of experience in full-stack development.",
  custom_tech_stack: [
    { technology: "React", proficiency: "Expert" },
    { technology: "TypeScript", proficiency: "Advanced" },
    { technology: "Node.js", proficiency: "Intermediate" }
  ],
  custom_employee_icebreaker_question: [
    { question: "What's your favorite hobby?", answer: "Playing guitar and hiking" },
    { question: "What's your dream vacation?", answer: "Backpacking through Europe" }
  ],
  custom_pod: "Alpha Pod",
  custom_tech_lead_name: "Jane Smith",
  custom_buddy_name: "Mike Johnson",
  custom_tech_advisor_name: "Sarah Wilson"
};

const Index = () => {
  const [activeTab, setActiveTab] = useState("about");
  const [employee] = useState(testEmployee);
  const [loading] = useState(false);

  // Mock role permissions for testing
  const userRole = employee?.designation || "";
  const hasBusinessAccess = false;
  const showCalibrationTab = true;
  const hasTechLeadAdvisorAccess = false;
  const hasPSMAccess = false;
  const isViewingOtherEmployee = false;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-600 font-medium">No employee data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Profile Header */}
          <ProfileHeader />
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200 bg-white">
              <TabsList className="w-full justify-start bg-transparent h-auto p-0 overflow-x-auto">
                <TabsTrigger 
                  value="about"
                  className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-700 border-b-2 border-transparent rounded-none px-6 py-4 whitespace-nowrap"
                >
                  About
                </TabsTrigger>
                <TabsTrigger 
                  value="tasks"
                  className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-700 border-b-2 border-transparent rounded-none px-6 py-4 whitespace-nowrap"
                >
                  Tasks
                </TabsTrigger>
                <TabsTrigger 
                  value="feedback"
                  className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-700 border-b-2 border-transparent rounded-none px-6 py-4 whitespace-nowrap"
                >
                  Feedback
                </TabsTrigger>
                {showCalibrationTab && (
                  <TabsTrigger 
                    value="calibration"
                    className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-700 border-b-2 border-transparent rounded-none px-6 py-4 whitespace-nowrap"
                  >
                    Calibration
                  </TabsTrigger>
                )}
                {hasBusinessAccess && (
                  <TabsTrigger 
                    value="calibration-dashboard"
                    className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-700 border-b-2 border-transparent rounded-none px-6 py-4 whitespace-nowrap"
                  >
                    Dashboard
                  </TabsTrigger>
                )}
              </TabsList>
            </div>
            
            <TabsContent value="about" className="space-y-6 p-6">
              <AboutSection />
              <MyPeople />
              <SkillsMatrix />
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  My Career at Incubyte
                </h2>
                <CareerProgression />
              </div>
              <IceBreakers />
              <SharedLearnings />
            </TabsContent>
            
            <TabsContent value="tasks" className="p-6">
              <div className="bg-gray-50 rounded-lg border border-gray-200">
                <Tasks />
              </div>
            </TabsContent>
            
            <TabsContent value="feedback" className="p-6">
              <FeedbackSection />
            </TabsContent>
            
            {showCalibrationTab && (
              <TabsContent value="calibration" className="p-6">
                <CalibrationSection 
                  showPerformanceMatrix={false}
                  showSelfEvaluationUpload={true}
                />
              </TabsContent>
            )}

            {hasBusinessAccess && (
              <TabsContent value="calibration-dashboard" className="p-6">
                <CalibrationDashboard />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Index;
