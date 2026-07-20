import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PaperAttempt, QuizPaper, QuestionCategory } from '../types';
import { colors, radius, shadow, spacing, typography, categoryColor } from '../theme';
import { Button } from './Button';
import { ProgressBar } from './ProgressBar';

export function ResultView({
  paper,
  attempt,
  onReview,
  onDone,
}: {
  paper: QuizPaper;
  attempt: PaperAttempt;
  onReview: () => void;
  onDone: () => void;
}) {
  const pct = attempt.total ? attempt.score / attempt.total : 0;
  const grade = gradeFor(pct);

  const byCategory = useMemo(() => {
    const map = new Map<QuestionCategory, { correct: number; total: number }>();
    for (const q of paper.questions) {
      const bucket = map.get(q.category) ?? { correct: 0, total: 0 };
      bucket.total += 1;
      if (attempt.answers[q.id]?.correct) bucket.correct += 1;
      map.set(q.category, bucket);
    }
    return [...map.entries()].sort((a, b) => b[1].total - a[1].total);
  }, [paper, attempt]);

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.hero, shadow.card]}>
        <Text style={styles.heroLabel}>{grade.title}</Text>
        <Text style={styles.score}>
          {attempt.score}
          <Text style={styles.scoreTotal}> / {attempt.total}</Text>
        </Text>
        <Text style={styles.pct}>{Math.round(pct * 100)}% correct</Text>
        <View style={styles.heroBar}>
          <ProgressBar value={pct} color={grade.color} height={10} />
        </View>
        <Text style={styles.heroMsg}>{grade.message}</Text>
      </View>

      <Text style={styles.sectionTitle}>Topic breakdown</Text>
      <View style={[styles.card, shadow.card]}>
        {byCategory.map(([cat, v], i) => (
          <View
            key={cat}
            style={[styles.catRow, i === byCategory.length - 1 && styles.catRowLast]}
          >
            <View style={styles.catHead}>
              <View style={[styles.dot, { backgroundColor: categoryColor[cat] }]} />
              <Text style={styles.catName}>{cat}</Text>
              <Text style={styles.catScore}>
                {v.correct}/{v.total}
              </Text>
            </View>
            <ProgressBar
              value={v.total ? v.correct / v.total : 0}
              color={categoryColor[cat]}
              height={6}
            />
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Button title="Review answers" onPress={onReview} variant="secondary" />
        <Button title="Done" onPress={onDone} />
      </View>
    </ScrollView>
  );
}

function gradeFor(pct: number): { title: string; message: string; color: string } {
  if (pct >= 0.85)
    return {
      title: 'Outstanding! 🏆',
      message: 'Exam-ready command of the news. Keep the streak alive.',
      color: colors.success,
    };
  if (pct >= 0.6)
    return {
      title: 'Solid work 💪',
      message: 'A strong base — review the misses below to close the gap.',
      color: colors.primary,
    };
  if (pct >= 0.4)
    return {
      title: 'Getting there 📈',
      message: 'Read the explanations carefully; these repeat in exams.',
      color: colors.warning,
    };
  return {
    title: 'Keep going 🌱',
    message: 'Every attempt counts. The explanations below will help a lot.',
    color: colors.error,
  };
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.lg },
  hero: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
  },
  heroLabel: { ...typography.heading, color: colors.text },
  score: { ...typography.display, fontSize: 52, color: colors.text, marginTop: spacing.sm },
  scoreTotal: { color: colors.textFaint, fontSize: 30 },
  pct: { ...typography.subheading, color: colors.textMuted },
  heroBar: { width: '100%', marginTop: spacing.lg },
  heroMsg: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  sectionTitle: { ...typography.subheading, color: colors.text, marginTop: spacing.xs },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  catRow: {
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  catRowLast: { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 },
  catHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
  catName: { ...typography.bodyStrong, color: colors.text, flex: 1 },
  catScore: { ...typography.label, color: colors.textMuted },
  actions: { gap: spacing.md, marginTop: spacing.sm },
});
