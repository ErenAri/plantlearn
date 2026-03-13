import { computeSessionRewards } from '../gameplay/engine'
import { getFeedback, similarity } from '../utils/similarity'

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
