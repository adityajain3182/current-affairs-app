// Bundled fallback content. Used only when both the network and the on-device
// cache are unavailable (e.g. very first launch before the live repo has data).
// The real papers always take precedence once fetched.

import { PaperIndex, QuizPaper } from '../types';
import indexJson from '../../content/index.json';
import dailyJson from '../../content/daily/2025-08-01.json';
import weeklyJson from '../../content/weekly/2025-W31.json';

export const sampleIndex = indexJson as PaperIndex;

export const samplePapers: Record<string, QuizPaper> = {
  'content/daily/2025-08-01.json': dailyJson as QuizPaper,
  'content/weekly/2025-W31.json': weeklyJson as QuizPaper,
};
