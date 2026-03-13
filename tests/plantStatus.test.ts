import { buildPlantStatusSummary } from '../services/plantStatusService'

let passed = 0
let failed = 0

function assert(label: string, actual: unknown, expected: unknown) {
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    passed++
  } else {
    failed++
    console.error(`FAIL: ${label} - expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
  }
}

const recoverySummary = buildPlantStatusSummary({
  plantCreatedAt: '2026-03-01T08:00:00.000Z',
  stage: 'sprout',
  level: 2,
  displayHealth: 62,
  totalWater: 10,
  totalSun: 12,
  totalFertilizer: 8,
  totalRoots: 6,
  currentStreak: 4,
  lastSessionDate: '2026-03-07',
  dueCount: 11,
  weekSessionCount: 2,
  totalSessions: 6,
  todayKey: '2026-03-09',
  recentSessions: [
    { id: 9, date: '2026-03-07T12:00:00.000Z', xpEarned: 18, skillType: 'reading' },
  ],
  skinUnlocks: [],
})

const thrivingSummary = buildPlantStatusSummary({
  plantCreatedAt: '2026-03-01T08:00:00.000Z',
  stage: 'mature',
  level: 6,
  displayHealth: 92,
  totalWater: 80,
  totalSun: 76,
  totalFertilizer: 64,
  totalRoots: 58,
  currentStreak: 8,
  lastSessionDate: '2026-03-09',
  dueCount: 2,
  weekSessionCount: 5,
  totalSessions: 24,
  todayKey: '2026-03-09',
  recentSessions: [
    { id: 10, date: '2026-03-09T12:00:00.000Z', xpEarned: 28, skillType: 'listening' },
    { id: 8, date: '2026-03-08T12:00:00.000Z', xpEarned: 24, skillType: 'speaking' },
  ],
  skinUnlocks: [
    { skinId: 'desert', unlockedAt: '2026-03-09T09:00:00.000Z' },
  ],
})

assert('recovery mood', recoverySummary.mood, 'recovery')
assert('recovery risk high', recoverySummary.risk, 'high')
assert('recovery recommendation', recoverySummary.recommendation.kind, 'recovery')
assert('recovery diagnosis includes backlog', recoverySummary.diagnoses.some((item) => item.kind === 'review_backlog'), true)
assert('thriving mood', thrivingSummary.mood, 'thriving')
assert('thriving risk low', thrivingSummary.risk, 'low')
assert('thriving recommendation steady', thrivingSummary.recommendation.kind, 'steady_session')
assert('timeline includes skin unlock', thrivingSummary.timeline.some((item) => item.kind === 'skin'), true)
assert('timeline includes session event', thrivingSummary.timeline.some((item) => item.kind === 'session'), true)

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
