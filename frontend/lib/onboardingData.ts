import { UserGoal, KnowledgeLevel } from '@/contexts/UserPreferencesContext';

export interface OnboardingQuestion {
  id: string;
  question: string;
  options: {
    id: string;
    label: string;
    value: UserGoal | KnowledgeLevel;
    description?: string;
  }[];
}

export const onboardingQuestions: OnboardingQuestion[] = [
  {
    id: 'goal',
    question: 'What is your primary investment goal?',
    options: [
      {
        id: 'grow_wealth',
        label: 'Grow Wealth',
        value: 'grow_wealth' as UserGoal,
        description: 'Maximize returns over the long term'
      },
      {
        id: 'protect_savings',
        label: 'Protect Savings',
        value: 'protect_savings' as UserGoal,
        description: 'Preserve capital with lower risk'
      },
      {
        id: 'active_trading',
        label: 'Active Trading',
        value: 'active_trading' as UserGoal,
        description: 'Actively manage and optimize positions'
      }
    ]
  },
  {
    id: 'knowledge',
    question: 'How much do you know about investing?',
    options: [
      {
        id: 'new',
        label: "I'm new. Guide me.",
        value: 'new' as KnowledgeLevel,
        description: 'Simple explanations and step-by-step guidance'
      },
      {
        id: 'basics',
        label: 'I know the basics.',
        value: 'basics' as KnowledgeLevel,
        description: 'Standard mode with helpful explanations'
      },
      {
        id: 'advanced',
        label: "I optimize my own Greeks.",
        value: 'advanced' as KnowledgeLevel,
        description: 'Pro mode with advanced metrics and tools'
      }
    ]
  }
];

