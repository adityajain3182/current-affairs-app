import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme';

export type OptionState = 'idle' | 'selected' | 'correct' | 'incorrect' | 'muted';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function OptionButton({
  text,
  index,
  state,
  disabled,
  onPress,
}: {
  text: string;
  index: number;
  state: OptionState;
  disabled?: boolean;
  onPress?: () => void;
}) {
  const s = palette[state];
  const icon =
    state === 'correct' ? 'checkmark-circle' : state === 'incorrect' ? 'close-circle' : null;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: s.bg, borderColor: s.border },
        pressed && !disabled && styles.pressed,
      ]}
    >
      <View style={[styles.badge, { backgroundColor: s.badgeBg, borderColor: s.badgeBorder }]}>
        <Text style={[styles.badgeText, { color: s.badgeText }]}>{LETTERS[index]}</Text>
      </View>
      <Text style={[styles.text, { color: s.text }]}>{text}</Text>
      {icon && <Ionicons name={icon} size={22} color={s.icon} style={styles.trailing} />}
    </Pressable>
  );
}

const palette: Record<
  OptionState,
  {
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
    icon: string;
  }
> = {
  idle: {
    bg: colors.surface,
    border: colors.border,
    text: colors.text,
    badgeBg: colors.surfaceAlt,
    badgeBorder: colors.border,
    badgeText: colors.textMuted,
  },
  selected: {
    bg: colors.primarySoft,
    border: colors.primary,
    text: colors.text,
    badgeBg: colors.primary,
    badgeBorder: colors.primary,
    badgeText: colors.white,
    icon: colors.primary,
  },
  correct: {
    bg: colors.successSoft,
    border: colors.successBorder,
    text: colors.text,
    badgeBg: colors.success,
    badgeBorder: colors.success,
    badgeText: colors.white,
    icon: colors.success,
  },
  incorrect: {
    bg: colors.errorSoft,
    border: colors.errorBorder,
    text: colors.text,
    badgeBg: colors.error,
    badgeBorder: colors.error,
    badgeText: colors.white,
    icon: colors.error,
  },
  muted: {
    bg: colors.surface,
    border: colors.border,
    text: colors.textFaint,
    badgeBg: colors.surfaceAlt,
    badgeBorder: colors.border,
    badgeText: colors.textFaint,
  },
} as any;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  pressed: { opacity: 0.9 },
  badge: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { ...typography.label, fontWeight: '800' },
  text: { ...typography.body, flex: 1, fontWeight: '500' },
  trailing: { marginLeft: spacing.xs },
});
