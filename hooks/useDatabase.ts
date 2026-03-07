import { useEffect, useState } from 'react'
import { initializeDb } from '@/db'

export function useDatabase() {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    async function init() {
      try {
        await initializeDb()
        if (!cancelled) setReady(true)
      } catch (e) {
        if (!cancelled) setError(e as Error)
      }
    }
    init()
    return () => {
      cancelled = true
    }
  }, [])

  return { ready, error }
}
