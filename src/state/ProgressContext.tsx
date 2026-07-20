// In-memory progress state backed by AsyncStorage, exposed via React context.
// Handles both interaction modes:
//   - daily  : each answer is graded immediately; streak bumps on completion
//   - weekly : selections are stored but only graded on explicit submit

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  AttemptAnswer,
  PaperAttempt,
  ProgressState,
  QuizPaper,
} from '../types';
import {
  bumpStreak,
  loadProgress,
  newAttempt,
  saveProgress,
} from '../storage/progressStore';

interface ProgressContextValue {
  ready: boolean;
  state: ProgressState;
  getAttempt: (paperId: string) => PaperAttempt | undefined;
  /** Ensure an attempt row exists for this paper (idempotent). */
  ensureAttempt: (paper: QuizPaper) => PaperAttempt;
  /** Daily: record + immediately grade one answer. */
  answerDaily: (
    paper: QuizPaper,
    questionId: string,
    selectedIndex: number,
  ) => void;
  /** Weekly: store a selection without grading/revealing. */
  selectWeekly: (
    paper: QuizPaper,
    questionId: string,
    selectedIndex: number,
  ) => void;
  /** Weekly: grade everything and lock the attempt. */
  submitWeekly: (paper: QuizPaper) => PaperAttempt;
  resetAttempt: (paperId: string) => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

const nowISO = () => new Date().toISOString();

function correctnessFor(paper: QuizPaper, questionId: string, sel: number) {
  const q = paper.questions.find((x) => x.id === questionId);
  return q ? sel === q.answerIndex : false;
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<ProgressState>({
    attempts: {},
    streak: { current: 0, longest: 0 },
  });

  useEffect(() => {
    loadProgress().then((s) => {
      setState(s);
      setReady(true);
    });
  }, []);

  // Persist whenever state changes (after initial load).
  useEffect(() => {
    if (ready) saveProgress(state);
  }, [state, ready]);

  const getAttempt = useCallback(
    (paperId: string) => state.attempts[paperId],
    [state.attempts],
  );

  const ensureAttempt = useCallback((paper: QuizPaper) => {
    let created = state.attempts[paper.id];
    if (!created) {
      created = newAttempt(paper, nowISO());
      setState((prev) => ({
        ...prev,
        attempts: { ...prev.attempts, [paper.id]: created! },
      }));
    }
    return created;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.attempts]);

  const writeAnswer = useCallback(
    (
      paper: QuizPaper,
      questionId: string,
      selectedIndex: number,
      opts: { gradeAndFinishIfDone: boolean },
    ) => {
      setState((prev) => {
        const existing =
          prev.attempts[paper.id] ?? newAttempt(paper, nowISO());
        // Daily answers are locked once given.
        if (opts.gradeAndFinishIfDone && existing.answers[questionId]) {
          return prev;
        }

        const correct = correctnessFor(paper, questionId, selectedIndex);
        const answer: AttemptAnswer = {
          questionId,
          selectedIndex,
          correct,
          answeredAt: nowISO(),
        };
        const answers = { ...existing.answers, [questionId]: answer };
        const score = Object.values(answers).filter((a) => a.correct).length;

        let attempt: PaperAttempt = { ...existing, answers, score };
        let streak = prev.streak;

        if (
          opts.gradeAndFinishIfDone &&
          Object.keys(answers).length >= paper.questionCount &&
          !existing.completed
        ) {
          attempt = { ...attempt, completed: true, completedAt: nowISO() };
          if (paper.type === 'daily') {
            streak = bumpStreak(prev.streak, paper.date);
          }
        }

        return {
          ...prev,
          streak,
          attempts: { ...prev.attempts, [paper.id]: attempt },
        };
      });
    },
    [],
  );

  const answerDaily = useCallback(
    (paper: QuizPaper, questionId: string, selectedIndex: number) =>
      writeAnswer(paper, questionId, selectedIndex, {
        gradeAndFinishIfDone: true,
      }),
    [writeAnswer],
  );

  const selectWeekly = useCallback(
    (paper: QuizPaper, questionId: string, selectedIndex: number) =>
      writeAnswer(paper, questionId, selectedIndex, {
        gradeAndFinishIfDone: false,
      }),
    [writeAnswer],
  );

  const submitWeekly = useCallback((paper: QuizPaper) => {
    let finished: PaperAttempt | undefined;
    setState((prev) => {
      const existing = prev.attempts[paper.id] ?? newAttempt(paper, nowISO());
      const score = Object.values(existing.answers).filter(
        (a) => a.correct,
      ).length;
      finished = {
        ...existing,
        score,
        completed: true,
        completedAt: nowISO(),
      };
      return {
        ...prev,
        attempts: { ...prev.attempts, [paper.id]: finished! },
      };
    });
    return finished!;
  }, []);

  const resetAttempt = useCallback((paperId: string) => {
    setState((prev) => {
      const next = { ...prev.attempts };
      delete next[paperId];
      return { ...prev, attempts: next };
    });
  }, []);

  const value = useMemo<ProgressContextValue>(
    () => ({
      ready,
      state,
      getAttempt,
      ensureAttempt,
      answerDaily,
      selectWeekly,
      submitWeekly,
      resetAttempt,
    }),
    [
      ready,
      state,
      getAttempt,
      ensureAttempt,
      answerDaily,
      selectWeekly,
      submitWeekly,
      resetAttempt,
    ],
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
