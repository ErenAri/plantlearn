import { PLACEMENT_QUESTIONS, type PlacementQuestion } from '../content/placementQuestions'
import type { CefrLevel } from '@/db/types'

export const SUPPORTED_CEFR_LEVELS: CefrLevel[] = ['A1', 'A2', 'B1', 'B2']
export const DEFAULT_LEARNING_LEVEL: CefrLevel = 'A1'

export type PlacementEstimate = CefrLevel | 'not_sure'
export type PlacementConfidence = 'high' | 'medium'
export type PlacementAdjustment = 'down' | 'stay' | 'up'

export interface PlacementEvaluation {
  recommendedLevel: CefrLevel
  baseLevel: CefrLevel
  correctCount: number
  totalQuestions: number
  accuracy: number
  confidence: PlacementConfidence
  adjustment: PlacementAdjustment
}

const QUESTION_IDS_BY_ESTIMATE: Record<PlacementEstimate, string[]> = {
  A1: ['a1-1', 'a1-2', 'a1-3', 'a2-1', 'a2-2', 'a2-3'],
  A2: ['a1-3', 'a2-1', 'a2-2', 'a2-3', 'b1-1', 'b1-2'],
  B1: ['a2-2', 'a2-3', 'b1-1', 'b1-2', 'b1-3', 'b2-1'],
  B2: ['a2-3', 'b1-1', 'b1-2', 'b1-3', 'b2-1', 'b2-2'],
  not_sure: ['a1-1', 'a1-3', 'a2-1', 'a2-2', 'b1-1', 'b2-1'],
}

function clampIndex(index: number): number {
  return Math.max(0, Math.min(SUPPORTED_CEFR_LEVELS.length - 1, index))
}

export function isCefrLevel(value: string | null | undefined): value is CefrLevel {
  return !!value && SUPPORTED_CEFR_LEVELS.includes(value as CefrLevel)
}

export function getLevelIndex(level: CefrLevel): number {
  return SUPPORTED_CEFR_LEVELS.indexOf(level)
}

export function getAdjacentLevel(level: CefrLevel, offset: -1 | 1): CefrLevel | null {
  const next = SUPPORTED_CEFR_LEVELS[getLevelIndex(level) + offset]
  return next ?? null
}

export function getBaseLevel(estimate: PlacementEstimate): CefrLevel {
  return estimate === 'not_sure' ? 'A2' : estimate
}

export function getPlacementQuestionSet(estimate: PlacementEstimate): PlacementQuestion[] {
  const ids = QUESTION_IDS_BY_ESTIMATE[estimate]
  return ids
    .map((id) => PLACEMENT_QUESTIONS.find((question) => question.id === id))
    .filter((question): question is PlacementQuestion => !!question)
}

export function evaluatePlacement(
  estimate: PlacementEstimate,
  answers: Record<string, string>,
  questions: PlacementQuestion[],
): PlacementEvaluation {
  const baseLevel = getBaseLevel(estimate)
  const correctCount = questions.reduce(
    (sum, question) => sum + (answers[question.id] === question.correctOptionId ? 1 : 0),
    0,
  )
  const totalQuestions = Math.max(questions.length, 1)
  const accuracy = correctCount / totalQuestions

  let levelShift = 0
  let adjustment: PlacementAdjustment = 'stay'
  if (accuracy >= 0.84) {
    levelShift = 1
    adjustment = 'up'
  } else if (accuracy < 0.35) {
    levelShift = -2
    adjustment = 'down'
  } else if (accuracy < 0.5) {
    levelShift = -1
    adjustment = 'down'
  }

  const recommendedLevel =
    SUPPORTED_CEFR_LEVELS[clampIndex(getLevelIndex(baseLevel) + levelShift)] ?? DEFAULT_LEARNING_LEVEL
  const confidence: PlacementConfidence =
    accuracy >= 0.75 || accuracy <= 0.25 || estimate !== 'not_sure' ? 'high' : 'medium'

  return {
    recommendedLevel,
    baseLevel,
    correctCount,
    totalQuestions,
    accuracy,
    confidence,
    adjustment,
  }
}
