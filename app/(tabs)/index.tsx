import { AppHeader, Button, Card, GrowthStrip, Icon, IconButton } from '@/components/ui'
import { PlantHeroScene } from '@/components/plant/PlantHeroScene'
import { fontSize, layout, spacing, typography } from '@/constants/Tokens'
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
  listSessionsInRange,
  type PlantRecord,
  type StreakRecord,
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
import { getLearningLevel } from '@/services/placement'
import {
  addDateKeyDays,
  buildDailyGrowthActivity,
  buildGrowthForecast,
  buildGrowthProgress,
  countActiveGrowthDays,
  type DailyGrowthActivity,
  type GrowthForecast,
} from '@/utils/growth'
import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

function ProgressBar({
  value,
  max = 100,
  color,
  trackColor,
}: {
  value: number
  max?: number
  color: string
  trackColor: string
}) {
  const widthAnim = useSharedValue(0)
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100))

  useEffect(() => {
    widthAnim.value = withTiming(pct, { duration: 600 })
  }, [pct, widthAnim])

  const animatedBar = useAnimatedStyle(() => ({
    width: `${widthAnim.value}%`,
    backgroundColor: color,
  }))

  return (
    <View style={[styles.progressTrack, { backgroundColor: trackColor }]}>
      <Animated.View style={[styles.progressFill, animatedBar]} />
    </View>
  )
}

function StatTile({
  icon,
  label,
  value,
  theme,
}: {
  icon: Parameters<typeof Icon>[0]['name']
  label: string
  value: number | string
  theme: ReturnType<typeof useTheme>
}) {
  return (
    <Card padding={spacing.md} style={styles.statTile} tone="muted">
      <View style={[styles.statIconWrap, { backgroundColor: theme.surface }]}>
        <Icon color={theme.primary} name={icon} size={18} />
      </View>
      <Text style={[typography.h3, { color: theme.text }]}>{value}</Text>
      <Text style={[typography.caption, styles.centeredText, { color: theme.textSecondary }]}>
        {label}
      </Text>
    </Card>
  )
}

function StatusChip({
  icon,
  label,
  theme,
}: {
  icon: Parameters<typeof Icon>[0]['name']
  label: string
  theme: ReturnType<typeof useTheme>
}) {
  return (
    <View style={[styles.statusChip, { backgroundColor: theme.surface }]}>
      <Icon color={theme.primary} name={icon} size={14} />
      <Text style={[typography.caption, { color: theme.text }]}>{label}</Text>
    </View>
  )
}

function PlanRow({
  icon,
  label,
  value,
  helper,
  theme,
}: {
  icon: Parameters<typeof Icon>[0]['name']
  label: string
  value: string
  helper?: string
  theme: ReturnType<typeof useTheme>
}) {
  return (
    <View style={styles.planRow}>
      <View style={[styles.planIconWrap, { backgroundColor: theme.surfaceMuted }]}>
        <Icon color={theme.primary} name={icon} size={16} />
      </View>
      <View style={styles.planCopy}>
        <Text style={[typography.bodySmall, { color: theme.text }]}>{label}</Text>
        {helper ? (
          <Text style={[typography.caption, { color: theme.textSecondary }]}>{helper}</Text>
        ) : null}
      </View>
      <Text style={[typography.caption, styles.planValue, { color: theme.textSecondary }]}>{value}</Text>
    </View>
  )
}

function QuestRow({
  progress,
  target,
  label,
  done,
  theme,
}: {
  progress: number
  target: number
  label: string
  done: boolean
  theme: ReturnType<typeof useTheme>
}) {
  return (
    <View style={styles.questRow}>
      <View style={styles.questCopy}>
        <View style={styles.questTitleRow}>
          <Icon color={done ? theme.success : theme.textSecondary} name={done ? 'check-circle' : 'circle'} size={14} />
          <Text style={[typography.bodySmall, { color: done ? theme.textSecondary : theme.text, flex: 1 }]}>
            {label}
          </Text>
          <Text style={[typography.caption, { color: theme.textSecondary }]}>
            {progress}/{target}
          </Text>
        </View>
        <ProgressBar
          color={done ? theme.success : theme.primary}
          max={target}
          trackColor={theme.surfaceAlt}
          value={progress}
        />
      </View>
    </View>
  )
}

