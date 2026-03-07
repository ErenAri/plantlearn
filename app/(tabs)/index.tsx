import { Button, Card } from '@/components/ui'
import { fontSize, spacing, typography } from '@/constants/Tokens'
import {
    getActivePlant,
    getDueCount,
    getLearnedCardCount,
    getOrCreateDailyQuests,
    getSetting,
    getSkinUnlockedForWeek,
    getStreak,
    getTotalLearningTimeSec,
    getTotalSessionCount,
    getWeekSessionCount,
    type PlantRecord,
    type StreakRecord
} from '@/db'
import { getDevNowIso, getDevTodayKey } from '@/dev/clock'
import {
    buildDailyQuestStates,
    buildWeeklyMilestone,
    computeDecayOnly,
    getTodayChallenge,
    isoWeekBounds,
    isWeekendBonusActive,
    MAX_HEALTH,
    PLANT_SKINS,
    weekKeyFromDate,
    type DailyChallenge,
    type DailyQuestState,
    type WeeklyMilestoneState,
} from '@/gameplay'
import { syncNotifications } from '@/hooks/useNotifications'
import { useTheme } from '@/hooks/useTheme'
import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated'

function HealthBar({ health, theme }: { health: number; theme: ReturnType<typeof useTheme> }) {
  const pct = Math.max(0, Math.min(100, health))
  const barColor = pct >= 60 ? theme.primary : pct >= 30 ? theme.accent : theme.danger
  const widthAnim = useSharedValue(0)

  useEffect(() => {
    widthAnim.value = withTiming(pct, { duration: 600 })
  }, [pct])

  const animatedBar = useAnimatedStyle(() => ({
    width: `${widthAnim.value}%`,
    backgroundColor: barColor,
  }))

  return (
    <View style={styles.healthBarOuter}>
      <Animated.View style={[styles.healthBarInner, animatedBar]} />
    </View>
  )
}

