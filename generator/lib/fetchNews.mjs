// Pulls recent news items from the curated RSS feeds in sources.json and
// normalises them into a compact shape for the prompt.

import Parser from 'rss-parser';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const parser = new Parser({
  timeout: 20000,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (compatible; CurrentAffairsBot/1.0; +https://github.com/adityajain3182/current-affairs-app)',
  },
});

function stripHtml(s = '') {
  return String(s)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function loadSources() {
  const raw = await readFile(join(__dirname, '..', 'sources.json'), 'utf8');
  const parsed = JSON.parse(raw);
  return parsed.feeds ?? [];
}

/**
 * @param {number} sinceDays how many days back to include
 * @param {number} maxItems  cap on total items returned
 */
export async function fetchNews(sinceDays, maxItems = 120) {
  const feeds = await loadSources();
  const cutoff = Date.now() - sinceDays * 86_400_000;
  const seen = new Set();
  const items = [];

  const results = await Promise.allSettled(
    feeds.map(async (feed) => {
      const parsed = await parser.parseURL(feed.url);
      return (parsed.items ?? []).map((it) => ({ feed, it }));
    }),
  );

  for (const r of results) {
    if (r.status !== 'fulfilled') continue;
    for (const { feed, it } of r.value) {
      const ts = it.isoDate ? Date.parse(it.isoDate) : NaN;
      // Keep items with no date (some feeds omit it) but drop clearly-old ones.
      if (!Number.isNaN(ts) && ts < cutoff) continue;

      const title = stripHtml(it.title);
      if (!title) continue;
      const key = title.toLowerCase().slice(0, 80);
      if (seen.has(key)) continue;
      seen.add(key);

      const summary = stripHtml(it.contentSnippet || it.content || it.summary || '').slice(0, 600);
      items.push({
        title,
        summary,
        link: it.link ?? '',
        source: feed.name,
        date: it.isoDate ?? '',
      });
    }
  }

  // Newest first, then cap.
  items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return items.slice(0, maxItems);
}

/** Compact the items into a numbered block for the prompt. */
export function itemsToPromptBlock(items) {
  return items
    .map((n, i) => {
      const parts = [`[${i + 1}] ${n.title}`];
      if (n.summary) parts.push(`    ${n.summary}`);
      parts.push(`    (source: ${n.source}${n.link ? ` — ${n.link}` : ''})`);
      return parts.join('\n');
    })
    .join('\n\n');
}
