import { Pressable, Text, StyleSheet, type ViewStyle } from 'react-native'
import { useTheme } from '@/hooks/useTheme'
import { spacing, radius, typography } from '@/constants/Tokens'

type Variant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: Variant
  style?: ViewStyle
  disabled?: boolean
}

export function Button({ title, onPress, variant = 'primary', style, disabled }: ButtonProps) {
  const theme = useTheme()

  const variantStyles: Record<Variant, ViewStyle> = {
    primary: { backgroundColor: theme.primary },
    secondary: { backgroundColor: theme.primaryLight, borderWidth: 1, borderColor: theme.primary },
    ghost: { backgroundColor: 'transparent' },
  }

  const textColor = variant === 'primary' ? '#fff' : theme.primary

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[typography.button, { color: textColor }]}>{title}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
})
