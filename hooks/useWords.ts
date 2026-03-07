import { useEffect, useState, useCallback } from 'react'
import { getDb } from '@/db'

export interface LearningCard {
  id: number
  word: string
  meaning: string
  example: string | null
  interval: number
  ease: number
  dueDate: string
  lastReview: string | null
  lapses: number
}

export function useWords() {
  const [words, setWords] = useState<LearningCard[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const db = await getDb()
    const rows = await db.getAllAsync<LearningCard>(
      'SELECT id, word, meaning, example, interval, ease, dueDate, lastReview, lapses FROM srs_cards ORDER BY id',
    )
    setWords(rows)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { words, loading, refresh }
}
