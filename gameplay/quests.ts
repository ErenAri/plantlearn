import { PLANT_SKINS, WEEKLY_MILESTONE_TARGET } from './config'
import type { DailyQuestId, DailyQuestState, WeeklyMilestoneState } from './types'

export interface QuestDefinition {
  id: DailyQuestId
  title: string
  target: number
}

export const DAILY_QUEST_DEFS: QuestDefinition[] = [
  { id: 'review_5', title: 'Review 5 cards', target: 5 },
  { id: 'listening_1', title: 'Complete a listening set', target: 1 },
  { id: 'speaking_1', title: 'Complete a speaking set', target: 1 },
  { id: 'grammar_1', title: 'Complete a grammar set', target: 1 },
  { id: 'reading_1', title: 'Complete a reading set', target: 1 },
  { id: 'writing_1', title: 'Complete a writing set', target: 1 },
]

export function buildDailyQuestStates(
  progressMap: Record<string, number>,
): DailyQuestState[] {
  return DAILY_QUEST_DEFS.map(def => {
    const progress = progressMap[def.id] ?? 0
    return {
      id: def.id,
      title: def.title,
      progress: Math.min(progress, def.target),
      target: def.target,
      done: progress >= def.target,
    }
  })
}

export function isoWeekBounds(dateKey: string): { monday: string; sunday: string } {
  const d = new Date(`${dateKey}T00:00:00Z`)
  const day = d.getUTCDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setUTCDate(d.getUTCDate() + mondayOffset)
  const sunday = new Date(monday)
  sunday.setUTCDate(monday.getUTCDate() + 6)
  return {
    monday: monday.toISOString().slice(0, 10),
    sunday: sunday.toISOString().slice(0, 10),
  }
}

export function weekKeyFromDate(dateKey: string): string {
  const { monday } = isoWeekBounds(dateKey)
  return monday
}

export function buildWeeklyMilestone(
  sessionCount: number,
  weekKey: string,
  skinUnlockedThisWeek: string | null,
): WeeklyMilestoneState {
  return {
    weekKey,
    sessionCount,
    target: WEEKLY_MILESTONE_TARGET,
    achieved: sessionCount >= WEEKLY_MILESTONE_TARGET,
    skinUnlocked: skinUnlockedThisWeek,
  }
}

export function nextUnlockableSkin(unlockedIds: string[]): string | null {
  const set = new Set(unlockedIds)
  for (const skin of PLANT_SKINS) {
    if (skin.id === 'classic') continue
    if (!set.has(skin.id)) return skin.id
  }
  return null
}
