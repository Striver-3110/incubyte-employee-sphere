
import React, { useState } from "react";
import { useEmployeeDetails } from "@/api/employeeService";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { FeedbackInitiation } from "./FeedbackInitiation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FeedbackSection = () => {
  const { employee, loading } = useEmployeeDetails();
  const [isInitiateDialogOpen, setIsInitiateDialogOpen] = useState(false);

  if (loading) {
    return <FeedbackSkeleton />;
  }

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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="received">Received Feedback</TabsTrigger>
          <TabsTrigger value="my-feedback">My Feedback</TabsTrigger>
        </TabsList>
        
        <TabsContent value="received" className="mt-4">
          {employee?.feedback_request && employee.feedback_request.length > 0 ? (
            <div className="space-y-4">
              {employee.feedback_request.map((feedback, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-md border">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-800">
                      {feedback.feedback_template || "Feedback Request"}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      feedback.status === 'Pending' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : feedback.status === 'Completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {feedback.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>From:</strong> {feedback.requester_name}</p>
                    <p><strong>Type:</strong> {feedback.feedback_type}</p>
                    {feedback.creation_date && (
                      <p><strong>Requested:</strong> {new Date(feedback.creation_date).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No feedback requests found.</p>
          )}
        </TabsContent>

        <TabsContent value="my-feedback" className="mt-4">
          <div className="text-center py-8">
            <p className="text-gray-500 italic">My feedback functionality will be implemented here.</p>
            <p className="text-sm text-gray-400 mt-2">This will show feedback that you have given or initiated.</p>
          </div>
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
