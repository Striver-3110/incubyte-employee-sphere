import { useState, useEffect } from "react";
import { useFeedbackData, useEmployeeDetails } from "@/api/employeeService";
import { hasRecentFeedback, formatDate } from "@/utils/dateUtils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Plus } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FeedbackInitiation from "./FeedbackInitiation";

interface FeedbackItem {
  name: string;
  for_employee: string;
  employee_name: string;
  reviewer_name: string;
  reviewer: string;
  rag_status: string;
}

const FeedbackSection = () => {
  const { feedbacks, loading } = useFeedbackData();
  const { employee, loading: employeeLoading } = useEmployeeDetails();
  const [employeeId, setEmployeeId] = useState<string>("");
  const [showAllInitiated, setShowAllInitiated] = useState(false);
  const [showAllGiven, setShowAllGiven] = useState(false);
  const [showAllReceived, setShowAllReceived] = useState(false);
  const [showAllPending, setShowAllPending] = useState(false);
  const [dismissWarning, setDismissWarning] = useState<{given: boolean, received: boolean}>({
    given: false,
    received: false
  });
  const [activeTab, setActiveTab] = useState("all");
  const [isInitiationDialogOpen, setIsInitiationDialogOpen] = useState(false);
  
  useEffect(() => {
    if (employee) {
      setEmployeeId(employee.employee);
    }
  }, [employee]);

  if (loading || employeeLoading || !employeeId) {
    return <FeedbackSectionSkeleton />;
  }

  // Extract feedback arrays from the new structure
  const initiatedFeedbacks = feedbacks?.initiated_by_me || [];
  const givenFeedbacks = feedbacks?.given_by_me || [];
  const receivedFeedbacks = feedbacks?.given_to_me || [];
  const pendingFeedbacks = feedbacks?.pending_to_give || [];
  
  // Check for recent feedback based on new structure
  const recentFeedback = {
    given: givenFeedbacks.length > 0,
    received: receivedFeedbacks.length > 0
  };
  
  // Calculate the number to show initially
  const initialDisplayCount = 3;
  const displayedInitiated = showAllInitiated ? initiatedFeedbacks : initiatedFeedbacks.slice(0, initialDisplayCount);
  const displayedGiven = showAllGiven ? givenFeedbacks : givenFeedbacks.slice(0, initialDisplayCount);
  const displayedReceived = showAllReceived ? receivedFeedbacks : receivedFeedbacks.slice(0, initialDisplayCount);
  const displayedPending = showAllPending ? pendingFeedbacks : pendingFeedbacks.slice(0, initialDisplayCount);

  // Filter feedbacks for "My Feedback" view (given by me and initiated by me)
  const myFeedbacks = [...givenFeedbacks, ...initiatedFeedbacks];
  const displayedMyFeedbacks = showAllGiven ? myFeedbacks : myFeedbacks.slice(0, initialDisplayCount);
  
  const handleInitiationSuccess = () => {
    setIsInitiationDialogOpen(false);
    // Optionally refresh the feedback data here
    window.location.reload(); // Simple refresh for now
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Feedback</h2>
        <Dialog open={isInitiationDialogOpen} onOpenChange={setIsInitiationDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Initiate Feedback
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Initiate Feedback Process</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto">
              <FeedbackInitiation 
                currentEmployeeId={employeeId} 
                onSuccess={handleInitiationSuccess}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Warning messages */}
      {!recentFeedback.given && !dismissWarning.given && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex justify-between items-center">
          <p className="text-yellow-700">You haven't given feedback recently! Please consider initiating feedback for your colleagues.</p>
          <Button variant="ghost" size="icon" onClick={() => setDismissWarning({...dismissWarning, given: true})}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {!recentFeedback.received && !dismissWarning.received && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex justify-between items-center">
          <p className="text-yellow-700">You haven't received feedback recently! Consider asking your colleagues for feedback.</p>
          <Button variant="ghost" size="icon" onClick={() => setDismissWarning({...dismissWarning, received: true})}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Feedback tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
        <TabsList className="mb-4 bg-gray-100">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="my-feedback">
            My Feedback ({myFeedbacks.length})
          </TabsTrigger>
          <TabsTrigger value="initiated">
            Initiated ({initiatedFeedbacks.length})
          </TabsTrigger>
          <TabsTrigger value="given">
            Given ({givenFeedbacks.length})
          </TabsTrigger>
          <TabsTrigger value="received">
            Received ({receivedFeedbacks.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingFeedbacks.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-feedback">
          <div>
            {myFeedbacks.length > 0 ? (
              <div className="space-y-2">
                {displayedMyFeedbacks.map((feedback) => (
                  <FeedbackItemComponent 
                    key={feedback.name} 
                    feedback={feedback} 
                    currentEmployeeId={employeeId}
                  />
                ))}
                
                {myFeedbacks.length > initialDisplayCount && (
                  <Button 
                    variant="link" 
                    onClick={() => setShowAllGiven(!showAllGiven)}
                    className="p-0 h-auto text-sm"
                  >
                    {showAllGiven ? "Show Less" : `View ${myFeedbacks.length - initialDisplayCount} More`}
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic">You haven't given or initiated any feedback yet.</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="all">
          <div className="space-y-6">
            {/* Feedback Initiated */}
            {initiatedFeedbacks.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Feedback Initiated</h3>
                <div className="space-y-2">
                  {displayedInitiated.map((feedback) => (
                    <FeedbackItemComponent 
                      key={feedback.name} 
                      feedback={feedback} 
                      currentEmployeeId={employeeId}
                    />
                  ))}
                  
                  {initiatedFeedbacks.length > initialDisplayCount && (
                    <Button 
                      variant="link" 
                      onClick={() => setShowAllInitiated(!showAllInitiated)}
                      className="p-0 h-auto text-sm"
                    >
                      {showAllInitiated ? "Show Less" : `View ${initiatedFeedbacks.length - initialDisplayCount} More`}
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            {/* Feedback Given */}
            {givenFeedbacks.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Feedback Given</h3>
                <div className="space-y-2">
                  {displayedGiven.map((feedback) => (
                    <FeedbackItemComponent 
                      key={feedback.name} 
                      feedback={feedback} 
                      currentEmployeeId={employeeId}
                    />
                  ))}
                  
                  {givenFeedbacks.length > initialDisplayCount && (
                    <Button 
                      variant="link" 
                      onClick={() => setShowAllGiven(!showAllGiven)}
                      className="p-0 h-auto text-sm"
                    >
                      {showAllGiven ? "Show Less" : `View ${givenFeedbacks.length - initialDisplayCount} More`}
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            {/* Feedback Received */}
            {receivedFeedbacks.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Feedback Received</h3>
                <div className="space-y-2">
                  {displayedReceived.map((feedback) => (
                    <FeedbackItemComponent 
                      key={feedback.name} 
                      feedback={feedback} 
                      currentEmployeeId={employeeId}
                    />
                  ))}
                  
                  {receivedFeedbacks.length > initialDisplayCount && (
                    <Button 
                      variant="link" 
                      onClick={() => setShowAllReceived(!showAllReceived)}
                      className="p-0 h-auto text-sm"
                    >
                      {showAllReceived ? "Show Less" : `View ${receivedFeedbacks.length - initialDisplayCount} More`}
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            {/* Pending Feedback */}
            {pendingFeedbacks.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Pending Feedback</h3>
                <div className="space-y-2">
                  {displayedPending.map((feedback) => (
                    <FeedbackItemComponent 
                      key={feedback.name} 
                      feedback={feedback} 
                      currentEmployeeId={employeeId}
                    />
                  ))}
                  
                  {pendingFeedbacks.length > initialDisplayCount && (
                    <Button 
                      variant="link" 
                      onClick={() => setShowAllPending(!showAllPending)}
                      className="p-0 h-auto text-sm"
                    >
                      {showAllPending ? "Show Less" : `View ${pendingFeedbacks.length - initialDisplayCount} More`}
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            {initiatedFeedbacks.length === 0 && givenFeedbacks.length === 0 && 
             receivedFeedbacks.length === 0 && pendingFeedbacks.length === 0 && (
              <p className="text-gray-500 italic">No feedback available.</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="initiated">
          <div>
            {initiatedFeedbacks.length > 0 ? (
              <div className="space-y-2">
                {displayedInitiated.map((feedback) => (
                  <FeedbackItemComponent 
                    key={feedback.name} 
                    feedback={feedback} 
                    currentEmployeeId={employeeId}
                  />
                ))}
                
                {initiatedFeedbacks.length > initialDisplayCount && (
                  <Button 
                    variant="link" 
                    onClick={() => setShowAllInitiated(!showAllInitiated)}
                    className="p-0 h-auto text-sm"
                  >
                    {showAllInitiated ? "Show Less" : `View ${initiatedFeedbacks.length - initialDisplayCount} More`}
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic">No feedback initiated yet.</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="given">
          <div>
            {givenFeedbacks.length > 0 ? (
              <div className="space-y-2">
                {displayedGiven.map((feedback) => (
                  <FeedbackItemComponent 
                    key={feedback.name} 
                    feedback={feedback} 
                    currentEmployeeId={employeeId}
                  />
                ))}
                
                {givenFeedbacks.length > initialDisplayCount && (
                  <Button 
                    variant="link" 
                    onClick={() => setShowAllGiven(!showAllGiven)}
                    className="p-0 h-auto text-sm"
                  >
                    {showAllGiven ? "Show Less" : `View ${givenFeedbacks.length - initialDisplayCount} More`}
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic">No feedback given yet.</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="received">
          <div>
            {receivedFeedbacks.length > 0 ? (
              <div className="space-y-2">
                {displayedReceived.map((feedback) => (
                  <FeedbackItemComponent 
                    key={feedback.name} 
                    feedback={feedback} 
                    currentEmployeeId={employeeId}
                  />
                ))}
                
                {receivedFeedbacks.length > initialDisplayCount && (
                  <Button 
                    variant="link" 
                    onClick={() => setShowAllReceived(!showAllReceived)}
                    className="p-0 h-auto text-sm"
                  >
                    {showAllReceived ? "Show Less" : `View ${receivedFeedbacks.length - initialDisplayCount} More`}
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic">No feedback received yet.</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="pending">
          <div>
            {pendingFeedbacks.length > 0 ? (
              <div className="space-y-2">
                {displayedPending.map((feedback) => (
                  <FeedbackItemComponent 
                    key={feedback.name} 
                    feedback={feedback} 
                    currentEmployeeId={employeeId}
                  />
                ))}
                
                {pendingFeedbacks.length > initialDisplayCount && (
                  <Button 
                    variant="link" 
                    onClick={() => setShowAllPending(!showAllPending)}
                    className="p-0 h-auto text-sm"
                  >
                    {showAllPending ? "Show Less" : `View ${pendingFeedbacks.length - initialDisplayCount} More`}
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic">No pending feedback.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface FeedbackItemProps {
  feedback: FeedbackItem;
  currentEmployeeId: string;
}

const FeedbackItemComponent = ({ feedback, currentEmployeeId }: FeedbackItemProps) => {
  // Show labels like "You → Emma" instead of employee IDs
  const displayFrom = feedback.reviewer === currentEmployeeId ? "You" : feedback.reviewer_name;
  const displayTo = feedback.for_employee === currentEmployeeId ? "You" : feedback.employee_name;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'green':
        return 'bg-green-100 text-green-800';
      case 'amber':
        return 'bg-yellow-100 text-yellow-800';
      case 'red':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-gray-50 p-3 rounded-md">
      <div className="flex justify-between items-center mb-1">
        <div className="font-medium">
          {displayFrom} → {displayTo}
        </div>
        <div className="text-sm text-gray-500">
          {feedback.name}
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600 line-clamp-1">
          Feedback for {feedback.employee_name}
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(feedback.rag_status)}`}>
          {feedback.rag_status}
        </span>
      </div>
    </div>
  );
};

const FeedbackSectionSkeleton = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <Skeleton className="h-7 w-32 mb-4" />
    
    <div className="space-y-6">
      <div>
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-16 w-full mb-2" />
        <Skeleton className="h-16 w-full mb-2" />
      </div>
      
      <div>
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-16 w-full mb-2" />
        <Skeleton className="h-16 w-full mb-2" />
      </div>
      
      <div>
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-16 w-full mb-2" />
        <Skeleton className="h-16 w-full mb-2" />
      </div>
    </div>
  </div>
);

export default FeedbackSection;