function SnapshotMetric({
  icon,
  label,
  value,
  theme,
}: {
  icon: Parameters<typeof Icon>[0]['name']
  label: string
  value: string
  theme: ReturnType<typeof useTheme>
}) {
  return (
    <View style={styles.snapshotMetric}>
      <View style={[styles.snapshotIconWrap, { backgroundColor: theme.surfaceAlt }]}>
        <Icon color={theme.primary} name={icon} size={16} />
      </View>
      <Text style={[typography.h3, styles.centeredText, { color: theme.text }]}>{value}</Text>
      <Text style={[typography.caption, styles.centeredText, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  )
}

function GrowthMetric({
  label,
  value,
  helper,
  theme,
}: {
  label: string
  value: string
  helper: string
  theme: ReturnType<typeof useTheme>
}) {
  return (
    <View style={[styles.growthMetric, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
      <Text style={[typography.caption, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[typography.body, { color: theme.text }]}>{value}</Text>
      <Text style={[typography.caption, { color: theme.textSecondary }]}>{helper}</Text>
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
  const [learningLevel, setLearningLevel] = useState('A1')
  const [last7Days, setLast7Days] = useState<DailyGrowthActivity[]>([])
  const [growthForecast, setGrowthForecast] = useState<GrowthForecast | null>(null)

  const plantBounce = useSharedValue(1)
  const plantStyle = useAnimatedStyle(() => ({
    transform: [{ scale: plantBounce.value }],
  }))

  const load = useCallback(async () => {
    const todayKey = getDevTodayKey()
    const sevenDayStart = addDateKeyDays(todayKey, -6)
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
    const recentSessions = await listSessionsInRange(sevenDayStart, todayKey)
    const nextLast7Days = buildDailyGrowthActivity(todayKey, recentSessions)
    setLast7Days(nextLast7Days)
    setGrowthForecast(buildGrowthForecast({
      plant: plantState,
      displayHealth: Math.round(currentHealth),
      todayKey,
      recentSessions,
    }))

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

    const [sessCount, learnedCount, learnTimeSec, activeLevel] = await Promise.all([
      getTotalSessionCount(),
      getLearnedCardCount(),
      getTotalLearningTimeSec(),
      getLearningLevel(),
    ])
    setTotalSessions(sessCount)
    setWordsLearned(learnedCount)
    setTotalTimeSec(learnTimeSec)
    setLearningLevel(activeLevel)

    setChallenge(getTodayChallenge())
    setWeekendBonus(isWeekendBonusActive())

    const hasSessionToday = s?.lastSessionDate === todayKey
    syncNotifications(hasSessionToday, s?.currentStreak ?? 0)
  }, [])

  useFocusEffect(useCallback(() => {
    void load()
    plantBounce.value = withSequence(
      withTiming(0.88, { duration: 100 }),
      withSpring(1, { damping: 6, stiffness: 200 }),
    )
  }, [load, plantBounce]))

  const stage = plant?.stage ?? 'seed'
  const stageLabel = t(`stages.${stage}` as any)
  const growthProgress = buildGrowthProgress(plant?.xp ?? 0)
  const nextStageLabel = growthProgress.nextStage
    ? t(`stages.${growthProgress.nextStage}` as any)
    : t('home.fullyGrown')
  const isRecoveryRecommended = displayHealth < 80
  const heroTitle = isRecoveryRecommended ? t('home.recoveryMode') : t('home.healthyState')
  const heroSubtitle = isRecoveryRecommended ? t('home.recoveryHint') : t('home.healthyHint')
  const completedQuests = quests.filter((quest) => quest.done).length
  const hasSessionToday = streak?.lastSessionDate === getDevTodayKey()
  const activeGrowthDays = countActiveGrowthDays(last7Days)
  const weeklyProgress = milestone
    ? `${milestone.sessionCount}/${milestone.target}`
    : '0/5'

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        style={[styles.container, { backgroundColor: theme.background }]}>
        <AppHeader
          action={
            <IconButton
              icon="settings"
              label={t('home.openSettings')}
              onPress={() => router.push('/settings' as any)}
            />
          }
          eyebrow={t('home.appLabel')}
          subtitle={t('home.welcomeSubtitle')}
          title={t('home.welcomeTitle')}
        />

        <Card elevated style={styles.heroCard} tone="accent">
          <View style={styles.heroTop}>
            <Animated.View
              style={[
                styles.plantScene,
                plantStyle,
              ]}>
              <PlantHeroScene
                health={displayHealth}
                height={154}
                skinId={activeSkinId}
                speciesId={plant?.speciesId ?? 'starter-fern'}
                stage={stage}
                totalFertilizer={plant?.totalFertilizer ?? 0}
                totalRoots={plant?.totalRoots ?? 0}
                totalSun={plant?.totalSun ?? 0}
                totalWater={plant?.totalWater ?? 0}
                width={140}
              />
            </Animated.View>
            <View style={styles.heroCopy}>
              <View style={styles.statusRow}>
                <StatusChip icon="activity" label={stageLabel} theme={theme} />
                <StatusChip
                  icon="flag"
                  label={t('home.currentTrack', { level: learningLevel })}
                  theme={theme}
                />
                <StatusChip
                  icon="zap"
                  label={`${streak?.currentStreak ?? 0} ${t('home.streak')}`}
                  theme={theme}
                />
              </View>
              <Text style={[typography.h1, styles.heroTitle, { color: theme.text }]}>{heroTitle}</Text>
              <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>{heroSubtitle}</Text>
            </View>
          </View>

          <View style={styles.healthBlock}>
            <View style={styles.healthHeader}>
              <Text style={[typography.caption, { color: theme.textSecondary }]}>{t('home.health')}</Text>
              <Text style={[typography.caption, { color: theme.text }]}>{displayHealth}/{MAX_HEALTH}</Text>
            </View>
            <ProgressBar
              color={displayHealth >= 60 ? theme.success : displayHealth >= 30 ? theme.accent : theme.danger}
              max={MAX_HEALTH}
              trackColor={theme.surface}
              value={displayHealth}
            />
          </View>

          <Button
            icon={isRecoveryRecommended ? 'refresh-cw' : 'play-circle'}
            onPress={() => router.push((isRecoveryRecommended ? '/session?recovery=1' : '/session') as any)}
            size="lg"
            title={isRecoveryRecommended ? t('home.recoverySession') : t('home.startSession')}
          />
          {isRecoveryRecommended ? (
            <Button
              icon="play-circle"
              onPress={() => router.push('/session')}
              style={styles.secondaryHeroButton}
              title={t('home.startSession')}
              variant="ghost"
            />
          ) : null}
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[typography.h3, { color: theme.text }]}>{t('home.growthLadder')}</Text>
              <Text style={[typography.caption, { color: theme.textSecondary }]}>
                {t('home.growthLadderHint')}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: theme.surfaceMuted }]}>
              <Text style={[typography.caption, { color: theme.primary }]}>
                {growthProgress.isMaxStage
                  ? t('home.fullyGrown')
                  : t('home.xpShort', { xp: growthProgress.xpToNextStage })}
              </Text>
            </View>
          </View>

          <View style={styles.growthStageRow}>
            <View style={[styles.stageBadge, { backgroundColor: theme.primaryLight, borderColor: theme.border }]}>
              <Text style={[typography.caption, { color: theme.primary }]}>{stageLabel}</Text>
            </View>
            <Icon color={theme.textSecondary} name="arrow-right" size={16} />
            <View style={[styles.stageBadge, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
              <Text style={[typography.caption, { color: theme.textSecondary }]}>{nextStageLabel}</Text>
            </View>
          </View>

          <ProgressBar
            color={theme.primary}
            max={100}
            trackColor={theme.surfaceAlt}
            value={growthProgress.progressPercent}
          />

          <View style={styles.growthMetaRow}>
            <Text style={[typography.caption, { color: theme.textSecondary }]}>
              {t('home.stageProgress', {
                current: plant?.xp ?? 0,
                next: growthProgress.nextStageXp ?? (plant?.xp ?? 0),
              })}
            </Text>
            <Text style={[typography.caption, { color: theme.textSecondary }]}>
              {growthProgress.isMaxStage
                ? t('home.maxStageHint')
                : t('home.xpToStage', { xp: growthProgress.xpToNextStage, stage: nextStageLabel })}
            </Text>
          </View>

          <View style={styles.growthMetricGrid}>
            <GrowthMetric
              helper={hasSessionToday ? t('home.protectedToday') : t('home.protectToday')}
              label={t('home.typicalSession')}
              theme={theme}
              value={`+${growthForecast?.estimatedSessionXp ?? 20} XP`}
            />
            <GrowthMetric
              helper={
                growthProgress.isMaxStage
                  ? t('home.maxStageHint')
                  : t('home.xpToStage', { xp: growthProgress.xpToNextStage, stage: nextStageLabel })
              }
              label={t('home.nextGrowth')}
              theme={theme}
              value={
                growthProgress.isMaxStage
                  ? t('home.fullyGrown')
                  : t('home.growthPaceShort', { count: growthForecast?.sessionsToNextStage ?? 1 })
              }
            />
            <GrowthMetric
              helper={t('home.skipRiskHint')}
              label={t('home.skipRisk')}
              theme={theme}
              value={`${growthForecast?.healthIfSkipTwoDays ?? displayHealth}/${MAX_HEALTH}`}
            />
          </View>

          <View style={styles.stripHeader}>
            <Text style={[typography.caption, { color: theme.textSecondary }]}>{t('home.activity7d')}</Text>
            <Text style={[typography.caption, { color: theme.textSecondary }]}>
              {t('home.activeDays', { count: activeGrowthDays })}
            </Text>
          </View>
          <GrowthStrip compact items={last7Days} />
        </Card>

        <View style={styles.statsRow}>
          <StatTile icon="book-open" label={t('home.due')} theme={theme} value={dueCount} />
          <StatTile icon="layers" label={t('home.wordsLearned')} theme={theme} value={wordsLearned} />
          <StatTile icon="droplet" label={t('home.water')} theme={theme} value={plant?.totalWater ?? 0} />
        </View>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[typography.h3, { color: theme.text }]}>{t('home.todayPlan')}</Text>
              <Text style={[typography.caption, { color: theme.textSecondary }]}>
                {t('home.todayPlanHint')}
              </Text>
            </View>
            {weekendBonus ? (
              <View style={[styles.badge, { backgroundColor: theme.primaryLight }]}>
                <Text style={[typography.caption, { color: theme.primary }]}>{t('home.weekendBonus')}</Text>
              </View>
            ) : null}
          </View>

          <PlanRow
            helper={isRecoveryRecommended ? t('home.recoveryHint') : t('home.cardsReady', { count: dueCount })}
            icon="book-open"
            label={t('home.reviewQueue')}
            theme={theme}
            value={`${dueCount}`}
          />

          <PlanRow
            helper={challenge ? t(`challenges.${challenge.descKey}` as any) : t('home.noChallenge')}
            icon="target"
            label={challenge ? t(`challenges.${challenge.nameKey}` as any) : t('home.activeChallenge')}
            theme={theme}
            value={challenge ? t('home.bonusXp', { xp: challenge.bonusXp }) : '—'}
          />

          <View style={styles.planBlock}>
            <PlanRow
              helper={t('home.goalDone', {
                count: milestone?.sessionCount ?? 0,
                target: milestone?.target ?? 5,
              })}
              icon="award"
              label={t('home.weeklyMilestone')}
              theme={theme}
              value={weeklyProgress}
            />
            <ProgressBar
              color={milestone?.achieved ? theme.success : theme.primary}
              max={milestone?.target ?? 5}
              trackColor={theme.surfaceAlt}
              value={milestone?.sessionCount ?? 0}
            />
            {milestone?.achieved && milestone.skinUnlocked ? (
              <Text style={[typography.caption, { color: theme.success }]}>
                {t('home.unlocked', {
                  name: PLANT_SKINS.find((item) => item.id === milestone.skinUnlocked)?.name ?? milestone.skinUnlocked,
                })}
              </Text>
            ) : null}
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[typography.h3, { color: theme.text }]}>{t('home.dailyQuests')}</Text>
              <Text style={[typography.caption, { color: theme.textSecondary }]}>
                {t('home.questsDone', { done: completedQuests, total: quests.length })}
              </Text>
            </View>
          </View>
          <View style={styles.questList}>
            {quests.map((quest) => (
              <QuestRow
                done={quest.done}
                key={quest.id}
                label={t(`quests.${quest.id}` as any)}
                progress={quest.progress}
                target={quest.target}
                theme={theme}
              />
            ))}
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[typography.h3, { color: theme.text }]}>{t('home.progressSnapshot')}</Text>
              <Text style={[typography.caption, { color: theme.textSecondary }]}>
                {t('home.yourProgress')}
              </Text>
            </View>
          </View>
          <View style={styles.snapshotRow}>
            <SnapshotMetric icon="bar-chart-2" label={t('home.totalSessions')} theme={theme} value={String(totalSessions)} />
            <SnapshotMetric icon="layers" label={t('home.wordsLearned')} theme={theme} value={String(wordsLearned)} />
            <SnapshotMetric icon="clock" label={t('home.totalTime')} theme={theme} value={formatTime(totalTimeSec)} />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  )
}

