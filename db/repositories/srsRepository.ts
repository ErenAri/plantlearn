import { getDb } from '../client'
import type { SrsCardRecord } from '../types'
import { getDevNow, getDevNowIso } from '@/dev/clock'

const CARD_COLUMNS = 'id, word, meaning, example, interval, ease, dueDate, lastReview, lapses'

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function addDays(base: Date, days: number): Date {
  const next = new Date(base)
  next.setDate(next.getDate() + days)
  return next
}

export async function getDueCards(limit: number): Promise<SrsCardRecord[]> {
  const db = await getDb()
  const safeLimit = Math.max(1, Math.floor(limit))
  const now = getDevNowIso()

  return db.getAllAsync<SrsCardRecord>(
    `SELECT ${CARD_COLUMNS} FROM srs_cards WHERE dueDate <= ? ORDER BY dueDate ASC LIMIT ?`,
    now,
    safeLimit,
  )
}

export async function getDueCount(): Promise<number> {
  const db = await getDb()
  const now = getDevNowIso()
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM srs_cards WHERE dueDate <= ?',
    now,
  )
  return row?.count ?? 0
}

export async function reviewCard(cardId: number, rating: number): Promise<SrsCardRecord | null> {
  const db = await getDb()
  const current = await db.getFirstAsync<SrsCardRecord>(
    `SELECT ${CARD_COLUMNS} FROM srs_cards WHERE id = ?`,
    cardId,
  )

  if (!current) {
    return null
  }

  const score = clamp(Math.round(rating), 0, 5)
  let nextInterval = current.interval
  let nextEase = current.ease
  let nextLapses = current.lapses

  if (score < 2) {
    nextLapses = current.lapses + 1
    nextInterval = 1
    nextEase = clamp(current.ease - 0.2, 1.3, 3.5)
  } else if (score === 2) {
    nextInterval = Math.max(1, Math.round(current.interval * 1.2))
    nextEase = clamp(current.ease - 0.15, 1.3, 3.5)
  } else if (score === 3) {
    nextInterval = Math.max(1, Math.round(current.interval * nextEase))
    nextEase = current.ease
  } else {
    const easeDelta = 0.1 - (5 - score) * 0.08
    nextEase = clamp(current.ease + easeDelta, 1.3, 3.5)
    nextInterval = current.interval <= 1 ? 3 : Math.max(1, Math.round(current.interval * nextEase * 1.3))
  }

  const now = getDevNow()
  const dueDate = addDays(now, nextInterval).toISOString()
  const lastReview = now.toISOString()

  await db.runAsync(
    'UPDATE srs_cards SET interval = ?, ease = ?, dueDate = ?, lastReview = ?, lapses = ? WHERE id = ?',
    nextInterval,
    nextEase,
    dueDate,
    lastReview,
    nextLapses,
    cardId,
  )

  return db.getFirstAsync<SrsCardRecord>(
    `SELECT ${CARD_COLUMNS} FROM srs_cards WHERE id = ?`,
    cardId,
  )
}
