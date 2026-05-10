import { GrammarLesson, type GrammarResult } from '@/components/GrammarLesson'
import { ListeningLesson, type ListeningResult } from '@/components/ListeningLesson'
import { ReadingLesson, type ReadingResult } from '@/components/ReadingLesson'
import { SpeakingLesson, type SpeakingResult } from '@/components/SpeakingLesson'
import { AchievementPopup, Button, Card, Confetti, StepIndicator } from '@/components/ui'
import { spacing, typography } from '@/constants/Tokens'
import { getDueCards, getSetting, reviewCard, type SrsCardRecord } from '@/db'
import {
    getAchievementDef,
    PLANT_SKINS,
    type SkillType,
} from '@/gameplay'
import { useAudio } from '@/hooks/useAudio'
import { useHaptics } from '@/hooks/useHaptics'
import { cancelStreakRiskNotification } from '@/hooks/useNotifications'
import { maybeRequestReview } from '@/hooks/useReviewPrompt'
import { completeSession, type SessionSummaryData } from '@/services/session'
import { useTheme } from '@/hooks/useTheme'
import { buildGrowthProgress } from '@/utils/growth'
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

const MAX_WARMUP_CARDS = 5
const WARMUP_TIME_LIMIT_MS = 60_000
const RECOVERY_TIME_LIMIT_MS = 120_000

