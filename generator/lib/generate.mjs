// Orchestrates a full paper: fetch news -> prompt Gemini (batched) -> sanitize
// -> dedupe -> write JSON + index.

import { fetchNews, itemsToPromptBlock } from './fetchNews.mjs';
import { buildPrompt } from './prompt.mjs';
import { generateJSON } from './gemini.mjs';
import { QUESTION_SCHEMA, sanitizeQuestion } from './schema.mjs';
import { writePaperFile, updateIndex } from './writePaper.mjs';

const normKey = (q) => q.question.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().slice(0, 90);

export async function generatePaper({
  kind, // 'daily' | 'weekly'
  count,
  sinceDays,
  model,
  apiKey,
  id,
  dateISO,
  title,
  batchSize = 30,
}) {
  console.log(`\n▶ Generating ${kind} paper "${id}" — target ${count} questions (model: ${model})`);

  const items = await fetchNews(sinceDays, kind === 'weekly' ? 150 : 80);
  console.log(`  · pulled ${items.length} news items from the last ${sinceDays} day(s)`);
  if (items.length < 8) {
    throw new Error(
      `Only ${items.length} news items found — not enough to build a quality paper. Check sources.json / feeds.`,
    );
  }
  const itemsBlock = itemsToPromptBlock(items);

  const collected = [];
  const seen = new Set();
  const batches = Math.ceil(count / batchSize);

  for (let b = 0; b < batches && collected.length < count; b++) {
    const remaining = count - collected.length;
    const ask = Math.min(batchSize, remaining) + (batches > 1 ? 3 : 0); // small buffer for dedupe losses
    const avoidTitles = collected.slice(-40).map((q) => q.question);

    console.log(`  · batch ${b + 1}/${batches}: requesting ${ask} questions…`);
    const out = await generateJSON({
      apiKey,
      model,
      prompt: buildPrompt({ items, itemsBlock, count: ask, kind, avoidTitles }),
      schema: QUESTION_SCHEMA,
      temperature: kind === 'weekly' ? 0.8 : 0.7,
    });

    const raw = Array.isArray(out?.questions) ? out.questions : [];
    let added = 0;
    for (const r of raw) {
      if (collected.length >= count) break;
      const q = sanitizeQuestion(r, id, collected.length + 1);
      if (!q) continue;
      const key = normKey(q);
      if (seen.has(key)) continue;
      seen.add(key);
      collected.push(q);
      added++;
    }
    console.log(`    → kept ${added} (total ${collected.length}/${count})`);
  }

  if (collected.length === 0) {
    throw new Error('Model returned no usable questions.');
  }
  if (collected.length < count) {
    console.warn(`  ! Only produced ${collected.length}/${count} questions; publishing what we have.`);
  }

  const paper = {
    id,
    type: kind,
    date: dateISO,
    title,
    questionCount: collected.length,
    questions: collected,
  };

  const path = await writePaperFile(paper);
  await updateIndex(paper, path, new Date().toISOString());
  console.log(`✓ Wrote ${path} (${paper.questionCount} questions) and updated index.json`);
  return paper;
}
