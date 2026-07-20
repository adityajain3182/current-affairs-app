// Fetches question papers (static JSON on GitHub, served via jsDelivr CDN).
// Everything is cached in AsyncStorage so a paper the user has opened once
// keeps working offline.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONTENT_CDN_BASE, CONTENT_RAW_BASE, INDEX_PATH } from '../config';
import { PaperIndex, QuizPaper } from '../types';
import { sampleIndex, samplePapers } from './sampleContent';

const CACHE_PREFIX = 'ca:cache:';

async function readCache<T>(path: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + path);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

async function writeCache(path: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_PREFIX + path, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

async function fetchJSON<T>(path: string): Promise<T> {
  // raw first for freshness (short cache); CDN as a resilient fallback.
  const bases = [CONTENT_RAW_BASE, CONTENT_CDN_BASE];
  let lastErr: unknown;
  for (const base of bases) {
    try {
      const res = await fetch(`${base}/${path}`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as T;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error('Network error');
}

/** Load the paper index, preferring the network but falling back to cache. */
export async function getIndex(): Promise<PaperIndex> {
  try {
    const idx = await fetchJSON<PaperIndex>(INDEX_PATH);
    await writeCache(INDEX_PATH, idx);
    return idx;
  } catch (e) {
    const cached = await readCache<PaperIndex>(INDEX_PATH);
    if (cached) return cached;
    return sampleIndex; // last-resort bundled fallback
  }
}

/** Load a single paper by its repo-relative path, with cache fallback. */
export async function getPaper(path: string): Promise<QuizPaper> {
  try {
    const paper = await fetchJSON<QuizPaper>(path);
    await writeCache(path, paper);
    return paper;
  } catch (e) {
    const cached = await readCache<QuizPaper>(path);
    if (cached) return cached;
    if (samplePapers[path]) return samplePapers[path];
    throw e;
  }
}
