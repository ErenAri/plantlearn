import { getDevNowIso } from '@/dev/clock'
import { getSetting, setSetting } from '@/db'
import type { CefrLevel } from '@/db/types'

import {
  DEFAULT_LEARNING_LEVEL,
  isCefrLevel,
  type PlacementEstimate,
  type PlacementEvaluation,
} from './placementService'

const LEARNING_LEVEL_KEY = 'learningLevel'
const PLACEMENT_ESTIMATE_KEY = 'placementEstimate'
const PLACEMENT_RECOMMENDED_LEVEL_KEY = 'placementRecommendedLevel'
const PLACEMENT_CHOSEN_LEVEL_KEY = 'placementChosenLevel'
const PLACEMENT_COMPLETED_AT_KEY = 'placementCompletedAt'
const PLACEMENT_CORRECT_COUNT_KEY = 'placementCorrectCount'
const PLACEMENT_TOTAL_COUNT_KEY = 'placementTotalCount'

export interface PlacementState {
  learningLevel: CefrLevel
  recommendedLevel: CefrLevel | null
  chosenLevel: CefrLevel | null
  estimate: PlacementEstimate | null
  completedAt: string | null
  correctCount: number | null
  totalQuestions: number | null
}

function parseEstimate(value: string | null): PlacementEstimate | null {
  if (value === 'not_sure') return 'not_sure'
  return isCefrLevel(value) ? value : null
}

function parseIntValue(value: string | null): number | null {
  if (!value) return null
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : null
}

export async function getLearningLevel(): Promise<CefrLevel> {
  const stored = await getSetting(LEARNING_LEVEL_KEY)
  return isCefrLevel(stored) ? stored : DEFAULT_LEARNING_LEVEL
}

export async function setLearningLevel(level: CefrLevel): Promise<void> {
  await setSetting(LEARNING_LEVEL_KEY, level)
}

export async function getPlacementState(): Promise<PlacementState> {
  const [
    learningLevelRaw,
    recommendedLevelRaw,
    chosenLevelRaw,
    estimateRaw,
    completedAt,
    correctCountRaw,
    totalQuestionsRaw,
  ] = await Promise.all([
    getSetting(LEARNING_LEVEL_KEY),
    getSetting(PLACEMENT_RECOMMENDED_LEVEL_KEY),
    getSetting(PLACEMENT_CHOSEN_LEVEL_KEY),
    getSetting(PLACEMENT_ESTIMATE_KEY),
    getSetting(PLACEMENT_COMPLETED_AT_KEY),
    getSetting(PLACEMENT_CORRECT_COUNT_KEY),
    getSetting(PLACEMENT_TOTAL_COUNT_KEY),
  ])

  return {
    learningLevel: isCefrLevel(learningLevelRaw) ? learningLevelRaw : DEFAULT_LEARNING_LEVEL,
    recommendedLevel: isCefrLevel(recommendedLevelRaw) ? recommendedLevelRaw : null,
    chosenLevel: isCefrLevel(chosenLevelRaw) ? chosenLevelRaw : null,
    estimate: parseEstimate(estimateRaw),
    completedAt,
    correctCount: parseIntValue(correctCountRaw),
    totalQuestions: parseIntValue(totalQuestionsRaw),
  }
}

export async function savePlacementSelection(input: {
  estimate: PlacementEstimate
  evaluation: PlacementEvaluation
  chosenLevel?: CefrLevel
  completedAt?: string
}): Promise<CefrLevel> {
  const completedAt = input.completedAt ?? getDevNowIso()
  const chosenLevel = input.chosenLevel ?? input.evaluation.recommendedLevel
  const estimate = input.estimate

  await Promise.all([
    setSetting(PLACEMENT_ESTIMATE_KEY, estimate),
    setSetting(PLACEMENT_RECOMMENDED_LEVEL_KEY, input.evaluation.recommendedLevel),
    setSetting(PLACEMENT_CHOSEN_LEVEL_KEY, chosenLevel),
    setSetting(LEARNING_LEVEL_KEY, chosenLevel),
    setSetting(PLACEMENT_COMPLETED_AT_KEY, completedAt),
    setSetting(PLACEMENT_CORRECT_COUNT_KEY, String(input.evaluation.correctCount)),
    setSetting(PLACEMENT_TOTAL_COUNT_KEY, String(input.evaluation.totalQuestions)),
  ])

  return chosenLevel
}
