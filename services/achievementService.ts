import {
  getAchievementDef,
  getNewlyUnlockedAchievementIds,
  type AchievementSnapshot,
  type AchievementTier,
} from '../gameplay/achievements'

const TRACKED_SKILLS = ['listening', 'speaking', 'grammar', 'reading'] as const

type TrackedSkill = (typeof TRACKED_SKILLS)[number]

export interface AchievementServiceDeps {
  getTotalSessionCount(): Promise<number>
  getStreak(): Promise<{ currentStreak: number }>
  getLearnedCardCount(): Promise<number>
  getPerfectSessionCount(): Promise<number>
  getSessionCountBySkill(skillType: TrackedSkill): Promise<number>
  getUnlockedSkins(): Promise<string[]>
  getUnlockedAchievements(): Promise<Array<{ id: string }>>
  unlockAchievement(id: string, tier: AchievementTier, unlockedAt: string): Promise<void>
}

export async function buildAchievementSnapshot(
  deps: AchievementServiceDeps,
): Promise<AchievementSnapshot> {
  const [
    totalSessions,
    streak,
    learnedCards,
    perfectSessions,
    listening,
    speaking,
    grammar,
    reading,
    unlockedSkinIds,
  ] = await Promise.all([
    deps.getTotalSessionCount(),
    deps.getStreak(),
    deps.getLearnedCardCount(),
    deps.getPerfectSessionCount(),
    deps.getSessionCountBySkill('listening'),
    deps.getSessionCountBySkill('speaking'),
    deps.getSessionCountBySkill('grammar'),
    deps.getSessionCountBySkill('reading'),
    deps.getUnlockedSkins(),
  ])

  return {
    totalSessions,
    currentStreak: streak.currentStreak,
    learnedCards,
    perfectSessions,
    sessionCounts: {
      listening,
      speaking,
      grammar,
      reading,
    },
    unlockedSkinIds,
  }
}

export async function checkAndUnlockAchievements(
  deps: AchievementServiceDeps,
  unlockedAt: string,
): Promise<string[]> {
  const [snapshot, unlocked] = await Promise.all([
    buildAchievementSnapshot(deps),
    deps.getUnlockedAchievements(),
  ])
  const newlyUnlocked = getNewlyUnlockedAchievementIds(
    snapshot,
    unlocked.map((achievement) => achievement.id),
  )

  for (const id of newlyUnlocked) {
    const def = getAchievementDef(id)
    if (!def) continue
    await deps.unlockAchievement(id, def.tier, unlockedAt)
  }

  return newlyUnlocked
}
