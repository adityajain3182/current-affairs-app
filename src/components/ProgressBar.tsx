import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius } from '../theme';

export function ProgressBar({
  value,
  color = colors.primary,
  track = colors.surfaceAlt,
  height = 8,
}: {
  /** 0..1 */
  value: number;
  color?: string;
  track?: string;
  height?: number;
}) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View style={[styles.track, { backgroundColor: track, height }]}>
      <View
        style={{
          width: `${pct * 100}%`,
          backgroundColor: color,
          height,
          borderRadius: radius.pill,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
});
