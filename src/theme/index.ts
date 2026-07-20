// A single, calm, friendly design language for the whole app.
// Light theme only in v1 (kept structured so a dark theme can be added later).

import { QuestionCategory } from '../types';

export const colors = {
  // Surfaces
  bg: '#F6F7F9',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F3F6',
  border: '#E7E9EE',
  borderStrong: '#D5D9E0',

  // Brand
  primary: '#3B5BFE',
  primaryDark: '#2A45D8',
  primarySoft: '#ECEFFF',

  // Text
  text: '#171A20',
  textMuted: '#5C636E',
  textFaint: '#9AA1AC',
  onPrimary: '#FFFFFF',

  // Semantic
  success: '#12A150',
  successSoft: '#E7F6EC',
  successBorder: '#B9E6C7',
  error: '#E5484D',
  errorSoft: '#FDEBEC',
  errorBorder: '#F5C4C6',
  warning: '#F5A623',
  warningSoft: '#FEF3E0',

  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(17, 20, 26, 0.45)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
} as const;

export const typography = {
  display: { fontSize: 30, fontWeight: '800' as const, letterSpacing: -0.5 },
  title: { fontSize: 22, fontWeight: '800' as const, letterSpacing: -0.3 },
  heading: { fontSize: 18, fontWeight: '700' as const },
  subheading: { fontSize: 16, fontWeight: '700' as const },
  body: { fontSize: 15.5, fontWeight: '400' as const, lineHeight: 23 },
  bodyStrong: { fontSize: 15.5, fontWeight: '600' as const, lineHeight: 23 },
  label: { fontSize: 13, fontWeight: '600' as const },
  caption: { fontSize: 12, fontWeight: '500' as const },
} as const;

export const shadow = {
  card: {
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  raised: {
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 22,
    elevation: 6,
  },
} as const;

// Distinct, muted colors per category for chips/tags.
export const categoryColor: Record<QuestionCategory, string> = {
  Appointments: '#3B5BFE',
  'Awards & Honours': '#B7791F',
  'Dates & Days': '#7C3AED',
  Sports: '#0E9F6E',
  'Economy & Business': '#0891B2',
  'Schemes & Projects': '#DB6B0B',
  'Science & Tech': '#4F46E5',
  Defence: '#475569',
  International: '#2563EB',
  Environment: '#059669',
  'Art & Culture': '#DB2777',
  'Books & Authors': '#9333EA',
  Obituaries: '#6B7280',
  'Polity & Governance': '#C2410C',
  Miscellaneous: '#64748B',
};

export const theme = { colors, spacing, radius, typography, shadow, categoryColor };
export type Theme = typeof theme;
