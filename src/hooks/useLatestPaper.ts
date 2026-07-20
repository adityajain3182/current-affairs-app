import { useCallback, useEffect, useState } from 'react';
import { getIndex, getPaper } from '../data/content';
import { PaperIndexEntry, PaperType, QuizPaper } from '../types';

interface State {
  loading: boolean;
  error: string | null;
  entry: PaperIndexEntry | null;
  paper: QuizPaper | null;
}

/** Loads the most recent paper of a given type (daily/weekly) plus its index entry. */
export function useLatestPaper(type: PaperType) {
  const [state, setState] = useState<State>({
    loading: true,
    error: null,
    entry: null,
    paper: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const index = await getIndex();
      const list = type === 'daily' ? index.daily : index.weekly;
      const sorted = [...list].sort((a, b) => b.date.localeCompare(a.date));
      const entry = sorted[0] ?? null;
      if (!entry) {
        setState({ loading: false, error: null, entry: null, paper: null });
        return;
      }
      const paper = await getPaper(entry.path);
      setState({ loading: false, error: null, entry, paper });
    } catch (e: any) {
      setState({
        loading: false,
        error: e?.message ?? 'Could not load questions',
        entry: null,
        paper: null,
      });
    }
  }, [type]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}
