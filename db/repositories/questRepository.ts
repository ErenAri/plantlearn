import { getDb } from '../client'
import type { DailyQuestRecord } from '../types'
import { DAILY_QUEST_DEFS } from '@/gameplay/quests'

export async function getOrCreateDailyQuests(dateKey: string): Promise<DailyQuestRecord[]> {
  const db = await getDb()
  const existing = await db.getAllAsync<DailyQuestRecord>(
    'SELECT id, dateKey, questId, progress, target, completedAt FROM daily_quests WHERE dateKey = ?',
    dateKey,
  )

  if (existing.length >= DAILY_QUEST_DEFS.length) {
    return existing
  }

  for (const def of DAILY_QUEST_DEFS) {
    const has = existing.find(e => e.questId === def.id)
    if (!has) {
      await db.runAsync(
        'INSERT OR IGNORE INTO daily_quests (dateKey, questId, progress, target) VALUES (?, ?, 0, ?)',
        dateKey,
        def.id,
        def.target,
      )
    }
  }

  return db.getAllAsync<DailyQuestRecord>(
    'SELECT id, dateKey, questId, progress, target, completedAt FROM daily_quests WHERE dateKey = ?',
    dateKey,
  )
}

export async function incrementQuestProgress(
  dateKey: string,
  questId: string,
  amount: number,
): Promise<void> {
  const db = await getDb()
  await getOrCreateDailyQuests(dateKey)

  const row = await db.getFirstAsync<DailyQuestRecord>(
    'SELECT id, dateKey, questId, progress, target, completedAt FROM daily_quests WHERE dateKey = ? AND questId = ?',
    dateKey,
    questId,
  )
  if (!row) return

  const newProgress = Math.min(row.progress + amount, row.target)
  const justCompleted = newProgress >= row.target && !row.completedAt

  if (justCompleted) {
    await db.runAsync(
      'UPDATE daily_quests SET progress = ?, completedAt = ? WHERE id = ?',
      newProgress,
      new Date().toISOString(),
      row.id,
    )
  } else {
    await db.runAsync(
      'UPDATE daily_quests SET progress = ? WHERE id = ?',
      newProgress,
      row.id,
    )
  }
}

export async function getWeekSessionCount(monday: string, sunday: string): Promise<number> {
  const db = await getDb()
  const row = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM sessions WHERE substr(date, 1, 10) >= ? AND substr(date, 1, 10) <= ?",
    monday,
    sunday,
  )
  return row?.count ?? 0
}

export async function getUnlockedSkins(): Promise<string[]> {
  const db = await getDb()
  const rows = await db.getAllAsync<{ skinId: string }>('SELECT skinId FROM unlocked_skins')
  const ids = rows.map(r => r.skinId)
  if (!ids.includes('classic')) {
    ids.unshift('classic')
  }
  return ids
}

export async function unlockSkin(skinId: string, weekKey: string): Promise<void> {
  const db = await getDb()
  await db.runAsync(
    'INSERT OR IGNORE INTO unlocked_skins (skinId, weekKey, unlockedAt) VALUES (?, ?, ?)',
    skinId,
    weekKey,
    new Date().toISOString(),
  )
}

export async function getSkinUnlockedForWeek(weekKey: string): Promise<string | null> {
  const db = await getDb()
  const row = await db.getFirstAsync<{ skinId: string }>(
    'SELECT skinId FROM unlocked_skins WHERE weekKey = ?',
    weekKey,
  )
  return row?.skinId ?? null
}
