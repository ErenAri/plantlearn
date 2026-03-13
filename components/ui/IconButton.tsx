import { radius } from '@/constants/Tokens'
import { useTheme } from '@/hooks/useTheme'
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native'

import { Icon, type IconName } from './Icon'

type Variant = 'ghost' | 'surface'

interface IconButtonProps {
  icon: IconName
  label: string
  onPress: () => void
  variant?: Variant
  size?: number
  style?: StyleProp<ViewStyle>
  accessibilityHint?: string
}

export function IconButton({
  icon,
  label,
  onPress,
  variant = 'surface',
  size = 44,
  style,
  accessibilityHint,
}: IconButtonProps) {
  const theme = useTheme()

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={label}
      accessibilityRole="button"
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: Math.max(radius.md, size / 2),
          backgroundColor: variant === 'surface' ? theme.surface : 'transparent',
          borderColor: variant === 'surface' ? theme.border : 'transparent',
          opacity: pressed ? 0.86 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
        style,
      ]}>
      <Icon color={theme.text} name={icon} size={20} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderWidth: 1,
    justifyContent: 'center',
  },
})
