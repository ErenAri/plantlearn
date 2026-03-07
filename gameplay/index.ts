export {
  computeSessionRewards,
  applyRewardsToPlant,
  applyStreakUpdate,
  computeDecayOnly,
  getTodayQuests,
  levelForXp,
  stageForXp,
} from './engine'

export {
  buildDailyQuestStates,
  isoWeekBounds,
  weekKeyFromDate,
  buildWeeklyMilestone,
  nextUnlockableSkin,
  DAILY_QUEST_DEFS,
} from './quests'

export type {
  SkillType,
  Difficulty,
  Nutrients,
  SessionInput,
  SessionRewards,
  PlantState,
  StreakState,
  Quest,
  DaySimResult,
  DailyQuestId,
  DailyQuestState,
  PlantSkin,
  WeeklyMilestoneState,
} from './types'

export {
  XP_PER_STAGE,
  STAGE_ORDER,
  MAX_HEALTH,
  SOFT_DECAY_FLOOR,
  RECOVERY_HEALTH_RESTORE,
  RECOVERY_TIME_LIMIT_MS,
  WEEKLY_MILESTONE_TARGET,
  PLANT_SKINS,
} from './config'
