import { getDb } from '../client'
import type { StreakRecord } from '../types'

const STREAK_COLUMNS = 'id, currentStreak, lastSessionDate'

function toDateKey(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10)
  }
  return date.toISOString().slice(0, 10)
}

function diffDays(previous: string, next: string): number {
  const previousUtc = Date.parse(`${previous}T00:00:00Z`)
  const nextUtc = Date.parse(`${next}T00:00:00Z`)
  const diffMs = nextUtc - previousUtc
  return Math.floor(diffMs / (24 * 60 * 60 * 1000))
}

async function ensureStreakRow(): Promise<StreakRecord> {
  const db = await getDb()
  const existing = await db.getFirstAsync<StreakRecord>(`SELECT ${STREAK_COLUMNS} FROM streaks WHERE id = 1`)

  if (existing) {
    return existing
  }

  await db.runAsync(
    'INSERT INTO streaks (id, currentStreak, lastSessionDate) VALUES (?, ?, ?)',
    1,
    0,
    null,
  )

  const created = await db.getFirstAsync<StreakRecord>(`SELECT ${STREAK_COLUMNS} FROM streaks WHERE id = 1`)
  if (!created) {
    throw new Error('Unable to create streak row')
  }

  return created
}

export async function getStreak(): Promise<StreakRecord> {
  return ensureStreakRow()
}

export async function updateStreak(date: string): Promise<StreakRecord> {
  const db = await getDb()
  const current = await ensureStreakRow()
  const nextDate = toDateKey(date)

  if (current.lastSessionDate === nextDate) {
    return current
  }

  let nextStreak = current.currentStreak

  if (!current.lastSessionDate) {
    nextStreak = 1
  } else {
    const days = diffDays(current.lastSessionDate, nextDate)
    if (days === 1) {
      nextStreak = current.currentStreak + 1
    } else if (days > 1) {
      nextStreak = 1
    } else {
      return current
    }
  }

  await db.runAsync(
    'UPDATE streaks SET currentStreak = ?, lastSessionDate = ? WHERE id = 1',
    nextStreak,
    nextDate,
  )

  return {
    id: 1,
    currentStreak: nextStreak,
    lastSessionDate: nextDate,
  }
}
