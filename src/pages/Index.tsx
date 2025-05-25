
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

const Index = () => {
  const [activeTab, setActiveTab] = useState("about");

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
              <TabsTrigger value="calibration-dashboard">Calibration Dashboard</TabsTrigger>
            </TabsList>
            
            {/* About Tab */}
            <TabsContent value="about" className="space-y-6 mt-6">
              <AboutSection />
              <SkillsMatrix />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CreativePursuits />
                <IceBreakers />
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
              <CalibrationSection employeeCalibration={''} />
            </TabsContent>

            {/* Calibration Dashboard Tab*/}
            <TabsContent value="calibration-dashboard" className="mt-6">
              <CalibrationDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Index;
