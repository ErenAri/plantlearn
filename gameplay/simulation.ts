import type { PlantState, StreakState, DaySimResult, SessionInput } from './types'
import { computeSessionRewards, applyRewardsToPlant, applyStreakUpdate, computeDecayOnly } from './engine'

const DEFAULT_SESSION: SessionInput = {
  skillType: 'vocabulary',
  difficulty: 'medium',
  accuracy: 0.85,
  durationSec: 180,
}

export function simulate7Days(
  schedule: (boolean | SessionInput)[] = [true, true, true, false, true, false, true],
): DaySimResult[] {
  const startDate = new Date('2026-03-01T12:00:00Z')
  const results: DaySimResult[] = []

  let plant: PlantState = {
    level: 1,
    xp: 0,
    health: 100,
    stage: 'seed',
    totalWater: 0,
    totalSun: 0,
    totalFertilizer: 0,
    totalRoots: 0,
  }

  let streak: StreakState = {
    currentStreak: 0,
    lastSessionDate: null,
  }

  for (let i = 0; i < schedule.length; i++) {
    const dayDate = new Date(startDate)
    dayDate.setDate(startDate.getDate() + i)
    const dateStr = dayDate.toISOString()
    const entry = schedule[i]
    const didSession = entry !== false

    if (didSession) {
      const input: SessionInput = typeof entry === 'object' ? entry : DEFAULT_SESSION
      const rewards = computeSessionRewards(input)
      plant = applyRewardsToPlant(plant, rewards, streak, dateStr)
      streak = applyStreakUpdate(streak, dateStr)

      results.push({
        day: i + 1,
        date: dateStr.slice(0, 10),
        didSession: true,
        rewards,
        plant: { ...plant },
        streak: { ...streak },
      })
    } else {
      const decayedHealth = computeDecayOnly(plant, streak.lastSessionDate, dateStr)
      plant = { ...plant, health: decayedHealth }

      results.push({
        day: i + 1,
        date: dateStr.slice(0, 10),
        didSession: false,
        rewards: null,
        plant: { ...plant },
        streak: { ...streak },
      })
    }
  }

  return results
}

export function formatSimResults(results: DaySimResult[]): string {
  const lines: string[] = ['=== 7-Day Simulation ===']

  for (const r of results) {
    const session = r.didSession ? 'SESSION' : 'MISSED'
    const nutrients = r.rewards
      ? `W:${r.rewards.nutrients.water} S:${r.rewards.nutrients.sun} F:${r.rewards.nutrients.fertilizer} R:${r.rewards.nutrients.roots}`
      : '-'
    lines.push(
      `Day ${r.day} (${r.date}) ${session} | ` +
      `XP:${r.plant.xp} Lv:${r.plant.level} HP:${r.plant.health} Stage:${r.plant.stage} | ` +
      `Streak:${r.streak.currentStreak} | Nutrients: ${nutrients}`,
    )
  }

  return lines.join('\n')
}
