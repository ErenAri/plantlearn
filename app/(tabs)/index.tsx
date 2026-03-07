import { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { useTheme } from '@/hooks/useTheme'
import { Card, Button } from '@/components/ui'
import { spacing, typography, fontSize } from '@/constants/Tokens'
import { useRouter, useFocusEffect } from 'expo-router'
import { useTranslation } from 'react-i18next'
import {
  getActivePlant,
  getStreak,
  getDueCount,
  getOrCreateDailyQuests,
  getWeekSessionCount,
  getUnlockedSkins,
  getSkinUnlockedForWeek,
  getSetting,
  type PlantRecord,
  type StreakRecord,
} from '@/db'
import {
  computeDecayOnly,
  MAX_HEALTH,
  buildDailyQuestStates,
  isoWeekBounds,
  weekKeyFromDate,
  buildWeeklyMilestone,
  PLANT_SKINS,
  type DailyQuestState,
  type WeeklyMilestoneState,
} from '@/gameplay'
import { getDevNowIso, getDevTodayKey } from '@/dev/clock'
import { syncNotifications } from '@/hooks/useNotifications'

function HealthBar({ health, theme }: { health: number; theme: ReturnType<typeof useTheme> }) {
  const pct = Math.max(0, Math.min(100, health))
  const barColor = pct >= 60 ? theme.primary : pct >= 30 ? theme.accent : theme.danger
  return (
    <View style={styles.healthBarOuter}>
      <View style={[styles.healthBarInner, { width: `${pct}%`, backgroundColor: barColor }]} />
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

    const hasSessionToday = s?.lastSessionDate === todayKey
    syncNotifications(hasSessionToday, s?.currentStreak ?? 0)
  }, [])

  useFocusEffect(useCallback(() => { load() }, [load]))
  useEffect(() => { load() }, [load])

  const skin = PLANT_SKINS.find(s => s.id === activeSkinId) ?? PLANT_SKINS[0]
  const stage = plant?.stage ?? 'seed'
  const stageEmoji = skin.emojis[stage] ?? skin.emojis.seed
  const stageLabel = t(`stages.${stage}` as any)

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={styles.plantViz}>
        <Text style={styles.plantArt}>{stageEmoji}</Text>
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
})
