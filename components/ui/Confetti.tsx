import { useEffect, useMemo } from 'react'
import { Dimensions } from 'react-native'
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from 'react-native-reanimated'

const CONFETTI_PIECES = 24
const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#a855f7', '#ec4899']
const EMOJIS = ['🎉', '✨', '🌟', '🎊', '💫', '⭐']
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

interface ConfettiProps {
  active: boolean
}

export function Confetti({ active }: ConfettiProps) {
  const pieces = useMemo(
    () =>
      Array.from({ length: CONFETTI_PIECES }, (_, i) => ({
        id: i,
        startX: Math.random() * SCREEN_WIDTH,
        endX: (Math.random() - 0.5) * SCREEN_WIDTH * 0.6,
        delay: Math.random() * 400,
        duration: 1200 + Math.random() * 800,
        emoji: EMOJIS[i % EMOJIS.length],
        rotation: Math.random() * 360,
      })),
    [],
  )

  if (!active) return null

  return (
    <>
      {pieces.map((p) => (
        <ConfettiPiece key={p.id} {...p} />
      ))}
    </>
  )
}

function ConfettiPiece({
  startX,
  endX,
  delay,
  duration,
  emoji,
  rotation,
}: {
  startX: number
  endX: number
  delay: number
  duration: number
  emoji: string
  rotation: number
}) {
  const translateY = useSharedValue(-40)
  const translateX = useSharedValue(0)
  const opacity = useSharedValue(1)
  const rotate = useSharedValue(0)

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(SCREEN_HEIGHT * 0.7, { duration, easing: Easing.out(Easing.quad) }),
    )
    translateX.value = withDelay(
      delay,
      withTiming(endX, { duration, easing: Easing.out(Easing.quad) }),
    )
    opacity.value = withDelay(
      delay + duration * 0.6,
      withTiming(0, { duration: duration * 0.4 }),
    )
    rotate.value = withDelay(
      delay,
      withTiming(rotation + 360, { duration }),
    )
  }, [])

  const style = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: startX,
    top: 0,
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
    zIndex: 1000,
  }))

  return (
    <Animated.Text style={[{ fontSize: 20 }, style]}>
      {emoji}
    </Animated.Text>
  )
}
