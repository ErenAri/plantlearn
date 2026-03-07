export function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m

  let prev = Array.from({ length: n + 1 }, (_, i) => i)
  let curr = new Array<number>(n + 1)

  for (let i = 1; i <= m; i++) {
    curr[0] = i
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost)
    }
    ;[prev, curr] = [curr, prev]
  }
  return prev[n]
}

export function similarity(target: string, transcript: string): number {
  const a = normalize(target)
  const b = normalize(transcript)
  if (a.length === 0 && b.length === 0) return 1
  if (a.length === 0 || b.length === 0) return 0
  const dist = levenshtein(a, b)
  return 1 - dist / Math.max(a.length, b.length)
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export type SpeakingFeedback = 'great' | 'good' | 'try_again'

export function getFeedback(sim: number): SpeakingFeedback {
  if (sim >= 0.85) return 'great'
  if (sim >= 0.70) return 'good'
  return 'try_again'
}

export function speakingAccuracyFromSimilarities(sims: number[]): number {
  if (sims.length === 0) return 0
  return sims.reduce((a, b) => a + b, 0) / sims.length
}
