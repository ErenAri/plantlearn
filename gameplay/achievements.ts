import { PLANT_SKINS } from './config'

export type AchievementTier = 'bronze' | 'silver' | 'gold'

export interface AchievementSnapshot {
  totalSessions: number
  currentStreak: number
  learnedCards: number
  perfectSessions: number
  sessionCounts: {
    listening: number
    speaking: number
    grammar: number
    reading: number
  }
  unlockedSkinIds: string[]
}

export interface AchievementDef {
  id: string
  tier: AchievementTier
  icon: string
  check: (snapshot: AchievementSnapshot) => boolean
}

const LOCKABLE_SKIN_COUNT = PLANT_SKINS.filter((skin) => skin.id !== 'classic').length

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { id: 'first_session', tier: 'bronze', icon: 'ðŸŒ±', check: (snapshot) => snapshot.totalSessions >= 1 },

  { id: 'bookworm_10', tier: 'bronze', icon: 'ðŸ“š', check: (snapshot) => snapshot.totalSessions >= 10 },
  { id: 'bookworm_50', tier: 'silver', icon: 'ðŸ“š', check: (snapshot) => snapshot.totalSessions >= 50 },
  { id: 'bookworm_100', tier: 'gold', icon: 'ðŸ“š', check: (snapshot) => snapshot.totalSessions >= 100 },

  { id: 'streak_7', tier: 'bronze', icon: 'ðŸ”¥', check: (snapshot) => snapshot.currentStreak >= 7 },
  { id: 'streak_30', tier: 'silver', icon: 'ðŸ”¥', check: (snapshot) => snapshot.currentStreak >= 30 },
  { id: 'streak_100', tier: 'gold', icon: 'ðŸ”¥', check: (snapshot) => snapshot.currentStreak >= 100 },

  { id: 'polyglot_50', tier: 'bronze', icon: 'ðŸ—£ï¸', check: (snapshot) => snapshot.learnedCards >= 50 },
  { id: 'polyglot_100', tier: 'bronze', icon: 'ðŸ—£ï¸', check: (snapshot) => snapshot.learnedCards >= 100 },
  { id: 'polyglot_250', tier: 'silver', icon: 'ðŸ—£ï¸', check: (snapshot) => snapshot.learnedCards >= 250 },
  { id: 'polyglot_500', tier: 'gold', icon: 'ðŸ—£ï¸', check: (snapshot) => snapshot.learnedCards >= 500 },

  { id: 'perfect_1', tier: 'bronze', icon: 'ðŸ’¯', check: (snapshot) => snapshot.perfectSessions >= 1 },
  { id: 'perfect_5', tier: 'silver', icon: 'ðŸ’¯', check: (snapshot) => snapshot.perfectSessions >= 5 },
  { id: 'perfect_20', tier: 'gold', icon: 'ðŸ’¯', check: (snapshot) => snapshot.perfectSessions >= 20 },

  { id: 'listener_5', tier: 'bronze', icon: 'ðŸŽ§', check: (snapshot) => snapshot.sessionCounts.listening >= 5 },
  { id: 'listener_25', tier: 'silver', icon: 'ðŸŽ§', check: (snapshot) => snapshot.sessionCounts.listening >= 25 },
  { id: 'listener_50', tier: 'gold', icon: 'ðŸŽ§', check: (snapshot) => snapshot.sessionCounts.listening >= 50 },

  { id: 'speaker_5', tier: 'bronze', icon: 'ðŸŽ¤', check: (snapshot) => snapshot.sessionCounts.speaking >= 5 },
  { id: 'speaker_25', tier: 'silver', icon: 'ðŸŽ¤', check: (snapshot) => snapshot.sessionCounts.speaking >= 25 },
  { id: 'speaker_50', tier: 'gold', icon: 'ðŸŽ¤', check: (snapshot) => snapshot.sessionCounts.speaking >= 50 },

  { id: 'grammarian_5', tier: 'bronze', icon: 'ðŸ“', check: (snapshot) => snapshot.sessionCounts.grammar >= 5 },
  { id: 'grammarian_25', tier: 'silver', icon: 'ðŸ“', check: (snapshot) => snapshot.sessionCounts.grammar >= 25 },
  { id: 'grammarian_50', tier: 'gold', icon: 'ðŸ“', check: (snapshot) => snapshot.sessionCounts.grammar >= 50 },

  { id: 'reader_5', tier: 'bronze', icon: 'ðŸ“–', check: (snapshot) => snapshot.sessionCounts.reading >= 5 },
  { id: 'reader_25', tier: 'silver', icon: 'ðŸ“–', check: (snapshot) => snapshot.sessionCounts.reading >= 25 },
  { id: 'reader_50', tier: 'gold', icon: 'ðŸ“–', check: (snapshot) => snapshot.sessionCounts.reading >= 50 },

  {
    id: 'garden_architect',
    tier: 'gold',
    icon: 'ðŸŽ¨',
    check: (snapshot) => snapshot.unlockedSkinIds.filter((skinId) => skinId !== 'classic').length >= LOCKABLE_SKIN_COUNT,
  },

  { id: 'dedicated_3', tier: 'bronze', icon: 'â­', check: (snapshot) => snapshot.totalSessions >= 3 },
  { id: 'first_words_10', tier: 'bronze', icon: 'ðŸ”¤', check: (snapshot) => snapshot.learnedCards >= 10 },
]

export function getAchievementDef(id: string): AchievementDef | undefined {
  return ACHIEVEMENT_DEFS.find((definition) => definition.id === id)
}

export function getNewlyUnlockedAchievementIds(
  snapshot: AchievementSnapshot,
  unlockedIds: string[],
): string[] {
  const unlockedSet = new Set(unlockedIds)

  return ACHIEVEMENT_DEFS
    .filter((definition) => !unlockedSet.has(definition.id) && definition.check(snapshot))
    .map((definition) => definition.id)
}
