import { Button, Card } from '@/components/ui'
import { radius, spacing, typography } from '@/constants/Tokens'
import { SPEAKING_PROMPTS, type SpeakingPrompt } from '@/content/speakingPrompts'
import type { Difficulty } from '@/gameplay'
import { useStt } from '@/hooks/useStt'
import { useTheme } from '@/hooks/useTheme'
import {
    getFeedback,
    similarity,
    speakingAccuracyFromSimilarities,
    type SpeakingFeedback,
} from '@/utils/similarity'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TextInput, View } from 'react-native'

const MAX_QUESTIONS = 5
const TIME_LIMIT_MS = 3 * 60 * 1000

export interface SpeakingResult {
  correct: number
  wrong: number
  total: number
  accuracy: number
  durationSec: number
  difficulty: Difficulty
}

interface Props {
  onComplete: (result: SpeakingResult) => void
  devTranscript?: string | null
}

function pickQuestions(): SpeakingPrompt[] {
  const easy = SPEAKING_PROMPTS.filter(p => p.difficulty === 'easy')
  const medium = SPEAKING_PROMPTS.filter(p => p.difficulty === 'medium')
  const hard = SPEAKING_PROMPTS.filter(p => p.difficulty === 'hard')

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

function avgDifficulty(prompts: SpeakingPrompt[]): Difficulty {
  const scores = prompts.map(p => p.difficulty === 'easy' ? 1 : p.difficulty === 'medium' ? 2 : 3)
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  if (avg < 1.5) return 'easy'
  if (avg < 2.5) return 'medium'
  return 'hard'
}

const FEEDBACK_LABEL: Record<SpeakingFeedback, string> = {
  great: 'speaking.great',
  good: 'speaking.good',
  try_again: 'speaking.tryAgain',
}

const FEEDBACK_COLOR: Record<SpeakingFeedback, string> = {
  great: '#22c55e',
  good: '#f59e0b',
  try_again: '#ef4444',
}

export function SpeakingLesson({ onComplete, devTranscript = null }: Props) {
  const theme = useTheme()
  const stt = useStt()
  const { t } = useTranslation()

  const isDevMode = devTranscript !== null

  const [questions] = useState(() => pickQuestions())
  const [index, setIndex] = useState(0)
  const [sim, setSim] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<SpeakingFeedback | null>(null)
  const [retryUsed, setRetryUsed] = useState(false)
  const [sims, setSims] = useState<number[]>([])
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [devInput, setDevInput] = useState('')
  const startTime = useRef(Date.now())
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const current = questions[index]

  const finishLesson = useCallback((finalSims: number[], finalCorrect: number, finalWrong: number) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const durationSec = Math.round((Date.now() - startTime.current) / 1000)
    onComplete({
      correct: finalCorrect,
      wrong: finalWrong,
      total: finalCorrect + finalWrong,
      accuracy: speakingAccuracyFromSimilarities(finalSims),
      durationSec,
      difficulty: avgDifficulty(questions),
    })
  }, [questions, onComplete])

  useEffect(() => {
    timerRef.current = setTimeout(() => finishLesson(sims, correct, wrong), TIME_LIMIT_MS)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [finishLesson, sims, correct, wrong])

  function processTranscript(text: string) {
    const s = similarity(current.sentence, text)
    setSim(s)
    const fb = getFeedback(s)
    setFeedback(fb)
  }

  async function handleRecord() {
    if (isDevMode) {
      processTranscript(devTranscript)
      return
    }
    const text = await stt.listen('tr-TR')
    processTranscript(text)
  }

  function handleDevSubmit() {
    processTranscript(devInput)
  }

  function handleRetry() {
    setSim(null)
    setFeedback(null)
    setRetryUsed(true)
    if (isDevMode) setDevInput('')
  }

  function handleNext() {
    const finalSim = sim ?? 0
    const newSims = [...sims, finalSim]
    setSims(newSims)

    const isGood = finalSim >= 0.70
    const newCorrect = correct + (isGood ? 1 : 0)
    const newWrong = wrong + (isGood ? 0 : 1)
    setCorrect(newCorrect)
    setWrong(newWrong)

    const nextIdx = index + 1
    if (nextIdx >= questions.length) {
      finishLesson(newSims, newCorrect, newWrong)
      return
    }

    setIndex(nextIdx)
    setSim(null)
    setFeedback(null)
    setRetryUsed(false)
    if (isDevMode) setDevInput('')
  }

  if (!current) return null

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[typography.caption, styles.progress, { color: theme.textSecondary }]}>
        {t('speaking.progress', { current: index + 1, total: questions.length })}
      </Text>

      <Card style={styles.promptCard}>
        <Text style={[typography.bodySmall, { color: theme.textSecondary, textAlign: 'center' }]}>
          {t('speaking.sayInTurkish')}
        </Text>
        <Text style={[typography.h2, { color: theme.text, textAlign: 'center', marginTop: spacing.sm }]}>
          {current.sentence}
        </Text>
        <Text style={[typography.bodySmall, { color: theme.textSecondary, textAlign: 'center', marginTop: spacing.xs }]}>
          {current.translation}
        </Text>
      </Card>

      {isDevMode && feedback === null && (
        <View style={styles.devRow}>
          <TextInput
            style={[styles.devInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
            value={devInput}
            onChangeText={setDevInput}
            placeholder={t('speaking.devPlaceholder')}
            placeholderTextColor={theme.textSecondary}
          />
          <Button title={t('speaking.submit')} variant="secondary" onPress={handleDevSubmit} />
        </View>
      )}

      {!isDevMode && feedback === null && (
        <Button
          title={stt.listening ? t('speaking.listeningMic') : t('speaking.record')}
          onPress={() => { void handleRecord() }}
          disabled={stt.listening}
          style={styles.recordBtn}
        />
      )}

      {stt.listening && !isDevMode && (
        <Button title={t('speaking.stop')} variant="secondary" onPress={stt.stop} style={{ marginTop: spacing.sm }} />
      )}

      {(stt.transcript !== '' && !isDevMode && feedback === null) && (
        <Text style={[typography.body, { color: theme.textSecondary, textAlign: 'center', marginTop: spacing.sm }]}>
          {stt.transcript}
        </Text>
      )}

      {feedback !== null && sim !== null && (
        <View style={styles.feedbackBlock}>
          <Text style={[typography.h3, { color: FEEDBACK_COLOR[feedback], textAlign: 'center' }]}>
            {t(FEEDBACK_LABEL[feedback])}
          </Text>
          <Text style={[typography.body, { color: theme.textSecondary, textAlign: 'center', marginTop: spacing.xs }]}>
            {t('speaking.similarity', { percent: Math.round(sim * 100) })}
          </Text>

          {feedback === 'try_again' && !retryUsed ? (
            <Button title={t('speaking.retry')} variant="secondary" onPress={handleRetry} style={{ marginTop: spacing.md }} />
          ) : (
            <Button title={t('speaking.next')} onPress={handleNext} style={{ marginTop: spacing.md }} />
          )}
        </View>
      )}

      {stt.error && (
        <Text style={[typography.bodySmall, { color: theme.danger, textAlign: 'center', marginTop: spacing.sm }]}>
          {stt.error}
        </Text>
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
  promptCard: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  recordBtn: {
    alignSelf: 'center',
  },
  feedbackBlock: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  devRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  devInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: 16,
  },
})
