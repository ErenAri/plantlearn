import { getDb } from '../client'
import type { AchievementRecord, AchievementTier } from '../types'

export async function getUnlockedAchievements(): Promise<AchievementRecord[]> {
  const db = await getDb()
  return db.getAllAsync<AchievementRecord>(
    'SELECT id, tier, unlockedAt FROM achievements ORDER BY unlockedAt DESC',
  )
}

export async function isAchievementUnlocked(id: string): Promise<boolean> {
  const db = await getDb()
  const row = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM achievements WHERE id = ?',
    id,
  )
  return !!row
}

export async function unlockAchievement(
  id: string,
  tier: AchievementTier,
  unlockedAt: string,
): Promise<void> {
  const db = await getDb()
  await db.runAsync(
    'INSERT OR REPLACE INTO achievements (id, tier, unlockedAt) VALUES (?, ?, ?)',
    id,
    tier,
    unlockedAt,
  )
}

export async function getAchievementCount(): Promise<number> {
  const db = await getDb()
  const row = await db.getFirstAsync<{ cnt: number }>('SELECT COUNT(*) as cnt FROM achievements')
  return row?.cnt ?? 0
}
