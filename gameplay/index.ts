export {
    applyRewardsToPlant,
    applyStreakUpdate,
    computeDecayOnly, computeSessionRewards, getTodayQuests,
    levelForXp,
    stageForXp
} from './engine'

export {
    DAILY_QUEST_DEFS, buildDailyQuestStates, buildWeeklyMilestone, isoWeekBounds, nextUnlockableSkin, weekKeyFromDate
} from './quests'

export {
    ACHIEVEMENT_DEFS,
    getAchievementDef,
    getNewlyUnlockedAchievementIds,
    type AchievementDef,
    type AchievementSnapshot,
    type AchievementTier,
} from './achievements'

export type {
    DailyQuestId,
    DailyQuestState, DaySimResult, Difficulty,
    Nutrients, PlantSkin, PlantState, Quest, SessionInput,
    SessionRewards, SkillType, StreakState, WeeklyMilestoneState
} from './types'

export {
    MAX_HEALTH, PLANT_SKINS, RECOVERY_HEALTH_RESTORE,
    RECOVERY_TIME_LIMIT_MS, SOFT_DECAY_FLOOR, STAGE_ORDER, WEEKLY_MILESTONE_TARGET, XP_PER_STAGE
} from './config'

export {
    getTodayChallenge, getTodayXpMultiplier, isWeekendBonusActive, type DailyChallenge
} from './challenges'

export {
    getAdaptiveDifficultyForAccuracy,
    type AdaptiveQuestionDistribution,
    isLevelUnlocked
} from './adaptive'

