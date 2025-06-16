import { useEmployeeDetails, useTeamEmployees } from "@/api/employeeService";
import { calculateTenure, formatDate } from "@/utils/dateUtils";
import { Linkedin, Github, Twitter, Mail, Phone, MapPin, Edit, X, Check, Plus, Save, Trash2, Users, Loader2, Upload } from "lucide-react";
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
import { toast } from "sonner";
import TeamMembersModal from "./TeamMembersModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

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

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({
    employee_name: "",
    designation: "",
    date_of_joining: "",
    company_email: "",
    current_address: "",
    custom_pin: "",
    cell_number: "",
    custom_city: "",
    custom_state: "",
  });

  // Image upload states
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Check if any operation is in progress
  const isAnyOperationInProgress = !!processingPlatform || isAddingPlatformLoading || isUpdatingProfile;

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

  const handleEditProfile = () => {
    setEditFormData({
      employee_name: employee.employee_name || "",
      designation: employee.designation || "",
      date_of_joining: employee.date_of_joining || "",
      company_email: employee.company_email || "",
      current_address: employee.current_address || "",
      custom_pin: employee.custom_pin || "",
      cell_number: employee.cell_number || "",
      custom_city: employee.custom_city || "",
      custom_state: employee.custom_state || "",
    });
    setSelectedImage(null);
    setImagePreview(null);
    setIsEditModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BASE_URL}user.upload_image`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const result = await response.json();
    return result.message?.file_url || result.file_url;
  };

  const handleSaveProfile = async () => {
    try {
      setIsUpdatingProfile(true);

      let imageUrl = employee.image;

      // Upload image if a new one is selected
      if (selectedImage) {
        try {
          imageUrl = await uploadImage(selectedImage);
        } catch (error) {
          console.error("Error uploading image:", error);
          toast.error("Failed to upload image", {
            position: "top-right",
          });
          return;
        }
      }

      const profileData = {
        ...editFormData,
        ...(imageUrl && { image: imageUrl })
      };

      const response = await fetch(`${BASE_URL}user.set_employee_profile_data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // Update the employee data in state
      setEmployee((prevEmployee) => ({
        ...prevEmployee,
        ...profileData,
      }));

      toast.success("Profile updated successfully", {
        position: "top-right",
      });

      setIsEditModalOpen(false);
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile", {
        position: "top-right",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleEditSocial = async (platformId: string, url: string) => {
    setEditingSocial(platformId);
    setNewUrl(url);
  };

  const handleSaveSocial = async (platformId: string) => {
    const trimmedUrl = newUrl.trim();
    if (!trimmedUrl) {
      toast.error("URL cannot be empty", {
        position: "top-right",
      });
      return;
    }

    // URL validation
    const urlRegex = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/;
    if (!urlRegex.test(trimmedUrl)) {
      toast.error("Please enter a valid URL", {
        position: "top-right",
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

      toast.success("Platform link updated successfully", {
        position: "top-right",
      });

      setEditingSocial(null);
      setNewUrl("");
    } catch (error) {
      console.error("Error updating platform:", error);
      toast.error("Failed to update platform link", {
        position: "top-right",
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
      toast.error("Please select a platform and enter a URL", {
        position: "top-right",
      });
      return;
    }

    const urlRegex = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/;
    if (!urlRegex.test(trimmedUrl)) {
      toast.error("Please enter a valid URL", {
        position: "top-right",
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

      toast.success("Platform added successfully", {
        position: "top-right",
      });

      setIsAddingPlatform(false);
      setSelectedPlatform("");
      setPlatformUrl("");
    } catch (error) {
      console.error("Error adding platform:", error);
      toast.error("Failed to add platform", {
        position: "top-right",
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

      toast.success("Platform deleted successfully", {
        position: "top-right",
      });
    } catch (error) {
      console.error("Error deleting platform:", error);
      toast.error("Failed to delete platform", {
        position: "top-right",
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
    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden relative">
      {/* Spinner overlay for platform operations */}
      {isAnyOperationInProgress && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}
      
      <div className="relative p-4 sm:p-6 lg:p-8">
        {/* Edit Profile Button */}
        <div className="absolute top-4 right-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEditProfile}
            className="flex items-center gap-2"
            disabled={isAnyOperationInProgress}
          >
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>

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
                      {editingSocial === platform.name ? (
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
                      className="flex items-center gap-1 text-xs sm:text-sm"
                      disabled={isAnyOperationInProgress}
                    >
                      <Plus className="h-3 w-3" /> 
                      <span className="hidden sm:inline">Add Platform</span>
                      <span className="sm:hidden">Add</span>
                    </Button>
                  )}

                  {isAddingPlatform && (
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
                  {teamMembers.slice(0, 3).map((member, index) => (
                    <div key={member.name || index} className="text-sm border-b border-gray-200 pb-2 last:border-b-0 last:pb-0">
                      <div className="font-medium text-gray-800 truncate">{member.employee_name}</div>
                      <div className="text-gray-500 text-xs truncate">{member.designation}</div>
                    </div>
                  ))}
                  
                  {teamMembers.length > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsTeamModalOpen(true)}
                      className="text-blue-600 hover:text-blue-700 p-0 h-auto font-normal text-sm w-full justify-start"
                    >
                      +{teamMembers.length - 3} more team members
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" showOverlay={false}>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Profile Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="profile_image">Profile Image</Label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-md overflow-hidden border-2 border-gray-200">
                  <img
                    src={imagePreview || employee.image || ''}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    id="profile_image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isUpdatingProfile}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: JPG, PNG, GIF. Max size: 5MB
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employee_name">Employee Name</Label>
                <Input
                  id="employee_name"
                  value={editFormData.employee_name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, employee_name: e.target.value }))}
                  disabled={isUpdatingProfile}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  value={editFormData.designation}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, designation: e.target.value }))}
                  disabled={isUpdatingProfile}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date_of_joining">Date of Joining</Label>
                <Input
                  id="date_of_joining"
                  type="date"
                  value={editFormData.date_of_joining}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, date_of_joining: e.target.value }))}
                  disabled={isUpdatingProfile}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company_email">Company Email</Label>
                <Input
                  id="company_email"
                  type="email"
                  value={editFormData.company_email}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, company_email: e.target.value }))}
                  disabled={isUpdatingProfile}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cell_number">Cell Number</Label>
                <Input
                  id="cell_number"
                  value={editFormData.cell_number}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, cell_number: e.target.value }))}
                  disabled={isUpdatingProfile}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="custom_pin">PIN Code</Label>
                <Input
                  id="custom_pin"
                  value={editFormData.custom_pin}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, custom_pin: e.target.value }))}
                  disabled={isUpdatingProfile}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="custom_city">City</Label>
                <Input
                  id="custom_city"
                  value={editFormData.custom_city}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, custom_city: e.target.value }))}
                  disabled={isUpdatingProfile}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="custom_state">State</Label>
                <Input
                  id="custom_state"
                  value={editFormData.custom_state}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, custom_state: e.target.value }))}
                  disabled={isUpdatingProfile}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="current_address">Current Address</Label>
              <Input
                id="current_address"
                value={editFormData.current_address}
                onChange={(e) => setEditFormData(prev => ({ ...prev, current_address: e.target.value }))}
                disabled={isUpdatingProfile}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isUpdatingProfile}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={isUpdatingProfile}
            >
              {isUpdatingProfile && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
