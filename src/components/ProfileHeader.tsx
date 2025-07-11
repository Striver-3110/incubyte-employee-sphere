import { useTestEmployee } from "@/contexts/TestEmployeeContext";
import { useTeamEmployees } from "@/api/employeeService";
import { calculateTenure, formatDate } from "@/utils/dateUtils";
import { 
  Linkedin, Github, Twitter, Mail, MapPin, Edit, X, Check, 
  Plus, Save, Trash2, Users, Loader2, Globe, Twitch, Youtube, 
  MessageSquare, FileCode, BookOpen, Coffee, Server, Code, Database,
  Search, Home, User
} from "lucide-react";

import { useState, useEffect } from "react";
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
import { Combobox } from "@/components/ui/combobox";
import { fetchAllEmployees } from "@/api/employeeService";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const socialPlatforms = [
  { id: "linkedin", name: "LinkedIn", icon: Linkedin },
  { id: "github", name: "GitHub", icon: Github },
  { id: "twitter", name: "Twitter", icon: Twitter },
  { id: "website", name: "Personal Website", icon: Globe },
  { id: "stackoverflow", name: "Stack Overflow", icon: FileCode },
  { id: "medium", name: "Medium", icon: BookOpen },
  { id: "dev", name: "DEV Community", icon: Code },
  { id: "hashnode", name: "Hashnode", icon: Database },
  { id: "youtube", name: "YouTube", icon: Youtube },
  { id: "twitch", name: "Twitch", icon: Twitch },
  { id: "discord", name: "Discord", icon: MessageSquare },
  { id: "kaggle", name: "Kaggle", icon: Server },
  { id: "buymeacoffee", name: "Buy Me a Coffee", icon: Coffee },
];

