import { getAverageAccuracyBySkill } from '@/db'
import type { SkillType } from '@/gameplay'

import { getAdaptiveDifficulty as getAdaptiveDifficultyWithDeps } from './adaptiveService'

export function getAdaptiveDifficulty(skillType: SkillType) {
  return getAdaptiveDifficultyWithDeps({ getAverageAccuracyBySkill }, skillType)
}
