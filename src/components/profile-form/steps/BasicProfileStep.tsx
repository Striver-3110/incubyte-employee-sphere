
import React, { useState } from 'react';
import { useProfileForm } from '@/contexts/ProfileFormContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, Plus, Trash2 } from 'lucide-react';
import { PlatformEntry } from '@/contexts/ProfileFormContext';

export const BasicProfileStep = () => {
  const { state, updateFormData, setImageChanged } = useProfileForm();
  const [imagePreview, setImagePreview] = useState<string>(state.formData.image);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setImagePreview(imageUrl);
        updateFormData({ image: imageUrl });
        setImageChanged(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddressChange = (field: string, value: string) => {
    updateFormData({ [field]: value });
  };

  const handleAboutChange = (value: string) => {
    updateFormData({ custom_about: value });
  };

  const handlePlatformChange = (index: number, field: keyof PlatformEntry, value: string) => {
    const updatedPlatforms = [...state.formData.custom_platforms];
    updatedPlatforms[index] = { ...updatedPlatforms[index], [field]: value };
    updateFormData({ custom_platforms: updatedPlatforms });
  };

  const addPlatform = () => {
    const newPlatforms = [...state.formData.custom_platforms, { platform_name: '', url: '' }];
    updateFormData({ custom_platforms: newPlatforms });
  };

  const removePlatform = (index: number) => {
    const updatedPlatforms = state.formData.custom_platforms.filter((_, i) => i !== index);
    updateFormData({ custom_platforms: updatedPlatforms });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Basic Profile Details</h2>
      
      {/* Image Upload */}
      <div className="space-y-2">
        <Label>Profile Image</Label>
        <div className="flex items-center space-x-4">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-300">
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
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Image
            </Button>
          </div>
        </div>
      </div>

      {/* Full Name (Read-only) */}
      <div className="space-y-2">
        <Label>Full Name</Label>
        <Input
          value={state.formData.full_name}
          readOnly
          className="bg-gray-50"
        />
      </div>

      {/* Address Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-800">Address Information</h3>
        
        <div className="space-y-2">
          <Label>Current Address *</Label>
          <Textarea
            value={state.formData.current_address}
            onChange={(e) => handleAddressChange('current_address', e.target.value)}
            placeholder="Enter your current address"
            className="resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>City *</Label>
            <Input
              value={state.formData.custom_city}
              onChange={(e) => handleAddressChange('custom_city', e.target.value)}
              placeholder="City"
            />
          </div>
          <div className="space-y-2">
            <Label>State *</Label>
            <Input
              value={state.formData.custom_state}
              onChange={(e) => handleAddressChange('custom_state', e.target.value)}
              placeholder="State"
            />
          </div>
          <div className="space-y-2">
            <Label>Pin Code *</Label>
            <Input
              value={state.formData.custom_pin}
              onChange={(e) => handleAddressChange('custom_pin', e.target.value)}
              placeholder="Pin Code"
            />
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="space-y-2">
        <Label>About *</Label>
        <Textarea
          value={state.formData.custom_about}
          onChange={(e) => handleAboutChange(e.target.value)}
          placeholder="Tell us about yourself..."
          className="resize-none min-h-[100px]"
        />
      </div>

      {/* Custom Platforms */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-800">Social Platforms</h3>
          <Button type="button" variant="outline" size="sm" onClick={addPlatform}>
            <Plus className="w-4 h-4 mr-2" />
            Add Platform
          </Button>
        </div>

        {state.formData.custom_platforms.map((platform, index) => (
          <div key={index} className="flex items-end space-x-2">
            <div className="flex-1 space-y-2">
              <Label>Platform Name</Label>
              <Input
                value={platform.platform_name}
                onChange={(e) => handlePlatformChange(index, 'platform_name', e.target.value)}
                placeholder="e.g., LinkedIn, GitHub"
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label>URL</Label>
              <Input
                value={platform.url}
                onChange={(e) => handlePlatformChange(index, 'url', e.target.value)}
                placeholder="https://..."
                type="url"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removePlatform(index)}
              className="mb-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}

        {state.formData.custom_platforms.length === 0 && (
          <p className="text-sm text-gray-500 italic">
            No platforms added yet. Click "Add Platform" to get started.
          </p>
        )}
      </div>
    </div>
  );
};
