export { getDb } from './client'
export { initializeDb, resetDb } from './init'
export { runMigrations } from './migrations'
export {
    getAchievementCount, getActivePlant, getAverageAccuracyBySkill, getDueCards,
    getDueCount, getLearnedCardCount, getOrCreateDailyQuests, getPerfectSessionCount, getRecentAccuracy, getSessionCountBySkill, getSetting, getSkinUnlockedForWeek, getStreak, getTotalLearningTimeSec, getTotalSessionCount, getUnlockedAchievements, getUnlockedSkins, getWeekSessionCount, incrementQuestProgress, isAchievementUnlocked, listLearningCards, listSessions, listSessionsInRange, listUnlockedSkinHistory, logSession, reviewCard, setSetting, unlockAchievement, unlockSkin, updateStreak, upsertPlantProgress
} from './repositories'
export { seedIfEmpty } from './seeds'
export type {
    AchievementRecord, AchievementTier, CefrLevel, DailyQuestRecord, PlantProgressPatch, PlantRecord, SessionRecord,
    SessionRow, SrsCardRecord, StreakRecord, UnlockedSkinRecord,
    UserSettingRecord
} from './types'

