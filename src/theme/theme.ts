/**
 * Couch Concierge — 10-foot UI theme tokens.
 *
 * Everything a TV app renders is viewed from ~10 feet away, so type is large,
 * spacing is generous, and contrast is high. Keep all colors / sizes here so
 * screens stay consistent and easy to re-skin for the demo.
 */

export const colors = {
  // Backgrounds
  bg: '#0B0E17',
  bgElevated: '#141A28',
  card: '#1B2333',
  cardFocused: '#26324A',

  // Brand / accent
  accent: '#FF6200', // Vega orange, carried over from the scaffold
  accentSoft: '#FF8A3D',
  info: '#3DA9FC',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#AEB6C7',
  textMuted: '#6B7488',

  // Focus ring
  focusRing: '#FFFFFF',

  // Utility
  success: '#4ADE80',
  overlay: 'rgba(0,0,0,0.55)',
} as const;

export const spacing = {
  xs: 8,
  sm: 12,
  md: 20,
  lg: 32,
  xl: 48,
  xxl: 64,
} as const;

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

export const type = {
  hero: {fontSize: 64, lineHeight: 72, fontWeight: '700' as const},
  title: {fontSize: 44, lineHeight: 52, fontWeight: '700' as const},
  heading: {fontSize: 32, lineHeight: 40, fontWeight: '600' as const},
  body: {fontSize: 24, lineHeight: 32, fontWeight: '400' as const},
  label: {fontSize: 22, lineHeight: 28, fontWeight: '600' as const},
  caption: {fontSize: 18, lineHeight: 24, fontWeight: '400' as const},
} as const;
