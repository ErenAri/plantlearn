import { AppHeader, Button, Card, StepIndicator } from '@/components/ui'
import { layout, spacing, typography } from '@/constants/Tokens'
import { setSetting, type CefrLevel } from '@/db'
import { useTheme } from '@/hooks/useTheme'
import { savePlacementSelection } from '@/services/placement'
import {
  evaluatePlacement,
  getAdjacentLevel,
  getPlacementQuestionSet,
  type PlacementEstimate,
  type PlacementEvaluation,
} from '@/services/placementService'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

function LevelOption({
  title,
  subtitle,
  selected,
  onPress,
}: {
  title: string
  subtitle: string
  selected: boolean
  onPress: () => void
}) {
  return (
    <Button
      align="start"
      onPress={onPress}
      style={styles.stretchButton}
      subtitle={subtitle}
      title={title}
      variant={selected ? 'primary' : 'secondary'}
    />
  )
}

export default function PlacementScreen() {
  const theme = useTheme()
  const router = useRouter()
  const { t } = useTranslation()
  const params = useLocalSearchParams<{ from?: string }>()
  const from = params.from === 'settings' ? 'settings' : 'onboarding'
  const [stage, setStage] = useState<'estimate' | 'quiz' | 'result'>('estimate')
  const [estimate, setEstimate] = useState<PlacementEstimate | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<PlacementEvaluation | null>(null)
  const [saving, setSaving] = useState(false)

  const questions = useMemo(
    () => (estimate ? getPlacementQuestionSet(estimate) : []),
    [estimate],
  )
  const currentQuestion = questions[currentQuestionIndex]
  const stepIndex = stage === 'estimate' ? 0 : stage === 'quiz' ? 1 : 2

  function handleStartQuiz() {
    if (!estimate) return
    setAnswers({})
    setCurrentQuestionIndex(0)
    setResult(null)
    setStage('quiz')
  }

  function handleAnswer(optionId: string) {
    if (!estimate || !currentQuestion) return

    const nextAnswers = {
      ...answers,
      [currentQuestion.id]: optionId,
    }
    setAnswers(nextAnswers)

    if (currentQuestionIndex === questions.length - 1) {
      setResult(evaluatePlacement(estimate, nextAnswers, questions))
      setStage('result')
      return
    }

    setCurrentQuestionIndex((value) => value + 1)
  }

  async function handleFinish(chosenLevel: CefrLevel) {
    if (!estimate || !result || saving) return
    setSaving(true)
    try {
      await savePlacementSelection({
        estimate,
        evaluation: result,
        chosenLevel,
      })
      if (from === 'onboarding') {
        await setSetting('onboardingComplete', '1')
        router.replace('/(tabs)')
      } else {
        router.replace('/settings' as any)
      }
    } finally {
      setSaving(false)
    }
  }

  const easierLevel = result ? getAdjacentLevel(result.recommendedLevel, -1) : null
  const harderLevel = result ? getAdjacentLevel(result.recommendedLevel, 1) : null

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader
          eyebrow={t('placement.eyebrow')}
          subtitle={t('placement.subtitle')}
          title={t('placement.title')}
        />
        <StepIndicator currentIndex={stepIndex} steps={['estimate', 'quiz', 'result']} />

        {stage === 'estimate' ? (
          <Card style={styles.card}>
            <Text style={[typography.h3, { color: theme.text }]}>{t('placement.estimateTitle')}</Text>
            <Text style={[typography.bodySmall, styles.copyBottom, { color: theme.textSecondary }]}>
              {t('placement.estimateBody')}
            </Text>

            <View style={styles.optionList}>
              <LevelOption
                onPress={() => setEstimate('A1')}
                selected={estimate === 'A1'}
                subtitle={t('placement.levelDescriptions.A1')}
                title={t('placement.levelNames.A1')}
              />
              <LevelOption
                onPress={() => setEstimate('A2')}
                selected={estimate === 'A2'}
                subtitle={t('placement.levelDescriptions.A2')}
                title={t('placement.levelNames.A2')}
              />
              <LevelOption
                onPress={() => setEstimate('B1')}
                selected={estimate === 'B1'}
                subtitle={t('placement.levelDescriptions.B1')}
                title={t('placement.levelNames.B1')}
              />
              <LevelOption
                onPress={() => setEstimate('B2')}
                selected={estimate === 'B2'}
                subtitle={t('placement.levelDescriptions.B2')}
                title={t('placement.levelNames.B2')}
              />
              <LevelOption
                onPress={() => setEstimate('not_sure')}
                selected={estimate === 'not_sure'}
                subtitle={t('placement.levelDescriptions.not_sure')}
                title={t('placement.levelNames.not_sure')}
              />
            </View>

            <Button
              disabled={!estimate}
              onPress={handleStartQuiz}
              style={styles.primaryButton}
              title={t('placement.startCheck')}
            />
          </Card>
        ) : null}

        {stage === 'quiz' && currentQuestion ? (
          <Card style={styles.card}>
            <Text style={[typography.caption, { color: theme.textSecondary }]}>
              {t('placement.questionProgress', {
                current: currentQuestionIndex + 1,
                total: questions.length,
              })}
            </Text>
            <Text style={[typography.h3, styles.copyTop, { color: theme.text }]}>
              {currentQuestion.prompt}
            </Text>
            <View style={styles.optionList}>
              {currentQuestion.options.map((option) => (
                <Button
                  key={option.id}
                  align="start"
                  onPress={() => handleAnswer(option.id)}
                  style={styles.stretchButton}
                  title={option.label}
                  variant="secondary"
                />
              ))}
            </View>
          </Card>
        ) : null}

        {stage === 'result' && result ? (
          <Card elevated style={styles.card} tone="accent">
            <Text style={[typography.caption, { color: theme.textSecondary }]}>
              {t('placement.recommendationLabel')}
            </Text>
            <Text style={[styles.levelText, { color: theme.text }]}>
              {t('placement.levelNames.' + result.recommendedLevel)}
            </Text>
            <Text style={[typography.body, styles.copyBottom, { color: theme.textSecondary }]}>
              {t(`placement.resultMessages.${result.adjustment}`, {
                level: t('placement.levelNames.' + result.recommendedLevel),
              })}
            </Text>
            <Text style={[typography.caption, styles.copyBottom, { color: theme.textSecondary }]}>
              {t('placement.scoreLine', {
                correct: result.correctCount,
                total: result.totalQuestions,
              })}
            </Text>

            <Button
              disabled={saving}
              onPress={() => handleFinish(result.recommendedLevel)}
              style={styles.stretchButton}
              title={t('placement.startAtLevel', {
                level: t('placement.levelShort.' + result.recommendedLevel),
              })}
            />

            {easierLevel ? (
              <Button
                disabled={saving}
                onPress={() => handleFinish(easierLevel)}
                style={styles.stretchButton}
                title={t('placement.startEasier', {
                  level: t('placement.levelShort.' + easierLevel),
                })}
                variant="ghost"
              />
            ) : null}

            {harderLevel ? (
              <Button
                disabled={saving}
                onPress={() => handleFinish(harderLevel)}
                style={styles.stretchButton}
                title={t('placement.startHarder', {
                  level: t('placement.levelShort.' + harderLevel),
                })}
                variant="ghost"
              />
            ) : null}
          </Card>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingHorizontal: layout.screenGutter,
  },
  card: {
    gap: spacing.md,
  },
  copyTop: {
    marginTop: spacing.xs,
  },
  copyBottom: {
    marginTop: spacing.xs,
  },
  optionList: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  primaryButton: {
    marginTop: spacing.sm,
    width: '100%',
  },
  stretchButton: {
    width: '100%',
  },
  levelText: {
    fontSize: 40,
    fontWeight: '700',
  },
})