export default function HomeScreen() {
  const theme = useTheme()
  const router = useRouter()
  const { t } = useTranslation()
  const [plant, setPlant] = useState<PlantRecord | null>(null)
  const [streak, setStreak] = useState<StreakRecord | null>(null)
  const [dueCount, setDueCount] = useState(0)
  const [quests, setQuests] = useState<DailyQuestState[]>([])
  const [milestone, setMilestone] = useState<WeeklyMilestoneState | null>(null)
  const [displayHealth, setDisplayHealth] = useState(100)
  const [activeSkinId, setActiveSkinId] = useState('classic')
  const [totalSessions, setTotalSessions] = useState(0)
  const [wordsLearned, setWordsLearned] = useState(0)
  const [totalTimeSec, setTotalTimeSec] = useState(0)
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null)
  const [weekendBonus, setWeekendBonus] = useState(false)

  // Plant bounce animation
  const plantBounce = useSharedValue(1)
  const plantStyle = useAnimatedStyle(() => ({
    transform: [{ scale: plantBounce.value }],
  }))

  const load = useCallback(async () => {
    const todayKey = getDevTodayKey()
    const [p, s, count] = await Promise.all([
      getActivePlant(),
      getStreak(),
      getDueCount(),
    ])
    setPlant(p)
    setStreak(s)
    setDueCount(count)

    const now = getDevNowIso()
    const plantState = p
      ? { level: p.level, xp: p.xp, health: p.health, stage: p.stage, totalWater: p.totalWater, totalSun: p.totalSun, totalFertilizer: p.totalFertilizer, totalRoots: p.totalRoots }
      : { level: 1, xp: 0, health: 100, stage: 'seed', totalWater: 0, totalSun: 0, totalFertilizer: 0, totalRoots: 0 }

    const currentHealth = computeDecayOnly(plantState, s?.lastSessionDate ?? null, now)
    setDisplayHealth(Math.round(currentHealth))

    const questRows = await getOrCreateDailyQuests(todayKey)
    const progressMap: Record<string, number> = {}
    for (const q of questRows) {
      progressMap[q.questId] = q.progress
    }
    setQuests(buildDailyQuestStates(progressMap))

    const { monday, sunday } = isoWeekBounds(todayKey)
    const weekKey = weekKeyFromDate(todayKey)
    const [weekSessions, skinThisWeek] = await Promise.all([
      getWeekSessionCount(monday, sunday),
      getSkinUnlockedForWeek(weekKey),
    ])
    setMilestone(buildWeeklyMilestone(weekSessions, weekKey, skinThisWeek))

    const skinSetting = await getSetting('activeSkin')
    setActiveSkinId(skinSetting ?? 'classic')

    const [sessCount, learnedCount, learnTimeSec] = await Promise.all([
      getTotalSessionCount(),
      getLearnedCardCount(),
      getTotalLearningTimeSec(),
    ])
    setTotalSessions(sessCount)
    setWordsLearned(learnedCount)
    setTotalTimeSec(learnTimeSec)

    setChallenge(getTodayChallenge())
    setWeekendBonus(isWeekendBonusActive())

    const hasSessionToday = s?.lastSessionDate === todayKey
    syncNotifications(hasSessionToday, s?.currentStreak ?? 0)
  }, [])

  useFocusEffect(useCallback(() => {
    load()
    // Bounce plant emoji on focus
    plantBounce.value = withSequence(
      withTiming(0.85, { duration: 100 }),
      withSpring(1, { damping: 6, stiffness: 200 }),
    )
  }, [load]))
  useEffect(() => { load() }, [load])

  const skin = PLANT_SKINS.find(s => s.id === activeSkinId) ?? PLANT_SKINS[0]
  const stage = plant?.stage ?? 'seed'
  const stageEmoji = skin.emojis[stage] ?? skin.emojis.seed
  const stageLabel = t(`stages.${stage}` as any)

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={styles.plantViz}>
        <Animated.View style={plantStyle}>
          <Text style={styles.plantArt}>{stageEmoji}</Text>
        </Animated.View>
        <Text style={[typography.h3, { color: theme.text }]}>{stageLabel}</Text>
        <Text style={[typography.caption, { color: theme.textSecondary }]}>
          Lv.{plant?.level ?? 1} — {plant?.xp ?? 0} XP
        </Text>
      </View>

      <Card style={styles.healthCard}>
        <View style={styles.healthHeader}>
          <Text style={[typography.bodySmall, { color: theme.text, fontWeight: '600' }]}>{t('home.health')}</Text>
          <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>{displayHealth}/{MAX_HEALTH}</Text>
        </View>
        <HealthBar health={displayHealth} theme={theme} />
      </Card>

      <View style={styles.statsRow}>
        <Card style={styles.miniStat}>
          <Text style={[{ fontSize: fontSize.xl, textAlign: 'center' }]}>🔥</Text>
          <Text style={[typography.h2, { color: theme.accent, textAlign: 'center' }]}>{streak?.currentStreak ?? 0}</Text>
          <Text style={[typography.caption, { color: theme.textSecondary, textAlign: 'center' }]}>{t('home.streak')}</Text>
        </Card>
        <Card style={styles.miniStat}>
          <Text style={[{ fontSize: fontSize.xl, textAlign: 'center' }]}>📚</Text>
          <Text style={[typography.h2, { color: theme.primary, textAlign: 'center' }]}>{dueCount}</Text>
          <Text style={[typography.caption, { color: theme.textSecondary, textAlign: 'center' }]}>{t('home.due')}</Text>
        </Card>
        <Card style={styles.miniStat}>
          <Text style={[{ fontSize: fontSize.xl, textAlign: 'center' }]}>💧</Text>
          <Text style={[typography.h2, { color: theme.primary, textAlign: 'center' }]}>{plant?.totalWater ?? 0}</Text>
          <Text style={[typography.caption, { color: theme.textSecondary, textAlign: 'center' }]}>{t('home.water')}</Text>
        </Card>
      </View>

      <Card style={styles.questCard}>
        <Text style={[typography.body, { color: theme.text, fontWeight: '600', marginBottom: spacing.sm }]}>{t('home.dailyQuests')}</Text>
        {quests.map(q => (
          <View key={q.id} style={styles.questRow}>
            <Text style={[typography.body, { color: theme.textSecondary }]}>{q.done ? '✅' : '⬜'}</Text>
            <Text style={[typography.bodySmall, { color: q.done ? theme.textSecondary : theme.text, flex: 1 }]}>
              {t(`quests.${q.id}` as any)}
            </Text>
            <Text style={[typography.caption, { color: theme.textSecondary }]}>
              {q.progress}/{q.target}
            </Text>
          </View>
        ))}
      </Card>

      {weekendBonus && (
        <Card style={{ ...styles.questCard, borderColor: theme.accent, borderWidth: 1.5 }}>
          <Text style={[typography.body, { color: theme.accent, fontWeight: '600', textAlign: 'center' }]}>
            🎉 {t('home.weekendBonus')}
          </Text>
        </Card>
      )}

      {challenge && (
        <Card style={styles.questCard}>
          <Text style={[typography.body, { color: theme.text, fontWeight: '600', marginBottom: spacing.sm }]}>{t('home.dailyChallenge')}</Text>
          <View style={styles.questRow}>
            <Text style={{ fontSize: 24 }}>{challenge.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[typography.bodySmall, { color: theme.text, fontWeight: '600' }]}>{t(`challenges.${challenge.nameKey}` as any)}</Text>
              <Text style={[typography.caption, { color: theme.textSecondary }]}>{t(`challenges.${challenge.descKey}` as any)}</Text>
            </View>
            <Text style={[typography.bodySmall, { color: theme.accent, fontWeight: '600' }]}>+{challenge.bonusXp} XP</Text>
          </View>
        </Card>
      )}

      {milestone && (
        <Card style={styles.questCard}>
          <Text style={[typography.body, { color: theme.text, fontWeight: '600', marginBottom: spacing.sm }]}>{t('home.weeklyMilestone')}</Text>
          <View style={styles.questRow}>
            <Text style={[typography.body, { color: theme.textSecondary }]}>{milestone.achieved ? '🏆' : '⬜'}</Text>
            <Text style={[typography.bodySmall, { color: milestone.achieved ? theme.textSecondary : theme.text, flex: 1 }]}>
              {t('home.sessionsThisWeek', { count: milestone.sessionCount, target: milestone.target })}
            </Text>
          </View>
          {milestone.achieved && milestone.skinUnlocked && (
            <Text style={[typography.bodySmall, { color: theme.accent, marginTop: spacing.xs }]}>
              {t('home.unlocked', { name: PLANT_SKINS.find(s => s.id === milestone.skinUnlocked)?.name ?? milestone.skinUnlocked })}
            </Text>
          )}
        </Card>
      )}

      <Button
        title={t('home.startSession')}
        onPress={() => router.push('/session')}
        style={styles.cta}
      />

      {displayHealth < 80 && (
        <Button
          title={t('home.recoverySession')}
          variant="secondary"
          onPress={() => router.push('/session?recovery=1' as any)}
          style={styles.recoveryBtn}
        />
      )}

      <View style={styles.nutrientsRow}>
        <NutrientBadge label={`☀️ ${t('home.sun')}`} value={plant?.totalSun ?? 0} theme={theme} />
        <NutrientBadge label={`🧪 ${t('home.fertilizer')}`} value={plant?.totalFertilizer ?? 0} theme={theme} />
        <NutrientBadge label={`🌳 ${t('home.roots')}`} value={plant?.totalRoots ?? 0} theme={theme} />
      </View>

      <Card style={styles.statsCard}>
        <Text style={[typography.body, { color: theme.text, fontWeight: '600', marginBottom: spacing.sm }]}>{t('home.yourProgress')}</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={{ fontSize: 22 }}>📊</Text>
            <Text style={[typography.h3, { color: theme.primary }]}>{totalSessions}</Text>
            <Text style={[typography.caption, { color: theme.textSecondary }]}>{t('home.totalSessions')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={{ fontSize: 22 }}>🔤</Text>
            <Text style={[typography.h3, { color: theme.primary }]}>{wordsLearned}</Text>
            <Text style={[typography.caption, { color: theme.textSecondary }]}>{t('home.wordsLearned')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={{ fontSize: 22 }}>⏱️</Text>
            <Text style={[typography.h3, { color: theme.primary }]}>{formatTime(totalTimeSec)}</Text>
            <Text style={[typography.caption, { color: theme.textSecondary }]}>{t('home.totalTime')}</Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  )
}

function NutrientBadge({ label, value, theme }: { label: string; value: number; theme: ReturnType<typeof useTheme> }) {
  return (
    <View style={styles.nutrient}>
      <Text style={[typography.caption, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[typography.bodySmall, { color: theme.text, fontWeight: '600' }]}>{value}</Text>
    </View>
  )
}

function formatTime(totalSec: number): string {
  const hours = Math.floor(totalSec / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  plantViz: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  plantArt: {
    fontSize: 80,
    marginBottom: spacing.sm,
  },
  healthCard: {
    marginBottom: spacing.md,
  },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  healthBarOuter: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  healthBarInner: {
    height: '100%',
    borderRadius: 5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  miniStat: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  questCard: {
    marginBottom: spacing.md,
  },
  questRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  cta: {
    marginBottom: spacing.sm,
  },
  recoveryBtn: {
    marginBottom: spacing.md,
  },
  nutrientsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutrient: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  statsCard: {
    marginTop: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
})
