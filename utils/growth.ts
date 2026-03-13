import type { SessionRow } from '../db/types'
import { computeDecayOnly } from '../gameplay/engine'
import { STAGE_ORDER, XP_PER_STAGE } from '../gameplay/config'
import type { PlantState } from '../gameplay/types'

export type GrowthStage = (typeof STAGE_ORDER)[number]

export interface GrowthProgress {
  currentStage: GrowthStage
  nextStage: GrowthStage | null
  currentStageXp: number
  nextStageXp: number | null
  progressPercent: number
  xpToNextStage: number
  isMaxStage: boolean
}

export interface DailyGrowthActivity {
  dateKey: string
  sessionCount: number
  xpEarned: number
  kind: 'none' | 'steady' | 'strong'
  isToday: boolean
}

export interface GrowthForecast {
  estimatedSessionXp: number
  sessionsToNextStage: number
  healthIfSkipTwoDays: number
}

export function addDateKeyDays(dateKey: string, days: number): string {
  const next = new Date(`${dateKey}T00:00:00Z`)
  next.setUTCDate(next.getUTCDate() + days)
  return next.toISOString().slice(0, 10)
}

export function getStageForXp(xp: number): GrowthStage {
  let stage: GrowthStage = STAGE_ORDER[0]

  for (const candidate of STAGE_ORDER) {
    if (xp >= XP_PER_STAGE[candidate]) {
      stage = candidate
    }
  }

  return stage
}

export function buildGrowthProgress(xp: number): GrowthProgress {
  const currentStage = getStageForXp(xp)
  const currentIndex = STAGE_ORDER.indexOf(currentStage)
  const nextStage = STAGE_ORDER[currentIndex + 1] ?? null
  const currentStageXp = XP_PER_STAGE[currentStage]
  const nextStageXp = nextStage ? XP_PER_STAGE[nextStage] : null

  if (!nextStage || nextStageXp == null) {
    return {
      currentStage,
      nextStage: null,
      currentStageXp,
      nextStageXp: null,
      progressPercent: 100,
      xpToNextStage: 0,
      isMaxStage: true,
    }
  }

  const span = Math.max(1, nextStageXp - currentStageXp)
  const progressPercent = Math.max(
    0,
    Math.min(100, ((xp - currentStageXp) / span) * 100),
  )

  return {
    currentStage,
    nextStage,
    currentStageXp,
    nextStageXp,
    progressPercent,
    xpToNextStage: Math.max(0, nextStageXp - xp),
    isMaxStage: false,
  }
}

export function estimateSessionXp(
  sessions: ReadonlyArray<Pick<SessionRow, 'xpEarned'>>,
  fallback: number = 20,
): number {
  if (sessions.length === 0) {
    return fallback
  }

  const totalXp = sessions.reduce((sum, session) => sum + session.xpEarned, 0)
  return Math.max(1, Math.round(totalXp / sessions.length))
}

export function buildDailyGrowthActivity(
  todayKey: string,
  sessions: ReadonlyArray<SessionRow>,
  days: number = 7,
): DailyGrowthActivity[] {
  const activityByDay = new Map<string, { sessionCount: number; xpEarned: number }>()

  for (const session of sessions) {
    const dateKey = session.date.slice(0, 10)
    const entry = activityByDay.get(dateKey) ?? { sessionCount: 0, xpEarned: 0 }
    entry.sessionCount += 1
    entry.xpEarned += session.xpEarned
    activityByDay.set(dateKey, entry)
  }

  const items: DailyGrowthActivity[] = []
  for (let offset = days - 1; offset >= 0; offset--) {
    const dateKey = addDateKeyDays(todayKey, -offset)
    const entry = activityByDay.get(dateKey) ?? { sessionCount: 0, xpEarned: 0 }
    const kind =
      entry.sessionCount === 0
        ? 'none'
        : entry.sessionCount >= 2 || entry.xpEarned >= 35
          ? 'strong'
          : 'steady'

    items.push({
      dateKey,
      sessionCount: entry.sessionCount,
      xpEarned: entry.xpEarned,
      kind,
      isToday: dateKey === todayKey,
    })
  }

  return items
}

export function countActiveGrowthDays(
  items: ReadonlyArray<DailyGrowthActivity>,
): number {
  return items.filter((item) => item.sessionCount > 0).length
}

export function sumGrowthXp(
  items: ReadonlyArray<DailyGrowthActivity>,
): number {
  return items.reduce((sum, item) => sum + item.xpEarned, 0)
}

export function buildGrowthForecast(input: {
  plant: PlantState
  displayHealth: number
  todayKey: string
  recentSessions: ReadonlyArray<SessionRow>
}): GrowthForecast {
  const growth = buildGrowthProgress(input.plant.xp)
  const estimatedSessionXp = estimateSessionXp(input.recentSessions)
  const sessionsToNextStage = growth.isMaxStage
    ? 0
    : Math.max(1, Math.ceil(growth.xpToNextStage / estimatedSessionXp))
  const futureDate = `${addDateKeyDays(input.todayKey, 3)}T12:00:00.000Z`

  return {
    estimatedSessionXp,
    sessionsToNextStage,
    healthIfSkipTwoDays: Math.round(
      computeDecayOnly(
        {
          ...input.plant,
          health: input.displayHealth,
        },
        input.todayKey,
        futureDate,
      ),
    ),
  }
}
