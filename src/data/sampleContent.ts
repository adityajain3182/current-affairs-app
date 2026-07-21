// Bundled fallback content. Used only when both the network and the on-device
// cache are unavailable (e.g. very first launch before the live repo has data).
// The real papers always take precedence once fetched.
//
// This builds its own small, self-contained index from the two bundled sample
// papers, so it stays coherent regardless of how the live content/index.json
// grows over time.

import { PaperIndex, PaperIndexEntry, QuizPaper } from '../types';
import dailyJson from '../../content/daily/2025-08-01.json';
import weeklyJson from '../../content/weekly/2025-W31.json';

const dailySample = dailyJson as QuizPaper;
const weeklySample = weeklyJson as QuizPaper;

const DAILY_PATH = 'content/daily/2025-08-01.json';
const WEEKLY_PATH = 'content/weekly/2025-W31.json';

const entry = (p: QuizPaper, path: string): PaperIndexEntry => ({
  id: p.id,
  type: p.type,
  date: p.date,
  title: p.title,
  path,
  questionCount: p.questionCount,
});

export const sampleIndex: PaperIndex = {
  updatedAt: dailySample.date,
  daily: [entry(dailySample, DAILY_PATH)],
  weekly: [entry(weeklySample, WEEKLY_PATH)],
};

export const samplePapers: Record<string, QuizPaper> = {
  [DAILY_PATH]: dailySample,
  [WEEKLY_PATH]: weeklySample,
};
