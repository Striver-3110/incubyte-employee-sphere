
import React from "react";
import { format } from "date-fns";
import { ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SharedLearning {
  name: string;
  employee?: string;
  employee_name?: string;
  event_type: string;
  event_date: string;
  event_description: string;
  event_link?: string;
}

interface LearningViewModalProps {
  learning: SharedLearning | null;
  isOpen: boolean;
  onClose: () => void;
}

const LearningViewModal = ({ learning, isOpen, onClose }: LearningViewModalProps) => {
  if (!isOpen || !learning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Learning Details</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="text-sm font-medium">
              {learning.event_type}
            </Badge>
            <div className="text-sm text-gray-500">
              {format(new Date(learning.event_date), "MMMM dd, yyyy")}
            </div>
          </div>
          
          {learning.employee && (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Shared by:</span>{" "}
              <span className="text-blue-600">
                {learning.employee_name || learning.employee}
              </span>
            </div>
          )}
          
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {learning.event_description}
            </p>
          </div>
          
          {learning.event_link && (
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Resource Link</h3>
              <a
                href={learning.event_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                {learning.event_link}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningViewModal;
