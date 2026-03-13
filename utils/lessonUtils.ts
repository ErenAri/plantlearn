import type { Difficulty } from '../gameplay/types'

export interface QuestionDistribution {
  easy: number
  medium: number
  hard: number
}

export interface DifficultyTagged {
  difficulty: Difficulty
}

export interface TimedAccuracyLessonResult {
  correct: number
  wrong: number
  total: number
  accuracy: number
  durationSec: number
  difficulty: Difficulty
}

export const FIVE_QUESTION_DISTRIBUTION: QuestionDistribution = {
  easy: 2,
  medium: 2,
  hard: 1,
}

export function shuffleArray<T>(
  items: readonly T[],
  random: () => number = Math.random,
): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

export function pickQuestionsByDifficulty<T extends DifficultyTagged>(
  items: readonly T[],
  distribution: QuestionDistribution,
  random: () => number = Math.random,
): T[] {
  const easy = items.filter((item) => item.difficulty === 'easy')
  const medium = items.filter((item) => item.difficulty === 'medium')
  const hard = items.filter((item) => item.difficulty === 'hard')

  const pool = [
    ...shuffleArray(easy, random).slice(0, distribution.easy),
    ...shuffleArray(medium, random).slice(0, distribution.medium),
    ...shuffleArray(hard, random).slice(0, distribution.hard),
  ]

  return shuffleArray(pool, random)
}

export function averageDifficulty<T extends DifficultyTagged>(
  items: readonly T[],
): Difficulty {
  if (items.length === 0) {
    return 'hard'
  }

  let total = 0
  for (const item of items) {
    total += item.difficulty === 'easy' ? 1 : item.difficulty === 'medium' ? 2 : 3
  }

  const average = total / items.length
  if (average < 1.5) return 'easy'
  if (average < 2.5) return 'medium'
  return 'hard'
}

export function buildTimedAccuracyLessonResult<T extends DifficultyTagged>(
  correct: number,
  wrong: number,
  startedAtMs: number,
  items: readonly T[],
): TimedAccuracyLessonResult {
  const total = correct + wrong

  return {
    correct,
    wrong,
    total,
    accuracy: total === 0 ? 0 : correct / total,
    durationSec: Math.round((Date.now() - startedAtMs) / 1000),
    difficulty: averageDifficulty(items),
  }
}
