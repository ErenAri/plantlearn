import type { AchievementTier } from '@/db'
import {
    getLearnedCardCount,
    getPerfectSessionCount,
    getSessionCountBySkill,
    getStreak,
    getTotalSessionCount,
    getUnlockedAchievements,
    getUnlockedSkins,
    unlockAchievement,
} from '@/db'
import { getDevNowIso } from '@/dev/clock'
import { PLANT_SKINS } from './config'

export interface AchievementDef {
  id: string
  tier: AchievementTier
  icon: string
  check: () => Promise<boolean>
}

/* ── Achievement definitions ───────────────── */

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  // First Steps
  { id: 'first_session', tier: 'bronze', icon: '🌱', check: async () => (await getTotalSessionCount()) >= 1 },

  // Bookworm (session count)
  { id: 'bookworm_10', tier: 'bronze', icon: '📚', check: async () => (await getTotalSessionCount()) >= 10 },
  { id: 'bookworm_50', tier: 'silver', icon: '📚', check: async () => (await getTotalSessionCount()) >= 50 },
  { id: 'bookworm_100', tier: 'gold', icon: '📚', check: async () => (await getTotalSessionCount()) >= 100 },

  // Streak Master
  { id: 'streak_7', tier: 'bronze', icon: '🔥', check: async () => (await getStreak()).currentStreak >= 7 },
  { id: 'streak_30', tier: 'silver', icon: '🔥', check: async () => (await getStreak()).currentStreak >= 30 },
  { id: 'streak_100', tier: 'gold', icon: '🔥', check: async () => (await getStreak()).currentStreak >= 100 },

  // Polyglot (words learned)
  { id: 'polyglot_50', tier: 'bronze', icon: '🗣️', check: async () => (await getLearnedCardCount()) >= 50 },
  { id: 'polyglot_100', tier: 'bronze', icon: '🗣️', check: async () => (await getLearnedCardCount()) >= 100 },
  { id: 'polyglot_250', tier: 'silver', icon: '🗣️', check: async () => (await getLearnedCardCount()) >= 250 },
  { id: 'polyglot_500', tier: 'gold', icon: '🗣️', check: async () => (await getLearnedCardCount()) >= 500 },

  // Perfect Session
  { id: 'perfect_1', tier: 'bronze', icon: '💯', check: async () => (await getPerfectSessionCount()) >= 1 },
  { id: 'perfect_5', tier: 'silver', icon: '💯', check: async () => (await getPerfectSessionCount()) >= 5 },
  { id: 'perfect_20', tier: 'gold', icon: '💯', check: async () => (await getPerfectSessionCount()) >= 20 },

  // Listener
  { id: 'listener_5', tier: 'bronze', icon: '🎧', check: async () => (await getSessionCountBySkill('listening')) >= 5 },
  { id: 'listener_25', tier: 'silver', icon: '🎧', check: async () => (await getSessionCountBySkill('listening')) >= 25 },
  { id: 'listener_50', tier: 'gold', icon: '🎧', check: async () => (await getSessionCountBySkill('listening')) >= 50 },

  // Speaker
  { id: 'speaker_5', tier: 'bronze', icon: '🎤', check: async () => (await getSessionCountBySkill('speaking')) >= 5 },
  { id: 'speaker_25', tier: 'silver', icon: '🎤', check: async () => (await getSessionCountBySkill('speaking')) >= 25 },
  { id: 'speaker_50', tier: 'gold', icon: '🎤', check: async () => (await getSessionCountBySkill('speaking')) >= 50 },

  // Grammarian
  { id: 'grammarian_5', tier: 'bronze', icon: '📝', check: async () => (await getSessionCountBySkill('grammar')) >= 5 },
  { id: 'grammarian_25', tier: 'silver', icon: '📝', check: async () => (await getSessionCountBySkill('grammar')) >= 25 },
  { id: 'grammarian_50', tier: 'gold', icon: '📝', check: async () => (await getSessionCountBySkill('grammar')) >= 50 },

  // Reader
  { id: 'reader_5', tier: 'bronze', icon: '📖', check: async () => (await getSessionCountBySkill('reading')) >= 5 },
  { id: 'reader_25', tier: 'silver', icon: '📖', check: async () => (await getSessionCountBySkill('reading')) >= 25 },
  { id: 'reader_50', tier: 'gold', icon: '📖', check: async () => (await getSessionCountBySkill('reading')) >= 50 },

  // Garden Architect (skins)
  { id: 'garden_architect', tier: 'gold', icon: '🎨', check: async () => {
    const unlocked = await getUnlockedSkins()
    const lockable = PLANT_SKINS.filter(s => s.id !== 'classic')
    return unlocked.length >= lockable.length
  }},

  // Dedicated (3+ sessions)
  { id: 'dedicated_3', tier: 'bronze', icon: '⭐', check: async () => (await getTotalSessionCount()) >= 3 },

  // Vocabulary beginner
  { id: 'first_words_10', tier: 'bronze', icon: '🔤', check: async () => (await getLearnedCardCount()) >= 10 },
]

/**
 * Check all achievements and unlock any newly earned ones.
 * Returns a list of newly unlocked achievement IDs.
 */
export async function checkAndUnlockAchievements(): Promise<string[]> {
  const unlocked = await getUnlockedAchievements()
  const unlockedSet = new Set(unlocked.map(a => a.id))
  const newlyUnlocked: string[] = []
  const now = getDevNowIso()

  for (const def of ACHIEVEMENT_DEFS) {
    if (unlockedSet.has(def.id)) continue
    const earned = await def.check()
    if (earned) {
      await unlockAchievement(def.id, def.tier, now)
      newlyUnlocked.push(def.id)
    }
  }

  return newlyUnlocked
}

export function getAchievementDef(id: string): AchievementDef | undefined {
  return ACHIEVEMENT_DEFS.find(d => d.id === id)
}
