function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m
  let prev = Array.from({ length: n + 1 }, (_, i) => i)
  let curr = new Array<number>(n + 1)
  for (let i = 1; i <= m; i++) {
    curr[0] = i
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost)
    }
    ;[prev, curr] = [curr, prev]
  }
  return prev[n]
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim()
}

function similarity(target: string, transcript: string): number {
  const a = normalize(target)
  const b = normalize(transcript)
  if (a.length === 0 && b.length === 0) return 1
  if (a.length === 0 || b.length === 0) return 0
  const dist = levenshtein(a, b)
  return 1 - dist / Math.max(a.length, b.length)
}

type SpeakingFeedback = 'great' | 'good' | 'try_again'
function getFeedback(sim: number): SpeakingFeedback {
  if (sim >= 0.85) return 'great'
  if (sim >= 0.70) return 'good'
  return 'try_again'
}

const BASE_XP = 20
const BASE_NUTRIENT = 10
const DIFFICULTY_MULTIPLIER: Record<string, number> = { easy: 0.8, medium: 1.0, hard: 1.4 }
const SKILL_NUTRIENT_WEIGHTS: Record<string, { water: number; sun: number; fertilizer: number; roots: number }> = {
  vocabulary: { water: 1.2, sun: 0.8, fertilizer: 0.6, roots: 0.4 },
  speaking: { water: 0.6, sun: 1.4, fertilizer: 0.4, roots: 0.8 },
  listening: { water: 0.8, sun: 1.0, fertilizer: 0.4, roots: 1.0 },
}

function computeSessionRewards(input: { skillType: string; difficulty: string; accuracy: number; durationSec: number }) {
  const accuracy = Math.min(1, Math.max(0, input.accuracy))
  const diffMult = DIFFICULTY_MULTIPLIER[input.difficulty] ?? 1
  const durationBonus = input.durationSec >= 120 ? 1.15 : 1
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

console.log('Similarity metric tests')
console.log('────────────────────────────────')

assert('exact match → 1.0', similarity('Merhaba', 'Merhaba') === 1)
assert('case insensitive match → 1.0', similarity('Merhaba', 'merhaba') === 1)
assert('empty vs empty → 1.0', similarity('', '') === 1)
assert('empty vs text → 0', similarity('', 'hello') === 0)
assert('completely different → low', similarity('Merhaba', 'zzzzz') < 0.3)

const simClose = similarity('Nasılsın', 'Nasilsin')
assert(`close match (${simClose.toFixed(2)}) >= 0.70`, simClose >= 0.70)

const simPartial = similarity('Bugün hava güzel', 'Bugun hava')
assert(`partial match (${simPartial.toFixed(2)}) is between 0.4-0.8`, simPartial > 0.4 && simPartial < 0.8)

const simPunct = similarity('Teşekkür ederim!', 'Teşekkür ederim')
assert(`punctuation ignored → similarity (${simPunct.toFixed(2)}) = 1.0`, simPunct === 1)

console.log('')
console.log('Feedback classification tests')
console.log('────────────────────────────────')

assert('sim 0.90 → great', getFeedback(0.90) === 'great')
assert('sim 0.85 → great', getFeedback(0.85) === 'great')
assert('sim 0.80 → good', getFeedback(0.80) === 'good')
assert('sim 0.70 → good', getFeedback(0.70) === 'good')
assert('sim 0.69 → try_again', getFeedback(0.69) === 'try_again')
assert('sim 0 → try_again', getFeedback(0) === 'try_again')

console.log('')
console.log('Speaking scoring integration')
console.log('────────────────────────────────')

const perfect = computeSessionRewards({ skillType: 'speaking', difficulty: 'medium', accuracy: 1.0, durationSec: 60 })
assert('100% speaking → XP = 20', perfect.xp === 20)
assert('100% speaking → sun = 14 (highest nutrient)', perfect.nutrients.sun === 14)
assert('100% speaking → water = 6', perfect.nutrients.water === 6)
assert('100% speaking → fertilizer = 4', perfect.nutrients.fertilizer === 4)
assert('100% speaking → roots = 8', perfect.nutrients.roots === 8)

assert('speaking sun > vocabulary sun', perfect.nutrients.sun > computeSessionRewards({ skillType: 'vocabulary', difficulty: 'medium', accuracy: 1.0, durationSec: 60 }).nutrients.sun)

const half = computeSessionRewards({ skillType: 'speaking', difficulty: 'medium', accuracy: 0.5, durationSec: 60 })
assert('50% speaking → XP = 10', half.xp === 10)
assert('50% speaking → sun = 7', half.nutrients.sun === 7)

const zero = computeSessionRewards({ skillType: 'speaking', difficulty: 'medium', accuracy: 0, durationSec: 60 })
assert('0% speaking → XP = 0', zero.xp === 0)
assert('0% speaking → all nutrients = 0', zero.nutrients.sun === 0 && zero.nutrients.water === 0)

const hardPerfect = computeSessionRewards({ skillType: 'speaking', difficulty: 'hard', accuracy: 1.0, durationSec: 60 })
assert('hard difficulty → XP = 28', hardPerfect.xp === 28)
assert('hard difficulty → sun = 20', hardPerfect.nutrients.sun === 20)

console.log('────────────────────────────────')
console.log(`${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
