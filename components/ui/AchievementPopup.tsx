import { radius, spacing, typography } from '@/constants/Tokens'
import type { AchievementTier } from '@/db'
import { useTheme } from '@/hooks/useTheme'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

const TIER_COLORS: Record<AchievementTier, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
}

interface Props {
  achievementId: string
  icon: string
  tier: AchievementTier
  onDismiss: () => void
}

export function AchievementPopup({ achievementId, icon, tier, onDismiss }: Props) {
  const theme = useTheme()
  const { t } = useTranslation()
  const scale = useSharedValue(0)
  const opacity = useSharedValue(0)

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 200 })
    scale.value = withSequence(
      withSpring(1.1, { damping: 8, stiffness: 150 }),
      withSpring(1, { damping: 12, stiffness: 200 }),
    )
    // Auto-dismiss after 3 seconds
    const timer = setTimeout(dismiss, 3000)
    return () => clearTimeout(timer)
  }, [])

  function dismiss() {
    opacity.value = withTiming(0, { duration: 300 })
    scale.value = withTiming(0.8, { duration: 300 })
    setTimeout(onDismiss, 350)
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  const tierColor = TIER_COLORS[tier]
  const name = t(`achievements.${achievementId}.name` as any)
  const desc = t(`achievements.${achievementId}.desc` as any)

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <Animated.View style={[styles.popup, { backgroundColor: theme.surface, borderColor: tierColor }, animatedStyle]}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={[typography.caption, { color: tierColor, fontWeight: '600', textTransform: 'uppercase' }]}>
          {t(`achievements.tierLabel.${tier}` as any)}
        </Text>
        <Text style={[typography.h3, { color: theme.text, textAlign: 'center' }]}>{name}</Text>
        <Text style={[typography.bodySmall, { color: theme.textSecondary, textAlign: 'center' }]}>{desc}</Text>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 100,
    zIndex: 1000,
  },
  popup: {
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 2,
    gap: spacing.xs,
    minWidth: 260,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  icon: {
    fontSize: 48,
  },
})
