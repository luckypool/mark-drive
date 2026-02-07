/**
 * Dark Indigo Theme - Color definitions
 * CSS変数を JS オブジェクトに変換
 */

export const colors = {
  // Background colors
  bgPrimary: '#0a0b14',
  bgSecondary: '#111320',
  bgTertiary: '#1a1d2e',
  bgCard: '#0d0e18',

  // Accent colors
  accent: '#6366f1',
  accentHover: '#818cf8',
  accentMuted: 'rgba(99, 102, 241, 0.15)',

  // Text colors
  textPrimary: '#e2e8f0',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',

  // Border colors
  border: '#1e2038',
  borderLight: 'rgba(99, 102, 241, 0.2)',

  // Status colors
  error: '#f87171',
  warning: '#fbbf24',
  warningMuted: 'rgba(251, 191, 36, 0.15)',
  success: '#10b981',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',

  // Shadow (for platforms that support it)
  shadowColor: '#000000',
} as const;

export type ColorKey = keyof typeof colors;

// Utility function to get rgba version of a color
export const withOpacity = (color: string, opacity: number): string => {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  // Already rgba or other format
  return color;
};
