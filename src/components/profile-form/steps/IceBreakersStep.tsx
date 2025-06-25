
import React, { useState, useEffect } from 'react';
import { useProfileForm } from '@/contexts/ProfileFormContext';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Info, Users } from 'lucide-react';
import { IceBreakerEntry } from '@/contexts/ProfileFormContext';

const allQuestions = [
  "What's your favorite hobby outside of work and why?",
  "If you could have dinner with anyone (living or dead), who would it be and why?",
  "What's the most interesting place you've traveled to?",
  "What's your go-to comfort food and why?",
  "If you could learn any skill instantly, what would it be and why?",
  "What's your favorite book or movie genre and why?",
  "What's the best piece of advice you've ever received?",
  "If you could live in any time period, which would you choose and why?",
  "What's your dream vacation destination and why?",
  "What's something you're passionate about that might surprise people?",
  "What's your favorite way to unwind after a long day?",
  "If you could have any superpower, what would it be and why?",
  "What's the most adventurous thing you've ever done?",
  "What's your favorite season and why?",
  "If you could only eat one cuisine for the rest of your life, what would it be and why?",
  "What's a skill you're currently learning or want to learn?",
  "What's your favorite childhood memory?",
  "If you could meet your 10-year-old self, what would you tell them?",
  "What's the best concert or live performance you've ever attended and why?",
  "What's your go-to karaoke song and why?",
  "If you could instantly become an expert in any field, what would it be?",
  "What's your favorite podcast or YouTube channel and why?",
  "What's the most unusual food you've ever tried?",
  "If you could have a conversation with any fictional character, who would it be?",
  "What's your favorite board game or video game and why?",
  "What's the most beautiful place you've ever seen?",
  "If you could relive one day from your past, which would it be and why?",
  "What's your favorite quote or motto and why does it resonate with you?",
  "What's something you've always wanted to try but haven't yet?",
  "If you could have dinner with three people (alive or dead), who would they be and why?"
];

// Function to randomly select 3 questions
const getRandomQuestions = () => {
  const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
};

export const IceBreakersStep = () => {
  const { state, updateFormData } = useProfileForm();
  const [displayQuestions, setDisplayQuestions] = useState<{ question: string; answer: string }[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize questions based on existing data or random selection - ONLY ONCE
  useEffect(() => {
    if (!isInitialized) {
      const existingIceBreakers = state.formData.custom_employee_icebreaker_question || [];
      
      if (existingIceBreakers.length > 0) {
        // Use existing ice breakers with their answers
        setDisplayQuestions(existingIceBreakers.map(item => ({
          question: item.question,
          answer: item.answer
        })));
      } else {
        // Create 3 random questions with empty answers
        const randomQuestions = getRandomQuestions();
        setDisplayQuestions(randomQuestions.map(question => ({
          question,
          answer: ''
        })));
      }
      setIsInitialized(true);
    }
  }, [isInitialized, state.formData.custom_employee_icebreaker_question]);

  const handleAnswerChange = (index: number, answer: string) => {
    // Create a new array to avoid mutation
    const updatedDisplayQuestions = displayQuestions.map((item, i) => 
      i === index ? { ...item, answer } : item
    );
    
    // Update local display state
    setDisplayQuestions(updatedDisplayQuestions);
    
    // Update form data with all questions (including empty answers to preserve question order)
    const updatedIceBreakers = updatedDisplayQuestions.map(item => ({
      question: item.question,
      answer: item.answer
    }));
    
    updateFormData({ custom_employee_icebreaker_question: updatedIceBreakers });
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="text-2xl font-bold text-brandBlueDarkest">Ice Breaker Questions</h2>
        <p className="text-textMuted mt-2">Here are fun questions to help your colleagues get to know you better!</p>
      </div>

      <div className="bg-highlightBg p-4 rounded-lg border border-borderMid shadow-subtle">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-brandBlue" />
          <h4 className="font-bold text-brandBlueLighterDark">Show Your Personality!</h4>
        </div>
        <p className="text-sm text-textMuted">
          <strong className="text-brandBlue">These answers will be visible to your colleagues</strong> – this is your chance to let your personality shine and help others connect with you! Feel free to be creative, funny, or thoughtful. You can skip any questions you prefer not to answer.
        </p>
      </div>

      <div className="space-y-6">
        {displayQuestions.map((item, index) => (
          <div key={`${item.question}-${index}`} className="space-y-2 p-4 bg-cardBg rounded-lg border border-borderSoft shadow-subtle">
            <Label className="text-base font-semibold text-brandBlueDarkest">
              {index + 1}. {item.question}
            </Label>
            <Textarea
              value={item.answer}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              placeholder="Share your answer... (optional)"
              className="resize-none min-h-[80px] border-borderSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-1 text-brandBlueDarker"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
