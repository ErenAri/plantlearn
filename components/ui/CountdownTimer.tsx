import { fontFamily, fontSize } from '@/constants/Tokens'
import { useTheme } from '@/hooks/useTheme'
import { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

interface CountdownTimerProps {
  totalSeconds: number
  remainingSeconds: number
  size?: number
}

export function CountdownTimer({ totalSeconds, remainingSeconds, size = 56 }: CountdownTimerProps) {
  const theme = useTheme()
  const progress = useSharedValue(1)

  useEffect(() => {
    progress.value = withTiming(remainingSeconds / totalSeconds, { duration: 900 })
  }, [remainingSeconds, totalSeconds])

  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60
  const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`
  const isLow = remainingSeconds <= 30

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: '-90deg' }],
    opacity: progress.value < 0.15 ? 0.5 : 1,
  }))

  // Use a simple circle progress using border trick
  const borderWidth = 3
  const innerSize = size - borderWidth * 2

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth,
            borderColor: theme.border,
          },
        ]}
      />
      <View style={[styles.center, { width: innerSize, height: innerSize }]}>
        <Text
          style={[
            styles.text,
            { color: isLow ? theme.danger : theme.text },
          ]}
        >
          {timeStr}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
  },
})
