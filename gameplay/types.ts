export type SkillType = 'vocabulary' | 'grammar' | 'listening' | 'reading' | 'speaking' | 'writing'

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Nutrients {
  water: number
  sun: number
  fertilizer: number
  roots: number
}

export interface SessionInput {
  skillType: SkillType
  difficulty: Difficulty
  accuracy: number
  durationSec: number
}

export interface SessionRewards {
  xp: number
  nutrients: Nutrients
}

export interface PlantState {
  level: number
  xp: number
  health: number
  stage: string
  totalWater: number
  totalSun: number
  totalFertilizer: number
  totalRoots: number
}

export interface StreakState {
  currentStreak: number
  lastSessionDate: string | null
}

export interface Quest {
  id: string
  title: string
  done: boolean
}

export type DailyQuestId = 'review_5' | 'listening_1' | 'speaking_1' | 'grammar_1' | 'reading_1' | 'writing_1'

export interface DailyQuestState {
  id: DailyQuestId
  title: string
  progress: number
  target: number
  done: boolean
}

export interface PlantSkin {
  id: string
  name: string
  emojis: Record<string, string>
}

export interface WeeklyMilestoneState {
  weekKey: string
  sessionCount: number
  target: number
  achieved: boolean
  skinUnlocked: string | null
}

export interface DaySimResult {
  day: number
  date: string
  didSession: boolean
  rewards: SessionRewards | null
  plant: PlantState
  streak: StreakState
}
