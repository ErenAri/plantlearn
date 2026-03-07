import { radius, spacing, typography } from '@/constants/Tokens'
import { useHaptics } from '@/hooks/useHaptics'
import { useTheme } from '@/hooks/useTheme'
import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

type Variant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: Variant
  style?: ViewStyle
  disabled?: boolean
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export function Button({ title, onPress, variant = 'primary', style, disabled }: ButtonProps) {
  const theme = useTheme()
  const { light } = useHaptics()
  const scale = useSharedValue(1)

  const variantStyles: Record<Variant, ViewStyle> = {
    primary: { backgroundColor: theme.primary },
    secondary: { backgroundColor: theme.primaryLight, borderWidth: 1, borderColor: theme.primary },
    ghost: { backgroundColor: 'transparent' },
  }

  const textColor = variant === 'primary' ? '#fff' : theme.primary

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <AnimatedPressable
      onPress={() => { light(); onPress() }}
      onPressIn={() => { scale.value = withSpring(0.95, { damping: 15, stiffness: 400 }) }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 10, stiffness: 300 }) }}
      disabled={disabled}
      style={[
        styles.base,
        variantStyles[variant],
        disabled && styles.disabled,
        style,
        animatedStyle,
      ]}
    >
      <Text style={[typography.button, { color: textColor }]}>{title}</Text>
    </AnimatedPressable>
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
  disabled: {
    opacity: 0.5,
  },
})
