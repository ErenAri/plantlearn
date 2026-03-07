const BASE_XP = 20
const BASE_NUTRIENT = 10
const DIFFICULTY_MULTIPLIER: Record<string, number> = { easy: 0.8, medium: 1.0, hard: 1.4 }
const DURATION_BONUS_THRESHOLD_SEC = 120
const DURATION_BONUS_FACTOR = 0.15
const SKILL_NUTRIENT_WEIGHTS: Record<string, { water: number; sun: number; fertilizer: number; roots: number }> = {
  vocabulary: { water: 1.2, sun: 0.8, fertilizer: 0.6, roots: 0.4 },
  grammar: { water: 0.6, sun: 1.2, fertilizer: 1.0, roots: 0.6 },
  listening: { water: 0.8, sun: 1.0, fertilizer: 0.4, roots: 1.0 },
  reading: { water: 0.4, sun: 0.6, fertilizer: 1.2, roots: 1.0 },
}

function computeSessionRewards(input: { skillType: string; difficulty: string; accuracy: number; durationSec: number }) {
  const accuracy = Math.min(1, Math.max(0, input.accuracy))
  const diffMult = DIFFICULTY_MULTIPLIER[input.difficulty] ?? 1
  const durationBonus = input.durationSec >= DURATION_BONUS_THRESHOLD_SEC ? 1 + DURATION_BONUS_FACTOR : 1
  const xp = Math.round(BASE_XP * accuracy * diffMult * durationBonus)
  const weights = SKILL_NUTRIENT_WEIGHTS[input.skillType] ?? SKILL_NUTRIENT_WEIGHTS.vocabulary
  const nutrientScale = accuracy * diffMult * durationBonus
  return {
    xp,
    nutrients: {
      water: Math.round(BASE_NUTRIENT * weights.water * nutrientScale),
      sun: Math.round(BASE_NUTRIENT * weights.sun * nutrientScale),
      fertilizer: Math.round(BASE_NUTRIENT * weights.fertilizer * nutrientScale),
      roots: Math.round(BASE_NUTRIENT * weights.roots * nutrientScale),
    },
  }
}

let passed = 0
let failed = 0

function assert(label: string, condition: boolean) {
  if (condition) {
    passed++
    console.log(`  ✓ ${label}`)
  } else {
    failed++
    console.error(`  ✗ ${label}`)
  }
}

console.log('Listening scoring mapping tests')
console.log('────────────────────────────────')

const perfect = computeSessionRewards({ skillType: 'listening', difficulty: 'medium', accuracy: 1.0, durationSec: 60 })
assert('100% listening accuracy → XP = 20', perfect.xp === 20)
assert('100% listening accuracy → water = 8', perfect.nutrients.water === 8)
assert('100% listening accuracy → sun = 10', perfect.nutrients.sun === 10)
assert('100% listening accuracy → fertilizer = 4', perfect.nutrients.fertilizer === 4)
assert('100% listening accuracy → roots = 10', perfect.nutrients.roots === 10)

const half = computeSessionRewards({ skillType: 'listening', difficulty: 'medium', accuracy: 0.5, durationSec: 60 })
assert('50% listening accuracy → XP = 10', half.xp === 10)
assert('50% listening accuracy → water = 4', half.nutrients.water === 4)

const zero = computeSessionRewards({ skillType: 'listening', difficulty: 'medium', accuracy: 0, durationSec: 60 })
assert('0% listening accuracy → XP = 0', zero.xp === 0)
assert('0% listening accuracy → all nutrients = 0', zero.nutrients.water === 0 && zero.nutrients.sun === 0)

const easyPerfect = computeSessionRewards({ skillType: 'listening', difficulty: 'easy', accuracy: 1.0, durationSec: 60 })
assert('easy difficulty → XP = 16', easyPerfect.xp === 16)

const hardPerfect = computeSessionRewards({ skillType: 'listening', difficulty: 'hard', accuracy: 1.0, durationSec: 60 })
assert('hard difficulty → XP = 28', hardPerfect.xp === 28)

const longSession = computeSessionRewards({ skillType: 'listening', difficulty: 'medium', accuracy: 1.0, durationSec: 150 })
assert('duration >= 120s → bonus applied → XP = 23', longSession.xp === 23)
assert('duration bonus → water = 9', longSession.nutrients.water === 9)

const vocab = computeSessionRewards({ skillType: 'vocabulary', difficulty: 'medium', accuracy: 1.0, durationSec: 60 })
assert('listening water < vocabulary water (0.8 vs 1.2)', perfect.nutrients.water < vocab.nutrients.water)

console.log('────────────────────────────────')
console.log(`${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
