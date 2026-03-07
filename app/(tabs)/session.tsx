import { GrammarLesson, type GrammarResult } from '@/components/GrammarLesson'
import { ListeningLesson, type ListeningResult } from '@/components/ListeningLesson'
import { ReadingLesson, type ReadingResult } from '@/components/ReadingLesson'
import { SpeakingLesson, type SpeakingResult } from '@/components/SpeakingLesson'
import { AchievementPopup, Button, Card, Confetti, StepIndicator } from '@/components/ui'
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
    checkAndUnlockAchievements,
    computeSessionRewards,
    getAchievementDef,
    getTodayXpMultiplier,
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
import { useAudio } from '@/hooks/useAudio'
import { useHaptics } from '@/hooks/useHaptics'
import { cancelStreakRiskNotification } from '@/hooks/useNotifications'
import { maybeRequestReview } from '@/hooks/useReviewPrompt'
import { useTheme } from '@/hooks/useTheme'
import { useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated'

/* ── constants ─────────────────────────────── */
const MAX_WARMUP_CARDS = 5
const WARMUP_TIME_LIMIT_MS = 60_000
const RECOVERY_TIME_LIMIT_MS = 120_000

type Step = 'warmup' | 'focus' | 'listening' | 'speaking' | 'grammar' | 'reading' | 'summary'

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
  const { play } = useAudio()
  const haptics = useHaptics()

  const [step, setStep] = useState<Step>('warmup')
  const [cards, setCards] = useState<SrsCardRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState({ correct: 0, wrong: 0 })
  const [saving, setSaving] = useState(false)
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [achievementQueue, setAchievementQueue] = useState<string[]>([])
  const startTime = useRef(Date.now())

  // Card flip animation
  const flipProgress = useSharedValue(0)
  const swipeX = useSharedValue(0)
  const cardFlipStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 800 },
      { rotateY: `${flipProgress.value * 180}deg` },
      { translateX: swipeX.value },
      { rotate: `${swipeX.value * 0.05}deg` },
    ],
    backfaceVisibility: 'hidden',
  }))
  const cardBackStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 800 },
      { rotateY: `${(flipProgress.value * 180) + 180}deg` },
      { translateX: swipeX.value },
      { rotate: `${swipeX.value * 0.05}deg` },
    ],
    backfaceVisibility: 'hidden',
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  }))

  // Summary celebration
  const celebrationScale = useSharedValue(0)
  const celebrationStyle = useAnimatedStyle(() => ({
    transform: [{ scale: celebrationScale.value }],
    opacity: celebrationScale.value,
  }))

  // Step indicator
  const STEP_NAMES = ['warmup', 'focus', 'lesson', 'summary'] as const
  const stepIndex = step === 'warmup' ? 0 : step === 'focus' ? 1 : (step === 'listening' || step === 'speaking' || step === 'grammar' || step === 'reading') ? 2 : 3
  const [showConfetti, setShowConfetti] = useState(false)

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
    if (rating >= 3) {
      haptics.success()
      play('correct')
    } else {
      haptics.warning()
      play('wrong')
    }
    setScore(s => ({
      correct: rating >= 3 ? s.correct + 1 : s.correct,
      wrong: rating < 2 ? s.wrong + 1 : s.wrong,
    }))
    setRevealed(false)
    flipProgress.value = withTiming(0, { duration: 200 })
    swipeX.value = 0
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

  function handleGrammarComplete(result: GrammarResult) {
    setScore({ correct: result.correct, wrong: result.wrong })
    void finishSession('grammar', result.accuracy, result.difficulty, result.durationSec)
  }

  function handleReadingComplete(result: ReadingResult) {
    setScore({ correct: result.correct, wrong: result.wrong })
    void finishSession('reading', result.accuracy, result.difficulty, result.durationSec)
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

    // Apply weekend double XP
    const xpMult = getTodayXpMultiplier()
    if (xpMult > 1) {
      rewards.xp = Math.round(rewards.xp * xpMult)
    }

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
      skillType,
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
    if (skillType === 'grammar') {
      await incrementQuestProgress(todayKey, 'grammar_1', 1)
    }
    if (skillType === 'reading') {
      await incrementQuestProgress(todayKey, 'reading_1', 1)
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
    play('complete')
    haptics.success()
    celebrationScale.value = withSequence(
      withTiming(0, { duration: 0 }),
      withSpring(1, { damping: 8, stiffness: 150 }),
    )
    // Confetti on perfect score
    const totalReviewed = score.correct + score.wrong
    if (totalReviewed > 0 && score.wrong === 0) {
      setShowConfetti(true)
    }

    // Check achievements
    const newAchievements = await checkAndUnlockAchievements()
    if (newAchievements.length > 0) {
      setAchievementQueue(newAchievements)
    }

    // Prompt for review on positive milestones
    if (newAchievements.length > 0 || newStreakState.currentStreak >= 7) {
      maybeRequestReview()
    }
  }

  function restart() {
    setStep('warmup')
    setIndex(0)
    setRevealed(false)
    setScore({ correct: 0, wrong: 0 })
    setSummary(null)
    setSaving(false)
    startTime.current = Date.now()
    flipProgress.value = 0
    swipeX.value = 0
    celebrationScale.value = 0
    setShowConfetti(false)
    setAchievementQueue([])
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
        <StepIndicator steps={[...STEP_NAMES]} currentIndex={stepIndex} />
        <Text style={[typography.caption, styles.progress, { color: theme.textSecondary }]}>
          {t('session.progress', { step: isRecovery ? t('session.recovery') : t('session.warmup'), current: index + 1, total: cards.length })}
        </Text>

        <View style={{ position: 'relative', minHeight: 200, marginBottom: spacing.lg }}>
          <GestureDetector gesture={
            Gesture.Pan()
              .enabled(revealed)
              .onUpdate((e) => { swipeX.value = e.translationX })
              .onEnd((e) => {
                if (e.translationX < -80) {
                  swipeX.value = withTiming(-300, { duration: 200 })
                  runOnJS(handleRate)(0)
                } else if (e.translationX > 80) {
                  swipeX.value = withTiming(300, { duration: 200 })
                  runOnJS(handleRate)(3)
                } else {
                  swipeX.value = withSpring(0)
                }
              })
          }>
          <Animated.View style={[cardFlipStyle]}>
            <Card style={styles.flashcard}>
              <Text style={[typography.h1, { color: theme.text, textAlign: 'center' }]}>
                {currentCard?.word}
              </Text>
            </Card>
          </Animated.View>
          </GestureDetector>
          <Animated.View style={[cardBackStyle]}>
            <Card style={styles.flashcard}>
              <Text style={[typography.h1, { color: theme.text, textAlign: 'center' }]}>
                {currentCard?.word}
              </Text>
              <Text style={[typography.h3, { color: theme.primary, textAlign: 'center', marginTop: spacing.md }]}>
                {currentCard?.meaning}
              </Text>
            </Card>
          </Animated.View>
        </View>

        {!revealed ? (
          <Button title={t('session.revealAnswer')} onPress={() => {
            setRevealed(true)
            flipProgress.value = withSpring(1, { damping: 12, stiffness: 200 })
          }} />
        ) : (
          <>
            <Text style={[typography.caption, { color: theme.textSecondary, textAlign: 'center', marginBottom: spacing.sm }]}>
              {t('session.swipeHint')}
            </Text>
            <View style={styles.ratingRow}>
            <Button title={t('session.again')} variant="secondary" onPress={() => void handleRate(0)} style={styles.ratingBtn} />
            <Button title={t('session.hard')} variant="secondary" onPress={() => void handleRate(2)} style={styles.ratingBtn} />
            <Button title={t('session.good')} onPress={() => void handleRate(3)} style={styles.ratingBtn} />
            <Button title={t('session.easy')} onPress={() => void handleRate(5)} style={styles.ratingBtn} />
          </View>
          </>
        )}
      </View>
    )
  }

  /* ── STEP 2: Focus Chooser ───────────────── */
  if (step === 'focus') {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
        <StepIndicator steps={[...STEP_NAMES]} currentIndex={stepIndex} />
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
        <Button
          title={t('session.grammar')}
          variant="secondary"
          onPress={() => setStep('grammar')}
          disabled={saving}
          style={styles.focusButton}
        />
        <Button
          title={t('session.reading')}
          variant="secondary"
          onPress={() => setStep('reading')}
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

  if (step === 'grammar') {
    return <GrammarLesson onComplete={handleGrammarComplete} />
  }

  if (step === 'reading') {
    return <ReadingLesson onComplete={handleReadingComplete} />
  }

  /* ── STEP 3: Summary ─────────────────────── */
  if (step === 'summary' && summary) {
    const r = summary.rewards
    const xpGained = summary.newPlant.xp - summary.oldPlant.xp
    const leveledUp = summary.newPlant.level > summary.oldPlant.level
    const stageChanged = summary.newPlant.stage !== summary.oldPlant.stage

    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={[styles.center, styles.summaryContent]}>
        <Confetti active={showConfetti} />
        {achievementQueue.length > 0 && (() => {
          const defId = achievementQueue[0]
          const def = getAchievementDef(defId)
          if (!def) return null
          return (
            <AchievementPopup
              achievementId={def.id}
              icon={def.icon}
              tier={def.tier}
              onDismiss={() => setAchievementQueue(q => q.slice(1))}
            />
          )
        })()}
        <StepIndicator steps={[...STEP_NAMES]} currentIndex={stepIndex} />
        <Animated.View style={celebrationStyle}>
          <Text style={{ fontSize: 64 }}>🎉</Text>
        </Animated.View>
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
