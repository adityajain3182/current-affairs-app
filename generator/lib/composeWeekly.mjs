// Composes the weekly test by SAMPLING from the daily papers already stored in
// content/daily/ — no news fetch, no Gemini call. The daily JSON files are the
// question bank; this just pools the last N days and picks a balanced 100.

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { CONTENT_DIR, writePaperFile, updateIndex } from './writePaper.mjs';
import { daysInWindow } from './dates.mjs';

const normKey = (q) =>
  q.question.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().slice(0, 90);

/** Read every daily paper whose date falls within the last `sinceDays` days. */
async function loadRecentDailyQuestions(sinceDays) {
  const dir = join(CONTENT_DIR, 'daily');
  let files = [];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith('.json'));
  } catch {
    return [];
  }
  const window = new Set(daysInWindow(sinceDays)); // set of YYYY-MM-DD strings

  const questions = [];
  for (const file of files) {
    const date = file.replace('.json', '');
    if (!window.has(date)) continue;
    try {
      const paper = JSON.parse(await readFile(join(dir, file), 'utf8'));
      for (const q of paper.questions ?? []) questions.push({ ...q, _date: date });
    } catch {
      /* skip unreadable file */
    }
  }
  return questions;
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Category-balanced sample: round-robin across categories so no single topic dominates. */
function balancedSample(pool, target) {
  const byCat = new Map();
  for (const q of pool) {
    if (!byCat.has(q.category)) byCat.set(q.category, []);
    byCat.get(q.category).push(q);
  }
  const buckets = [...byCat.values()].map(shuffle);
  const picked = [];
  let progressed = true;
  while (picked.length < target && progressed) {
    progressed = false;
    for (const bucket of shuffle(buckets)) {
      if (bucket.length) {
        picked.push(bucket.pop());
        progressed = true;
        if (picked.length >= target) break;
      }
    }
  }
  return picked;
}

export async function composeWeekly({ id, dateISO, title, count = 100, sinceDays = 7 }) {
  console.log(`\n▶ Composing weekly test "${id}" from the last ${sinceDays} days of daily papers`);

  const all = await loadRecentDailyQuestions(sinceDays);
  console.log(`  · pooled ${all.length} questions from stored daily papers`);
  if (all.length === 0) {
    throw new Error(
      'No daily papers found in the last week — run the daily generator first (the weekly is built from them).',
    );
  }

  // De-duplicate by question text (same story can recur across days).
  const seen = new Set();
  const unique = [];
  for (const q of all) {
    const key = normKey(q);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(q);
  }
  console.log(`  · ${unique.length} unique after de-duplication`);

  const picked = balancedSample(unique, Math.min(count, unique.length));
  if (picked.length < count) {
    console.warn(`  ! Only ${picked.length} questions available; publishing that many.`);
  }

  // Re-id and strip internal fields.
  const questions = shuffle(picked).map((q, i) => {
    const { _date, ...rest } = q;
    return { ...rest, id: `${id}-q${i + 1}` };
  });

  const paper = { id, type: 'weekly', date: dateISO, title, questionCount: questions.length, questions };
  const path = await writePaperFile(paper);
  await updateIndex(paper, path, new Date().toISOString());
  console.log(`✓ Wrote ${path} (${paper.questionCount} questions) and updated index.json`);
  return paper;
}
