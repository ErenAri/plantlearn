import { getAverageAccuracyBySkill, getLearnedCardCount } from '@/db'
import type { Difficulty, SkillType } from './types'

/**
 * Determine recommended difficulty distribution based on user's past accuracy.
 * Returns the number of easy/medium/hard questions for a 5-question set.
 */
export async function getAdaptiveDifficulty(skillType: SkillType): Promise<{ easy: number; medium: number; hard: number }> {
  const avgAccuracy = await getAverageAccuracyBySkill(skillType)

  // High accuracy → harder questions
  if (avgAccuracy >= 0.9) return { easy: 0, medium: 2, hard: 3 }
  if (avgAccuracy >= 0.75) return { easy: 1, medium: 2, hard: 2 }
  if (avgAccuracy >= 0.6) return { easy: 2, medium: 2, hard: 1 } // default
  if (avgAccuracy >= 0.4) return { easy: 3, medium: 2, hard: 0 }
  return { easy: 4, medium: 1, hard: 0 }
}

/**
 * Check if a CEFR level is unlocked based on learned word count.
 * A1 is always available. Higher levels require mastering previous words.
 */
export function isLevelUnlocked(level: string, learnedCount: number): boolean {
  switch (level) {
    case 'A1': return true
    case 'A2': return learnedCount >= 40  // ~80% of basic A1 vocab
    case 'B1': return learnedCount >= 120
    case 'B2': return learnedCount >= 300
    default: return true
  }
}
