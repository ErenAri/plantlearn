export const XP_PER_STAGE: Record<string, number> = {
  seed: 0,
  sprout: 50,
  sapling: 150,
  mature: 400,
  bloom: 800,
}

export const STAGE_ORDER = ['seed', 'sprout', 'sapling', 'mature', 'bloom'] as const

export const DIFFICULTY_MULTIPLIER: Record<string, number> = {
  easy: 0.8,
  medium: 1.0,
  hard: 1.4,
}

export const SKILL_NUTRIENT_WEIGHTS: Record<string, { water: number; sun: number; fertilizer: number; roots: number }> = {
  vocabulary: { water: 1.2, sun: 0.8, fertilizer: 0.6, roots: 0.4 },
  grammar: { water: 0.6, sun: 1.2, fertilizer: 1.0, roots: 0.6 },
  listening: { water: 0.8, sun: 1.0, fertilizer: 0.4, roots: 1.0 },
  reading: { water: 0.4, sun: 0.6, fertilizer: 1.2, roots: 1.0 },
  speaking: { water: 0.6, sun: 1.4, fertilizer: 0.4, roots: 0.8 },
  writing: { water: 0.5, sun: 0.8, fertilizer: 1.2, roots: 0.9 },
}

export const BASE_XP = 20
export const BASE_NUTRIENT = 10
export const DURATION_BONUS_THRESHOLD_SEC = 120
export const DURATION_BONUS_FACTOR = 0.15
export const STREAK_BONUS_PER_DAY = 0.05
export const MAX_STREAK_BONUS = 0.5
export const MAX_HEALTH = 100
export const DECAY_PER_MISSED_DAY = 5
export const ROOTS_DECAY_REDUCTION_FACTOR = 0.02
export const MIN_DECAY = 1
export const HEALTH_REGEN_PER_SESSION = 5
export const LEVEL_XP_BASE = 50
export const LEVEL_XP_GROWTH = 1.3

export const SOFT_DECAY_FLOOR = 10
export const RECOVERY_HEALTH_RESTORE = 15
export const RECOVERY_TIME_LIMIT_MS = 120_000
export const WEEKLY_MILESTONE_TARGET = 5

export const PLANT_SKINS: { id: string; name: string; emojis: Record<string, string> }[] = [
  { id: 'classic', name: 'Classic Fern', emojis: { seed: '🫘', sprout: '🌱', sapling: '🌿', mature: '🪴', bloom: '🌸' } },
  { id: 'desert', name: 'Desert Cactus', emojis: { seed: '🏜️', sprout: '🌵', sapling: '🌵', mature: '🌵', bloom: '💐' } },
  { id: 'tropical', name: 'Tropical Palm', emojis: { seed: '🥥', sprout: '🌴', sapling: '🌴', mature: '🌴', bloom: '🌺' } },
  { id: 'garden', name: 'Garden Bloom', emojis: { seed: '🌰', sprout: '🌱', sapling: '🌷', mature: '🌻', bloom: '💐' } },
  { id: 'forest', name: 'Forest Pine', emojis: { seed: '🌰', sprout: '🌱', sapling: '🎋', mature: '🌲', bloom: '🎄' } },
  { id: 'aquatic', name: 'Ocean Garden', emojis: { seed: '💧', sprout: '🌊', sapling: '🪷', mature: '🪸', bloom: '🐚' } },
  { id: 'night', name: 'Moonlight', emojis: { seed: '🌑', sprout: '🌒', sapling: '🌓', mature: '🌔', bloom: '🌕' } },
  { id: 'fruit', name: 'Fruit Garden', emojis: { seed: '🌰', sprout: '🌱', sapling: '🍊', mature: '🍎', bloom: '🍇' } },
]
