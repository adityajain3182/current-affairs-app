import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { MessageView } from '../components/StateViews';
import { useProgress } from '../state/ProgressContext';
import { colors, radius, shadow, spacing, typography } from '../theme';
import { prettyDate } from '../utils/date';
import { PaperAttempt } from '../types';

export function ProgressScreen() {
  const { state } = useProgress();

  const attempts = useMemo(
    () =>
      Object.values(state.attempts)
        .filter((a) => a.completed)
        .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? '')),
    [state.attempts],
  );

  const totals = useMemo(() => {
    const papers = attempts.length;
    const score = attempts.reduce((s, a) => s + a.score, 0);
    const questions = attempts.reduce((s, a) => s + a.total, 0);
    const accuracy = questions ? Math.round((score / questions) * 100) : 0;
    return { papers, questions, accuracy };
  }, [attempts]);

  if (attempts.length === 0) {
    return (
      <Screen>
        <Header />
        <MessageView
          icon="stats-chart-outline"
          title="No attempts yet"
          message="Finish a daily quiz or weekly test and your stats, streak and history will show up here."
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Header />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.streakCard}>
          <Ionicons name="flame" size={30} color={colors.white} />
          <View style={{ flex: 1 }}>
            <Text style={styles.streakNum}>{state.streak.current}-day streak</Text>
            <Text style={styles.streakSub}>Longest: {state.streak.longest} days</Text>
          </View>
        </View>

        <View style={styles.statRow}>
          <StatTile icon="documents-outline" value={String(totals.papers)} label="Completed" />
          <StatTile icon="checkmark-done-outline" value={`${totals.accuracy}%`} label="Accuracy" />
          <StatTile icon="help-circle-outline" value={String(totals.questions)} label="Questions" />
        </View>

        <Text style={styles.sectionTitle}>History</Text>
        <View style={[styles.historyCard, shadow.card]}>
          {attempts.map((a, i) => (
            <HistoryRow key={a.paperId} attempt={a} last={i === attempts.length - 1} />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Your progress</Text>
    </View>
  );
}

function StatTile({
  icon,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
}) {
  return (
    <View style={[styles.tile, shadow.card]}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

function HistoryRow({ attempt, last }: { attempt: PaperAttempt; last: boolean }) {
  const pct = attempt.total ? attempt.score / attempt.total : 0;
  const color = pct >= 0.6 ? colors.success : pct >= 0.4 ? colors.warning : colors.error;
  return (
    <View style={[styles.historyRow, !last && styles.historyRowBorder]}>
      <View style={[styles.typeBadge, attempt.type === 'weekly' && styles.typeBadgeWeekly]}>
        <Ionicons
          name={attempt.type === 'daily' ? 'today-outline' : 'calendar-outline'}
          size={16}
          color={attempt.type === 'daily' ? colors.primary : '#B7791F'}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.historyTitle}>
          {attempt.type === 'daily' ? 'Daily quiz' : 'Weekly test'}
        </Text>
        <Text style={styles.historyDate}>{prettyDate(attempt.date)}</Text>
      </View>
      <Text style={[styles.historyScore, { color }]}>
        {attempt.score}/{attempt.total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  headerTitle: { ...typography.title, color: colors.text },
  content: { padding: spacing.lg, paddingTop: 0, paddingBottom: spacing.xxxl, gap: spacing.lg },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  streakNum: { ...typography.title, color: colors.white },
  streakSub: { ...typography.body, color: '#D7DEFF' },
  statRow: { flexDirection: 'row', gap: spacing.md },
  tile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    gap: 2,
  },
  tileValue: { ...typography.title, color: colors.text, marginTop: spacing.xs },
  tileLabel: { ...typography.caption, color: colors.textMuted },
  sectionTitle: { ...typography.subheading, color: colors.text },
  historyCard: { backgroundColor: colors.surface, borderRadius: radius.lg, paddingHorizontal: spacing.lg },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  historyRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  typeBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadgeWeekly: { backgroundColor: '#FBF0DC' },
  historyTitle: { ...typography.bodyStrong, color: colors.text },
  historyDate: { ...typography.caption, color: colors.textMuted },
  historyScore: { ...typography.heading },
});
