// Persists all user progress on-device with AsyncStorage. No accounts in v1.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { PaperAttempt, ProgressState, QuizPaper } from '../types';
import { daysBetween } from '../utils/date';

const KEY = 'ca:progress:v1';

const emptyState: ProgressState = {
  attempts: {},
  streak: { current: 0, longest: 0 },
};

export async function loadProgress(): Promise<ProgressState> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...emptyState };
    const parsed = JSON.parse(raw) as ProgressState;
    return {
      attempts: parsed.attempts ?? {},
      streak: parsed.streak ?? { current: 0, longest: 0 },
    };
  } catch {
    return { ...emptyState };
  }
}

export async function saveProgress(state: ProgressState): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // best-effort; a failed write should never crash the UI
  }
}

/** Create a fresh in-progress attempt for a paper. */
export function newAttempt(paper: QuizPaper, startedAt: string): PaperAttempt {
  return {
    paperId: paper.id,
    type: paper.type,
    date: paper.date,
    answers: {},
    completed: false,
    score: 0,
    total: paper.questionCount,
    startedAt,
  };
}

/** Recompute the daily streak given the date of a just-completed daily paper. */
export function bumpStreak(
  streak: ProgressState['streak'],
  completedDate: string,
): ProgressState['streak'] {
  const last = streak.lastCompletedDate;
  if (last === completedDate) return streak; // already counted today

  let current: number;
  if (!last) {
    current = 1;
  } else {
    const gap = daysBetween(last, completedDate);
    current = gap === 1 ? streak.current + 1 : 1; // consecutive day -> +1 else reset
  }
  return {
    current,
    longest: Math.max(streak.longest, current),
    lastCompletedDate: completedDate,
  };
}
