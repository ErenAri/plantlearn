import { View, StyleSheet, type ViewStyle, type ViewProps } from 'react-native'
import { useTheme } from '@/hooks/useTheme'
import { spacing, radius } from '@/constants/Tokens'

interface CardProps extends ViewProps {
  style?: ViewStyle
}

export function Card({ style, children, ...rest }: CardProps) {
  const theme = useTheme()

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border },
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
})
