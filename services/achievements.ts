import {
  getLearnedCardCount,
  getPerfectSessionCount,
  getSessionCountBySkill,
  getStreak,
  getTotalSessionCount,
  getUnlockedAchievements,
  getUnlockedSkins,
  unlockAchievement,
} from '@/db'
import { getDevNowIso } from '@/dev/clock'

import { checkAndUnlockAchievements as checkAndUnlockAchievementsWithDeps } from './achievementService'

export function checkAndUnlockAchievements(unlockedAt: string = getDevNowIso()) {
  return checkAndUnlockAchievementsWithDeps(
    {
      getTotalSessionCount,
      getStreak,
      getLearnedCardCount,
      getPerfectSessionCount,
      getSessionCountBySkill,
      getUnlockedSkins,
      getUnlockedAchievements,
      unlockAchievement,
    },
    unlockedAt,
  )
}
