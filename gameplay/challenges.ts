import { getDevTodayKey } from '@/dev/clock'

export interface DailyChallenge {
  id: string
  icon: string
  /** i18n key suffix */
  nameKey: string
  descKey: string
  /** Target to beat */
  target: number
  /** Bonus XP on completion */
  bonusXp: number
}

const CHALLENGE_POOL: DailyChallenge[] = [
  { id: 'speed_round', icon: '⚡', nameKey: 'speedRound', descKey: 'speedRoundDesc', target: 5, bonusXp: 30 },
  { id: 'perfect_streak', icon: '🎯', nameKey: 'perfectStreak', descKey: 'perfectStreakDesc', target: 5, bonusXp: 40 },
  { id: 'vocabulary_blitz', icon: '📖', nameKey: 'vocabBlitz', descKey: 'vocabBlitzDesc', target: 10, bonusXp: 25 },
  { id: 'listen_focus', icon: '🎧', nameKey: 'listenFocus', descKey: 'listenFocusDesc', target: 2, bonusXp: 30 },
  { id: 'speak_up', icon: '🗣️', nameKey: 'speakUp', descKey: 'speakUpDesc', target: 2, bonusXp: 30 },
  { id: 'grammar_drill', icon: '📝', nameKey: 'grammarDrill', descKey: 'grammarDrillDesc', target: 2, bonusXp: 30 },
  { id: 'reading_marathon', icon: '📚', nameKey: 'readingMarathon', descKey: 'readingMarathonDesc', target: 2, bonusXp: 30 },
]

/**
 * Get today's daily challenge (deterministic based on date).
 */
export function getTodayChallenge(): DailyChallenge {
  const todayKey = getDevTodayKey()
  // Simple hash from date string to pick challenge
  let hash = 0
  for (let i = 0; i < todayKey.length; i++) {
    hash = ((hash << 5) - hash + todayKey.charCodeAt(i)) | 0
  }
  const index = Math.abs(hash) % CHALLENGE_POOL.length
  return CHALLENGE_POOL[index]
}

/**
 * Check if today is a weekend (Saturday or Sunday) for double XP.
 */
export function isWeekendBonusActive(): boolean {
  const todayKey = getDevTodayKey()
  const day = new Date(`${todayKey}T00:00:00Z`).getUTCDay()
  return day === 0 || day === 6
}

/**
 * Get the XP multiplier for today (accounts for weekend bonus).
 */
export function getTodayXpMultiplier(): number {
  return isWeekendBonusActive() ? 2.0 : 1.0
}
