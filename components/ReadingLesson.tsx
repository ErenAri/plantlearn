import { Button, Card, CountdownTimer } from '@/components/ui'
import { radius, spacing, typography } from '@/constants/Tokens'
import { READING_PROMPTS, type ReadingPrompt } from '@/content/readingPrompts'
import type { Difficulty } from '@/gameplay'
import { useAudio } from '@/hooks/useAudio'
import { useHaptics } from '@/hooks/useHaptics'
import { getAdaptiveDifficulty } from '@/services/adaptive'
import { useTheme } from '@/hooks/useTheme'
import {
  buildTimedAccuracyLessonResult,
  FIVE_QUESTION_DISTRIBUTION,
  pickQuestionsByDifficulty,
} from '@/utils/lessonUtils'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

const TIME_LIMIT_MS = 4 * 60 * 1000

export interface ReadingResult {
  correct: number
  wrong: number
  total: number
  accuracy: number
  durationSec: number
  difficulty: Difficulty
}

interface Props {
  onComplete: (result: ReadingResult) => void
}

export function ReadingLesson({ onComplete }: Props) {
  const theme = useTheme()
  const { t } = useTranslation()
  const { play } = useAudio()
  const haptics = useHaptics()

  const [questions, setQuestions] = useState<ReadingPrompt[]>(() =>
    pickQuestionsByDifficulty(READING_PROMPTS, FIVE_QUESTION_DISTRIBUTION),
  )
  const [index, setIndex] = useState(0)

  // Load adaptive difficulty
  useEffect(() => {
    getAdaptiveDifficulty('reading').then(dist => {
      setQuestions(pickQuestionsByDifficulty(READING_PROMPTS, dist))
    })
  }, [])
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState({ correct: 0, wrong: 0 })
  const [showFeedback, setShowFeedback] = useState(false)
  const startTime = useRef(Date.now())
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [remainingSec, setRemainingSec] = useState(Math.floor(TIME_LIMIT_MS / 1000))

  const current = questions[index]
  const isCorrect = selected === current?.correctIndex

  const finish = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    onComplete(
      buildTimedAccuracyLessonResult(
        score.correct,
        score.wrong,
        startTime.current,
        questions,
      ),
    )
  }, [score, questions, onComplete])

  useEffect(() => {
    timerRef.current = setTimeout(finish, TIME_LIMIT_MS)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [finish])

  useEffect(() => {
    const tick = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime.current) / 1000)
      const remaining = Math.max(0, Math.floor(TIME_LIMIT_MS / 1000) - elapsed)
      setRemainingSec(remaining)
    }, 1000)
    return () => clearInterval(tick)
  }, [])

  function handleSelect(choiceIdx: number) {
    if (showFeedback) return
    setSelected(choiceIdx)
    setShowFeedback(true)
    const correct = choiceIdx === current.correctIndex
    if (correct) {
      haptics.success()
      play('correct')
    } else {
      haptics.error()
      play('wrong')
    }
    setScore(s => ({
      correct: s.correct + (correct ? 1 : 0),
      wrong: s.wrong + (correct ? 0 : 1),
    }))
  }

  function handleNext() {
    setSelected(null)
    setShowFeedback(false)
    const nextIdx = index + 1
    if (nextIdx >= questions.length) {
      if (timerRef.current) clearTimeout(timerRef.current)
      onComplete(
        buildTimedAccuracyLessonResult(
          score.correct,
          score.wrong,
          startTime.current,
          questions,
        ),
      )
    } else {
      setIndex(nextIdx)
    }
  }

  if (!current) return null

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <Text style={[typography.caption, { color: theme.textSecondary, flex: 1 }]}>
          {t('reading.progress', { current: index + 1, total: questions.length })}
        </Text>
        <CountdownTimer totalSeconds={Math.floor(TIME_LIMIT_MS / 1000)} remainingSeconds={remainingSec} />
      </View>

      <Card style={styles.passageCard}>
        <Text style={[typography.bodySmall, { color: theme.accent, fontWeight: '600', marginBottom: spacing.xs }]}>
          {current.title}
        </Text>
        <Text style={[typography.body, { color: theme.text, lineHeight: 24 }]}>
          {current.passage}
        </Text>
      </Card>

      <Text style={[typography.h3, { color: theme.text, textAlign: 'center', marginBottom: spacing.md }]}>
        {current.question}
      </Text>

      {current.choices.map((choice, i) => {
        let bg = theme.surface
        let borderColor = theme.border
        if (showFeedback) {
          if (i === current.correctIndex) {
            bg = '#dcfce7'
            borderColor = '#22c55e'
          } else if (i === selected && !isCorrect) {
            bg = '#fee2e2'
            borderColor = '#ef4444'
          }
        }

        return (
          <Pressable
            key={i}
            onPress={() => handleSelect(i)}
            disabled={showFeedback}
            style={[
              styles.choiceBtn,
              { backgroundColor: bg, borderColor },
              showFeedback && styles.choiceDisabled,
            ]}
          >
            <Text style={[typography.body, { color: theme.text }]}>{choice}</Text>
          </Pressable>
        )
      })}

      {showFeedback && (
        <View style={styles.feedbackRow}>
          <Text style={[typography.body, { color: isCorrect ? '#22c55e' : '#ef4444', fontWeight: '600' }]}>
            {isCorrect ? t('reading.correctFeedback') : t('reading.wrongFeedback')}
          </Text>
          <Button title={t('reading.next')} onPress={handleNext} style={{ marginTop: spacing.sm }} />
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.xxl,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  passageCard: {
    marginBottom: spacing.lg,
  },
  choiceBtn: {
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  choiceDisabled: {
    opacity: 0.9,
  },
  feedbackRow: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
})
