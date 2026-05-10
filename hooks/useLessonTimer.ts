import { useEffect, useRef, useState } from 'react'

export function useLessonTimer(
  timeLimitMs: number,
  onExpire: () => void,
  enabled = true,
) {
  const onExpireRef = useRef(onExpire)
  const startTimeRef = useRef<number | null>(null)
  const [remainingSec, setRemainingSec] = useState(Math.floor(timeLimitMs / 1000))

  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  useEffect(() => {
    if (!enabled) return

    const startedAt = Date.now()
    const deadline = startedAt + timeLimitMs
    startTimeRef.current = startedAt
    setRemainingSec(Math.floor(timeLimitMs / 1000))

    const timeout = setTimeout(() => {
      setRemainingSec(0)
      onExpireRef.current()
    }, timeLimitMs)

    const tick = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      setRemainingSec(remaining)
    }, 1000)

    return () => {
      clearTimeout(timeout)
      clearInterval(tick)
    }
  }, [enabled, timeLimitMs])

  return {
    remainingSec,
    startTimeRef,
  }
}
