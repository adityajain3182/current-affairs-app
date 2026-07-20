// Generates the daily 30-question paper from the last 24-36 hours of news.
// Usage: GEMINI_API_KEY=... node generate-daily.mjs

import { generatePaper } from './lib/generate.mjs';
import { istDateISO, prettyIST } from './lib/dates.mjs';

// Load a local .env if present (no-op in CI where env vars are already set).
try { process.loadEnvFile(); } catch {}

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY is not set.');
  process.exit(1);
}

const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const count = Number(process.env.DAILY_COUNT || 30);
const date = istDateISO();

try {
  await generatePaper({
    kind: 'daily',
    count,
    sinceDays: 2, // a little slack so nothing published overnight is missed
    model,
    apiKey,
    id: `daily-${date}`,
    dateISO: date,
    title: `Current Affairs — ${prettyIST(date)}`,
    batchSize: 30,
  });
} catch (e) {
  console.error('✗ Daily generation failed:', e.message);
  process.exit(1);
}
