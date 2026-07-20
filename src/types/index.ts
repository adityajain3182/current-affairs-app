// Shared domain types for the Current Affairs app.
// These mirror the JSON produced by the generator (see /generator) and served
// from GitHub raw content.

export type QuestionCategory =
  | 'Appointments'
  | 'Awards & Honours'
  | 'Dates & Days'
  | 'Sports'
  | 'Economy & Business'
  | 'Schemes & Projects'
  | 'Science & Tech'
  | 'Defence'
  | 'International'
  | 'Environment'
  | 'Art & Culture'
  | 'Books & Authors'
  | 'Obituaries'
  | 'Polity & Governance'
  | 'Miscellaneous';

export interface QuestionSource {
  title: string;
  url: string;
  date?: string; // ISO date of the underlying news item
}

export interface Question {
  id: string;
  question: string;
  /** Exactly four options. */
  options: string[];
  /** Index (0-3) of the correct option. */
  answerIndex: number;
  category: QuestionCategory;
  /** Full explanation of the correct answer with the key exam facts. */
  explanation: string;
  /** Links this news to any past event, scheme, or ongoing series, and why it matters. */
  background?: string;
  /** Bottom-line "remember this for the exam" note. */
  examRelevance?: string;
  tags: string[];
  source?: QuestionSource;
}

export type PaperType = 'daily' | 'weekly';

export interface QuizPaper {
  /** e.g. "daily-2026-07-21" or "weekly-2026-W29". */
  id: string;
  type: PaperType;
  /** ISO publish date (YYYY-MM-DD). */
  date: string;
  title: string;
  questionCount: number;
  questions: Question[];
}

export interface PaperIndexEntry {
  id: string;
  type: PaperType;
  date: string;
  title: string;
  /** Repo-relative path, e.g. "content/daily/2026-07-21.json". */
  path: string;
  questionCount: number;
}

export interface PaperIndex {
  updatedAt: string;
  daily: PaperIndexEntry[];
  weekly: PaperIndexEntry[];
}

// ---- Local (on-device) progress types ----

export interface AttemptAnswer {
  questionId: string;
  selectedIndex: number;
  correct: boolean;
  answeredAt: string;
}

export interface PaperAttempt {
  paperId: string;
  type: PaperType;
  /** Paper publish date. */
  date: string;
  /** Keyed by questionId. */
  answers: Record<string, AttemptAnswer>;
  completed: boolean;
  score: number;
  total: number;
  startedAt: string;
  completedAt?: string;
}

export interface StreakState {
  current: number;
  longest: number;
  /** ISO date of the last completed daily paper. */
  lastCompletedDate?: string;
}

export interface ProgressState {
  /** Keyed by paperId. */
  attempts: Record<string, PaperAttempt>;
  streak: StreakState;
}
