import { getDb } from '../client'
import type { SessionRecord, SessionRow } from '../types'

const SESSION_COLUMNS = 'id, date, durationSec, accuracy, xpEarned, nutrientsJson, skillType'

export async function logSession(sessionRecord: SessionRecord): Promise<number> {
  const db = await getDb()
  const result = await db.runAsync(
    'INSERT INTO sessions (date, durationSec, accuracy, xpEarned, nutrientsJson, skillType) VALUES (?, ?, ?, ?, ?, ?)',
    sessionRecord.date,
    sessionRecord.durationSec,
    sessionRecord.accuracy,
    sessionRecord.xpEarned,
    sessionRecord.nutrientsJson,
    sessionRecord.skillType ?? 'vocabulary',
  )

  return Number(result.lastInsertRowId)
}

export async function listSessions(limit: number): Promise<SessionRow[]> {
  const db = await getDb()
  const safeLimit = Math.max(1, Math.floor(limit))

  return db.getAllAsync<SessionRow>(
    `SELECT ${SESSION_COLUMNS} FROM sessions ORDER BY date DESC, id DESC LIMIT ?`,
    safeLimit,
  )
}

export async function getTotalSessionCount(): Promise<number> {
  const db = await getDb()
  const row = await db.getFirstAsync<{ cnt: number }>('SELECT COUNT(*) as cnt FROM sessions')
  return row?.cnt ?? 0
}

export async function getSessionCountBySkill(skillType: string): Promise<number> {
  const db = await getDb()
  const row = await db.getFirstAsync<{ cnt: number }>(
    'SELECT COUNT(*) as cnt FROM sessions WHERE skillType = ?',
    skillType,
  )
  return row?.cnt ?? 0
}

export async function getPerfectSessionCount(): Promise<number> {
  const db = await getDb()
  const row = await db.getFirstAsync<{ cnt: number }>(
    'SELECT COUNT(*) as cnt FROM sessions WHERE accuracy >= 1.0',
  )
  return row?.cnt ?? 0
}

export async function getTotalLearningTimeSec(): Promise<number> {
  const db = await getDb()
  const row = await db.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(durationSec), 0) as total FROM sessions',
  )
  return row?.total ?? 0
}

export async function getAverageAccuracyBySkill(skillType: string): Promise<number> {
  const db = await getDb()
  const row = await db.getFirstAsync<{ avg: number | null }>(
    'SELECT AVG(accuracy) as avg FROM sessions WHERE skillType = ?',
    skillType,
  )
  return row?.avg ?? 0.5
}

export async function getRecentAccuracy(limit: number = 10): Promise<number> {
  const db = await getDb()
  const safeLimit = Math.max(1, Math.floor(limit))
  const row = await db.getFirstAsync<{ avg: number | null }>(
    'SELECT AVG(accuracy) as avg FROM (SELECT accuracy FROM sessions ORDER BY date DESC, id DESC LIMIT ?)',
    safeLimit,
  )
  return row?.avg ?? 0.5
}
