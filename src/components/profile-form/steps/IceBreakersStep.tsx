
import React from 'react';
import { useProfileForm } from '@/contexts/ProfileFormContext';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { IceBreakerEntry } from '@/contexts/ProfileFormContext';

const defaultQuestions = [
  "What's your favorite hobby outside of work?",
  "If you could have dinner with anyone (living or dead), who would it be?",
  "What's the most interesting place you've traveled to?",
  "What's your go-to comfort food?",
  "If you could learn any skill instantly, what would it be?",
  "What's your favorite book or movie genre?",
  "What's the best piece of advice you've ever received?",
  "If you could live in any time period, which would you choose?",
  "What's your dream vacation destination?",
  "What's something you're passionate about that might surprise people?"
];

export const IceBreakersStep = () => {
  const { state, updateFormData } = useProfileForm();

  const handleAnswerChange = (index: number, answer: string) => {
    const updatedIceBreakers = [...state.formData.custom_employee_icebreaker_question];
    
    if (updatedIceBreakers[index]) {
      updatedIceBreakers[index] = { ...updatedIceBreakers[index], answer };
    } else {
      updatedIceBreakers[index] = { question: defaultQuestions[index], answer };
    }
    
    updateFormData({ custom_employee_icebreaker_question: updatedIceBreakers });
  };

  const getAnswerForQuestion = (index: number): string => {
    const iceBreaker = state.formData.custom_employee_icebreaker_question.find(
      (item) => item.question === defaultQuestions[index]
    );
    return iceBreaker?.answer || '';
  };

  const getAnsweredCount = (): number => {
    return state.formData.custom_employee_icebreaker_question.filter(
      (item) => item.answer && item.answer.trim() !== ''
    ).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Ice Breaker Questions</h2>
        <div className="text-sm text-gray-600">
          {getAnsweredCount()}/5 minimum answered
        </div>
      </div>
      
      <div className="bg-yellow-50 p-4 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Please answer at least 5 questions to help your colleagues get to know you better.
        </p>
      </div>

      <div className="space-y-6">
        {defaultQuestions.map((question, index) => (
          <div key={index} className="space-y-2">
            <Label className="text-base font-medium text-gray-800">
              {index + 1}. {question}
            </Label>
            <Textarea
              value={getAnswerForQuestion(index)}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              placeholder="Share your answer..."
              className="resize-none min-h-[80px]"
            />
          </div>
        ))}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Tips for Great Answers</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Be authentic and genuine in your responses</li>
          <li>• Share personal anecdotes or experiences when relevant</li>
          <li>• Keep answers concise but engaging</li>
          <li>• These questions help build connections with your team</li>
        </ul>
      </div>
    </div>
  );
};
