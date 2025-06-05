import { useState, useEffect } from "react";
import { useEmployeeDetails } from "@/api/employeeService";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit, RefreshCcw, Save, X, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_BASE_URL

// Expanded list of predefined questions (30 total)
const predefinedQuestions = [
  "If you were a superhero, what would your costume look like?",
  "What's your favorite productivity hack?",
  "What was your first job ever?",
  "If you could have dinner with any historical figure, who would it be?",
  "What's your most-used emoji?",
  "What's your go-to karaoke song?",
  "If you could instantly master one skill, what would it be?",
  "What's the most adventurous thing you've ever done?",
  "If you had to eat one food for the rest of your life, what would it be?",
  "What's your favorite book or movie and why?",
  "What's a hobby you've always wanted to try but haven't yet?",
  "If you could live in any fictional world, which would you choose?",
  "What's the best piece of advice you've ever received?",
  "If you could time travel, which era would you visit first?",
  "What's something unexpected that brings you joy?",
  "What's the most beautiful place you've ever been?",
  "If you could have any animal as a pet, what would it be?",
  "What's a talent you have that most people don't know about?",
  "If you could solve one world problem, which would you choose?",
  "What's your favorite way to recharge after a long day?",
  "What's the strangest food combination you enjoy?",
  "If you were a character in a movie, who would play you?",
  "What's something you learned recently that surprised you?",
  "If you could start a business, what kind would it be?",
  "What childhood toy do you wish you still had?",
  "If you had a personal theme song, what would it be?",
  "What's a technology from science fiction you wish existed?",
  "If you had an extra hour every day, how would you use it?",
  "What's a small act of kindness someone did for you that you never forgot?",
  "If you could pick up and move anywhere tomorrow, where would you go?"
];

interface IceBreakerQuestion {
  name?: string;
  question: string;
  answer: string;
}

interface QuestionHistory {
  index: number;
  answer: string;
}

// Function to save employee ice breaker answers
const saveIceBreakers = async (questions: IceBreakerQuestion[]) => {

  try {
    const response = await fetch(`${BASE_URL}user.set_employee_details`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        custom_employee_icebreaker_question: questions
      }),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to save ice breakers');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving ice breakers:', error);
    throw error;
  }
};

// Helper function to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const IceBreakers = () => {
  const { employee, loading } = useEmployeeDetails();

  if (loading || !employee) {
    return <IceBreakersSkeleton />;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Ice Breakers</h2>

      {employee.custom_employee_icebreaker_question ? (
        employee.custom_employee_icebreaker_question.length === 0 ? (
          <IceBreakersForm questions={[]} predefinedQuestions={predefinedQuestions} />
        ) : (
          <IceBreakersForm
            questions={employee.custom_employee_icebreaker_question}
            predefinedQuestions={predefinedQuestions}
          />
        )
      ) : (
        <p className="text-gray-500 italic">No ice breakers available.</p>
      )}
    </div>
  );
};

