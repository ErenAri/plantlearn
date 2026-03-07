import { useState, useRef, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useTheme } from '@/hooks/useTheme'
import { useTts } from '@/hooks/useTts'
import { Card, Button } from '@/components/ui'
import { spacing, typography, radius } from '@/constants/Tokens'
import { LISTENING_PROMPTS, type ListeningPrompt } from '@/content/listeningPrompts'
import type { Difficulty } from '@/gameplay'

const MAX_QUESTIONS = 5
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

function pickQuestions(): ListeningPrompt[] {
  const easy = LISTENING_PROMPTS.filter(p => p.difficulty === 'easy')
  const medium = LISTENING_PROMPTS.filter(p => p.difficulty === 'medium')
  const hard = LISTENING_PROMPTS.filter(p => p.difficulty === 'hard')

  const pool = [
    ...shuffle(easy).slice(0, 2),
    ...shuffle(medium).slice(0, 2),
    ...shuffle(hard).slice(0, 1),
  ]
  return shuffle(pool)
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function avgDifficulty(prompts: ListeningPrompt[]): Difficulty {
  const scores = prompts.map(p => p.difficulty === 'easy' ? 1 : p.difficulty === 'medium' ? 2 : 3)
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  if (avg < 1.5) return 'easy'
  if (avg < 2.5) return 'medium'
  return 'hard'
}

export function ListeningLesson({ onComplete }: Props) {
  const theme = useTheme()
  const { speak, replay, stop, speaking } = useTts()

  const [questions] = useState(() => pickQuestions())
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState({ correct: 0, wrong: 0 })
  const [showFeedback, setShowFeedback] = useState(false)
  const startTime = useRef(Date.now())
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const current = questions[index]
  const isCorrect = selected === current?.correctIndex

  const finish = useCallback(() => {
    stop()
    if (timerRef.current) clearTimeout(timerRef.current)
    const durationSec = Math.round((Date.now() - startTime.current) / 1000)
    const total = score.correct + score.wrong
    onComplete({
      correct: score.correct,
      wrong: score.wrong,
      total,
      accuracy: total === 0 ? 0 : score.correct / total,
      durationSec,
      difficulty: avgDifficulty(questions),
    })
  }, [stop, score, questions, onComplete])

  useEffect(() => {
    timerRef.current = setTimeout(finish, TIME_LIMIT_MS)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [finish])

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
      const durationSec = Math.round((Date.now() - startTime.current) / 1000)
      const c = score.correct
      const w = score.wrong
      const total = c + w
      stop()
      if (timerRef.current) clearTimeout(timerRef.current)
      onComplete({
        correct: c,
        wrong: w,
        total,
        accuracy: total === 0 ? 0 : c / total,
        durationSec,
        difficulty: avgDifficulty(questions),
      })
    } else {
      setIndex(nextIdx)
    }
  }

  if (!current) return null

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[typography.caption, styles.progress, { color: theme.textSecondary }]}>
        Listening — {index + 1} / {questions.length}
      </Text>

      <Card style={styles.audioCard}>
        <Text style={{ fontSize: 48, textAlign: 'center' }}>🔊</Text>
        <Text style={[typography.body, { color: theme.textSecondary, textAlign: 'center', marginTop: spacing.sm }]}>
          {speaking ? 'Playing…' : 'Tap to replay'}
        </Text>
        <Button
          title="🔁  Replay"
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
            {isCorrect ? '✓ Correct!' : '✗ Wrong'}
          </Text>
          <Button title="Next" onPress={handleNext} style={{ marginTop: spacing.sm }} />
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
