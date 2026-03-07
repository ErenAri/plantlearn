import { radius, spacing } from '@/constants/Tokens'
import { useTheme } from '@/hooks/useTheme'
import { StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native'

interface CardProps extends ViewProps {
  style?: ViewStyle
  elevated?: boolean
}

export function Card({ style, children, elevated, ...rest }: CardProps) {
  const theme = useTheme()

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border },
        elevated && styles.elevated,
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
    padding: spacing.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  elevated: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
})
