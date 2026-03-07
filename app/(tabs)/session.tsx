import { ListeningLesson, type ListeningResult } from '@/components/ListeningLesson'
import { SpeakingLesson, type SpeakingResult } from '@/components/SpeakingLesson'
import { Button, Card } from '@/components/ui'
import { spacing, typography } from '@/constants/Tokens'
import type { SrsCardRecord } from '@/db'
import {
    getActivePlant,
    getDueCards,
    getSkinUnlockedForWeek,
    getStreak,
    getUnlockedSkins,
    getWeekSessionCount,
    incrementQuestProgress,
    logSession,
    reviewCard,
    unlockSkin,
    updateStreak,
    upsertPlantProgress,
} from '@/db'
import { getDevNowIso, getDevTodayKey } from '@/dev/clock'
import {
    applyRewardsToPlant,
    applyStreakUpdate,
    computeSessionRewards,
    isoWeekBounds,
    MAX_HEALTH,
    nextUnlockableSkin,
    PLANT_SKINS,
    RECOVERY_HEALTH_RESTORE,
    weekKeyFromDate,
    WEEKLY_MILESTONE_TARGET,
    type Difficulty,
    type PlantState,
    type SessionRewards,
    type SkillType,
    type StreakState,
} from '@/gameplay'
import { cancelStreakRiskNotification } from '@/hooks/useNotifications'
import { useTheme } from '@/hooks/useTheme'
import { useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

/* ── constants ─────────────────────────────── */
const MAX_WARMUP_CARDS = 5
const WARMUP_TIME_LIMIT_MS = 60_000
const RECOVERY_TIME_LIMIT_MS = 120_000

type Step = 'warmup' | 'focus' | 'listening' | 'speaking' | 'summary'

interface SummaryData {
  rewards: SessionRewards
  oldStreak: number
  newStreak: number
  oldPlant: PlantState
  newPlant: PlantState
  correct: number
  wrong: number
  skinUnlocked: string | null
}

/* ── main screen ───────────────────────────── */
export default function SessionScreen() {
  const theme = useTheme()
  const params = useLocalSearchParams<{ recovery?: string }>()
  const isRecovery = params.recovery === '1'
  const { t } = useTranslation()

  const [step, setStep] = useState<Step>('warmup')
  const [cards, setCards] = useState<SrsCardRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState({ correct: 0, wrong: 0 })
  const [saving, setSaving] = useState(false)
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const startTime = useRef(Date.now())

  /* load due cards once on mount */
  const loadCards = useCallback(async () => {
    setLoading(true)
    const due = await getDueCards(MAX_WARMUP_CARDS)
    setCards(due)
    setLoading(false)
  }, [])

  useEffect(() => { loadCards() }, [loadCards])

  const currentCard = cards[index]
  const warmupDone = index >= cards.length

  /* check time limit */
  const warmupLimit = isRecovery ? RECOVERY_TIME_LIMIT_MS : WARMUP_TIME_LIMIT_MS
  const isTimedOut = () => Date.now() - startTime.current >= warmupLimit

  /* ── SRS rating handlers ─────────────────── */
  async function handleRate(rating: 0 | 2 | 3 | 5) {
    if (!currentCard) return
    await reviewCard(currentCard.id, rating)
    setScore(s => ({
      correct: rating >= 3 ? s.correct + 1 : s.correct,
      wrong: rating < 2 ? s.wrong + 1 : s.wrong,
    }))
    setRevealed(false)
    const nextIdx = index + 1
    setIndex(nextIdx)
    if (nextIdx >= cards.length || isTimedOut()) {
      if (isRecovery) {
        void finishSession('vocabulary')
      } else {
        setStep('focus')
      }
    }
  }

  /* ── skip warmup if no cards ─────────────── */
  useEffect(() => {
    if (!loading && cards.length === 0) {
      if (isRecovery) {
        void finishSession('vocabulary')
      } else {
        setStep('focus')
      }
    }
  }, [loading, cards.length])

  /* ── finish & persist ────────────────────── */
  function handleListeningComplete(result: ListeningResult) {
    setScore({ correct: result.correct, wrong: result.wrong })
    void finishSession('listening', result.accuracy, result.difficulty, result.durationSec)
  }

  function handleSpeakingComplete(result: SpeakingResult) {
    setScore({ correct: result.correct, wrong: result.wrong })
    void finishSession('speaking', result.accuracy, result.difficulty, result.durationSec)
  }

  async function finishSession(skillType: SkillType, overrideAccuracy?: number, overrideDifficulty?: Difficulty, overrideDuration?: number) {
    if (saving) return
    setSaving(true)

    const reviewed = score.correct + score.wrong
    const accuracy = overrideAccuracy ?? (reviewed === 0 ? 1 : score.correct / reviewed)
    const durationSec = overrideDuration ?? Math.round((Date.now() - startTime.current) / 1000)

    const rewards = computeSessionRewards({
      skillType,
      difficulty: overrideDifficulty ?? 'medium',
      accuracy,
      durationSec,
    })

    const now = getDevNowIso()
    const todayKey = getDevTodayKey()
    const streakRow = await getStreak()
    const oldStreakState: StreakState = { currentStreak: streakRow.currentStreak, lastSessionDate: streakRow.lastSessionDate }

    const plantRow = await getActivePlant()
    const oldPlant: PlantState = plantRow
      ? { level: plantRow.level, xp: plantRow.xp, health: plantRow.health, stage: plantRow.stage, totalWater: plantRow.totalWater, totalSun: plantRow.totalSun, totalFertilizer: plantRow.totalFertilizer, totalRoots: plantRow.totalRoots }
      : { level: 1, xp: 0, health: 100, stage: 'seed', totalWater: 0, totalSun: 0, totalFertilizer: 0, totalRoots: 0 }

    let newPlant = applyRewardsToPlant(oldPlant, rewards, oldStreakState, now)

    if (isRecovery) {
      newPlant = { ...newPlant, health: Math.min(MAX_HEALTH, newPlant.health + RECOVERY_HEALTH_RESTORE) }
    }

    const newStreakState = applyStreakUpdate(oldStreakState, now)

    await logSession({
      date: now,
      durationSec,
      accuracy,
      xpEarned: rewards.xp,
      nutrientsJson: JSON.stringify(rewards.nutrients),
    })

    await upsertPlantProgress({
      xp: newPlant.xp,
      level: newPlant.level,
      health: newPlant.health,
      stage: newPlant.stage,
      totalWater: newPlant.totalWater,
      totalSun: newPlant.totalSun,
      totalFertilizer: newPlant.totalFertilizer,
      totalRoots: newPlant.totalRoots,
    })

    await updateStreak(now)

    const cardsReviewed = score.correct + score.wrong
    if (cardsReviewed > 0) {
      await incrementQuestProgress(todayKey, 'review_5', cardsReviewed)
    }
    if (skillType === 'listening') {
      await incrementQuestProgress(todayKey, 'listening_1', 1)
    }
    if (skillType === 'speaking') {
      await incrementQuestProgress(todayKey, 'speaking_1', 1)
    }

    let skinUnlocked: string | null = null
    const { monday, sunday } = isoWeekBounds(todayKey)
    const weekKey = weekKeyFromDate(todayKey)
    const weekSessions = await getWeekSessionCount(monday, sunday)
    if (weekSessions >= WEEKLY_MILESTONE_TARGET) {
      const existing = await getSkinUnlockedForWeek(weekKey)
      if (!existing) {
        const unlockedIds = await getUnlockedSkins()
        const next = nextUnlockableSkin(unlockedIds)
        if (next) {
          await unlockSkin(next, weekKey)
          skinUnlocked = next
        }
      }
    }

    cancelStreakRiskNotification()

    setSummary({
      rewards,
      oldStreak: oldStreakState.currentStreak,
      newStreak: newStreakState.currentStreak,
      oldPlant,
      newPlant,
      correct: score.correct,
      wrong: score.wrong,
      skinUnlocked,
    })
    setSaving(false)
    setStep('summary')
  }

  function restart() {
    setStep('warmup')
    setIndex(0)
    setRevealed(false)
    setScore({ correct: 0, wrong: 0 })
    setSummary(null)
    setSaving(false)
    startTime.current = Date.now()
    loadCards()
  }

  /* ── loading state ───────────────────────── */
  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
        <Text style={[typography.body, { color: theme.textSecondary }]}>{t('session.loadingCards')}</Text>
      </View>
    )
  }

  /* ── STEP 1: SRS Warmup ──────────────────── */
  if (step === 'warmup') {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[typography.caption, styles.progress, { color: theme.textSecondary }]}>
          {t('session.progress', { step: isRecovery ? t('session.recovery') : t('session.warmup'), current: index + 1, total: cards.length })}
        </Text>

        <Card style={styles.flashcard}>
          <Text style={[typography.h1, { color: theme.text, textAlign: 'center' }]}>
            {currentCard?.word}
          </Text>
          {revealed && (
            <Text style={[typography.h3, { color: theme.primary, textAlign: 'center', marginTop: spacing.md }]}>
              {currentCard?.meaning}
            </Text>
          )}
        </Card>

        {!revealed ? (
          <Button title={t('session.revealAnswer')} onPress={() => setRevealed(true)} />
        ) : (
          <View style={styles.ratingRow}>
            <Button title={t('session.again')} variant="secondary" onPress={() => void handleRate(0)} style={styles.ratingBtn} />
            <Button title={t('session.hard')} variant="secondary" onPress={() => void handleRate(2)} style={styles.ratingBtn} />
            <Button title={t('session.good')} onPress={() => void handleRate(3)} style={styles.ratingBtn} />
            <Button title={t('session.easy')} onPress={() => void handleRate(5)} style={styles.ratingBtn} />
          </View>
        )}
      </View>
    )
  }

  /* ── STEP 2: Focus Chooser ───────────────── */
  if (step === 'focus') {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ fontSize: 48 }}>🎯</Text>
        <Text style={[typography.h2, { color: theme.text, marginTop: spacing.md }]}>{t('session.chooseFocus')}</Text>
        <Text style={[typography.bodySmall, { color: theme.textSecondary, marginTop: spacing.xs, textAlign: 'center' }]}>
          {t('session.pickSkill')}
        </Text>
        <Button
          title={t('session.listening')}
          onPress={() => setStep('listening')}
          disabled={saving}
          style={styles.focusButton}
        />
        <Button
          title={t('session.speaking')}
          variant="secondary"
          onPress={() => setStep('speaking')}
          disabled={saving}
          style={styles.focusButton}
        />
      </View>
    )
  }

  if (step === 'listening') {
    return <ListeningLesson onComplete={handleListeningComplete} />
  }

  if (step === 'speaking') {
    return <SpeakingLesson onComplete={handleSpeakingComplete} />
  }

  /* ── STEP 3: Summary ─────────────────────── */
  if (step === 'summary' && summary) {
    const r = summary.rewards
    const xpGained = summary.newPlant.xp - summary.oldPlant.xp
    const leveledUp = summary.newPlant.level > summary.oldPlant.level
    const stageChanged = summary.newPlant.stage !== summary.oldPlant.stage

    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={[styles.center, styles.summaryContent]}>
        <Text style={{ fontSize: 64 }}>🎉</Text>
        <Text style={[typography.h2, { color: theme.text, marginTop: spacing.md }]}>{t('session.sessionComplete')}</Text>

        <Card style={styles.summaryCard}>
          <Text style={[typography.body, { color: theme.text, fontWeight: '600' }]}>{t('session.results')}</Text>
          <View style={styles.summaryRow}>
            <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>{t('session.correct')}</Text>
            <Text style={[typography.body, { color: theme.primary }]}>{summary.correct}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>{t('session.wrong')}</Text>
            <Text style={[typography.body, { color: theme.danger }]}>{summary.wrong}</Text>
          </View>
        </Card>

        <Card style={styles.summaryCard}>
          <Text style={[typography.body, { color: theme.text, fontWeight: '600' }]}>{t('session.xpAndGrowth')}</Text>
          <View style={styles.summaryRow}>
            <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>{t('session.xpEarned')}</Text>
            <Text style={[typography.body, { color: theme.primary }]}>+{xpGained}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>{t('session.totalXp')}</Text>
            <Text style={[typography.body, { color: theme.text }]}>{summary.newPlant.xp}</Text>
          </View>
          {leveledUp && (
            <Text style={[typography.body, { color: theme.accent, textAlign: 'center', marginTop: spacing.xs }]}>
              {t('session.levelUp', { old: summary.oldPlant.level, new: summary.newPlant.level })}
            </Text>
          )}
          {stageChanged && (
            <Text style={[typography.body, { color: theme.accent, textAlign: 'center', marginTop: spacing.xs }]}>
              {t('session.stageChange', { old: t(`stages.${summary.oldPlant.stage}` as any), new: t(`stages.${summary.newPlant.stage}` as any) })}
            </Text>
          )}
        </Card>

        <Card style={styles.summaryCard}>
          <Text style={[typography.body, { color: theme.text, fontWeight: '600' }]}>{t('session.nutrientsEarned')}</Text>
          <View style={styles.nutrientsGrid}>
            <NutrientPill emoji="💧" label={t('session.nutrientWater')} value={r.nutrients.water} theme={theme} />
            <NutrientPill emoji="☀️" label={t('session.nutrientSun')} value={r.nutrients.sun} theme={theme} />
            <NutrientPill emoji="🧪" label={t('session.nutrientFertilizer')} value={r.nutrients.fertilizer} theme={theme} />
            <NutrientPill emoji="🌳" label={t('session.nutrientRoots')} value={r.nutrients.roots} theme={theme} />
          </View>
        </Card>

        <Card style={styles.summaryCard}>
          <Text style={[typography.body, { color: theme.text, fontWeight: '600' }]}>{t('session.streakLabel')}</Text>
          <View style={styles.summaryRow}>
            <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>{t('session.streakLabel')}</Text>
            <Text style={[typography.body, { color: theme.accent }]}>
              🔥 {summary.oldStreak} → {summary.newStreak}
            </Text>
          </View>
        </Card>

        {summary.skinUnlocked && (
          <Card style={styles.summaryCard}>
            <Text style={[typography.body, { color: theme.accent, fontWeight: '600', textAlign: 'center' }]}>
              {t('session.newSkinUnlocked')}
            </Text>
            <Text style={[typography.bodySmall, { color: theme.text, textAlign: 'center' }]}>
              {PLANT_SKINS.find(s => s.id === summary.skinUnlocked)?.name ?? summary.skinUnlocked}
            </Text>
          </Card>
        )}

        <Button title={t('session.practiceAgain')} onPress={restart} style={styles.actionButton} />
      </ScrollView>
    )
  }

  return null
}

function NutrientPill({ emoji, label, value, theme }: { emoji: string; label: string; value: number; theme: ReturnType<typeof useTheme> }) {
  return (
    <View style={styles.nutrientPill}>
      <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>{emoji} {label}</Text>
      <Text style={[typography.body, { color: theme.primary, fontWeight: '600' }]}>+{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xxl,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryContent: {
    paddingBottom: spacing.xxl,
  },
  progress: {
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  flashcard: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  ratingBtn: {
    flex: 1,
  },
  focusButton: {
    marginTop: spacing.md,
    width: '100%',
  },
  summaryCard: {
    marginTop: spacing.md,
    width: '100%',
    gap: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nutrientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  nutrientPill: {
    alignItems: 'center',
    gap: spacing.xs,
    minWidth: 70,
  },
  actionButton: {
    marginTop: spacing.md,
    width: '100%',
  },
})
