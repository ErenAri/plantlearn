import { Platform, StyleSheet } from 'react-native'

export const fontFamily = {
  regular: Platform.select({ web: 'Inter, sans-serif', default: 'Inter_400Regular' }),
  medium: Platform.select({ web: 'Inter, sans-serif', default: 'Inter_500Medium' }),
  semibold: Platform.select({ web: 'Inter, sans-serif', default: 'Inter_600SemiBold' }),
  bold: Platform.select({ web: 'Inter, sans-serif', default: 'Inter_700Bold' }),
} as const

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const

export const fontSize = {
  xs: 12,
  sm: 15,
  md: 17,
  lg: 21,
  xl: 28,
  xxl: 36,
} as const

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
}

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  full: 9999,
} as const

export const layout = {
  screenGutter: 20,
  sectionGap: 18,
  contentMaxWidth: 720,
  touchTarget: 48,
} as const

export const typography = StyleSheet.create({
  h1: { fontSize: fontSize.xxl, fontFamily: fontFamily.bold, fontWeight: fontWeight.bold, lineHeight: 42 },
  h2: { fontSize: fontSize.xl, fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold, lineHeight: 34 },
  h3: { fontSize: fontSize.lg, fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold, lineHeight: 28 },
  body: { fontSize: fontSize.md, fontFamily: fontFamily.regular, fontWeight: fontWeight.regular, lineHeight: 25 },
  bodySmall: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, fontWeight: fontWeight.regular, lineHeight: 22 },
  caption: { fontSize: fontSize.xs, fontFamily: fontFamily.medium, fontWeight: fontWeight.medium, lineHeight: 16, letterSpacing: 0.2 },
  button: { fontSize: fontSize.md, fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold, lineHeight: 22 },
})
