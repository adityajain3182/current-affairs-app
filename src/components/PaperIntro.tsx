import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PaperAttempt, QuizPaper } from '../types';
import { colors, radius, shadow, spacing, typography } from '../theme';
import { prettyDayLong, prettyDate } from '../utils/date';
import { Button } from './Button';

/** The landing card for a paper: title, meta, streak, and the start/continue CTA. */
export function PaperIntro({
  paper,
  attempt,
  streak,
  onStart,
}: {
  paper: QuizPaper;
  attempt?: PaperAttempt;
  streak?: number;
  onStart: () => void;
}) {
  const isDaily = paper.type === 'daily';
  const answered = attempt ? Object.keys(attempt.answers).length : 0;
  const inProgress = !!attempt && !attempt.completed && answered > 0;
  const completed = !!attempt?.completed;

  const cta = completed
    ? 'View results'
    : inProgress
    ? `Continue (${answered}/${paper.questionCount})`
    : isDaily
    ? 'Start today’s quiz'
    : 'Start weekly test';

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.kicker}>
        <View style={styles.kickerDot} />
        <Text style={styles.kickerText}>
          {isDaily ? 'DAILY CURRENT AFFAIRS' : 'WEEKLY MEGA TEST'}
        </Text>
      </View>

      <Text style={styles.title}>{paper.title}</Text>
      <Text style={styles.date}>
        {isDaily ? prettyDayLong(paper.date) : `Week ending ${prettyDate(paper.date)}`}
      </Text>

      <View style={[styles.card, shadow.card]}>
        <Stat
          icon="help-circle-outline"
          label="Questions"
          value={String(paper.questionCount)}
        />
        <Divider />
        <Stat
          icon={isDaily ? 'flash-outline' : 'time-outline'}
          label="Mode"
          value={isDaily ? 'Instant feedback' : 'Score on submit'}
        />
        {completed && (
          <>
            <Divider />
            <Stat
              icon="trophy-outline"
              label="Your score"
              value={`${attempt!.score}/${attempt!.total}`}
              highlight
            />
          </>
        )}
      </View>

      {isDaily && typeof streak === 'number' && streak > 0 && (
        <View style={styles.streak}>
          <Ionicons name="flame" size={18} color={colors.warning} />
          <Text style={styles.streakText}>{streak}-day streak — keep it going!</Text>
        </View>
      )}

      <Text style={styles.blurb}>
        {isDaily
          ? 'Answer each question to instantly see whether you were right, then read the full background — dates, names, awards, schemes and the links to past events that examiners love.'
          : '100 questions curated from the whole week’s news. Attempt them all, then submit to see your score and detailed explanations for every question.'}
      </Text>

      <Button title={cta} onPress={onStart} style={styles.cta} />
    </ScrollView>
  );
}

function Stat({
  icon,
  label,
  value,
  highlight,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.stat}>
      <Ionicons
        name={icon}
        size={20}
        color={highlight ? colors.success : colors.primary}
      />
      <View style={styles.statText}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, highlight && { color: colors.success }]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const Divider = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  kicker: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  kickerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  kickerText: { ...typography.label, color: colors.primary, letterSpacing: 1 },
  title: { ...typography.display, color: colors.text },
  date: { ...typography.body, color: colors.textMuted, marginTop: spacing.xs },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  stat: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  statText: { flex: 1 },
  statLabel: { ...typography.caption, color: colors.textMuted },
  statValue: { ...typography.subheading, color: colors.text },
  divider: { height: 1, backgroundColor: colors.border },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    backgroundColor: colors.warningSoft,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  streakText: { ...typography.bodyStrong, color: '#9A6400' },
  blurb: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xl,
  },
  cta: { marginTop: spacing.xl },
});
