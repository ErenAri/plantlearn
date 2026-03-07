import type {
  SessionInput,
  SessionRewards,
  PlantState,
  StreakState,
  Nutrients,
} from './types'

import {
  BASE_XP,
  BASE_NUTRIENT,
  DIFFICULTY_MULTIPLIER,
  SKILL_NUTRIENT_WEIGHTS,
  DURATION_BONUS_THRESHOLD_SEC,
  DURATION_BONUS_FACTOR,
  STREAK_BONUS_PER_DAY,
  MAX_STREAK_BONUS,
  MAX_HEALTH,
  DECAY_PER_MISSED_DAY,
  ROOTS_DECAY_REDUCTION_FACTOR,
  MIN_DECAY,
  HEALTH_REGEN_PER_SESSION,
  LEVEL_XP_BASE,
  LEVEL_XP_GROWTH,
  STAGE_ORDER,
  XP_PER_STAGE,
  SOFT_DECAY_FLOOR,
} from './config'

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function toDateKey(value: string): string {
  return value.slice(0, 10)
}

function diffDays(a: string, b: string): number {
  const msA = Date.parse(`${a}T00:00:00Z`)
  const msB = Date.parse(`${b}T00:00:00Z`)
  return Math.floor((msB - msA) / (24 * 60 * 60 * 1000))
}

function levelForXp(totalXp: number): number {
  let level = 1
  let threshold = LEVEL_XP_BASE
  let xpRemaining = totalXp
  while (xpRemaining >= threshold) {
    xpRemaining -= threshold
    level++
    threshold = Math.round(LEVEL_XP_BASE * Math.pow(LEVEL_XP_GROWTH, level - 1))
  }
  return level
}

function stageForXp(totalXp: number): string {
  let result: string = STAGE_ORDER[0]
  for (const stage of STAGE_ORDER) {
    if (totalXp >= XP_PER_STAGE[stage]) {
      result = stage
    }
  }
  return result
}

export function computeSessionRewards(input: SessionInput): SessionRewards {
  const accuracy = clamp(input.accuracy, 0, 1)
  const diffMult = DIFFICULTY_MULTIPLIER[input.difficulty] ?? 1
  const durationBonus = input.durationSec >= DURATION_BONUS_THRESHOLD_SEC
    ? 1 + DURATION_BONUS_FACTOR
    : 1

  const xp = Math.round(BASE_XP * accuracy * diffMult * durationBonus)

  const weights = SKILL_NUTRIENT_WEIGHTS[input.skillType] ?? SKILL_NUTRIENT_WEIGHTS.vocabulary
  const nutrientScale = accuracy * diffMult * durationBonus

  const nutrients: Nutrients = {
    water: Math.round(BASE_NUTRIENT * weights.water * nutrientScale),
    sun: Math.round(BASE_NUTRIENT * weights.sun * nutrientScale),
    fertilizer: Math.round(BASE_NUTRIENT * weights.fertilizer * nutrientScale),
    roots: Math.round(BASE_NUTRIENT * weights.roots * nutrientScale),
  }

  return { xp, nutrients }
}

export function applyRewardsToPlant(
  plant: PlantState,
  rewards: SessionRewards,
  streak: StreakState,
  sessionDate: string,
): PlantState {
  const sessionDay = toDateKey(sessionDate)
  let health = plant.health

  if (streak.lastSessionDate) {
    const missed = diffDays(streak.lastSessionDate, sessionDay) - 1
    if (missed > 0) {
      const rootsReduction = plant.totalRoots * ROOTS_DECAY_REDUCTION_FACTOR
      const decayPerDay = Math.max(MIN_DECAY, DECAY_PER_MISSED_DAY - rootsReduction)
      health = Math.max(SOFT_DECAY_FLOOR, health - decayPerDay * missed)
    }
  }

  health = clamp(health + HEALTH_REGEN_PER_SESSION, 0, MAX_HEALTH)

  const streakBonus = 1 + Math.min(streak.currentStreak * STREAK_BONUS_PER_DAY, MAX_STREAK_BONUS)
  const effectiveXp = Math.round(rewards.xp * streakBonus)
  const totalXp = plant.xp + effectiveXp

  const totalWater = plant.totalWater + rewards.nutrients.water
  const totalSun = plant.totalSun + rewards.nutrients.sun
  const totalFertilizer = plant.totalFertilizer + rewards.nutrients.fertilizer
  const totalRoots = plant.totalRoots + rewards.nutrients.roots

  return {
    xp: totalXp,
    level: levelForXp(totalXp),
    health,
    stage: stageForXp(totalXp),
    totalWater,
    totalSun,
    totalFertilizer,
    totalRoots,
  }
}

export function applyStreakUpdate(streak: StreakState, sessionDate: string): StreakState {
  const sessionDay = toDateKey(sessionDate)

  if (streak.lastSessionDate === sessionDay) {
    return streak
  }

  if (!streak.lastSessionDate) {
    return { currentStreak: 1, lastSessionDate: sessionDay }
  }

  const gap = diffDays(streak.lastSessionDate, sessionDay)
  if (gap === 1) {
    return { currentStreak: streak.currentStreak + 1, lastSessionDate: sessionDay }
  }
  if (gap > 1) {
    return { currentStreak: 1, lastSessionDate: sessionDay }
  }

  return streak
}

export function computeDecayOnly(
  plant: PlantState,
  lastSessionDate: string | null,
  currentDate: string,
): number {
  if (!lastSessionDate) return plant.health
  const missed = diffDays(lastSessionDate, toDateKey(currentDate)) - 1
  if (missed <= 0) return plant.health
  const rootsReduction = plant.totalRoots * ROOTS_DECAY_REDUCTION_FACTOR
  const decayPerDay = Math.max(MIN_DECAY, DECAY_PER_MISSED_DAY - rootsReduction)
  return Math.max(SOFT_DECAY_FLOOR, plant.health - decayPerDay * missed)
}

export function getTodayQuests(
  dueCount: number,
  streak: StreakState,
  plant: PlantState,
  sessionDate: string,
): { id: string; title: string; done: boolean }[] {
  const today = toDateKey(sessionDate)
  const didSessionToday = streak.lastSessionDate === today

  return [
    { id: 'review', title: `Review ${Math.min(dueCount, 10)} due cards`, done: dueCount === 0 && didSessionToday },
    { id: 'streak', title: `Keep your streak (${streak.currentStreak} days)`, done: didSessionToday },
    { id: 'health', title: plant.health >= 80 ? 'Plant is healthy!' : 'Restore plant health', done: plant.health >= 80 },
  ]
}

export { levelForXp, stageForXp }
