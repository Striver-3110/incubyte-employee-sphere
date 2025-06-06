
import React, { useState } from "react";
import { useFeedbackData } from "@/api/employeeService";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { FeedbackInitiation } from "./FeedbackInitiation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const FeedbackSection = () => {
  const { feedbacks, loading } = useFeedbackData();
  const [isInitiateDialogOpen, setIsInitiateDialogOpen] = useState(false);

  if (loading) {
    return <FeedbackSkeleton />;
  }

  const receivedFeedbacks = feedbacks?.given_to_me || [];
  const givenFeedbacks = feedbacks?.given_by_me || [];
  const initiatedFeedbacks = feedbacks?.initiated_by_me || [];
  const pendingFeedbacks = feedbacks?.pending_to_give || [];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Feedback</h2>
        <Dialog open={isInitiateDialogOpen} onOpenChange={setIsInitiateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Plus className="h-4 w-4 mr-1" /> Initiate Feedback
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" showOverlay={false}>
            <FeedbackInitiation onClose={() => setIsInitiateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="received" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="received" className="flex justify-center items-center gap-2">
            Received
            {receivedFeedbacks.length > 0 && (
              <Badge variant="secondary" className="h-5 min-w-5 px-1.5 flex justify-center items-center rounded-full">
                {receivedFeedbacks.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="given" className="flex justify-center items-center gap-2">
            Given
            {givenFeedbacks.length > 0 && (
              <Badge variant="secondary" className="h-5 min-w-5 px-1.5 flex justify-center items-center rounded-full">
                {givenFeedbacks.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="initiated" className="flex justify-center items-center gap-2">
            Initiated
            {initiatedFeedbacks.length > 0 && (
              <Badge variant="secondary" className="h-5 min-w-5 px-1.5 flex justify-center items-center rounded-full">
                {initiatedFeedbacks.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex justify-center items-center gap-2">
            Pending
            {pendingFeedbacks.length > 0 && (
              <Badge variant="secondary" className="h-5 min-w-5 px-1.5 flex justify-center items-center rounded-full">
                {pendingFeedbacks.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="received" className="mt-4">
          {receivedFeedbacks.length > 0 ? (
            <div className="space-y-4">
              {receivedFeedbacks.map((feedback, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-md border">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-800">
                      {feedback.name || "Feedback Request"}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
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
                    <p><strong>From:</strong> {feedback.reviewer_name}</p>
                    <p><strong>For:</strong> {feedback.employee_name}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No feedback received yet.</p>
          )}
        </TabsContent>

        <TabsContent value="given" className="mt-4">
          {givenFeedbacks.length > 0 ? (
            <div className="space-y-4">
              {givenFeedbacks.map((feedback, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-md border">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-800">
                      {feedback.name || "Feedback Given"}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
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
                    <p><strong>To:</strong> {feedback.employee_name}</p>
                    <p><strong>Reviewer:</strong> {feedback.reviewer_name}</p>
                    {feedback.additional_comments && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="font-medium text-sm">Comments:</p>
                        <div
                          className="text-sm prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: feedback.additional_comments }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No feedback given yet.</p>
          )}
        </TabsContent>
        
        <TabsContent value="initiated" className="mt-4">
          {initiatedFeedbacks.length > 0 ? (
            <div className="space-y-4">
              {initiatedFeedbacks.map((feedback, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-md border">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-800">
                      {feedback.name || "Feedback Initiated"}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
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
                    <p><strong>For:</strong> {feedback.employee_name}</p>
                    <p><strong>Reviewer:</strong> {feedback.reviewer_name}</p>
                    {feedback.additional_comments && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="font-medium text-sm">Comments:</p>
                        <div
                          className="text-sm prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: feedback.additional_comments }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No feedback initiated yet.</p>
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          {pendingFeedbacks.length > 0 ? (
            <div className="space-y-4">
              {pendingFeedbacks.map((feedback, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-md border">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-800">
                      {feedback.name || "Pending Feedback"}
                    </h3>
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                      {feedback.custom_feedback_status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>For:</strong> {feedback.employee_name}</p>
                    <p><strong>Reviewer:</strong> {feedback.reviewer_name}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No pending feedback to give.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const FeedbackSkeleton = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <div className="flex justify-between items-center mb-4">
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-8 w-32" />
    </div>
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-md">
        <div className="flex justify-between items-start mb-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
      <div className="bg-gray-50 p-4 rounded-md">
        <div className="flex justify-between items-start mb-2">
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
