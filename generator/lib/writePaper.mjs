// Writes a paper JSON file and keeps content/index.json up to date.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Repo root is one level up from /generator.
export const CONTENT_DIR = join(__dirname, '..', '..', 'content');

const MAX_DAILY = 90; // keep ~3 months
const MAX_WEEKLY = 30;

export async function writePaperFile(paper) {
  const rel = `${paper.type}/${paper.type === 'daily' ? paper.date : paper.id.replace('weekly-', '')}.json`;
  const abs = join(CONTENT_DIR, rel);
  await mkdir(dirname(abs), { recursive: true });
  await writeFile(abs, JSON.stringify(paper, null, 2) + '\n', 'utf8');
  return `content/${rel}`;
}

async function readIndex() {
  try {
    const raw = await readFile(join(CONTENT_DIR, 'index.json'), 'utf8');
    const idx = JSON.parse(raw);
    return { updatedAt: idx.updatedAt ?? '', daily: idx.daily ?? [], weekly: idx.weekly ?? [] };
  } catch {
    return { updatedAt: '', daily: [], weekly: [] };
  }
}

export async function updateIndex(paper, path, nowISO) {
  const idx = await readIndex();
  const entry = {
    id: paper.id,
    type: paper.type,
    date: paper.date,
    title: paper.title,
    path,
    questionCount: paper.questionCount,
  };
  const list = paper.type === 'daily' ? idx.daily : idx.weekly;
  const filtered = list.filter((e) => e.id !== paper.id);
  filtered.push(entry);
  filtered.sort((a, b) => b.date.localeCompare(a.date));
  const capped = filtered.slice(0, paper.type === 'daily' ? MAX_DAILY : MAX_WEEKLY);

  const next = {
    updatedAt: nowISO,
    daily: paper.type === 'daily' ? capped : idx.daily,
    weekly: paper.type === 'weekly' ? capped : idx.weekly,
  };
  await mkdir(CONTENT_DIR, { recursive: true });
  await writeFile(join(CONTENT_DIR, 'index.json'), JSON.stringify(next, null, 2) + '\n', 'utf8');
}
