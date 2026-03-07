import { spacing } from '@/constants/Tokens'
import { useTheme } from '@/hooks/useTheme'
import { StyleSheet, View } from 'react-native'
import Animated, {
    useAnimatedStyle,
    withTiming,
} from 'react-native-reanimated'

interface StepIndicatorProps {
  steps: string[]
  currentIndex: number
}

export function StepIndicator({ steps, currentIndex }: StepIndicatorProps) {
  const theme = useTheme()

  return (
    <View style={styles.container}>
      {steps.map((_, i) => (
        <StepDot
          key={i}
          active={i <= currentIndex}
          current={i === currentIndex}
          color={theme.primary}
          inactiveColor={theme.border}
        />
      ))}
    </View>
  )
}

function StepDot({
  active,
  current,
  color,
  inactiveColor,
}: {
  active: boolean
  current: boolean
  color: string
  inactiveColor: string
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(active ? color : inactiveColor, { duration: 300 }),
    width: withTiming(current ? 24 : 10, { duration: 300 }),
  }))

  return <Animated.View style={[styles.dot, animatedStyle]} />
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  dot: {
    height: 10,
    borderRadius: 5,
  },
})
