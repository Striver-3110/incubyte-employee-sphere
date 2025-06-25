
import React, { useEffect, useState } from 'react';
import { ProfileFormProvider } from '@/contexts/ProfileFormContext';
import { ProfileFormContainer } from '@/components/profile-form/ProfileFormContainer';
import { Skeleton } from '@/components/ui/skeleton';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const ProfileData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate initial data fetch
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <ProfileFormProvider>
      <ProfileFormContainer />
    </ProfileFormProvider>
  );
};

export default ProfileData;
