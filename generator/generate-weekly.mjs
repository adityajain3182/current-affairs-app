// Builds the weekly 100-question test by sampling from the daily papers already
// stored in content/daily/ (the accumulated question bank). No news fetch, no
// Gemini call — fast and free. Usage: node generate-weekly.mjs

import { composeWeekly } from './lib/composeWeekly.mjs';
import { istDateISO, istWeekLabel } from './lib/dates.mjs';

const count = Number(process.env.WEEKLY_COUNT || 100);
const date = istDateISO();
const week = istWeekLabel();
const [year, weekNum] = week.split('-W');

try {
  await composeWeekly({
    id: `weekly-${week}`,
    dateISO: date,
    title: `Weekly Current Affairs — Week ${weekNum}, ${year}`,
    count,
    sinceDays: 7,
  });
} catch (e) {
  console.error('✗ Weekly composition failed:', e.message);
  process.exit(1);
}
