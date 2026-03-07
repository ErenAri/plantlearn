import { getDb } from '../client'
import type { SessionRecord, SessionRow } from '../types'

const SESSION_COLUMNS = 'id, date, durationSec, accuracy, xpEarned, nutrientsJson'

export async function logSession(sessionRecord: SessionRecord): Promise<number> {
  const db = await getDb()
  const result = await db.runAsync(
    'INSERT INTO sessions (date, durationSec, accuracy, xpEarned, nutrientsJson) VALUES (?, ?, ?, ?, ?)',
    sessionRecord.date,
    sessionRecord.durationSec,
    sessionRecord.accuracy,
    sessionRecord.xpEarned,
    sessionRecord.nutrientsJson,
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
