// Generates the weekly 100-question mega test from the last 7 days of news.
// Usage: GEMINI_API_KEY=... node generate-weekly.mjs

import { generatePaper } from './lib/generate.mjs';
import { istDateISO, istWeekLabel } from './lib/dates.mjs';

// Load a local .env if present (no-op in CI where env vars are already set).
try { process.loadEnvFile(); } catch {}

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY is not set.');
  process.exit(1);
}

const model = process.env.GEMINI_MODEL || 'gemini-2.5-pro';
const count = Number(process.env.WEEKLY_COUNT || 100);
const date = istDateISO();
const week = istWeekLabel();
const weekNum = week.split('-W')[1];
const year = week.split('-W')[0];

try {
  await generatePaper({
    kind: 'weekly',
    count,
    sinceDays: 7,
    model,
    apiKey,
    id: `weekly-${week}`,
    dateISO: date,
    title: `Weekly Current Affairs — Week ${weekNum}, ${year}`,
    batchSize: 25, // 4 batches keeps each response well within output limits
  });
} catch (e) {
  console.error('✗ Weekly generation failed:', e.message);
  process.exit(1);
}
