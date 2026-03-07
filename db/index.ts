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
	logSession,
	listSessions,
	getOrCreateDailyQuests,
	incrementQuestProgress,
	getWeekSessionCount,
	getUnlockedSkins,
	unlockSkin,
	getSkinUnlockedForWeek,
	getSetting,
	setSetting,
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
} from './types'

