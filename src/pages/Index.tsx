
import { useState } from "react";
import ProfileHeader from "@/components/ProfileHeader";
import AboutSection from "@/components/AboutSection";
import CreativePursuits from "@/components/CreativePursuits";
import IceBreakers from "@/components/IceBreakers";
import MyPeople from "@/components/MyPeople";
import SkillsMatrix from "@/components/SkillsMatrix";
import CareerProgression from "@/components/CareerProgression";
import FeedbackSection from "@/components/FeedbackSection";
import CalibrationSection from "@/components/CalibrationSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CalibrationDashboard from "@/components/CalibrationDashboard";
import Contributions from "./Contributions";
import { useEmployeeDetails } from "@/api/employeeService";
import { roleCategories } from "@/utils/roleUtils";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [activeTab, setActiveTab] = useState("about");
  const { employee, loading } = useEmployeeDetails();

  // Check if user has business role access for calibration dashboard
  const userRole = employee?.designation || "";
  const hasBusinessAccess = roleCategories.Business.includes(userRole);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <ProfileHeader />
        
        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="people">My People</TabsTrigger>
              <TabsTrigger value="career">Career</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
              <TabsTrigger value="calibration">Calibration</TabsTrigger>
              {hasBusinessAccess && (
                <TabsTrigger value="calibration-dashboard">Calibration Dashboard</TabsTrigger>
              )}
            </TabsList>
            
            {/* About Tab */}
            <TabsContent value="about" className="space-y-6 mt-6">
              <AboutSection />
              <SkillsMatrix />
              <IceBreakers />
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">My Career at Incubyte</h2>
                <CareerProgression />
              </div>
            </TabsContent>
            
            {/* My People Tab */}
            <TabsContent value="people" className="mt-6">
              <MyPeople />
            </TabsContent>
            
            {/* Career Tab */}
            <TabsContent value="career" className="mt-6">
              <CareerProgression />
            </TabsContent>
            
            {/* Feedback Tab */}
            <TabsContent value="feedback" className="mt-6">
              <FeedbackSection />
            </TabsContent>
            
            {/* Calibration Tab */}
            <TabsContent value="calibration" className="mt-6">
              <CalibrationSection 
                employeeCalibration={''}
                showPerformanceMatrix={false}
                showSelfEvaluationUpload={true}
              />
            </TabsContent>

            {/* Calibration Dashboard Tab - Only for Business roles */}
            {hasBusinessAccess && (
              <TabsContent value="calibration-dashboard" className="mt-6">
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
