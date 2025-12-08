import { format, differenceInDays, startOfDay } from 'date-fns';

export interface ProgressData {
  streak: number;
  lastActivityDate: string | null;
  badges: Badge[];
  conceptsMastered: ConceptProgress[];
  totalPortfolios: number;
  totalNewsAnalyzed: number;
  totalRebalances: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  earned: boolean;
  earnedDate: string | null;
  icon: string;
}

export interface ConceptProgress {
  id: string;
  name: string;
  progress: number; // 0-100
  target: number;
  current: number;
}

const BADGE_DEFINITIONS: Omit<Badge, 'earned' | 'earnedDate'>[] = [
  {
    id: 'diversification_master',
    name: 'Diversification Master',
    description: 'Created 5+ diversified portfolios',
    icon: '🎯'
  },
  {
    id: 'risk_manager',
    name: 'Risk Manager',
    description: 'Successfully reduced volatility 3+ times',
    icon: '🛡️'
  },
  {
    id: 'news_reader',
    name: 'News Reader',
    description: 'Analyzed 10+ news articles',
    icon: '📰'
  },
  {
    id: 'rebalancer',
    name: 'Rebalancer',
    description: 'Successfully rebalanced a portfolio',
    icon: '⚖️'
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: '7-day streak',
    icon: '🔥'
  },
  {
    id: 'month_master',
    name: 'Month Master',
    description: '30-day streak',
    icon: '👑'
  }
];

const CONCEPT_DEFINITIONS: Omit<ConceptProgress, 'progress' | 'current'>[] = [
  {
    id: 'diversification',
    name: 'Diversification',
    target: 5
  },
  {
    id: 'risk_management',
    name: 'Risk Management',
    target: 3
  },
  {
    id: 'news_analysis',
    name: 'News Analysis',
    target: 10
  },
  {
    id: 'rebalancing',
    name: 'Rebalancing',
    target: 1
  }
];

export function getInitialProgress(): ProgressData {
  return {
    streak: 0,
    lastActivityDate: null,
    badges: BADGE_DEFINITIONS.map(badge => ({
      ...badge,
      earned: false,
      earnedDate: null
    })),
    conceptsMastered: CONCEPT_DEFINITIONS.map(concept => ({
      ...concept,
      progress: 0,
      current: 0
    })),
    totalPortfolios: 0,
    totalNewsAnalyzed: 0,
    totalRebalances: 0
  };
}

export function loadProgress(): ProgressData {
  try {
    const stored = localStorage.getItem('progressData');
    if (stored) {
      const data = JSON.parse(stored);
      // Update streak based on last activity
      const updatedData = updateStreak(data);
      return updatedData;
    }
  } catch (e) {
    console.error('Failed to load progress:', e);
  }
  return getInitialProgress();
}

export function saveProgress(progress: ProgressData): void {
  try {
    localStorage.setItem('progressData', JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress:', e);
  }
}

export function updateStreak(progress: ProgressData): ProgressData {
  const today = startOfDay(new Date());
  const lastActivity = progress.lastActivityDate
    ? startOfDay(new Date(progress.lastActivityDate))
    : null;

  if (!lastActivity) {
    return progress;
  }

  const daysSince = differenceInDays(today, lastActivity);

  if (daysSince === 0) {
    // Same day - streak continues
    return progress;
  } else if (daysSince === 1) {
    // Consecutive day - increment streak
    return {
      ...progress,
      streak: progress.streak + 1,
      lastActivityDate: today.toISOString()
    };
  } else {
    // Streak broken
    return {
      ...progress,
      streak: 1,
      lastActivityDate: today.toISOString()
    };
  }
}

export function recordActivity(
  activity: 'portfolio' | 'news' | 'rebalance',
  progress: ProgressData
): ProgressData {
  const updated = updateStreak(progress);
  const today = new Date().toISOString();

  let newProgress = {
    ...updated,
    lastActivityDate: today
  };

  // Update counts
  if (activity === 'portfolio') {
    newProgress.totalPortfolios += 1;
  } else if (activity === 'news') {
    newProgress.totalNewsAnalyzed += 1;
  } else if (activity === 'rebalance') {
    newProgress.totalRebalances += 1;
  }

  // Update concept progress
  newProgress.conceptsMastered = newProgress.conceptsMastered.map(concept => {
    let current = concept.current;
    if (activity === 'portfolio' && concept.id === 'diversification') {
      current += 1;
    } else if (activity === 'news' && concept.id === 'news_analysis') {
      current += 1;
    } else if (activity === 'rebalance' && concept.id === 'rebalancing') {
      current += 1;
    }

    return {
      ...concept,
      current,
      progress: Math.min(100, (current / concept.target) * 100)
    };
  });

  // Check for badge unlocks
  newProgress.badges = newProgress.badges.map(badge => {
    if (badge.earned) return badge;

    let shouldEarn = false;

    if (badge.id === 'diversification_master' && newProgress.totalPortfolios >= 5) {
      shouldEarn = true;
    } else if (badge.id === 'news_reader' && newProgress.totalNewsAnalyzed >= 10) {
      shouldEarn = true;
    } else if (badge.id === 'rebalancer' && newProgress.totalRebalances >= 1) {
      shouldEarn = true;
    } else if (badge.id === 'week_warrior' && newProgress.streak >= 7) {
      shouldEarn = true;
    } else if (badge.id === 'month_master' && newProgress.streak >= 30) {
      shouldEarn = true;
    }

    if (shouldEarn) {
      return {
        ...badge,
        earned: true,
        earnedDate: today
      };
    }

    return badge;
  });

  saveProgress(newProgress);
  return newProgress;
}

