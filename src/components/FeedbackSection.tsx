
import { useState, useEffect } from "react";
import { useFeedbackData, useEmployeeDetails } from "@/api/employeeService";
import { hasRecentFeedback, formatDate } from "@/utils/dateUtils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { X } from "lucide-react";
import { Feedback } from "@/api/employeeService";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Helper function to convert employee IDs to names
const getEmployeeName = (id: string, employeeMap: Record<string, string>) => {
  return employeeMap[id] || id;
};

const FeedbackSection = () => {
  const { feedbacks, loading } = useFeedbackData();
  const { employee, loading: employeeLoading } = useEmployeeDetails();
  const [employeeId, setEmployeeId] = useState<string>("");
  const [employeeNames, setEmployeeNames] = useState<Record<string, string>>({});
  const [showAllInitiated, setShowAllInitiated] = useState(false);
  const [showAllGiven, setShowAllGiven] = useState(false);
  const [showAllReceived, setShowAllReceived] = useState(false);
  const [showAllPending, setShowAllPending] = useState(false);
  const [dismissWarning, setDismissWarning] = useState<{given: boolean, received: boolean}>({
    given: false,
    received: false
  });
  const [activeTab, setActiveTab] = useState("all");
  
  useEffect(() => {
    if (employee) {
      setEmployeeId(employee.employee);
      
      // Create a mapping of employee IDs to names
      // In a real app, you would fetch this data from your API
      // For now, we'll use a placeholder mapping starting with the current user
      setEmployeeNames(prev => ({
        ...prev,
        [employee.employee]: employee.employee_name
      }));
    }
  }, [employee]);
  
  // Mock employee names for demonstration
  useEffect(() => {
    if (feedbacks.length > 0) {
      const uniqueEmployeeIds = new Set<string>();
      feedbacks.forEach(feedback => {
        uniqueEmployeeIds.add(feedback.from);
        uniqueEmployeeIds.add(feedback.to);
      });
      
      // In a real app, you would fetch these names using the IDs
      // For now, we'll create mock names for demonstration
      const nameMap: Record<string, string> = {};
      uniqueEmployeeIds.forEach(id => {
        if (id === employeeId && employee) {
          nameMap[id] = employee.employee_name;
        } else {
          // Mock names for other employees - in real app, fetch from API
          nameMap[id] = `Employee ${id.replace('E', '')}`;
        }
      });
      
      setEmployeeNames(nameMap);
    }
  }, [feedbacks, employeeId, employee]);

  if (loading || employeeLoading || !employeeId) {
    return <FeedbackSectionSkeleton />;
  }

  // Filter feedbacks
  const initiatedFeedbacks = feedbacks.filter(f => f.from === employeeId && f.status === 'Pending');
  const givenFeedbacks = feedbacks.filter(f => f.from === employeeId && f.status === 'Completed');
  const receivedFeedbacks = feedbacks.filter(f => f.to === employeeId && f.status === 'Completed');
  const pendingFeedbacks = feedbacks.filter(f => 
    f.to === employeeId && f.status === 'Pending'
  );
  
  // Check for recent feedback
  const recentFeedback = hasRecentFeedback(feedbacks, employeeId);
  
  // Calculate the number to show initially
  const initialDisplayCount = 3;
  const displayedInitiated = showAllInitiated ? initiatedFeedbacks : initiatedFeedbacks.slice(0, initialDisplayCount);
  const displayedGiven = showAllGiven ? givenFeedbacks : givenFeedbacks.slice(0, initialDisplayCount);
  const displayedReceived = showAllReceived ? receivedFeedbacks : receivedFeedbacks.slice(0, initialDisplayCount);
  const displayedPending = showAllPending ? pendingFeedbacks : pendingFeedbacks.slice(0, initialDisplayCount);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Feedback</h2>
      
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
        
        <TabsContent value="all">
          <div className="space-y-6">
            {/* Feedback Initiated */}
            {initiatedFeedbacks.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Feedback Initiated</h3>
                <div className="space-y-2">
                  {displayedInitiated.map((feedback) => (
                    <FeedbackItem 
                      key={feedback.id} 
                      feedback={feedback} 
                      employeeNames={employeeNames}
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
                    <FeedbackItem 
                      key={feedback.id} 
                      feedback={feedback} 
                      employeeNames={employeeNames}
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
                    <FeedbackItem 
                      key={feedback.id} 
                      feedback={feedback} 
                      employeeNames={employeeNames}
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
                    <FeedbackItem 
                      key={feedback.id} 
                      feedback={feedback} 
                      employeeNames={employeeNames}
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
                  <FeedbackItem 
                    key={feedback.id} 
                    feedback={feedback} 
                    employeeNames={employeeNames}
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
                  <FeedbackItem 
                    key={feedback.id} 
                    feedback={feedback} 
                    employeeNames={employeeNames}
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
                  <FeedbackItem 
                    key={feedback.id} 
                    feedback={feedback} 
                    employeeNames={employeeNames}
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
                  <FeedbackItem 
                    key={feedback.id} 
                    feedback={feedback} 
                    employeeNames={employeeNames}
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
  feedback: Feedback;
  employeeNames: Record<string, string>;
  currentEmployeeId: string;
}

const FeedbackItem = ({ feedback, employeeNames, currentEmployeeId }: FeedbackItemProps) => {
  const fromName = getEmployeeName(feedback.from, employeeNames);
  const toName = getEmployeeName(feedback.to, employeeNames);
  
  // Determine if this is a self-review
  const isSelfReview = feedback.from === feedback.to;
  
  // Show labels like "You → Emma" instead of employee IDs
  const displayFrom = feedback.from === currentEmployeeId ? "You" : fromName;
  const displayTo = feedback.to === currentEmployeeId ? "You" : toName;

  return (
    <div className="bg-gray-50 p-3 rounded-md">
      <div className="flex justify-between items-center mb-1">
        <div className="font-medium">
          {displayFrom} {isSelfReview ? "(Self)" : `→ ${displayTo}`}
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
