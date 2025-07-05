import React, { useState, useEffect } from 'react';
import { useProfileForm } from '@/contexts/ProfileFormContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Plus, Trash2, AlertCircle, Search } from 'lucide-react';
import { PlatformEntry } from '@/contexts/ProfileFormContext';
import { socialPlatforms, getPlatformIcon } from '@/constants/socialPlatforms';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import { fetchAllStates, fetchCitiesByState } from '@/utils/indianCitiesApi';
import { Combobox } from '@/components/ui/combobox';

interface ValidationErrors {
  image?: string;
  current_address?: string;
  custom_city?: string;
  custom_state?: string;
  custom_pin?: string;
  custom_about?: string;
  platforms?: { [key: number]: { platform_name?: string; url?: string } };
}

export const BasicProfileStep = () => {
  const { state, updateFormData, setImageChanged, setSelectedImageFile } = useProfileForm();
  const [imagePreview, setImagePreview] = useState<string>(state.formData.image);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showValidation, setShowValidation] = useState(false);
  const [touchedPlatforms, setTouchedPlatforms] = useState<Set<number>>(new Set());
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [statesError, setStatesError] = useState<string | null>(null);
  const [citiesError, setCitiesError] = useState<string | null>(null);
  const [manualState, setManualState] = useState('');
  const [manualCity, setManualCity] = useState('');
  const [showManualState, setShowManualState] = useState(false);
  const [showManualCity, setShowManualCity] = useState(false);

  // Expose validation function to parent
  React.useEffect(() => {
    (window as any).validateBasicProfile = () => {
      const errors = validateForm();
      setValidationErrors(errors);
      setShowValidation(true);
      
      // Mark all platforms as touched when validating (e.g., on form submission)
      if (state.formData.custom_platforms.length > 0) {
        const allPlatformIndices = new Set(
          state.formData.custom_platforms.map((_, index) => index)
        );
        setTouchedPlatforms(allPlatformIndices);
      }
      
      return Object.keys(errors).length === 0;
    };
    
    return () => {
      delete (window as any).validateBasicProfile;
    };
  }, [state.formData]);

  // Fetch states on mount
  React.useEffect(() => {
    const loadStates = async () => {
      setLoadingStates(true);
      try {
        const statesData = await fetchAllStates();
        setStates(statesData);
        setStatesError(null);
      } catch (error) {
        console.error('Error loading states:', error);
        setStatesError('Failed to load states');
      } finally {
        setLoadingStates(false);
      }
    };

    loadStates();
  }, []);

  // Fetch cities when state changes
  useEffect(() => {
    if (!state.formData.custom_state) {
      setCities([]);
      return;
    }

    const loadCities = async () => {
      setLoadingCities(true);
      setCitiesError(null);
      try {
        const citiesData = await fetchCitiesByState(state.formData.custom_state);
        setCities(citiesData);
      } catch (error) {
        console.error('Error loading cities:', error);
        setCitiesError('Failed to load cities');
      } finally {
        setLoadingCities(false);
      }
    };

    loadCities();
  }, [state.formData.custom_state]);

  const validateForm = (): ValidationErrors => {
    const errors: ValidationErrors = {};
    
    // Image validation
    if (!state.formData.image || state.formData.image.trim() === '') {
      errors.image = 'Profile image is required';
    }
    
    // Address validation
    
    if (!state.formData.custom_city || state.formData.custom_city.trim() === '') {
      errors.custom_city = 'City is required';
    }
    
    if (!state.formData.custom_state || state.formData.custom_state.trim() === '') {
      errors.custom_state = 'State is required';
    }
    
    // About validation
    if (!state.formData.custom_about || state.formData.custom_about.trim() === '') {
      errors.custom_about = 'About section is required';
    }
    
    // Platform validation - if any platforms are added, they must be complete
    if (state.formData.custom_platforms.length > 0) {
      const platformErrors: { [key: number]: { platform_name?: string; url?: string } } = {};
      
      state.formData.custom_platforms.forEach((platform, index) => {
        const platformError: { platform_name?: string; url?: string } = {};
        
        if (!platform.platform_name || platform.platform_name.trim() === '') {
          platformError.platform_name = 'Platform selection is required';
        }
        
        if (!platform.url || platform.url.trim() === '') {
          platformError.url = 'Platform URL is required';
        } else if (!platform.url.startsWith('http')) {
          platformError.url = 'URL must start with https://';
        }
        
        if (Object.keys(platformError).length > 0) {
          platformErrors[index] = platformError;
        }
      });
      
      if (Object.keys(platformErrors).length > 0) {
        errors.platforms = platformErrors;
      }
    }
    
    return errors;
  };

  // Update imagePreview when formData.image changes (for initial load)
  React.useEffect(() => {
    if (state.formData.image && !imagePreview.startsWith('data:')) {
      setImagePreview(state.formData.image);
      
      // Calculate dimensions for existing image
      if (state.formData.image !== '/placeholder.svg') {
        const img = new Image();
        img.onload = () => {
          setImageDimensions({ width: img.width, height: img.height });
        };
        img.onerror = () => {
          // If image fails to load, reset dimensions
          setImageDimensions(null);
        };
        img.src = state.formData.image;
      }
    }
  }, [state.formData.image]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only image files (PNG, JPEG, GIF, WebP) are allowed');
        return;
      }

      // Validate file size (limit to 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        return;
      }

      // Store the file for later upload
      setSelectedImageFile(file);
      setImageChanged(true);
      
      // Create preview and calculate dimensions
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setImagePreview(imageUrl);
        
        // Calculate image dimensions
        const img = new Image();
        img.onload = () => {
          setImageDimensions({ width: img.width, height: img.height });
        };
        img.src = imageUrl;
      };
      reader.readAsDataURL(file);
      
      // Clear validation error for image
      if (showValidation && validationErrors.image) {
        const newErrors = { ...validationErrors };
        delete newErrors.image;
        setValidationErrors(newErrors);
      }
    }
  };

  const handleAddressChange = (field: string, value: string) => {
    updateFormData({ [field]: value });
    
    // Clear validation error for this field
    if (showValidation && validationErrors[field as keyof ValidationErrors]) {
      const newErrors = { ...validationErrors };
      delete newErrors[field as keyof ValidationErrors];
      setValidationErrors(newErrors);
    }
  };

  const handleAddressBlur = (field: string, value: string) => {
    const trimmedValue = value.trim();
    if (trimmedValue !== value) {
      updateFormData({ [field]: trimmedValue });
    }
  };

  const handleAboutChange = (value: string) => {
    updateFormData({ custom_about: value });
    
    // Clear validation error for about field
    if (showValidation && validationErrors.custom_about) {
      const newErrors = { ...validationErrors };
      delete newErrors.custom_about;
      setValidationErrors(newErrors);
    }
  };

  const handleAboutBlur = (value: string) => {
    const trimmedValue = value.trim();
    if (trimmedValue !== value) {
      updateFormData({ custom_about: trimmedValue });
    }
  };

  const handlePlatformChange = (index: number, field: keyof PlatformEntry, value: string) => {
    const updatedPlatforms = [...state.formData.custom_platforms];
    updatedPlatforms[index] = { ...updatedPlatforms[index], [field]: value };
    updateFormData({ custom_platforms: updatedPlatforms });
    
    // Mark this platform as touched
    setTouchedPlatforms(prev => new Set(prev).add(index));
    
    // Clear validation error for this platform field
    if (showValidation && validationErrors.platforms?.[index]?.[field]) {
      const newErrors = { ...validationErrors };
      if (newErrors.platforms?.[index]) {
        delete newErrors.platforms[index][field];
        if (Object.keys(newErrors.platforms[index]).length === 0) {
          delete newErrors.platforms[index];
        }
        if (Object.keys(newErrors.platforms).length === 0) {
          delete newErrors.platforms;
        }
      }
      setValidationErrors(newErrors);
    }
  };

  const handlePlatformBlur = (index: number, field: keyof PlatformEntry, value: string) => {
    const trimmedValue = value.trim();
    if (trimmedValue !== value) {
      const updatedPlatforms = [...state.formData.custom_platforms];
      updatedPlatforms[index] = { ...updatedPlatforms[index], [field]: trimmedValue };
      updateFormData({ custom_platforms: updatedPlatforms });
    }
  };

  const addPlatform = () => {
    const newPlatforms = [...state.formData.custom_platforms, { platform_name: '', url: '' }];
    updateFormData({ custom_platforms: newPlatforms });
  };

  const removePlatform = (index: number) => {
    const updatedPlatforms = state.formData.custom_platforms.filter((_, i) => i !== index);
    updateFormData({ custom_platforms: updatedPlatforms });
    
    // Update touched platforms indices - shift down indices that are greater than removed index
    setTouchedPlatforms(prev => {
      const newTouched = new Set<number>();
      prev.forEach(touchedIndex => {
        if (touchedIndex < index) {
          newTouched.add(touchedIndex);
        } else if (touchedIndex > index) {
          newTouched.add(touchedIndex - 1);
        }
        // Skip the removed index
      });
      return newTouched;
    });
    
    // Clear validation errors for this platform
    if (validationErrors.platforms?.[index]) {
      const newErrors = { ...validationErrors };
      if (newErrors.platforms) {
        delete newErrors.platforms[index];
        // Shift validation errors for platforms with higher indices
        const updatedPlatformErrors: { [key: number]: { platform_name?: string; url?: string } } = {};
        Object.keys(newErrors.platforms).forEach(key => {
          const keyIndex = parseInt(key);
          if (keyIndex > index) {
            updatedPlatformErrors[keyIndex - 1] = newErrors.platforms![keyIndex];
          } else if (keyIndex < index) {
            updatedPlatformErrors[keyIndex] = newErrors.platforms![keyIndex];
          }
        });
        
        if (Object.keys(updatedPlatformErrors).length > 0) {
          newErrors.platforms = updatedPlatformErrors;
        } else {
          delete newErrors.platforms;
        }
      }
      setValidationErrors(newErrors);
    }
  };

  // Check if all platforms are already selected
  const selectedPlatformNames = state.formData.custom_platforms.map(p => p.platform_name).filter(Boolean);
  const allPlatformsSelected = selectedPlatformNames.length >= socialPlatforms.length;

  // Helper function to calculate optimal display size
  const getImageDisplaySize = () => {
    if (!imageDimensions) {
      return { width: 112, height: 112 }; // Default 28 * 4 = 112px (w-28 h-28)
    }

    const { width, height } = imageDimensions;
    const aspectRatio = width / height;
    
    // Set constraints: min 80px, max 200px for any dimension
    const minSize = 80;
    const maxSize = 200;
    
    let displayWidth, displayHeight;
    
    if (aspectRatio > 1) {
      // Landscape: width > height
      displayWidth = Math.min(maxSize, Math.max(minSize, 140));
      displayHeight = Math.round(displayWidth / aspectRatio);
    } else if (aspectRatio < 1) {
      // Portrait: height > width  
      displayHeight = Math.min(maxSize, Math.max(minSize, 140));
      displayWidth = Math.round(displayHeight * aspectRatio);
    } else {
      // Square
      const size = 112; // Default square size
      displayWidth = size;
      displayHeight = size;
    }
    
    // Ensure minimum sizes
    displayWidth = Math.max(minSize, displayWidth);
    displayHeight = Math.max(minSize, displayHeight);
    
    return { width: displayWidth, height: displayHeight };
  };

  const imageDisplaySize = getImageDisplaySize();

  // Helper function to determine if validation should be shown for a platform
  const shouldShowPlatformValidation = (index: number) => {
    return showValidation && touchedPlatforms.has(index);
  };

  const PlatformSelectTrigger = ({ platform }: { platform: PlatformEntry }) => {
    const PlatformIcon = getPlatformIcon(platform.platform_name);
    
    return (
      <div className="flex items-center w-full">
        {platform.platform_name ? (
          <>
            <PlatformIcon className="w-4 h-4 mr-2" />
            {platform.platform_name}
          </>
        ) : (
          <span className="text-muted-foreground">Select platform</span>
        )}
      </div>
    );
  };

  // Filtered lists for dropdowns
  const filteredStates = states.filter(s => s.toLowerCase().includes(state.formData.custom_state.toLowerCase()) || s === state.formData.custom_state);
  const filteredCities = cities.filter(c => c.toLowerCase().includes(state.formData.custom_city.toLowerCase()) || c === state.formData.custom_city);

  return (
    <div className="space-y-6 font-sans">
      <h2 className="text-2xl font-bold text-brandBlueDark">Basic Details</h2>

      {/* Profile Image and Full Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Image Upload */}
        <div className="space-y-2 p-4 bg-cardBg rounded-lg border border-borderSoft shadow-subtle">
          <Label className={`text-brandBlueDark font-semibold text-sm ${showValidation && validationErrors.image ? 'text-red-600' : ''}`}>
            Profile Image *
          </Label>
          <div className="flex items-center space-x-4">
            <div 
              className={`rounded-md overflow-hidden bg-cardInner border-2 transition-all duration-300 ${showValidation && validationErrors.image ? 'border-red-500' : 'border-borderMid'}`}
              style={{ 
                width: `${imageDisplaySize.width}px`, 
                height: `${imageDisplaySize.height}px`,
                minWidth: '80px',
                minHeight: '80px'
              }}
            >
              <img
                src={imagePreview || '/placeholder.svg'}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('image-upload')?.click()}
                className={`border-brandBlue text-brandBlue hover:bg-brandBlue hover:text-white transition-colors ${showValidation && validationErrors.image ? 'border-red-500 text-red-600 hover:bg-red-500' : ''}`}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
              {imageDimensions && (
                <p className="text-xs text-textMuted mt-2">
                  Image: {imageDimensions.width} × {imageDimensions.height}px
                </p>
              )}
            </div>
          </div>
          {showValidation && validationErrors.image && (
            <div className="flex items-center space-x-1 text-red-600 text-sm mt-1">
              <AlertCircle className="w-4 h-4" />
              <span>{validationErrors.image}</span>
            </div>
          )}
        </div>

        {/* Full Name (Read-only) */}
        <div className="space-y-2 p-4 bg-cardBg rounded-lg border border-borderSoft shadow-subtle">
          <Label className="text-brandBlueDark font-semibold text-sm">Full Name</Label>
          <Input
            value={state.formData.full_name}
            readOnly
            className="bg-cardInner border-borderMid text-brandBlueDarker font-medium"
          />
        </div>
      </div>

      {/* Address Section */}
      <div className="space-y-4 p-4 bg-cardBg rounded-lg border border-borderSoft shadow-subtle">
        <h3 className="text-lg font-bold text-brandBlue">Address Information</h3>

        <div className="space-y-2">
          <Label className={`text-textMuted font-semibold text-sm ${showValidation && validationErrors.current_address ? 'text-red-600' : ''}`}>
            Current Address 
          </Label>
          <Textarea
            value={state.formData.current_address}
            onChange={(e) => handleAddressChange('current_address', e.target.value)}
            onBlur={(e) => handleAddressBlur('current_address', e.target.value)}
            placeholder="Enter your current address"
            className={`resize-none border-borderSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-1 text-brandBlueDarker ${showValidation && validationErrors.current_address ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          />
          {showValidation && validationErrors.current_address && (
            <div className="flex items-center space-x-1 text-red-600 text-sm mt-1">
              <AlertCircle className="w-4 h-4" />
              <span>{validationErrors.current_address}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className={`text-textMuted font-semibold text-sm ${showValidation && validationErrors.custom_state ? 'text-red-600' : ''}`}>
              State *
            </Label>
            <Combobox
              options={states.map(stateName => ({ value: stateName, label: stateName }))}
              value={state.formData.custom_state}
              onValueChange={(value) => {
                handleAddressChange('custom_state', value);
                // Clear city when state changes
                handleAddressChange('custom_city', '');
              }}
              placeholder={loadingStates ? 'Loading states...' : statesError ? 'Failed to load states' : 'Select or type state'}
              searchPlaceholder="Search or type state..."
              emptyMessage="No states available"
              loading={loadingStates}
              error={statesError}
              allowCustom={true}
              className={showValidation && validationErrors.custom_state ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {showValidation && validationErrors.custom_state && (
              <div className="flex items-center space-x-1 text-red-600 text-sm mt-1">
                <AlertCircle className="w-4 h-4" />
                <span>{validationErrors.custom_state}</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label className={`text-textMuted font-semibold text-sm ${showValidation && validationErrors.custom_city ? 'text-red-600' : ''}`}>
              City *
            </Label>
            <Combobox
              options={cities.map(city => ({ value: city, label: city }))}
              value={state.formData.custom_city}
              onValueChange={(value) => handleAddressChange('custom_city', value)}
              placeholder={loadingCities ? 'Loading cities...' : citiesError ? 'Failed to load cities' : 'Select or type city'}
              searchPlaceholder="Search or type city..."
              emptyMessage="No cities available"
              loading={loadingCities}
              error={citiesError}
              allowCustom={true}
              className={showValidation && validationErrors.custom_city ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {showValidation && validationErrors.custom_city && (
              <div className="flex items-center space-x-1 text-red-600 text-sm mt-1">
                <AlertCircle className="w-4 h-4" />
                <span>{validationErrors.custom_city}</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label className={`text-textMuted font-semibold text-sm ${showValidation && validationErrors.custom_pin ? 'text-red-600' : ''}`}>
              Pin Code
            </Label>
            <Input
              value={state.formData.custom_pin}
              onChange={(e) => handleAddressChange('custom_pin', e.target.value)}
              onBlur={(e) => handleAddressBlur('custom_pin', e.target.value)}
              placeholder="Pin Code"
              className={`border-borderSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-1 text-brandBlueDarker ${showValidation && validationErrors.custom_pin ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            />
            {showValidation && validationErrors.custom_pin && (
              <div className="flex items-center space-x-1 text-red-600 text-sm mt-1">
                <AlertCircle className="w-4 h-4" />
                <span>{validationErrors.custom_pin}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="space-y-4 p-4 bg-cardBg rounded-lg border border-borderSoft shadow-subtle">
        <h3 className={`text-lg font-bold text-brandBlue ${showValidation && validationErrors.custom_about ? 'text-red-600' : ''}`}>
          About *
        </h3>
        <Textarea
          value={state.formData.custom_about}
          onChange={(e) => handleAboutChange(e.target.value)}
          onBlur={(e) => handleAboutBlur(e.target.value)}
          placeholder="Tell us about yourself..."
          className={`resize-none min-h-[100px] border-borderSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-1 text-brandBlueDarker ${showValidation && validationErrors.custom_about ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
        />
        {showValidation && validationErrors.custom_about && (
          <div className="flex items-center space-x-1 text-red-600 text-sm mt-1">
            <AlertCircle className="w-4 h-4" />
            <span>{validationErrors.custom_about}</span>
          </div>
        )}
      </div>

      {/* Custom Platforms */}
      <div className="space-y-4 p-4 bg-cardBg rounded-lg border border-borderSoft shadow-subtle">
        <div>
          <h3 className="text-lg font-bold text-brandBlue">Social Platforms</h3>
        </div>

        {state.formData.custom_platforms.map((platform, index) => {
          const PlatformIcon = getPlatformIcon(platform.platform_name);

          // Get already selected platform names (excluding current platform)
          const selectedPlatforms = state.formData.custom_platforms
            .map((p, i) => i !== index ? p.platform_name : null)
            .filter(Boolean);

          // Filter available platforms
          const availablePlatforms = socialPlatforms.filter(
            socialPlatform => !selectedPlatforms.includes(socialPlatform.name)
          );

          return (
            <div key={index} className="flex items-start  space-x-2">
              <div className="flex-1 space-y-2">
                <Label className={`text-textMuted font-semibold text-sm ${shouldShowPlatformValidation(index) && validationErrors.platforms?.[index]?.platform_name ? 'text-red-600' : ''}`}>
                  Platform *
                </Label>
                <Select
                  value={platform.platform_name}
                  onValueChange={(value) => handlePlatformChange(index, 'platform_name', value)}
                >
                  <SelectTrigger className={`w-full border-borderSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-1 ${shouldShowPlatformValidation(index) && validationErrors.platforms?.[index]?.platform_name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}>
                    <PlatformSelectTrigger platform={platform} />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlatforms.length > 0 ? (
                      availablePlatforms.map((socialPlatform) => {
                        const Icon = socialPlatform.icon;
                        return (
                          <SelectItem key={socialPlatform.id} value={socialPlatform.name}>
                            <div className="flex items-center">
                              <Icon className="w-4 h-4 mr-2" />
                              {socialPlatform.name}
                            </div>
                          </SelectItem>
                        );
                      })
                    ) : (
                      <div className="p-2 text-sm text-textMuted">
                        No more platforms available
                      </div>
                    )}
                  </SelectContent>
                </Select>
                {/* Reserved space for validation message to prevent layout shift */}
                <div className="min-h-[20px]">
                  {shouldShowPlatformValidation(index) && validationErrors.platforms?.[index]?.platform_name && (
                    <div className="flex items-center space-x-1 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{validationErrors.platforms[index].platform_name}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <Label className={`text-textMuted font-semibold text-sm ${shouldShowPlatformValidation(index) && validationErrors.platforms?.[index]?.url ? 'text-red-600' : ''}`}>
                  URL *
                </Label>
                <Input
                  value={platform.url}
                  onChange={(e) => handlePlatformChange(index, 'url', e.target.value)}
                  onBlur={(e) => handlePlatformBlur(index, 'url', e.target.value)}
                  placeholder="https://..."
                  type="url"
                  className={`border-borderSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-1 text-brandBlueDarker ${shouldShowPlatformValidation(index) && validationErrors.platforms?.[index]?.url ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
                {/* Reserved space for validation message to prevent layout shift */}
                <div className="min-h-[20px]">
                  {shouldShowPlatformValidation(index) && validationErrors.platforms?.[index]?.url && (
                    <div className="flex items-center space-x-1 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{validationErrors.platforms[index].url}</span>
                    </div>
                  )}
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removePlatform(index)}
                className="mt-8 border-brandBlue text-brandBlue hover:bg-brandBlue hover:text-white transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          );
        })}

        {state.formData.custom_platforms.length === 0 && (
          <p className="text-sm text-textMuted italic">
            No platforms added yet. Click "Add Platform" to get started.
          </p>
        )}

        {allPlatformsSelected && state.formData.custom_platforms.length > 0 && (
          <p className="text-sm text-brandBlue italic font-medium">
            All available platforms have been added.
          </p>
        )}

        <div className="flex justify-end pt-2">
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={addPlatform}
            disabled={allPlatformsSelected}
            className="border-brandBlue text-brandBlue hover:bg-brandBlue hover:text-white disabled:opacity-50 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Platform
          </Button>
        </div>
      </div>
    </div>
  );
};
