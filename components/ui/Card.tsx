import { radius, spacing } from '@/constants/Tokens'
import { useTheme } from '@/hooks/useTheme'
import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native'

type Tone = 'default' | 'muted' | 'accent'

interface CardProps extends ViewProps {
  style?: StyleProp<ViewStyle>
  elevated?: boolean
  tone?: Tone
  padding?: number
}

export function Card({ style, children, elevated, tone = 'default', padding, ...rest }: CardProps) {
  const theme = useTheme()

  const toneStyles: Record<Tone, ViewStyle> = {
    default: { backgroundColor: theme.surface, borderColor: theme.border },
    muted: { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
    accent: { backgroundColor: theme.primaryLight, borderColor: 'transparent' },
  }

  return (
    <View
      style={[
        styles.card,
        toneStyles[tone],
        { shadowColor: theme.shadow },
        elevated && styles.elevated,
        typeof padding === 'number' ? { padding } : null,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.md + 2,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  elevated: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
  },
})
