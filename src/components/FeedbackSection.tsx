import React, { useState } from "react";
import { useFeedbackData } from "@/api/employeeService";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus, X, AlertCircle, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { FeedbackInitiation } from "./FeedbackInitiation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { checkRecentFeedback } from "@/utils/dateUtils";

interface Feedback {
  name: string;
  for_employee: string;
  employee_name: string;
  reviewer_name: string;
  reviewer: string;
  custom_feedback_status?: string | null;
  additional_comments?: string | null;
  added_on?: string;
}

interface FeedbackData {
  initiated_by_me: Feedback[];
  given_to_me: Feedback[];
  given_by_me: Feedback[];
  pending_to_give: Feedback[];
}

const FeedbackSection = () => {
  const { feedbacks, loading } = useFeedbackData();
  const [isInitiateDialogOpen, setIsInitiateDialogOpen] = useState(false);
  const [showReceivedWarning, setShowReceivedWarning] = useState(true);
  const [showGivenWarning, setShowGivenWarning] = useState(true);
  const [viewFeedbackDialog, setViewFeedbackDialog] = useState<Feedback | null>(null);
  
  // Pagination states for each tab
  const [receivedDisplayCount, setReceivedDisplayCount] = useState(5);
  const [givenDisplayCount, setGivenDisplayCount] = useState(5);
  const [initiatedDisplayCount, setInitiatedDisplayCount] = useState(5);
  const [pendingDisplayCount, setPendingDisplayCount] = useState(5);

  const handleFeedbackInitiated = async () => {
    // Close the dialog
    setIsInitiateDialogOpen(false);
    
    // Refresh the page to get updated data
    window.location.reload();
  };

  if (loading) {
    return <FeedbackSkeleton />;
  }

  const typedFeedbacks = feedbacks as FeedbackData;

  const receivedFeedbacks = typedFeedbacks?.given_to_me || [];
  const givenFeedbacks = typedFeedbacks?.given_by_me || [];
  const initiatedFeedbacks = typedFeedbacks?.initiated_by_me || [];
  const pendingFeedbacks = typedFeedbacks?.pending_to_give || [];

  // Filter given feedbacks to show only completed ones
  const completedGivenFeedbacks = givenFeedbacks.filter(feedback => 
    feedback.custom_feedback_status === 'Completed'
  );

  const hasRecentlyReceivedFeedback = checkRecentFeedback(receivedFeedbacks, 2);
  const hasRecentlyGivenFeedback = checkRecentFeedback(givenFeedbacks, 2);

  const handleShowMore = (type: 'received' | 'given' | 'initiated' | 'pending') => {
    switch (type) {
      case 'received':
        setReceivedDisplayCount(prev => prev + 5);
        break;
      case 'given':
        setGivenDisplayCount(prev => prev + 5);
        break;
      case 'initiated':
        setInitiatedDisplayCount(prev => prev + 5);
        break;
      case 'pending':
        setPendingDisplayCount(prev => prev + 5);
        break;
    }
  };

  const handleShowLess = (type: 'received' | 'given' | 'initiated' | 'pending') => {
    switch (type) {
      case 'received':
        setReceivedDisplayCount(prev => Math.max(5, prev - 5));
        break;
      case 'given':
        setGivenDisplayCount(prev => Math.max(5, prev - 5));
        break;
      case 'initiated':
        setInitiatedDisplayCount(prev => Math.max(5, prev - 5));
        break;
      case 'pending':
        setPendingDisplayCount(prev => Math.max(5, prev - 5));
        break;
    }
  };

  const handlePendingFeedbackClick = (feedbackName: string) => {
    const url = `http://127.0.0.1:8004/app/employee-feedback-rag/${feedbackName}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Feedback</h2>
        <Dialog open={isInitiateDialogOpen} onOpenChange={setIsInitiateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-1" /> Initiate Feedback
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl w-full mx-4" showOverlay={false}>
            <FeedbackInitiation 
              onClose={() => setIsInitiateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Feedback Warning Alerts */}
      <div className="space-y-3 mb-4">
        {!hasRecentlyReceivedFeedback && showReceivedWarning && (
          <Alert variant="destructive" className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <AlertDescription className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span className="text-amber-800 text-sm">
                You haven't received any feedback in the last 2 months. Consider requesting feedback from your colleagues.
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-amber-600 hover:text-amber-800 hover:bg-amber-100 self-end sm:self-auto"
                onClick={() => setShowReceivedWarning(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {!hasRecentlyGivenFeedback && showGivenWarning && (
          <Alert variant="destructive" className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <AlertDescription className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span className="text-blue-800 text-sm">
                You haven't given any feedback in the last 2 months. Providing feedback helps your team grow!
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-blue-600 hover:text-blue-800 hover:bg-blue-100 self-end sm:self-auto"
                onClick={() => setShowGivenWarning(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* View Feedback Dialog - Fixed backdrop and scrolling issues */}
      <Dialog open={!!viewFeedbackDialog} onOpenChange={(open) => !open && setViewFeedbackDialog(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden" showOverlay={false}>
          <div className="max-h-[70vh] overflow-y-auto pr-2">
            {viewFeedbackDialog && (
              <div className="space-y-4">
                <h3 className="text-lg sm:text-xl font-semibold sticky top-0 bg-white pb-2">
                  {viewFeedbackDialog.name || "Feedback Details"}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
                  <div>
                    <p className="text-sm text-gray-500">For</p>
                    <p className="font-medium text-sm sm:text-base break-words">{viewFeedbackDialog.employee_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">From</p>
                    <p className="font-medium text-sm sm:text-base break-words">{viewFeedbackDialog.reviewer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`px-2 py-1 text-xs rounded-full inline-block mt-1 ${
                      viewFeedbackDialog.custom_feedback_status === 'Pending' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : viewFeedbackDialog.custom_feedback_status === 'Completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {viewFeedbackDialog.custom_feedback_status || "Status Unknown"}
                    </span>
                  </div>
                  {viewFeedbackDialog.added_on && (
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium text-sm sm:text-base">{new Date(viewFeedbackDialog.added_on).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
                
                {viewFeedbackDialog.additional_comments && (
                  <div className="border-t pt-4 mt-4">
                    <p className="font-medium mb-2">Comments:</p>
                    <div
                      className="prose prose-sm max-w-none text-sm"
                      dangerouslySetInnerHTML={{ __html: viewFeedbackDialog.additional_comments }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="received" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="received" className="flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2">
            <span>Received</span>
            {receivedFeedbacks.length > 0 && (
              <Badge variant="secondary" className="h-4 min-w-4 px-1 flex justify-center items-center rounded-full text-xs">
                {receivedFeedbacks.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="given" className="flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2">
            <span>Given</span>
            {completedGivenFeedbacks.length > 0 && (
              <Badge variant="secondary" className="h-4 min-w-4 px-1 flex justify-center items-center rounded-full text-xs">
                {completedGivenFeedbacks.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="initiated" className="flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2">
            <span>Initiated</span>
            {initiatedFeedbacks.length > 0 && (
              <Badge variant="secondary" className="h-4 min-w-4 px-1 flex justify-center items-center rounded-full text-xs">
                {initiatedFeedbacks.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2">
            <span>Pending</span>
            {pendingFeedbacks.length > 0 && (
              <Badge variant="secondary" className="h-4 min-w-4 px-1 flex justify-center items-center rounded-full text-xs">
                {pendingFeedbacks.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="received" className="mt-4">
          {receivedFeedbacks.length > 0 ? (
            <div className="space-y-4">
              {receivedFeedbacks.slice(0, receivedDisplayCount).map((feedback, index) => (
                <div key={index} className="bg-gray-50 p-3 sm:p-4 rounded-md border">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                    <h3 className="font-medium text-gray-800 text-sm sm:text-base break-words">
                      {feedback.name || "Feedback Request"}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full self-start sm:self-auto flex-shrink-0 ${
                      feedback.custom_feedback_status === 'Pending' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : feedback.custom_feedback_status === 'Completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {feedback.custom_feedback_status || "Status Unknown"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>From:</strong> <span className="break-words">{feedback.reviewer_name}</span></p>
                    <p><strong>For:</strong> <span className="break-words">{feedback.employee_name}</span></p>
                  </div>
                </div>
              ))}
              
              {/* Pagination controls */}
              <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mt-4">
                {receivedDisplayCount > 5 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleShowLess('received')}
                    className="flex items-center gap-1 w-full sm:w-auto"
                  >
                    <ChevronUp className="h-4 w-4" /> See Less
                  </Button>
                )}
                {receivedDisplayCount < receivedFeedbacks.length && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleShowMore('received')}
                    className="flex items-center gap-1 w-full sm:w-auto"
                  >
                    <ChevronDown className="h-4 w-4" /> See More
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic text-sm sm:text-base">No feedback received yet.</p>
          )}
        </TabsContent>

        <TabsContent value="given" className="mt-4">
          {completedGivenFeedbacks.length > 0 ? (
            <div className="space-y-4">
              {completedGivenFeedbacks.slice(0, givenDisplayCount).map((feedback, index) => (
                <div key={index} className="bg-gray-50 p-3 sm:p-4 rounded-md border">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                    <h3 className="font-medium text-gray-800 text-sm sm:text-base break-words">
                      {feedback.name || "Feedback Given"}
                    </h3>
                    <div className="flex gap-2 self-start sm:self-auto">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full flex-shrink-0"
                        onClick={() => setViewFeedbackDialog(feedback)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${
                        feedback.custom_feedback_status === 'Pending' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : feedback.custom_feedback_status === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {feedback.custom_feedback_status || "Status Unknown"}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>To:</strong> <span className="break-words">{feedback.employee_name}</span></p>
                    <p><strong>Reviewer:</strong> <span className="break-words">{feedback.reviewer_name}</span></p>
                  </div>
                </div>
              ))}
              
              {/* Pagination controls */}
              <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mt-4">
                {givenDisplayCount > 5 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleShowLess('given')}
                    className="flex items-center gap-1 w-full sm:w-auto"
                  >
                    <ChevronUp className="h-4 w-4" /> See Less
                  </Button>
                )}
                {givenDisplayCount < completedGivenFeedbacks.length && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleShowMore('given')}
                    className="flex items-center gap-1 w-full sm:w-auto"
                  >
                    <ChevronDown className="h-4 w-4" /> See More
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic text-sm sm:text-base">No completed feedback given yet.</p>
          )}
        </TabsContent>
        
        <TabsContent value="initiated" className="mt-4">
          {initiatedFeedbacks.length > 0 ? (
            <div className="space-y-4">
              {initiatedFeedbacks.slice(0, initiatedDisplayCount).map((feedback, index) => (
                <div key={index} className="bg-gray-50 p-3 sm:p-4 rounded-md border">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                    <h3 className="font-medium text-gray-800 text-sm sm:text-base break-words">
                      {feedback.name || "Feedback Initiated"}
                    </h3>
                    <div className="flex gap-2 self-start sm:self-auto">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full flex-shrink-0"
                        onClick={() => setViewFeedbackDialog(feedback)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${
                        feedback.custom_feedback_status === 'Pending' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : feedback.custom_feedback_status === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {feedback.custom_feedback_status || "Status Unknown"}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>For:</strong> <span className="break-words">{feedback.employee_name}</span></p>
                    <p><strong>Reviewer:</strong> <span className="break-words">{feedback.reviewer_name}</span></p>
                  </div>
                </div>
              ))}
              
              {/* Pagination controls */}
              <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mt-4">
                {initiatedDisplayCount > 5 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleShowLess('initiated')}
                    className="flex items-center gap-1 w-full sm:w-auto"
                  >
                    <ChevronUp className="h-4 w-4" /> See Less
                  </Button>
                )}
                {initiatedDisplayCount < initiatedFeedbacks.length && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleShowMore('initiated')}
                    className="flex items-center gap-1 w-full sm:w-auto"
                  >
                    <ChevronDown className="h-4 w-4" /> See More
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic text-sm sm:text-base">No feedback initiated yet.</p>
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          {pendingFeedbacks.length > 0 ? (
            <div className="space-y-4">
              {pendingFeedbacks.slice(0, pendingDisplayCount).map((feedback, index) => (
                <div 
                  key={index} 
                  className="bg-gray-50 p-3 sm:p-4 rounded-md border cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handlePendingFeedbackClick(feedback.name)}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                    <h3 className="font-medium text-gray-800 text-sm sm:text-base break-words">
                      {feedback.name || "Pending Feedback"}
                    </h3>
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 self-start sm:self-auto flex-shrink-0">
                      {feedback.custom_feedback_status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>For:</strong> <span className="break-words">{feedback.employee_name}</span></p>
                    <p><strong>Reviewer:</strong> <span className="break-words">{feedback.reviewer_name}</span></p>
                  </div>
                </div>
              ))}
              
              {/* Pagination controls */}
              <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mt-4">
                {pendingDisplayCount > 5 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleShowLess('pending')}
                    className="flex items-center gap-1 w-full sm:w-auto"
                  >
                    <ChevronUp className="h-4 w-4" /> See Less
                  </Button>
                )}
                {pendingDisplayCount < pendingFeedbacks.length && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleShowMore('pending')}
                    className="flex items-center gap-1 w-full sm:w-auto"
                  >
                    <ChevronDown className="h-4 w-4" /> See More
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic text-sm sm:text-base">No pending feedback to give.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const FeedbackSkeleton = () => (
  <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-8 w-full sm:w-32" />
    </div>
    <div className="space-y-4">
      <div className="bg-gray-50 p-3 sm:p-4 rounded-md">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
      <div className="bg-gray-50 p-3 sm:p-4 rounded-md">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
    </div>
  </div>
);

export default FeedbackSection;
