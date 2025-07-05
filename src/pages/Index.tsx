
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
import { User, MapPin, Calendar, Building } from "lucide-react";

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-blue-800 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-blue-800 font-medium">No employee data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-12">          
          {/* Profile Header Content */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 text-white">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
              <div className="relative">
                <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
                  <User className="w-16 h-16 text-white/80" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              
              <div className="text-center lg:text-left space-y-2">
                <h1 className="text-3xl lg:text-4xl font-bold">
                  {employee?.employee_name || 'Employee Name'}
                </h1>
                <p className="text-xl text-white/90 font-medium">
                  {employee?.designation || 'Designation'}
                </p>
                <p className="text-lg text-white/80">
                  {employee?.custom_team || "Team"}
                </p>
              </div>
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:ml-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
                <Building className="w-6 h-6 mx-auto mb-2 text-white/80" />
                <p className="text-sm text-white/70">Team</p>
                <p className="font-semibold text-white">{employee?.custom_team || "—"}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
                <MapPin className="w-6 h-6 mx-auto mb-2 text-white/80" />
                <p className="text-sm text-white/70">Location</p>
                <p className="font-semibold text-white">{employee?.custom_city || "—"}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
                <Calendar className="w-6 h-6 mx-auto mb-2 text-white/80" />
                <p className="text-sm text-white/70">Joined</p>
                <p className="font-semibold text-white">
                  {employee?.date_of_joining ? new Date(employee.date_of_joining).getFullYear() : "—"}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
                <User className="w-6 h-6 mx-auto mb-2 text-white/80" />
                <p className="text-sm text-white/70">ID</p>
                <p className="font-semibold text-white">{employee?.name || "—"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <TabsList className="w-full justify-start bg-transparent h-auto p-0 overflow-x-auto">
                <TabsTrigger 
                  value="about"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-blue-600 rounded-none px-6 py-4 whitespace-nowrap"
                >
                  About
                </TabsTrigger>
                <TabsTrigger 
                  value="tasks"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-blue-600 rounded-none px-6 py-4 whitespace-nowrap"
                >
                  Tasks
                </TabsTrigger>
                <TabsTrigger 
                  value="feedback"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-blue-600 rounded-none px-6 py-4 whitespace-nowrap"
                >
                  Feedback
                </TabsTrigger>
                {showCalibrationTab && (
                  <TabsTrigger 
                    value="calibration"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-blue-600 rounded-none px-6 py-4 whitespace-nowrap"
                  >
                    Calibration
                  </TabsTrigger>
                )}
                {hasBusinessAccess && (
                  <TabsTrigger 
                    value="calibration-dashboard"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-blue-600 rounded-none px-6 py-4 whitespace-nowrap"
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
              <div className="bg-gray-50 p-8 rounded-xl border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-green-500 rounded-full"></div>
                  My Career at Incubyte
                </h2>
                <CareerProgression />
              </div>
              <IceBreakers />
              <SharedLearnings />
            </TabsContent>
            
            <TabsContent value="tasks" className="p-8">
              <div className="bg-gray-50 rounded-xl border border-gray-200">
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
        </div>
      </div>
    </div>
  );
};

export default Index;
