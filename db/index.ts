export { getDb } from './client'
export { initializeDb, resetDb } from './init'
export { runMigrations } from './migrations'
export { seedIfEmpty } from './seeds'
export {
	getActivePlant,
	upsertPlantProgress,
	getStreak,
	updateStreak,
	getDueCards,
	getDueCount,
	reviewCard,
	getLearnedCardCount,
	logSession,
	listSessions,
	getTotalSessionCount,
	getSessionCountBySkill,
	getPerfectSessionCount,
	getTotalLearningTimeSec,
	getAverageAccuracyBySkill,
	getRecentAccuracy,
	getOrCreateDailyQuests,
	incrementQuestProgress,
	getWeekSessionCount,
	getUnlockedSkins,
	unlockSkin,
	getSkinUnlockedForWeek,
	getSetting,
	setSetting,
	getUnlockedAchievements,
	isAchievementUnlocked,
	unlockAchievement,
	getAchievementCount,
} from './repositories'
export type {
	PlantRecord,
	StreakRecord,
	SrsCardRecord,
	SessionRecord,
	SessionRow,
	PlantProgressPatch,
	DailyQuestRecord,
	UnlockedSkinRecord,
	UserSettingRecord,
	AchievementTier,
	AchievementRecord,
} from './types'

