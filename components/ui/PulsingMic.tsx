import { useTheme } from '@/hooks/useTheme'
import { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated'

interface PulsingMicProps {
  active: boolean
  size?: number
}

export function PulsingMic({ active, size = 80 }: PulsingMicProps) {
  const theme = useTheme()
  const scale = useSharedValue(1)
  const opacity = useSharedValue(0)

  useEffect(() => {
    if (active) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 600 }),
          withTiming(1, { duration: 600 }),
        ),
        -1,
        false,
      )
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 600 }),
          withTiming(0, { duration: 600 }),
        ),
        -1,
        false,
      )
    } else {
      scale.value = withTiming(1, { duration: 200 })
      opacity.value = withTiming(0, { duration: 200 })
    }
  }, [active])

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.pulse,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: theme.danger,
          },
          pulseStyle,
        ]}
      />
      <View
        style={[
          styles.mic,
          {
            width: size * 0.7,
            height: size * 0.7,
            borderRadius: (size * 0.7) / 2,
            backgroundColor: active ? theme.danger : theme.primary,
          },
        ]}
      >
        <Text style={{ fontSize: size * 0.35 }}>🎤</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
  },
  mic: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})
