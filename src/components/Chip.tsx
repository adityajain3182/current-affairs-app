import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

/** A small pill. Pass a color to tint it (used for category tags). */
export function Chip({
  label,
  color = colors.textMuted,
  filled = false,
}: {
  label: string;
  color?: string;
  filled?: boolean;
}) {
  return (
    <View
      style={[
        styles.chip,
        filled
          ? { backgroundColor: color }
          : { backgroundColor: hexWithAlpha(color, 0.12) },
      ]}
    >
      <Text
        style={[styles.text, { color: filled ? colors.white : color }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

function hexWithAlpha(hex: string, alpha: number): string {
  const a = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  text: { ...typography.caption, fontWeight: '700' },
});