const ProfileHeader = () => {
  const { employee, setEmployee, loading, viewEmployeeById, isViewingOtherEmployee, resetToOwnProfile } = useTestEmployee();
  const { employees: teamMembers } = useTeamEmployees();
  const [editingSocial, setEditingSocial] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState("");
  const [processingPlatform, setProcessingPlatform] = useState<string | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [allEmployees, setAllEmployees] = useState<{ value: string; label: string }[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

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

  // Mock platforms for test data
  const mockPlatforms = [
    { name: "linkedin", platform_name: "LinkedIn", url: "https://linkedin.com/in/johndoe" },
    { name: "github", platform_name: "GitHub", url: "https://github.com/johndoe" }
  ];

  // Check if any operation is in progress
  const isAnyOperationInProgress = !!processingPlatform || isAddingPlatformLoading || isUpdatingProfile;

  if (loading || !employee) {
    return <ProfileHeaderSkeleton />;
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "linkedin":
        return <Linkedin className="h-4 w-4" />;
      case "github":
        return <Github className="h-4 w-4" />;
      case "twitter":
        return <Twitter className="h-4 w-4" />;
      case "personal website":
      case "website":
        return <Globe className="h-4 w-4" />;
      case "stack overflow":
      case "stackoverflow":
        return <FileCode className="h-4 w-4" />;
      case "medium":
        return <BookOpen className="h-4 w-4" />;
      case "dev community":
      case "dev":
        return <Code className="h-4 w-4" />;
      case "hashnode":
        return <Database className="h-4 w-4" />;
      case "youtube":
        return <Youtube className="h-4 w-4" />;
      case "twitch":
        return <Twitch className="h-4 w-4" />;
      case "discord":
        return <MessageSquare className="h-4 w-4" />;
      case "kaggle":
        return <Server className="h-4 w-4" />;
      case "buy me a coffee":
      case "buymeacoffee":
        return <Coffee className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
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

  const handleSaveProfile = async () => {
    try {
      setIsUpdatingProfile(true);
      // Mock save for test data
      setEmployee((prevEmployee) => ({
        ...prevEmployee!,
        ...editFormData,
      }));

      toast.success("Profile updated successfully");
      setIsEditModalOpen(false);
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
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
      toast.error("URL cannot be empty");
      return;
    }

    try {
      setProcessingPlatform(platformId);
      // Mock save for test data
      toast.success("Platform link updated successfully");
      setEditingSocial(null);
      setNewUrl("");
    } catch (error) {
      console.error("Error updating platform:", error);
      toast.error("Failed to update platform link");
    } finally {
      setProcessingPlatform(null);
    }
  };

  const handleAddPlatform = async () => {
    const trimmedUrl = platformUrl.trim();

    if (!selectedPlatform || !trimmedUrl) {
      toast.error("Please select a platform and enter a URL");
      return;
    }

    try {
      setIsAddingPlatformLoading(true);
      // Mock add for test data
      toast.success("Platform added successfully");
      setIsAddingPlatform(false);
      setSelectedPlatform("");
      setPlatformUrl("");
    } catch (error) {
      console.error("Error adding platform:", error);
      toast.error("Failed to add platform");
    } finally {
      setIsAddingPlatformLoading(false);
    }
  };

  const handleDeletePlatform = async (platformName: string) => {
    try {
      setProcessingPlatform(platformName);
      // Mock delete for test data
      toast.success("Platform deleted successfully");
    } catch (error) {
      console.error("Error deleting platform:", error);
      toast.error("Failed to delete platform");
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

  const availablePlatforms = socialPlatforms.filter(platform => 
    !mockPlatforms.some(mp => mp.name === platform.id)
  );

  // Check if user is co-founder to show team members
  const isCoFounder = employee && employee.designation === "Co-Founder";
  const hasTeamMembers = teamMembers && teamMembers.length > 0;
  const shouldShowTeamMembers = !isCoFounder && hasTeamMembers && !isViewingOtherEmployee;

  return (
    <div className="w-full bg-white border-b border-gray-200 relative">
      {/* Spinner overlay for platform operations */}
      {isAnyOperationInProgress && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}
      
      <div className="relative p-6">
        {/* Edit Profile Button */}
        {!isViewingOtherEmployee && (
          <div className="absolute top-6 right-6">
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
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section - Profile Info */}
          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                  <img
                    src={employee.image}
                    alt={employee.employee_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Profile Details */}
              <div className="flex flex-col flex-grow min-w-0">
                <div className="mb-4">
                  <h1 className="text-3xl font-bold text-gray-900 break-words">{employee.employee_name}</h1>
                  <p className="text-lg font-medium text-blue-600 mt-1">{employee.designation}</p>

                  <div className="flex flex-col sm:flex-row sm:items-center mt-2 text-gray-600 text-sm gap-1 sm:gap-0">
                    <span>Joined {formatDate(employee.date_of_joining)}</span>
                    <span className="hidden sm:inline mx-2">•</span>
                    <span>Tenure: {calculateTenure(employee.date_of_joining)}</span>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex flex-wrap items-center gap-3 mt-2 mb-4">
                  {mockPlatforms.map((platform) => (
                    <div key={platform.name} className="flex items-center">
                      {editingSocial === platform.name ? (
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
                            href={platform.url.startsWith("http") ? platform.url : `https://${platform.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
                          >
                            {getPlatformIcon(platform.platform_name)}
                            <span>{platform.platform_name}</span>
                          </a>
                          {!isViewingOtherEmployee && (
                            <>
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
                                onClick={() => handleDeletePlatform(platform.name)}
                                className="h-6 w-6 ml-1 text-red-500"
                                disabled={isAnyOperationInProgress}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  ))}

                  {/* Add Platform Button */}
                  {availablePlatforms.length > 0 && !isAddingPlatform && !isViewingOtherEmployee && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddingPlatform(true)}
                      className="flex items-center gap-2"
                      disabled={isAnyOperationInProgress}
                    >
                      <Plus className="h-4 w-4" />
                      Add Platform
                    </Button>
                  )}

                  {isAddingPlatform && !isViewingOtherEmployee && (
                    <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                      <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                        <SelectTrigger className="w-[150px] h-8">
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

                      <Button
                        size="sm"
                        onClick={handleAddPlatform}
                        className="h-8"
                        disabled={isAnyOperationInProgress}
                      >
                        <Save className="h-4 w-4 mr-1" /> Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelAddPlatform}
                        className="h-8"
                        disabled={isAnyOperationInProgress}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Contact Information - Only Email and Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${employee.company_email}`} className="hover:underline">
                      {employee.company_email}
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{employee.custom_city}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Team Members Table */}
          <div className="lg:col-span-1">
            {shouldShowTeamMembers && (
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-medium text-gray-700 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Team Members
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {(teamMembers || []).slice(0, 5).map((member, index) => (
                    <div key={member.name || index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                      <div className="text-sm">
                        <div className="font-medium text-gray-800">{member.employee_name}</div>
                        <div className="text-gray-500 text-xs">{member.designation}</div>
                      </div>
                    </div>
                  ))}
                  
                  {teamMembers.length > 5 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsTeamModalOpen(true)}
                      className="text-blue-600 hover:text-blue-700 p-0 h-auto font-normal text-sm w-full justify-start"
                    >
                      +{teamMembers.length - 5} more members
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                    src={imagePreview || employee.image || 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=400&fit=crop&crop=face'}
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
                <Label htmlFor="custom_city">City</Label>
                <Input
                  id="custom_city"
                  value={editFormData.custom_city}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, custom_city: e.target.value }))}
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
  <div className="w-full bg-white border-b border-gray-200">
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <Skeleton className="w-32 h-32 rounded-lg" />
            <div className="flex-grow min-w-0">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-5 w-32 mb-4" />
              <Skeleton className="h-4 w-64 mb-6" />
              <div className="flex gap-2 mb-4">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
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
