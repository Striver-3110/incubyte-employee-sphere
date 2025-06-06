
import { useEmployeeDetails } from "@/api/employeeService";
import { calculateTenure, formatDate } from "@/utils/dateUtils";
import { Linkedin, Github, Twitter, Mail, Phone, MapPin, Edit, X, Check, Plus, Save, Trash2 } from "lucide-react";
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

const BASE_URL = import.meta.env.VITE_BASE_URL;

const socialPlatforms = [
  { id: "linkedin", name: "LinkedIn", icon: Linkedin },
  { id: "github", name: "GitHub", icon: Github },
  { id: "twitter", name: "Twitter", icon: Twitter },
];

const ProfileHeader = () => {
  const { employee, setEmployee, loading } = useEmployeeDetails();
  const [editingSocial, setEditingSocial] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState("");
  const [processingPlatform, setProcessingPlatform] = useState<string | null>(null);

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
      setProcessingPlatform(platformName);

      // Filter out the platform being deleted
      const updatedPlatforms = employee.custom_platforms.filter(
        (platform) => platform.platform_name !== platformName
      );

      // Send the updated list to the backend
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

      // Use the setEmployee hook to update the employee state
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
                  {processingPlatform === platform.name ? (
                    <Skeleton className="h-8 w-32" />
                  ) : editingSocial === platform.name ? (
                    <div className="flex items-center space-x-2">
                      <Input
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        className="h-8 w-48"
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
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        {getPlatformIcon(platform.platform_name.toLowerCase())}
                        <span>{platform.platform_name}</span>
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditSocial(platform.name, platform.url)}
                        className="h-6 w-6 ml-1"
                        disabled={isAnyOperationInProgress}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeletePlatform(platform.platform_name)}
                        className="h-6 w-6 ml-1 text-red-500"
                        disabled={isAnyOperationInProgress}
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
                  className="flex items-center gap-1"
                  disabled={isAnyOperationInProgress}
                >
                  <Plus className="h-3 w-3" /> Add Platform
                </Button>
              )}

              {isAddingPlatformLoading ? (
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ) : (
                isAddingPlatform && (
                  <div className="flex flex-wrap items-center gap-2 p-2 border rounded-md bg-gray-50">
                    <Select 
                      value={selectedPlatform} 
                      onValueChange={setSelectedPlatform}
                      disabled={isAnyOperationInProgress}
                    >
                      <SelectTrigger className="w-[120px] h-8">
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
                      className="h-8 w-48"
                      disabled={isAnyOperationInProgress}
                    />

                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={handleAddPlatform}
                        className="h-8"
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
                  {employee.custom_city}, {employee.custom_state}
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