type Step = 'warmup' | 'focus' | 'listening' | 'speaking' | 'grammar' | 'reading' | 'summary'
type LessonResult = ListeningResult | SpeakingResult | GrammarResult | ReadingResult

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
  const [warmupScore, setWarmupScore] = useState({ correct: 0, hard: 0, wrong: 0, reviewed: 0 })
  const [saving, setSaving] = useState(false)
  const [summary, setSummary] = useState<SessionSummaryData | null>(null)
  const [achievementQueue, setAchievementQueue] = useState<string[]>([])
  const [activeSkinId, setActiveSkinId] = useState('classic')
  const startTime = useRef(Date.now())

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

  const celebrationScale = useSharedValue(0)
  const celebrationStyle = useAnimatedStyle(() => ({
    transform: [{ scale: celebrationScale.value }],
    opacity: celebrationScale.value,
  }))

  const STEP_NAMES = ['warmup', 'focus', 'lesson', 'summary'] as const
  const stepIndex = step === 'warmup' ? 0 : step === 'focus' ? 1 : (step === 'listening' || step === 'speaking' || step === 'grammar' || step === 'reading') ? 2 : 3
  const [showConfetti, setShowConfetti] = useState(false)

  const loadCards = useCallback(async () => {
    setLoading(true)
    const due = await getDueCards(MAX_WARMUP_CARDS)
    setCards(due)
    setLoading(false)
  }, [])

  useEffect(() => { loadCards() }, [loadCards])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const savedSkin = await getSetting('activeSkin')
      if (!cancelled && savedSkin) {
        setActiveSkinId(savedSkin)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const currentCard = cards[index]

  const warmupLimit = isRecovery ? RECOVERY_TIME_LIMIT_MS : WARMUP_TIME_LIMIT_MS
  const isTimedOut = () => Date.now() - startTime.current >= warmupLimit

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
    const nextWarmupScore = {
      correct: rating >= 3 ? warmupScore.correct + 1 : warmupScore.correct,
      hard: rating === 2 ? warmupScore.hard + 1 : warmupScore.hard,
      wrong: rating === 0 ? warmupScore.wrong + 1 : warmupScore.wrong,
      reviewed: warmupScore.reviewed + 1,
    }
    setWarmupScore(nextWarmupScore)
    setRevealed(false)
    flipProgress.value = withTiming(0, { duration: 200 })
    swipeX.value = 0
    const nextIdx = index + 1
    setIndex(nextIdx)
    if (nextIdx >= cards.length || isTimedOut()) {
      if (isRecovery) {
        void persistCompletedSession({
          skillType: 'vocabulary',
          correct: nextWarmupScore.correct,
          wrong: nextWarmupScore.wrong + nextWarmupScore.hard,
          reviewCount: nextWarmupScore.reviewed,
          durationSec: Math.round((Date.now() - startTime.current) / 1000),
        })
      } else {
        setStep('focus')
      }
    }
  }

  useEffect(() => {
    if (!loading && cards.length === 0) {
      if (isRecovery) {
        setStep('summary')
        setSummary({
          rewards: { xp: 0, nutrients: { water: 0, sun: 0, fertilizer: 0, roots: 0 } },
          oldStreak: 0,
          newStreak: 0,
          oldPlant: { level: 1, xp: 0, health: 100, stage: 'seed', totalWater: 0, totalSun: 0, totalFertilizer: 0, totalRoots: 0 },
          newPlant: { level: 1, xp: 0, health: 100, stage: 'seed', totalWater: 0, totalSun: 0, totalFertilizer: 0, totalRoots: 0 },
          correct: 0,
          wrong: 0,
          skinUnlocked: null,
        })
      } else {
        setStep('focus')
      }
    }
  }, [cards.length, isRecovery, loading])

  async function persistCompletedSession(input: {
    skillType: SkillType
    correct: number
    wrong: number
    reviewCount: number
    accuracy?: number
    difficulty?: LessonResult['difficulty']
    durationSec: number
  }) {
    if (saving) return
    setSaving(true)

    try {
      const { summary: nextSummary, newAchievements } = await completeSession({
        ...input,
        isRecovery,
      })

      await cancelStreakRiskNotification()

      setSummary(nextSummary)
      setStep('summary')
      play('complete')
      haptics.success()
      celebrationScale.value = withSequence(
        withTiming(0, { duration: 0 }),
        withSpring(1, { damping: 8, stiffness: 150 }),
      )

      const totalReviewed = nextSummary.correct + nextSummary.wrong
      if (totalReviewed > 0 && nextSummary.wrong === 0) {
        setShowConfetti(true)
      }

      if (newAchievements.length > 0) {
        setAchievementQueue(newAchievements)
      }

      if (newAchievements.length > 0 || nextSummary.newStreak >= 7) {
        void maybeRequestReview()
      }
    } finally {
      setSaving(false)
    }
  }

  function handleListeningComplete(result: ListeningResult) {
    void persistLessonResult('listening', result)
  }

  function handleSpeakingComplete(result: SpeakingResult) {
    void persistLessonResult('speaking', result)
  }

  function handleGrammarComplete(result: GrammarResult) {
    void persistLessonResult('grammar', result)
  }

  function handleReadingComplete(result: ReadingResult) {
    void persistLessonResult('reading', result)
  }

  async function persistLessonResult(skillType: SkillType, result: LessonResult) {
    await persistCompletedSession({
      skillType,
      correct: result.correct,
      wrong: result.wrong,
      reviewCount: warmupScore.reviewed,
      accuracy: result.accuracy,
      difficulty: result.difficulty,
      durationSec: result.durationSec,
    })
  }

  function restart() {
    setStep('warmup')
    setIndex(0)
    setRevealed(false)
    setWarmupScore({ correct: 0, hard: 0, wrong: 0, reviewed: 0 })
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

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
        <Text style={[typography.body, { color: theme.textSecondary }]}>{t('session.loadingCards')}</Text>
      </View>
    )
  }

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

  if (step === 'summary' && summary) {
    const r = summary.rewards
    const xpGained = summary.newPlant.xp - summary.oldPlant.xp
    const healthDelta = summary.newPlant.health - summary.oldPlant.health
    const leveledUp = summary.newPlant.level > summary.oldPlant.level
    const stageChanged = summary.newPlant.stage !== summary.oldPlant.stage
    const oldGrowth = buildGrowthProgress(summary.oldPlant.xp)
    const newGrowth = buildGrowthProgress(summary.newPlant.xp)
    const activeSkin = PLANT_SKINS.find((skin) => skin.id === activeSkinId) ?? PLANT_SKINS[0]
    const oldStageEmoji = activeSkin.emojis[summary.oldPlant.stage] ?? activeSkin.emojis.seed
    const newStageEmoji = activeSkin.emojis[summary.newPlant.stage] ?? activeSkin.emojis.seed
    const nextStageLabel = newGrowth.nextStage
      ? t(`stages.${newGrowth.nextStage}` as any)
      : t('session.fullyGrown')
    const summaryNarrative = stageChanged
      ? t('session.summaryNarrativeStage', {
          stage: t(`stages.${summary.newPlant.stage}` as any),
          xp: xpGained,
        })
      : t('session.summaryNarrativeProgress', {
          xp: xpGained,
          percent: Math.round(newGrowth.progressPercent),
        })

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
        <Text style={[typography.body, styles.summaryLead, { color: theme.textSecondary }]}>
          {summaryNarrative}
        </Text>

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
          <Text style={[typography.body, { color: theme.text, fontWeight: '600' }]}>{t('session.growthSnapshot')}</Text>
          <View style={styles.growthCompareRow}>
            <View style={[styles.growthCompareCard, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
              <Text style={[typography.caption, { color: theme.textSecondary }]}>{t('session.before')}</Text>
              <Text style={styles.compareEmoji}>{oldStageEmoji}</Text>
              <Text style={[typography.bodySmall, { color: theme.text }]}>{t(`stages.${summary.oldPlant.stage}` as any)}</Text>
              <Text style={[typography.caption, { color: theme.textSecondary }]}>{summary.oldPlant.xp} XP</Text>
            </View>
            <View style={[styles.growthCompareCard, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
              <Text style={[typography.caption, { color: theme.textSecondary }]}>{t('session.after')}</Text>
              <Text style={styles.compareEmoji}>{newStageEmoji}</Text>
              <Text style={[typography.bodySmall, { color: theme.text }]}>{t(`stages.${summary.newPlant.stage}` as any)}</Text>
              <Text style={[typography.caption, { color: theme.textSecondary }]}>{summary.newPlant.xp} XP</Text>
            </View>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>{t('session.totalXp')}</Text>
            <Text style={[typography.body, { color: theme.text }]}>{summary.newPlant.xp}</Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: theme.surfaceAlt }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: theme.primary,
                  width: `${Math.max(0, Math.min(100, newGrowth.progressPercent))}%`,
                },
              ]}
            />
          </View>
          <Text style={[typography.caption, { color: theme.textSecondary }]}>
            {newGrowth.isMaxStage
              ? t('session.fullyGrown')
              : t('session.xpToStageSummary', {
                  xp: newGrowth.xpToNextStage,
                  stage: nextStageLabel,
                })}
          </Text>
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
          <Text style={[typography.body, { color: theme.text, fontWeight: '600' }]}>{t('session.whatChanged')}</Text>
          <DeltaRow label={t('session.xpEarned')} theme={theme} value={`+${xpGained}`} valueColor={theme.primary} />
          <DeltaRow
            label={t('session.healthDelta')}
            theme={theme}
            value={`${healthDelta >= 0 ? '+' : ''}${healthDelta}`}
            valueColor={healthDelta >= 0 ? theme.success : theme.danger}
          />
          <DeltaRow
            label={t('session.growthProgress')}
            theme={theme}
            value={`${Math.round(oldGrowth.progressPercent)}% → ${Math.round(newGrowth.progressPercent)}%`}
          />
          <DeltaRow label={t('session.nutrientWater')} theme={theme} value={`+${r.nutrients.water}`} valueColor={theme.primary} />
          <DeltaRow label={t('session.nutrientSun')} theme={theme} value={`+${r.nutrients.sun}`} valueColor={theme.primary} />
          <DeltaRow label={t('session.nutrientFertilizer')} theme={theme} value={`+${r.nutrients.fertilizer}`} valueColor={theme.primary} />
          <DeltaRow label={t('session.nutrientRoots')} theme={theme} value={`+${r.nutrients.roots}`} valueColor={theme.primary} />
          <DeltaRow label={t('session.streakLabel')} theme={theme} value={`${summary.oldStreak} → ${summary.newStreak}`} valueColor={theme.accent} />
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

function DeltaRow({
  label,
  value,
  theme,
  valueColor,
}: {
  label: string
  value: string
  theme: ReturnType<typeof useTheme>
  valueColor?: string
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[typography.body, { color: valueColor ?? theme.text, fontWeight: '600' }]}>{value}</Text>
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
  summaryLead: {
    marginTop: spacing.xs,
    textAlign: 'center',
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
  growthCompareRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  growthCompareCard: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  compareEmoji: {
    fontSize: 36,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  actionButton: {
    marginTop: spacing.md,
    width: '100%',
  },
})