const IceBreakersForm = ({
  questions,
  predefinedQuestions
}: {
  questions: IceBreakerQuestion[];
  predefinedQuestions: string[];
}) => {
  const [currentQuestions, setCurrentQuestions] = useState<IceBreakerQuestion[]>(questions);
  const [currentIndex, setCurrentIndex] = useState(questions.length === 0 ? 0 : -1);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inlineEditing, setInlineEditing] = useState<number | null>(null);
  const [editedAnswer, setEditedAnswer] = useState("");
  const [questionHistory, setQuestionHistory] = useState<QuestionHistory[]>([]);

  // Initialize questions with randomly selected ones if needed
  useEffect(() => {
    if (questions.length === 0 && currentQuestions.length === 0 && currentIndex === 0) {
      generateRandomQuestions();
    }
  }, [questions, predefinedQuestions, currentQuestions.length, currentIndex]);

  // Generate a set of randomly selected questions
  const generateRandomQuestions = () => {
    const shuffledQuestions = shuffleArray(predefinedQuestions);
    const initialQuestions = shuffledQuestions.map((q, index) => ({
      name: `q_${index}`,
      question: q,
      answer: ""
    }));
    setCurrentQuestions(initialQuestions);
  };

  // Handle start/restart
  const handleStart = () => {
    setCurrentIndex(0);
    setAnswer("");
    setQuestionHistory([]);
    if (currentQuestions.length === 0) {
      generateRandomQuestions();
    }
  };

  // Handle restart (clear answers)
  const handleRestart = () => {
    generateRandomQuestions();
    setCurrentIndex(0);
    setAnswer("");
    setEditingIndex(null);
    setInlineEditing(null);
    setQuestionHistory([]);
    toast.success("Ice breakers restarted with new questions");
  };

  // Handle back button
  const handleBack = () => {
    if (questionHistory.length > 0) {
      // Save current answer before going back
      const updatedQuestions = [...currentQuestions];
      updatedQuestions[currentIndex] = {
        ...updatedQuestions[currentIndex],
        answer: answer.trim(),
      };
      setCurrentQuestions(updatedQuestions);

      // Get the previous question from history
      const previousQuestion = questionHistory[questionHistory.length - 1];
      
      // Remove the last item from history
      setQuestionHistory(prev => prev.slice(0, -1));
      
      // Set the previous question as current
      setCurrentIndex(previousQuestion.index);
      setAnswer(previousQuestion.answer);
    }
  };

  // Handle inline edit mode
  const handleInlineEdit = (index: number) => {
    setInlineEditing(index);
    setEditedAnswer(currentQuestions[index].answer);
  };

  // Handle save inline edit
  const handleSaveInlineEdit = async (index: number) => {
    if (inlineEditing !== null) {
      const updatedQuestions = [...currentQuestions];
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        answer: editedAnswer
      };
      setCurrentQuestions(updatedQuestions);

      // Save the updates to the server
      setIsSubmitting(true);
      try {
        // Filter out questions that have answers
        const answeredQuestions = updatedQuestions.filter(q => q.answer.trim() !== "");
        await saveIceBreakers(answeredQuestions);
        toast.success("Answer updated successfully!");
      } catch (error) {
        toast.error("Failed to update answer");
        console.error("Error saving edited answer:", error);
      } finally {
        setIsSubmitting(false);
      }

      setInlineEditing(null);
      setEditedAnswer("");
    }
  };

  // Handle cancel inline edit
  const handleCancelInlineEdit = () => {
    setInlineEditing(null);
    setEditedAnswer("");
  };

  // Handle edit mode
  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setAnswer(currentQuestions[index].answer);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (editingIndex !== null) {
      const updatedQuestions = [...currentQuestions];
      updatedQuestions[editingIndex] = {
        ...updatedQuestions[editingIndex],
        answer: answer
      };
      setCurrentQuestions(updatedQuestions);

      // Save the updates to the server
      setIsSubmitting(true);
      try {
        // Filter out questions that have answers
        const answeredQuestions = updatedQuestions.filter(q => q.answer.trim() !== "");
        await saveIceBreakers(answeredQuestions);
        toast.success("Answer updated successfully!");
      } catch (error) {
        toast.error("Failed to update answer");
        console.error("Error saving edited answer:", error);
      } finally {
        setIsSubmitting(false);
      }

      setEditingIndex(null);
      setAnswer("");
    }
  };

  // Handle next question (with circular navigation and history tracking)
  const handleNext = () => {
    if (currentIndex >= 0 && currentIndex < currentQuestions.length) {
      // Save current state to history
      setQuestionHistory(prev => [...prev, {
        index: currentIndex,
        answer: answer
      }]);

      const updatedQuestions = [...currentQuestions];
      updatedQuestions[currentIndex] = {
        ...updatedQuestions[currentIndex],
        answer: answer.trim(),
      };
      setCurrentQuestions(updatedQuestions);

      // Move to the next question
      const nextIndex = (currentIndex + 1) % currentQuestions.length;
      setCurrentIndex(nextIndex);
      
      // Load the answer for the next question if it exists
      setAnswer(updatedQuestions[nextIndex]?.answer || "");
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    if (currentIndex >= 0 && currentIndex < currentQuestions.length) {
      const updatedQuestions = [...currentQuestions];
      updatedQuestions[currentIndex] = {
        ...updatedQuestions[currentIndex],
        answer: answer.trim(),
      };
      setCurrentQuestions(updatedQuestions);

      const answeredQuestions = updatedQuestions.filter(q => q.answer.trim() !== "");

      setIsSubmitting(true);
      try {
        await saveIceBreakers(answeredQuestions);
        toast.success("Ice breakers submitted successfully!");
        setCurrentIndex(-1);
        setQuestionHistory([]);
      } catch (error) {
        toast.error("Failed to submit ice breakers");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Handle skip question (with circular navigation and history tracking)
  const handleSkip = () => {
    // Save current state to history
    setQuestionHistory(prev => [...prev, {
      index: currentIndex,
      answer: answer
    }]);

    const nextIndex = (currentIndex + 1) % currentQuestions.length;
    setCurrentIndex(nextIndex);
    
    // Load the answer for the next question if it exists
    setAnswer(currentQuestions[nextIndex]?.answer || "");
  };

  // Check if minimum questions are answered
  const answeredCount = currentQuestions.filter(q => q.answer.trim() !== "").length;
  const canSubmit = answeredCount >= 5;
  const canGoBack = questionHistory.length > 0;

  // Render view mode (list of answered questions)
  if (currentIndex === -1) {
    const answeredQuestions = currentQuestions.filter(q => q.answer.trim() !== "");

    return (
      <div>
        {answeredQuestions.length > 0 ? (
          <div className="space-y-4">
            {answeredQuestions.map((item, index) => (
              <div key={item.name || index} className="bg-gray-50 p-4 rounded-md relative">
                <div className="flex justify-between mb-2">
                  <p className="font-medium text-gray-700">{item.question}</p>

                  {inlineEditing === index ? (
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelInlineEdit()}
                      >
                        <X size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSaveInlineEdit(index)}
                        disabled={isSubmitting}
                      >
                        <Save size={16} />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => handleInlineEdit(index)}
                    >
                      <Edit size={16} />
                    </Button>
                  )}
                </div>

                {inlineEditing === index ? (
                  <Textarea
                    value={editedAnswer}
                    onChange={(e) => setEditedAnswer(e.target.value)}
                    className="w-full min-h-[100px]"
                    disabled={isSubmitting}
                  />
                ) : (
                  <p className="text-gray-600">{item.answer}</p>
                )}
              </div>
            ))}
            {/* <div className="flex space-x-2 mt-4 pt-4 border-t">
              <Button 
                variant="outline"
                onClick={handleRestart}
                className="flex items-center gap-2"
              >
                <RefreshCcw size={16} /> Start Fresh
              </Button>
            </div> */}
          </div>
        ) : (
          <div className="text-center my-8">
            <p className="text-gray-500 mb-4">No ice breakers answered yet.</p>
            <Button onClick={handleStart}>Get Started</Button>
          </div>
        )}
      </div>
    );
  }

  // Render editing mode for a specific question
  if (editingIndex !== null) {
    return (
      <div className="space-y-4">
        <h3 className="font-medium text-gray-700">{currentQuestions[editingIndex].question}</h3>
        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Your answer..."
          className="w-full min-h-[100px]"
        />
        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            onClick={() => {
              setEditingIndex(null);
              setAnswer("");
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveEdit}
            disabled={answer.trim() === "" || isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    );
  }

  // Render question answering mode
  const currentQuestion = currentQuestions[currentIndex];
  const hasAnswer = answer.trim() !== "";
  const remainingQuestionsToAnswerMinimum = Math.max(0, 5 - answeredCount - (hasAnswer ? 1 : 0));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-gray-500">Question {currentIndex + 1} of {currentQuestions.length}</p>
      </div>

      <h3 className="font-medium text-gray-700">{currentQuestion?.question}</h3>
      <Textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Your answer..."
        className="w-full min-h-[100px]"
      />

      <div className="flex justify-between mt-4">
        <div className="flex gap-2">
          {canGoBack && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ChevronLeft size={16} />
              Back
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleSkip}
          >
            Skip
          </Button>
        </div>
        <div className="flex gap-2">
          {(canSubmit || answeredCount + (hasAnswer ? 1 : 0) >= 5) && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={isSubmitting || !hasAnswer}
          >
            Next
          </Button>
        </div>
      </div>

      {remainingQuestionsToAnswerMinimum > 0 && (
        <p className="text-sm text-amber-600">
          Please answer at least {remainingQuestionsToAnswerMinimum} more question{remainingQuestionsToAnswerMinimum !== 1 ? 's' : ''} before submitting ({answeredCount}/5 answered)
        </p>
      )}
    </div>
  );
};

const IceBreakersSkeleton = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <Skeleton className="h-7 w-32 mb-4" />
    <div className="space-y-4">
      <div>
        <Skeleton className="h-5 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div>
        <Skeleton className="h-5 w-full mb-2" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div>
        <Skeleton className="h-5 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  </div>
);

export default IceBreakers;
