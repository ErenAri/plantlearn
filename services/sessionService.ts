import { MAX_HEALTH, RECOVERY_HEALTH_RESTORE, WEEKLY_MILESTONE_TARGET } from '../gameplay/config'
import { applyRewardsToPlant, applyStreakUpdate, computeSessionRewards } from '../gameplay/engine'
import { isoWeekBounds, nextUnlockableSkin, weekKeyFromDate } from '../gameplay/quests'
import type { Difficulty, PlantState, SessionRewards, SkillType, StreakState } from '../gameplay/types'

const EMPTY_PLANT: PlantState = {
  level: 1,
  xp: 0,
  health: 100,
  stage: 'seed',
  totalWater: 0,
  totalSun: 0,
  totalFertilizer: 0,
  totalRoots: 0,
}

const SKILL_QUEST_IDS: Partial<Record<SkillType, string>> = {
  listening: 'listening_1',
  speaking: 'speaking_1',
  grammar: 'grammar_1',
  reading: 'reading_1',
}

export interface CompleteSessionInput {
  skillType: SkillType
  correct: number
  wrong: number
  reviewCount: number
  accuracy?: number
  difficulty?: Difficulty
  durationSec: number
  isRecovery?: boolean
}

export interface SessionSummaryData {
  rewards: SessionRewards
  oldStreak: number
  newStreak: number
  oldPlant: PlantState
  newPlant: PlantState
  correct: number
  wrong: number
  skinUnlocked: string | null
}

export interface CompleteSessionResult {
  summary: SessionSummaryData
  newAchievements: string[]
}

export interface SessionServiceDeps {
  getNow(): string
  getTodayKey(): string
  getTodayXpMultiplier(): number
  getStreak(): Promise<StreakState>
  getActivePlant(): Promise<PlantState | null>
  logSession(record: {
    date: string
    durationSec: number
    accuracy: number
    xpEarned: number
    nutrientsJson: string
    skillType?: string
  }): Promise<number>
  upsertPlantProgress(plant: PlantState): Promise<unknown>
  updateStreak(date: string): Promise<StreakState>
  incrementQuestProgress(dateKey: string, questId: string, amount: number): Promise<void>
  getWeekSessionCount(monday: string, sunday: string): Promise<number>
  getSkinUnlockedForWeek(weekKey: string): Promise<string | null>
  getUnlockedSkins(): Promise<string[]>
  unlockSkin(skinId: string, weekKey: string): Promise<void>
  checkAndUnlockAchievements(unlockedAt: string): Promise<string[]>
}

export async function completeSession(
  deps: SessionServiceDeps,
  input: CompleteSessionInput,
): Promise<CompleteSessionResult> {
  const reviewed = input.correct + input.wrong
  const accuracy = input.accuracy ?? (reviewed === 0 ? 1 : input.correct / reviewed)
  const rewardsBase = computeSessionRewards({
    skillType: input.skillType,
    difficulty: input.difficulty ?? 'medium',
    accuracy,
    durationSec: input.durationSec,
  })
  const xpMultiplier = deps.getTodayXpMultiplier()
  const rewards =
    xpMultiplier > 1
      ? { ...rewardsBase, xp: Math.round(rewardsBase.xp * xpMultiplier) }
      : rewardsBase

  const now = deps.getNow()
  const todayKey = deps.getTodayKey()
  const oldStreakState = await deps.getStreak()
  const oldPlant = (await deps.getActivePlant()) ?? { ...EMPTY_PLANT }

  let newPlant = applyRewardsToPlant(oldPlant, rewards, oldStreakState, now)
  if (input.isRecovery) {
    newPlant = {
      ...newPlant,
      health: Math.min(MAX_HEALTH, newPlant.health + RECOVERY_HEALTH_RESTORE),
    }
  }

  const newStreakState = applyStreakUpdate(oldStreakState, now)

  await deps.logSession({
    date: now,
    durationSec: input.durationSec,
    accuracy,
    xpEarned: rewards.xp,
    nutrientsJson: JSON.stringify(rewards.nutrients),
    skillType: input.skillType,
  })

  await deps.upsertPlantProgress(newPlant)
  await deps.updateStreak(now)

  if (input.reviewCount > 0) {
    await deps.incrementQuestProgress(todayKey, 'review_5', input.reviewCount)
  }

  const skillQuestId = SKILL_QUEST_IDS[input.skillType]
  if (skillQuestId) {
    await deps.incrementQuestProgress(todayKey, skillQuestId, 1)
  }

  let skinUnlocked: string | null = null
  const { monday, sunday } = isoWeekBounds(todayKey)
  const weekKey = weekKeyFromDate(todayKey)
  const weekSessions = await deps.getWeekSessionCount(monday, sunday)
  if (weekSessions >= WEEKLY_MILESTONE_TARGET) {
    const existing = await deps.getSkinUnlockedForWeek(weekKey)
    if (!existing) {
      const unlockedIds = await deps.getUnlockedSkins()
      const next = nextUnlockableSkin(unlockedIds)
      if (next) {
        await deps.unlockSkin(next, weekKey)
        skinUnlocked = next
      }
    }
  }

  const newAchievements = await deps.checkAndUnlockAchievements(now)

  return {
    summary: {
      rewards,
      oldStreak: oldStreakState.currentStreak,
      newStreak: newStreakState.currentStreak,
      oldPlant,
      newPlant,
      correct: input.correct,
      wrong: input.wrong,
      skinUnlocked,
    },
    newAchievements,
  }
}