function formatTime(totalSec: number): string {
  const hours = Math.floor(totalSec / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    gap: layout.sectionGap,
    paddingBottom: spacing.xxl,
    paddingHorizontal: layout.screenGutter,
  },
  heroCard: {
    gap: spacing.md,
  },
  heroTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  plantScene: {
    flexShrink: 0,
  },
  heroCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  statusChip: {
    alignItems: 'center',
    borderRadius: 999,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
  },
  heroTitle: {
    fontSize: fontSize.xl,
  },
  healthBlock: {
    gap: spacing.xs,
  },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressTrack: {
    borderRadius: 999,
    height: 10,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 999,
    height: '100%',
  },
  secondaryHeroButton: {
    marginTop: -spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statTile: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
  },
  statIconWrap: {
    alignItems: 'center',
    borderRadius: 999,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  centeredText: {
    textAlign: 'center',
  },
  sectionCard: {
    gap: spacing.md,
  },
  sectionHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 1,
  },
  growthStageRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stageBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
  },
  growthMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  growthMetricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  growthMetric: {
    borderRadius: 14,
    borderWidth: 1,
    flexBasis: '31%',
    flexGrow: 1,
    gap: spacing.xs,
    padding: spacing.sm + 2,
  },
  stripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  planRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  planIconWrap: {
    alignItems: 'center',
    borderRadius: 12,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  planCopy: {
    flex: 1,
    gap: spacing.xxs,
  },
  planValue: {
    textAlign: 'right',
  },
  planBlock: {
    gap: spacing.sm,
  },
  questList: {
    gap: spacing.md,
  },
  questRow: {
    gap: spacing.sm,
  },
  questCopy: {
    gap: spacing.xs,
  },
  questTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  snapshotRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  snapshotMetric: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
  },
  snapshotIconWrap: {
    alignItems: 'center',
    borderRadius: 12,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
})
