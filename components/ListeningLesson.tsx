import { Button, Card, CountdownTimer } from '@/components/ui'
import { radius, spacing, typography } from '@/constants/Tokens'
import { LISTENING_PROMPTS, type ListeningPrompt } from '@/content/listeningPrompts'
import type { Difficulty } from '@/gameplay'
import { useAudio } from '@/hooks/useAudio'
import { useHaptics } from '@/hooks/useHaptics'
import { getAdaptiveDifficulty } from '@/services/adaptive'
import { useTheme } from '@/hooks/useTheme'
import { useTts } from '@/hooks/useTts'
import {
  buildTimedAccuracyLessonResult,
  FIVE_QUESTION_DISTRIBUTION,
  pickQuestionsByDifficulty,
} from '@/utils/lessonUtils'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, View } from 'react-native'

const TIME_LIMIT_MS = 3 * 60 * 1000

export interface ListeningResult {
  correct: number
  wrong: number
  total: number
  accuracy: number
  durationSec: number
  difficulty: Difficulty
}

interface Props {
  onComplete: (result: ListeningResult) => void
}

export function ListeningLesson({ onComplete }: Props) {
  const theme = useTheme()
  const { speak, replay, stop, speaking } = useTts()
  const { t } = useTranslation()
  const { play } = useAudio()
  const haptics = useHaptics()

  const [questions, setQuestions] = useState<ListeningPrompt[]>(() =>
    pickQuestionsByDifficulty(LISTENING_PROMPTS, FIVE_QUESTION_DISTRIBUTION),
  )
  const [index, setIndex] = useState(0)

  // Load adaptive difficulty
  useEffect(() => {
    getAdaptiveDifficulty('listening').then(dist => {
      setQuestions(pickQuestionsByDifficulty(LISTENING_PROMPTS, dist))
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
    stop()
    if (timerRef.current) clearTimeout(timerRef.current)
    onComplete(
      buildTimedAccuracyLessonResult(
        score.correct,
        score.wrong,
        startTime.current,
        questions,
      ),
    )
  }, [stop, score, questions, onComplete])

  useEffect(() => {
    timerRef.current = setTimeout(finish, TIME_LIMIT_MS)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [finish])

  // Countdown tick
  useEffect(() => {
    const tick = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime.current) / 1000)
      const remaining = Math.max(0, Math.floor(TIME_LIMIT_MS / 1000) - elapsed)
      setRemainingSec(remaining)
    }, 1000)
    return () => clearInterval(tick)
  }, [])

  useEffect(() => {
    if (current) {
      speak(current.audioText, current.audioLang)
    }
  }, [index, current, speak])

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
      stop()
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.topRow}>
        <Text style={[typography.caption, { color: theme.textSecondary, flex: 1 }]}>
          {t('listening.progress', { current: index + 1, total: questions.length })}
        </Text>
        <CountdownTimer totalSeconds={Math.floor(TIME_LIMIT_MS / 1000)} remainingSeconds={remainingSec} />
      </View>

      <Card style={styles.audioCard}>
        <Text style={{ fontSize: 48, textAlign: 'center' }}>🔊</Text>
        <Text style={[typography.body, { color: theme.textSecondary, textAlign: 'center', marginTop: spacing.sm }]}>
          {speaking ? t('listening.playing') : t('listening.tapReplay')}
        </Text>
        <Button
          title={t('listening.replay')}
          variant="ghost"
          onPress={() => replay(current.audioLang)}
          style={{ marginTop: spacing.sm }}
        />
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
            {isCorrect ? t('listening.correctFeedback') : t('listening.wrongFeedback')}
          </Text>
          <Button title={t('listening.next')} onPress={handleNext} style={{ marginTop: spacing.sm }} />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xxl,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  progress: {
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  audioCard: {
    alignItems: 'center',
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
