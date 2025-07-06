
import { useState, useEffect } from "react";
import ProfileHeader from "@/components/ProfileHeader";
import AboutSection from "@/components/AboutSection";
import EmployeeAbout from "@/components/EmployeeAbout";
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

const Index = () => {
  const [activeTab, setActiveTab] = useState("about");

  // Mock role permissions for testing
  const showCalibrationTab = true;
  const hasBusinessAccess = false;

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
              <EmployeeAbout />
              <MyPeople />
              <SkillsMatrix />
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
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
