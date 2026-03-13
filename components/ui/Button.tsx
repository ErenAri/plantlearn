import { layout, radius, spacing, typography } from '@/constants/Tokens'
import { useHaptics } from '@/hooks/useHaptics'
import { useTheme } from '@/hooks/useTheme'
import type { ReactNode } from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

import { Icon, type IconName } from './Icon'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'md' | 'lg'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: Variant
  style?: StyleProp<ViewStyle>
  disabled?: boolean
  subtitle?: string
  icon?: IconName
  trailing?: ReactNode
  align?: 'center' | 'start'
  size?: Size
  accessibilityLabel?: string
  accessibilityHint?: string
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export function Button({
  title,
  onPress,
  variant = 'primary',
  style,
  disabled,
  subtitle,
  icon,
  trailing,
  align = 'center',
  size = 'md',
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const theme = useTheme()
  const { light } = useHaptics()
  const scale = useSharedValue(1)

  const variantStyles: Record<Variant, { container: ViewStyle; text: string; subtitle: string; icon: string }> = {
    primary: {
      container: { backgroundColor: theme.primary, borderColor: theme.primary },
      text: '#ffffff',
      subtitle: 'rgba(255,255,255,0.8)',
      icon: '#ffffff',
    },
    secondary: {
      container: { backgroundColor: theme.surface, borderColor: theme.border },
      text: theme.text,
      subtitle: theme.textSecondary,
      icon: theme.primary,
    },
    ghost: {
      container: { backgroundColor: 'transparent', borderColor: 'transparent' },
      text: theme.primary,
      subtitle: theme.textSecondary,
      icon: theme.primary,
    },
  }

  const sizeStyles: Record<Size, ViewStyle> = {
    md: {
      minHeight: layout.touchTarget + 6,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm + 4,
    },
    lg: {
      minHeight: layout.touchTarget + 12,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <AnimatedPressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      hitSlop={6}
      onPress={() => {
        light()
        onPress()
      }}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 400 })
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 10, stiffness: 300 })
      }}
      disabled={disabled}
      style={[
        styles.base,
        sizeStyles[size],
        variantStyles[variant].container,
        align === 'start' && styles.alignStart,
        disabled && styles.disabled,
        style,
        animatedStyle,
      ]}>
      {icon ? <Icon color={variantStyles[variant].icon} name={icon} size={18} /> : null}
      <View style={[styles.copy, align === 'start' && styles.copyStart]}>
        <Text style={[typography.button, { color: variantStyles[variant].text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[typography.caption, { color: variantStyles[variant].subtitle }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  alignStart: {
    justifyContent: 'flex-start',
  },
  copy: {
    alignItems: 'center',
    flexShrink: 1,
  },
  copyStart: {
    alignItems: 'flex-start',
  },
  disabled: {
    opacity: 0.5,
  },
  trailing: {
    marginLeft: 'auto',
  },
})
