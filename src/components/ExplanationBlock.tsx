import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Question } from '../types';
import { colors, radius, spacing, typography } from '../theme';

/** The rich detail shown after a question is answered / revealed. */
export function ExplanationBlock({ question }: { question: Question }) {
  return (
    <View style={styles.wrap}>
      <Section icon="bulb-outline" title="Explanation" tint={colors.primary}>
        <Text style={styles.body}>{question.explanation}</Text>
      </Section>

      {!!question.background && (
        <Section icon="link-outline" title="The bigger picture" tint="#7C3AED">
          <Text style={styles.body}>{question.background}</Text>
        </Section>
      )}

      {!!question.examRelevance && (
        <Section icon="school-outline" title="Why it matters for exams" tint={colors.warning}>
          <Text style={styles.body}>{question.examRelevance}</Text>
        </Section>
      )}

      {question.tags?.length > 0 && (
        <View style={styles.tagRow}>
          {question.tags.map((t) => (
            <View key={t} style={styles.tag}>
              <Text style={styles.tagText}>#{t}</Text>
            </View>
          ))}
        </View>
      )}

      {!!question.source?.url && (
        <Pressable
          style={styles.source}
          onPress={() => Linking.openURL(question.source!.url)}
        >
          <Ionicons name="newspaper-outline" size={15} color={colors.textMuted} />
          <Text style={styles.sourceText} numberOfLines={1}>
            Source: {question.source.title}
          </Text>
          <Ionicons name="open-outline" size={14} color={colors.textMuted} />
        </Pressable>
      )}
    </View>
  );
}

function Section({
  icon,
  title,
  tint,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  tint: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={16} color={tint} />
        <Text style={[styles.sectionTitle, { color: tint }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.lg,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  section: { gap: spacing.xs },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  sectionTitle: { ...typography.label, textTransform: 'uppercase', letterSpacing: 0.4 },
  body: { ...typography.body, color: colors.text },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tag: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  tagText: { ...typography.caption, color: colors.textMuted },
  source: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sourceText: { ...typography.caption, color: colors.textMuted, flex: 1 },
});
