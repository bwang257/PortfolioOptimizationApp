'use client';

import { useState } from 'react';
import { OnboardingQuestion } from '@/lib/onboardingData';
import { UserGoal, KnowledgeLevel } from '@/contexts/UserPreferencesContext';

interface OnboardingQuizProps {
  questions: OnboardingQuestion[];
  onComplete: (goal: UserGoal, level: KnowledgeLevel) => void;
  onSkip?: () => void;
}

export default function OnboardingQuiz({ questions, onComplete, onSkip }: OnboardingQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, UserGoal | KnowledgeLevel>>({});

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleOptionSelect = (value: UserGoal | KnowledgeLevel) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    if (isLastQuestion) {
      // Complete onboarding
      const goal = newAnswers['goal'] as UserGoal;
      const level = newAnswers['knowledge'] as KnowledgeLevel;
      if (goal && level) {
        onComplete(goal, level);
      }
    } else {
      // Move to next question
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 300);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-600 dark:text-gray-400">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          {onSkip && (
            <button
              onClick={onSkip}
              className="text-sm text-slate-500 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300 transition-colors"
            >
              Skip
            </button>
          )}
        </div>
        <div className="w-full bg-slate-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
          {currentQuestion.question}
        </h2>

        <div className="space-y-4">
          {currentQuestion.options.map((option) => {
            const isSelected = answers[currentQuestion.id] === option.value;
            return (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(option.value)}
                className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-md'
                    : 'border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                      {option.label}
                    </h3>
                    {option.description && (
                      <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">
                        {option.description}
                      </p>
                    )}
                  </div>
                  {isSelected && (
                    <div className="ml-4 flex-shrink-0">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={currentQuestionIndex === 0}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            currentQuestionIndex === 0
              ? 'bg-slate-100 dark:bg-gray-800 text-slate-400 dark:text-gray-600 cursor-not-allowed'
              : 'bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-gray-600'
          }`}
        >
          Back
        </button>
        <div className="text-sm text-slate-500 dark:text-gray-400">
          {currentQuestionIndex + 1} / {questions.length}
        </div>
      </div>
    </div>
  );
}

