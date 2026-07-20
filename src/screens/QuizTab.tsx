import React, { useState } from 'react';
import { PaperType } from '../types';
import { useLatestPaper } from '../hooks/useLatestPaper';
import { useProgress } from '../state/ProgressContext';
import { Screen } from '../components/Screen';
import { LoadingView, MessageView } from '../components/StateViews';
import { PaperIntro } from '../components/PaperIntro';
import { QuizRunner } from '../components/QuizRunner';

/** Shared tab for both Daily and Weekly quizzes. */
export function QuizTab({ type }: { type: PaperType }) {
  const { loading, error, paper, reload } = useLatestPaper(type);
  const { getAttempt, state, ready } = useProgress();
  const [started, setStarted] = useState(false);

  if (loading || !ready) {
    return (
      <Screen>
        <LoadingView label="Fetching the latest questions…" />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <MessageView
          icon="cloud-offline-outline"
          title="Couldn’t load questions"
          message="Check your internet connection and try again."
          actionLabel="Retry"
          onAction={reload}
        />
      </Screen>
    );
  }

  if (!paper) {
    return (
      <Screen>
        <MessageView
          icon={type === 'daily' ? 'sunny-outline' : 'calendar-outline'}
          title={type === 'daily' ? 'Today’s quiz is on its way' : 'Weekly test unlocks soon'}
          message={
            type === 'daily'
              ? 'Fresh questions are published every morning. Pull to refresh in a bit.'
              : 'A new 100-question test drops once a week from the week’s news.'
          }
          actionLabel="Refresh"
          onAction={reload}
        />
      </Screen>
    );
  }

  const attempt = getAttempt(paper.id);

  if (started) {
    return <QuizRunner paper={paper} onExit={() => setStarted(false)} />;
  }

  return (
    <Screen>
      <PaperIntro
        paper={paper}
        attempt={attempt}
        streak={state.streak.current}
        onStart={() => setStarted(true)}
      />
    </Screen>
  );
}
