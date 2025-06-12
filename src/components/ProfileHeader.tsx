
import { useEmployeeDetails, useTeamEmployees } from "@/api/employeeService";
import { calculateTenure, formatDate } from "@/utils/dateUtils";
import { Linkedin, Github, Twitter, Mail, Phone, MapPin, Edit, X, Check, Plus, Save, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import TeamMembersModal from "./TeamMembersModal";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const socialPlatforms = [
  { id: "linkedin", name: "LinkedIn", icon: Linkedin },
  { id: "github", name: "GitHub", icon: Github },
  { id: "twitter", name: "Twitter", icon: Twitter },
];

const ProfileHeader = () => {
  const { employee, setEmployee, loading } = useEmployeeDetails();
  const { employees: teamMembers } = useTeamEmployees();
  const [editingSocial, setEditingSocial] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState("");
  const [processingPlatform, setProcessingPlatform] = useState<string | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  const [isAddingPlatform, setIsAddingPlatform] = useState(false);
  const [isAddingPlatformLoading, setIsAddingPlatformLoading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [platformUrl, setPlatformUrl] = useState("");

  // Check if any operation is in progress
  const isAnyOperationInProgress = !!processingPlatform || isAddingPlatformLoading;

  if (loading || !employee) {
    return <ProfileHeaderSkeleton />;
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "linkedin":
        return <Linkedin className="h-5 w-5" />;
      case "github":
        return <Github className="h-5 w-5" />;
      case "twitter":
        return <Twitter className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const handleEditSocial = (platformId: string, url: string) => {
    setEditingSocial(platformId);
    setNewUrl(url);
  };

  const handleSaveSocial = async (platformId: string) => {
    const trimmedUrl = newUrl.trim();
    if (!trimmedUrl) {
      toast({
        title: "Error",
        description: "URL cannot be empty",
        variant: "destructive",
      });
      return;
    }

    // URL validation
    const urlRegex = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/;
    if (!urlRegex.test(trimmedUrl)) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessingPlatform(platformId);
      
      const updatedPlatforms = employee.custom_platforms.map((platform) =>
        platform.name === platformId ? { ...platform, url: trimmedUrl } : platform
      );

      const response = await fetch(`${BASE_URL}user.set_employee_details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          custom_platforms: updatedPlatforms,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error('Failed to update platform');
      }

      const platformIndex = employee.custom_platforms.findIndex(
        (platform) => platform.name === platformId
      );
      if (platformIndex !== -1) {
        employee.custom_platforms[platformIndex].url = trimmedUrl;
      }

      toast({
        title: "Success",
        description: "Platform link updated successfully",
      });

      setEditingSocial(null);
      setNewUrl("");
    } catch (error) {
      console.error("Error updating platform:", error);
      toast({
        title: "Error",
        description: "Failed to update platform link",
        variant: "destructive",
      });
    } finally {
      setProcessingPlatform(null);
    }
  };

  const getAvailablePlatforms = () => {
    const addedPlatforms = employee.custom_platforms.map((p) =>
      p.platform_name.toLowerCase()
    );
    return socialPlatforms.filter((platform) => !addedPlatforms.includes(platform.name.toLowerCase()));
  };

  const handleAddPlatform = async () => {
    const trimmedUrl = platformUrl.trim();

    if (!selectedPlatform || !trimmedUrl) {
      toast({
        title: "Error",
        description: "Please select a platform and enter a URL",
        variant: "destructive",
      });
      return;
    }

    const urlRegex = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/;
    if (!urlRegex.test(trimmedUrl)) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAddingPlatformLoading(true);
      const platformInfo = socialPlatforms.find((p) => p.id === selectedPlatform);

      if (!platformInfo) return;

      const newPlatform = {
        name: selectedPlatform,
        platform_name: platformInfo.name,
        url: trimmedUrl,
      };

      const updatedPlatforms = [...employee.custom_platforms, newPlatform];

      const response = await fetch(`${BASE_URL}user.set_employee_details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          custom_platforms: updatedPlatforms,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error('Failed to add platform');
      }

      employee.custom_platforms.push(newPlatform);

      toast({
        title: "Success",
        description: "Platform added successfully",
      });

      setIsAddingPlatform(false);
      setSelectedPlatform("");
      setPlatformUrl("");
    } catch (error) {
      console.error("Error adding platform:", error);
      toast({
        title: "Error",
        description: "Failed to add platform",
        variant: "destructive",
      });
    } finally {
      setIsAddingPlatformLoading(false);
    }
  };

  const handleDeletePlatform = async (platformName: string) => {
    try {
      const platformToDelete = employee.custom_platforms.find(
        (platform) => platform.platform_name === platformName
      );
      
      if (!platformToDelete) return;
      
      setProcessingPlatform(platformToDelete.name);

      const updatedPlatforms = employee.custom_platforms.filter(
        (platform) => platform.platform_name !== platformName
      );

      const response = await fetch(`${BASE_URL}user.set_employee_details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          custom_platforms: updatedPlatforms,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error('Failed to delete platform');
      }

      setEmployee((prevEmployee) => ({
        ...prevEmployee,
        custom_platforms: updatedPlatforms,
      }));

      toast({
        title: "Success",
        description: "Platform deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting platform:", error);
      toast({
        title: "Error",
        description: "Failed to delete platform",
        variant: "destructive",
      });
    } finally {
      setProcessingPlatform(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingSocial(null);
    setNewUrl("");
  };

  const handleCancelAddPlatform = () => {
    setIsAddingPlatform(false);
    setSelectedPlatform("");
    setPlatformUrl("");
  };

  const availablePlatforms = getAvailablePlatforms();

  // Check if user is co-founder to show team members
  const isCoFounder = employee && employee.designation === "Co-Founder";
  const hasTeamMembers = teamMembers && teamMembers.length > 0;

  return (
    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section - Profile Info */}
          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-md overflow-hidden border-4 border-gray-100 shadow-inner">
                  <img
                    src={employee.image || ''}
                    alt={employee.employee_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Profile Details */}
              <div className="flex flex-col flex-grow min-w-0">
                <div className="mb-4">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 break-words">{employee.employee_name}</h1>
                  <p className="text-sm sm:text-base font-medium text-blue-600 mt-1">{employee.designation}</p>

                  <div className="flex flex-col sm:flex-row sm:items-center mt-2 text-gray-600 text-sm gap-1 sm:gap-0">
                    <span>Joined {formatDate(employee.date_of_joining)}</span>
                    <span className="hidden sm:inline mx-2">•</span>
                    <span>Tenure: {calculateTenure(employee.date_of_joining)}</span>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 mb-4">
                  {employee.custom_platforms.map((platform) => (
                    <div key={platform.name} className="flex items-center">
                      {processingPlatform === platform.name ? (
                        <Skeleton className="h-8 w-28 sm:w-32" />
                      ) : editingSocial === platform.name ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            value={newUrl}
                            onChange={(e) => setNewUrl(e.target.value)}
                            className="h-8 w-36 sm:w-48"
                            disabled={isAnyOperationInProgress}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSaveSocial(platform.name)}
                            className="h-8 w-8"
                            disabled={isAnyOperationInProgress}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCancelEdit}
                            className="h-8 w-8"
                            disabled={isAnyOperationInProgress}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <a
                            href={platform.url.startsWith("http") ? platform.url : `https://${platform.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
                          >
                            {getPlatformIcon(platform.platform_name.toLowerCase())}
                            <span className="hidden sm:inline">{platform.platform_name}</span>
                          </a>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditSocial(platform.name, platform.url)}
                            className="h-6 w-6 ml-1"
                            disabled={processingPlatform === platform.name}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePlatform(platform.platform_name)}
                            className="h-6 w-6 ml-1 text-red-500"
                            disabled={processingPlatform === platform.name}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}

                  {/* Add Platform Button & Form */}
                  {availablePlatforms.length > 0 && !isAddingPlatform && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddingPlatform(true)}
                      className="flex items-center gap-1 text-xs sm:text-sm"
                      disabled={isAnyOperationInProgress}
                    >
                      <Plus className="h-3 w-3" /> 
                      <span className="hidden sm:inline">Add Platform</span>
                      <span className="sm:hidden">Add</span>
                    </Button>
                  )}

                  {isAddingPlatformLoading ? (
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-24 sm:w-32" />
                      <Skeleton className="h-8 w-36 sm:w-48" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  ) : (
                    isAddingPlatform && (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 border rounded-md bg-gray-50 w-full sm:w-auto">
                        <Select 
                          value={selectedPlatform} 
                          onValueChange={setSelectedPlatform}
                          disabled={isAnyOperationInProgress}
                        >
                          <SelectTrigger className="w-full sm:w-[120px] h-8">
                            <SelectValue placeholder="Platform" />
                          </SelectTrigger>
                          <SelectContent>
                            {availablePlatforms.map((platform) => (
                              <SelectItem key={platform.id} value={platform.id}>
                                <div className="flex items-center gap-2">
                                  <platform.icon className="h-4 w-4" />
                                  <span>{platform.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Input
                          placeholder="Enter URL"
                          value={platformUrl}
                          onChange={(e) => setPlatformUrl(e.target.value)}
                          className="h-8 w-full sm:w-48"
                          disabled={isAnyOperationInProgress}
                        />

                        <div className="flex gap-1 w-full sm:w-auto">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={handleAddPlatform}
                            className="h-8 flex-1 sm:flex-none"
                            disabled={isAnyOperationInProgress}
                          >
                            <Save className="h-3 w-3 mr-1" /> Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancelAddPlatform}
                            className="h-8"
                            disabled={isAnyOperationInProgress}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <a href={`mailto:${employee.company_email}`} className="hover:underline truncate">
                      {employee.company_email}
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <a href={`tel:${employee.cell_number}`} className="hover:underline">
                      {employee.cell_number}
                    </a>
                  </div>

                  <div className="flex items-center gap-2 min-w-0 sm:col-span-2 lg:col-span-1">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">
                      {employee.custom_city}, {employee.custom_state}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Team Members */}
          {!isCoFounder && hasTeamMembers && (
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm sm:text-base font-medium text-gray-700 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Team Members
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {teamMembers.slice(0, 6).map((member, index) => (
                    <div key={member.name} className="text-sm border-b border-gray-200 pb-2 last:border-b-0 last:pb-0">
                      <div className="font-medium text-gray-800 truncate">{member.employee_name}</div>
                      <div className="text-gray-500 text-xs truncate">{member.designation}</div>
                    </div>
                  ))}
                  
                  {teamMembers.length > 6 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsTeamModalOpen(true)}
                      className="text-blue-600 hover:text-blue-700 p-0 h-auto font-normal text-sm w-full justify-start"
                    >
                      +{teamMembers.length - 6} more team members
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <TeamMembersModal 
        isOpen={isTeamModalOpen} 
        onClose={() => setIsTeamModalOpen(false)} 
      />
    </div>
  );
};

const ProfileHeaderSkeleton = () => (
  <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
            <Skeleton className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-md" />
            <div className="flex-grow min-w-0">
              <Skeleton className="h-6 sm:h-8 w-48 mb-2" />
              <Skeleton className="h-4 sm:h-5 w-32 mb-4" />
              <Skeleton className="h-4 w-64 mb-6" />
              <div className="flex gap-2 mb-4">
                <Skeleton className="h-8 w-20 sm:w-24" />
                <Skeleton className="h-8 w-20 sm:w-24" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <Skeleton className="h-5 w-36 sm:w-40" />
                <Skeleton className="h-5 w-28 sm:w-32" />
                <Skeleton className="h-5 w-32 sm:w-36" />
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="grid grid-cols-1 gap-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ProfileHeader;
