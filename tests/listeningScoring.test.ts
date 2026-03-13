import { computeSessionRewards } from '../gameplay/engine'

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
