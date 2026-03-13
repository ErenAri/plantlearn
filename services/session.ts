import {
  getActivePlant,
  getSkinUnlockedForWeek,
  getStreak,
  getUnlockedSkins,
  getWeekSessionCount,
  incrementQuestProgress,
  logSession,
  unlockSkin,
  updateStreak,
  upsertPlantProgress,
  type PlantRecord,
} from '@/db'
import { getDevNowIso, getDevTodayKey } from '@/dev/clock'
import { getTodayXpMultiplier, type PlantState } from '@/gameplay'

import { checkAndUnlockAchievements } from './achievements'
import {
  completeSession as completeSessionWithDeps,
  type CompleteSessionInput,
  type CompleteSessionResult,
  type SessionSummaryData,
} from './sessionService'

function toPlantState(plant: PlantRecord | null): PlantState | null {
  if (!plant) return null

  return {
    level: plant.level,
    xp: plant.xp,
    health: plant.health,
    stage: plant.stage,
    totalWater: plant.totalWater,
    totalSun: plant.totalSun,
    totalFertilizer: plant.totalFertilizer,
    totalRoots: plant.totalRoots,
  }
}

export function completeSession(input: CompleteSessionInput): Promise<CompleteSessionResult> {
  return completeSessionWithDeps(
    {
      getNow: getDevNowIso,
      getTodayKey: getDevTodayKey,
      getTodayXpMultiplier,
      async getStreak() {
        const streak = await getStreak()
        return {
          currentStreak: streak.currentStreak,
          lastSessionDate: streak.lastSessionDate,
        }
      },
      async getActivePlant() {
        return toPlantState(await getActivePlant())
      },
      logSession,
      async upsertPlantProgress(plant) {
        await upsertPlantProgress({
          xp: plant.xp,
          level: plant.level,
          health: plant.health,
          stage: plant.stage,
          totalWater: plant.totalWater,
          totalSun: plant.totalSun,
          totalFertilizer: plant.totalFertilizer,
          totalRoots: plant.totalRoots,
        })
      },
      async updateStreak(date) {
        const streak = await updateStreak(date)
        return {
          currentStreak: streak.currentStreak,
          lastSessionDate: streak.lastSessionDate,
        }
      },
      incrementQuestProgress,
      getWeekSessionCount,
      getSkinUnlockedForWeek,
      getUnlockedSkins,
      unlockSkin,
      checkAndUnlockAchievements,
    },
    input,
  )
}

export type { CompleteSessionInput, CompleteSessionResult, SessionSummaryData }
