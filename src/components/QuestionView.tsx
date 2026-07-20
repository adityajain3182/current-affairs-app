import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Question } from '../types';
import { colors, radius, spacing, typography, categoryColor } from '../theme';
import { Chip } from './Chip';
import { OptionButton, OptionState } from './OptionButton';
import { ExplanationBlock } from './ExplanationBlock';

/**
 * Presentational rendering of one question.
 * - `revealed` controls whether correct/incorrect colouring + explanation show.
 *   Daily: revealed as soon as the user answers.
 *   Weekly: revealed only after the whole paper is submitted.
 */
export function QuestionView({
  question,
  index,
  total,
  selectedIndex,
  revealed,
  locked,
  onSelect,
}: {
  question: Question;
  index: number;
  total: number;
  selectedIndex: number | null;
  revealed: boolean;
  /** When true, options can't be changed (daily after answering). */
  locked: boolean;
  onSelect: (i: number) => void;
}) {
  const stateFor = (i: number): OptionState => {
    if (revealed) {
      if (i === question.answerIndex) return 'correct';
      if (i === selectedIndex) return 'incorrect';
      return 'muted';
    }
    return i === selectedIndex ? 'selected' : 'idle';
  };

  return (
    <View>
      <View style={styles.metaRow}>
        <Text style={styles.counter}>
          Question {index + 1}
          <Text style={styles.counterTotal}> / {total}</Text>
        </Text>
        <Chip label={question.category} color={categoryColor[question.category]} />
      </View>

      <Text style={styles.question}>{question.question}</Text>

      <View style={styles.options}>
        {question.options.map((opt, i) => (
          <OptionButton
            key={i}
            index={i}
            text={opt}
            state={stateFor(i)}
            disabled={locked}
            onPress={() => onSelect(i)}
          />
        ))}
      </View>

      {revealed && <ExplanationBlock question={question} />}
    </View>
  );
}

const styles = StyleSheet.create({
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  counter: { ...typography.label, color: colors.textMuted },
  counterTotal: { color: colors.textFaint, fontWeight: '600' },
  question: {
    ...typography.heading,
    color: colors.text,
    lineHeight: 26,
    marginBottom: spacing.lg,
  },
  options: { marginTop: spacing.xs },
});
