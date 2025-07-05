import React from 'react';
import { CheckCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ThankYouPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center font-sans">
      <div className="text-center space-y-6 p-8 max-w-lg mx-auto">
        {/* Success Icon */}
        <div className="mx-auto w-20 h-20 bg-brandGreen/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12 text-brandGreen" />
        </div>
        
        {/* Thank You Message */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-brandBlueDarkest">
            Thank You!
          </h1>
        </div>
        
        {/* Stay Tuned Message */}
        <div className="space-y-3 bg-highlightBg p-6 rounded-lg border border-borderMid shadow-subtle">
          <h2 className="text-xl font-semibold text-brandBlue">
            Stay Tuned! 📧
          </h2>
          <p className="text-lg text-textMuted">
            Your profile has been successfully submitted.
          </p>
          <p className="text-lg text-textMuted">
            You can close this window now.
          </p>
        </div>
      </div>
    </div>
  );
};
