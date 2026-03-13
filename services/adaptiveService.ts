import { getAdaptiveDifficultyForAccuracy, type AdaptiveQuestionDistribution } from '../gameplay/adaptive'
import type { SkillType } from '../gameplay/types'

export interface AdaptiveServiceDeps {
  getAverageAccuracyBySkill(skillType: SkillType): Promise<number>
}

export async function getAdaptiveDifficulty(
  deps: AdaptiveServiceDeps,
  skillType: SkillType,
): Promise<AdaptiveQuestionDistribution> {
  const avgAccuracy = await deps.getAverageAccuracyBySkill(skillType)
  return getAdaptiveDifficultyForAccuracy(avgAccuracy)
}
