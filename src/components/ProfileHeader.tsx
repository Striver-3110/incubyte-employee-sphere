
import { useEmployeeDetails } from "@/api/employeeService";
import { calculateTenure, formatDate } from "@/utils/dateUtils";
import { Linkedin, Github, Mail, Phone, MapPin, Edit, X, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const ProfileHeader = () => {
  const { employee, loading } = useEmployeeDetails();
  const [editingSocial, setEditingSocial] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState("");

  if (loading || !employee) {
    return <ProfileHeaderSkeleton />;
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "linkedin":
        return <Linkedin className="h-5 w-5" />;
      case "github":
        return <Github className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const handleEditSocial = (platformId: string, url: string) => {
    setEditingSocial(platformId);
    setNewUrl(url);
  };

  const handleSaveSocial = (platformId: string) => {
    // In a real app, this would update the URL via an API call
    console.log(`Updated ${platformId} to ${newUrl}`);
    setEditingSocial(null);
    setNewUrl("");
  };

  const handleCancelEdit = () => {
    setEditingSocial(null);
    setNewUrl("");
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 sm:p-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-inner">
              <img 
                src="/placeholder.svg" 
                alt={employee.employee_name} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Profile Details */}
          <div className="flex flex-col flex-grow">
            <div className="mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{employee.employee_name}</h1>
              <p className="text-sm sm:text-base font-medium text-blue-600 mt-1">{employee.designation}</p>
              
              <div className="flex items-center mt-2 text-gray-600 text-sm">
                <span>Joined {formatDate(employee.date_of_joining)}</span>
                <span className="mx-2">•</span>
                <span>Tenure: {calculateTenure(employee.date_of_joining)}</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {employee.custom_platforms.map((platform) => (
                <div key={platform.name} className="flex items-center">
                  {editingSocial === platform.name ? (
                    <div className="flex items-center space-x-2">
                      <Input 
                        value={newUrl} 
                        onChange={(e) => setNewUrl(e.target.value)} 
                        className="h-8 w-48"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleSaveSocial(platform.name)}
                        className="h-8 w-8"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleCancelEdit}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <a 
                        href={platform.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        {getPlatformIcon(platform.platform_name)}
                        <span>{platform.platform_name}</span>
                      </a>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditSocial(platform.name, platform.url)}
                        className="h-6 w-6 ml-1"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <a href={`mailto:${employee.company_email}`} className="hover:underline">
                  {employee.company_email}
                </a>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <a href={`tel:${employee.cell_number}`} className="hover:underline">
                  {employee.cell_number}
                </a>
              </div>
              
              <div className="flex items-start gap-2 text-sm text-gray-600 sm:col-span-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  {employee.current_address}, {employee.custom_city}, {employee.custom_state} - {employee.custom_pin}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileHeaderSkeleton = () => (
  <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
    <div className="p-6 sm:p-8">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Skeleton className="w-28 h-28 sm:w-32 sm:h-32 rounded-full" />
        <div className="flex-grow">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-5 w-32 mb-4" />
          <Skeleton className="h-4 w-64 mb-6" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full sm:col-span-2" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ProfileHeader;
