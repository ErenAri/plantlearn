export interface PlantRecord {
  id: number
  speciesId: string
  level: number
  xp: number
  health: number
  stage: string
  totalWater: number
  totalSun: number
  totalFertilizer: number
  totalRoots: number
  createdAt: string
}

export interface StreakRecord {
  id: number
  currentStreak: number
  lastSessionDate: string | null
}

export interface SrsCardRecord {
  id: number
  word: string
  meaning: string
  example: string | null
  interval: number
  ease: number
  dueDate: string | null
  lastReview: string | null
  lapses: number
}

export interface SessionRecord {
  date: string
  durationSec: number
  accuracy: number
  xpEarned: number
  nutrientsJson: string
}

export interface SessionRow extends SessionRecord {
  id: number
}

export interface PlantProgressPatch {
  speciesId?: string
  level?: number
  xp?: number
  health?: number
  stage?: string
  totalWater?: number
  totalSun?: number
  totalFertilizer?: number
  totalRoots?: number
}

export interface DailyQuestRecord {
  id: number
  dateKey: string
  questId: string
  progress: number
  target: number
  completedAt: string | null
}

export interface UnlockedSkinRecord {
  skinId: string
  weekKey: string
  unlockedAt: string
}

export interface UserSettingRecord {
  key: string
  value: string
}
