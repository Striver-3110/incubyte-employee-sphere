
export const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  return date.toLocaleDateString('en-US', options);
};

export const calculateTenure = (joiningDate: string): string => {
  if (!joiningDate) return "";
  
  const startDate = new Date(joiningDate);
  const currentDate = new Date();
  
  // Calculate the difference in milliseconds
  const diffInMs = currentDate.getTime() - startDate.getTime();
  
  // Convert to years and months
  const msInYear = 1000 * 60 * 60 * 24 * 365.25;
  const msInMonth = msInYear / 12;
  
  const years = Math.floor(diffInMs / msInYear);
  const months = Math.floor((diffInMs % msInYear) / msInMonth);
  
  if (years > 0) {
    return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
  } else {
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
};

export const hasRecentFeedback = (feedbacks: any[], employeeId: string, months: number = 3): {
  given: boolean;
  received: boolean;
} => {
  const currentDate = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(currentDate.getMonth() - months);
  
  const givenFeedbacks = feedbacks.filter(f => f.from === employeeId && f.status === 'Completed');
  const receivedFeedbacks = feedbacks.filter(f => f.to === employeeId && f.status === 'Completed');
  
  const mostRecentGivenDate = givenFeedbacks.length > 0 
    ? Math.max(...givenFeedbacks.map(f => new Date(f.date_initiated).getTime()))
    : 0;
    
  const mostRecentReceivedDate = receivedFeedbacks.length > 0 
    ? Math.max(...receivedFeedbacks.map(f => new Date(f.date_initiated).getTime()))
    : 0;
    
  return {
    given: mostRecentGivenDate >= threeMonthsAgo.getTime(),
    received: mostRecentReceivedDate >= threeMonthsAgo.getTime()
  };
};

export const checkRecentFeedback = (feedbackList: any[], monthsThreshold: number = 2): boolean => {
  if (!feedbackList || feedbackList.length === 0) {
    return false;
  }
  
  const currentDate = new Date();
  const thresholdDate = new Date();
  thresholdDate.setMonth(currentDate.getMonth() - monthsThreshold);
  
  // Check if any feedback was received within the threshold period
  return feedbackList.some(feedback => {
    const feedbackDate = feedback.added_on ? new Date(feedback.added_on) : null;
    return feedbackDate && feedbackDate > thresholdDate;
  });
};

