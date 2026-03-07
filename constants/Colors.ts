export const palette = {
  green50: '#f0fdf4',
  green100: '#dcfce7',
  green200: '#bbf7d0',
  green400: '#4ade80',
  green500: '#22c55e',
  green600: '#16a34a',
  green700: '#15803d',
  green800: '#166534',
  green900: '#14532d',

  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',

  white: '#ffffff',
  black: '#000000',

  amber400: '#fbbf24',
  amber500: '#f59e0b',
  red400: '#f87171',
  red500: '#ef4444',
} as const

export const light = {
  text: palette.gray900,
  textSecondary: palette.gray600,
  background: palette.gray50,
  surface: palette.white,
  border: palette.gray200,
  primary: palette.green700,
  primaryLight: palette.green100,
  accent: palette.amber500,
  danger: palette.red500,
  tabBar: palette.white,
  tabBarInactive: palette.gray500,
  tabBarActive: palette.green700,
} as const

export const dark = {
  text: palette.gray50,
  textSecondary: palette.gray400,
  background: palette.gray900,
  surface: palette.gray800,
  border: palette.gray700,
  primary: palette.green500,
  primaryLight: palette.green900,
  accent: palette.amber400,
  danger: palette.red400,
  tabBar: palette.gray800,
  tabBarInactive: palette.gray500,
  tabBarActive: palette.green400,
} as const

export type ThemeColors = {
  [K in keyof typeof light]: string
}
