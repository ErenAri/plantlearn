import { listLearningCards, type SrsCardRecord } from '@/db'
import { useCallback, useEffect, useState } from 'react'

export interface LearningCard extends Pick<SrsCardRecord, 'id' | 'word' | 'meaning' | 'example' | 'interval' | 'ease' | 'dueDate' | 'lastReview' | 'lapses' | 'level'> {}

export function useWords() {
  const [words, setWords] = useState<LearningCard[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    setWords(await listLearningCards())
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { words, loading, refresh }
}
