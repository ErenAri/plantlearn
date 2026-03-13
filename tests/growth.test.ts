import {
  addDateKeyDays,
  buildDailyGrowthActivity,
  buildGrowthForecast,
  buildGrowthProgress,
  countActiveGrowthDays,
  estimateSessionXp,
  sumGrowthXp,
} from '../utils/growth'

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

assert('addDateKeyDays shifts backward', addDateKeyDays('2026-03-13', -6), '2026-03-07')
assert('addDateKeyDays shifts forward', addDateKeyDays('2026-03-13', 3), '2026-03-16')

assert(
  'buildGrowthProgress reports partial progress to next stage',
  buildGrowthProgress(120),
  {
    currentStage: 'sprout',
    nextStage: 'sapling',
    currentStageXp: 50,
    nextStageXp: 150,
    progressPercent: 70,
    xpToNextStage: 30,
    isMaxStage: false,
  },
)

assert(
  'buildGrowthProgress reports max stage correctly',
  buildGrowthProgress(900),
  {
    currentStage: 'bloom',
    nextStage: null,
    currentStageXp: 800,
    nextStageXp: null,
    progressPercent: 100,
    xpToNextStage: 0,
    isMaxStage: true,
  },
)

const activity = buildDailyGrowthActivity('2026-03-13', [
  { id: 1, date: '2026-03-10T09:00:00.000Z', durationSec: 60, accuracy: 1, xpEarned: 18, nutrientsJson: '{}', skillType: 'listening' },
  { id: 2, date: '2026-03-11T09:00:00.000Z', durationSec: 60, accuracy: 1, xpEarned: 20, nutrientsJson: '{}', skillType: 'reading' },
  { id: 3, date: '2026-03-11T16:00:00.000Z', durationSec: 60, accuracy: 1, xpEarned: 24, nutrientsJson: '{}', skillType: 'speaking' },
  { id: 4, date: '2026-03-13T08:00:00.000Z', durationSec: 60, accuracy: 1, xpEarned: 16, nutrientsJson: '{}', skillType: 'grammar' },
])

assert('activity includes a 7 day window', activity.length, 7)
assert('activity marks missing days as none', activity[0].kind, 'none')
assert('activity marks a single day as steady', activity[3].kind, 'steady')
assert('activity marks multi-session day as strong', activity[4].kind, 'strong')
assert('activity marks today', activity[6].isToday, true)
assert('countActiveGrowthDays counts study days', countActiveGrowthDays(activity), 3)
assert('sumGrowthXp totals recent xp', sumGrowthXp(activity), 78)
assert('estimateSessionXp uses rounded average', estimateSessionXp(activity.filter((item) => item.sessionCount > 0).map((item, index) => ({ xpEarned: index === 0 ? 18 : index === 1 ? 44 : 16 }))), 26)

const forecast = buildGrowthForecast({
  plant: {
    level: 2,
    xp: 120,
    health: 70,
    stage: 'sprout',
    totalWater: 20,
    totalSun: 16,
    totalFertilizer: 14,
    totalRoots: 12,
  },
  displayHealth: 63,
  todayKey: '2026-03-13',
  recentSessions: [
    { id: 1, date: '2026-03-10T09:00:00.000Z', durationSec: 60, accuracy: 1, xpEarned: 18, nutrientsJson: '{}', skillType: 'listening' },
    { id: 2, date: '2026-03-11T09:00:00.000Z', durationSec: 60, accuracy: 1, xpEarned: 24, nutrientsJson: '{}', skillType: 'reading' },
  ],
})

assert('forecast estimates session xp from recent sessions', forecast.estimatedSessionXp, 21)
assert('forecast estimates sessions to next stage', forecast.sessionsToNextStage, 2)
assert('forecast applies two more missed days from current health', forecast.healthIfSkipTwoDays, 53)

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
