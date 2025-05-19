
import { useState, useEffect } from "react";
import { useFeedbackData, useEmployeeDetails } from "@/api/employeeService";
import { hasRecentFeedback, formatDate } from "@/utils/dateUtils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { X } from "lucide-react";
import { Feedback } from "@/api/employeeService";

const FeedbackSection = () => {
  const { feedbacks, loading } = useFeedbackData();
  const { employee } = useEmployeeDetails();
  const [employeeId, setEmployeeId] = useState<string>("");
  const [showAllGiven, setShowAllGiven] = useState(false);
  const [showAllReceived, setShowAllReceived] = useState(false);
  const [showAllPending, setShowAllPending] = useState(false);
  const [dismissWarning, setDismissWarning] = useState<{given: boolean, received: boolean}>({
    given: false,
    received: false
  });
  
  useEffect(() => {
    if (employee) {
      setEmployeeId(employee.employee);
    }
  }, [employee]);

  if (loading || !employeeId) {
    return <FeedbackSectionSkeleton />;
  }

  // Filter feedbacks
  const givenFeedbacks = feedbacks.filter(f => f.from === employeeId && f.status === 'Completed');
  const receivedFeedbacks = feedbacks.filter(f => f.to === employeeId && f.status === 'Completed');
  const pendingFeedbacks = feedbacks.filter(f => 
    (f.from === employeeId || f.to === employeeId) && f.status === 'Pending'
  );
  
  // Check for recent feedback
  const recentFeedback = hasRecentFeedback(feedbacks, employeeId);
  
  // Calculate the number to show initially
  const initialDisplayCount = 3;
  const displayedGiven = showAllGiven ? givenFeedbacks : givenFeedbacks.slice(0, initialDisplayCount);
  const displayedReceived = showAllReceived ? receivedFeedbacks : receivedFeedbacks.slice(0, initialDisplayCount);
  const displayedPending = showAllPending ? pendingFeedbacks : pendingFeedbacks.slice(0, initialDisplayCount);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Feedback</h2>
      
      {/* Warning messages */}
      {!recentFeedback.given && !dismissWarning.given && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex justify-between items-center">
          <p className="text-yellow-700">You have not given feedback recently! Please initiate feedback.</p>
          <Button variant="ghost" size="icon" onClick={() => setDismissWarning({...dismissWarning, given: true})}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {!recentFeedback.received && !dismissWarning.received && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex justify-between items-center">
          <p className="text-yellow-700">You have not received feedback recently! Ask your colleagues to give feedback.</p>
          <Button variant="ghost" size="icon" onClick={() => setDismissWarning({...dismissWarning, received: true})}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Feedback sections */}
      <div className="space-y-6">
        {/* Feedback Given */}
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Feedback Given</h3>
          {displayedGiven.length > 0 ? (
            <div className="space-y-2">
              {displayedGiven.map((feedback) => (
                <FeedbackItem key={feedback.id} feedback={feedback} />
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
        
        {/* Feedback Received */}
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Feedback Received</h3>
          {displayedReceived.length > 0 ? (
            <div className="space-y-2">
              {displayedReceived.map((feedback) => (
                <FeedbackItem key={feedback.id} feedback={feedback} />
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
        
        {/* Pending Feedback */}
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Pending Feedback</h3>
          {displayedPending.length > 0 ? (
            <div className="space-y-2">
              {displayedPending.map((feedback) => (
                <FeedbackItem key={feedback.id} feedback={feedback} />
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
      </div>
    </div>
  );
};

interface FeedbackItemProps {
  feedback: Feedback;
}

const FeedbackItem = ({ feedback }: FeedbackItemProps) => (
  <div className="bg-gray-50 p-3 rounded-md">
    <div className="flex justify-between items-center mb-1">
      <div className="font-medium">
        {feedback.from} {feedback.from !== feedback.to ? `→ ${feedback.to}` : "(Self)"}
      </div>
      <div className="text-sm text-gray-500">
        {formatDate(feedback.date_initiated)}
      </div>
    </div>
    <div className="flex justify-between items-center">
      <div className="text-sm text-gray-600 line-clamp-1">
        {feedback.content || "(No content available)"}
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full ${
        feedback.status === 'Completed' 
          ? 'bg-green-100 text-green-800' 
          : 'bg-yellow-100 text-yellow-800'
      }`}>
        {feedback.status}
      </span>
    </div>
  </div>
);

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
