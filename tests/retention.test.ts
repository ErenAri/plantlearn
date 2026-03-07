import {
  buildDailyQuestStates,
  isoWeekBounds,
  weekKeyFromDate,
  buildWeeklyMilestone,
  nextUnlockableSkin,
  DAILY_QUEST_DEFS,
} from '../gameplay/quests'
import { computeDecayOnly, applyRewardsToPlant, computeSessionRewards } from '../gameplay/engine'
import { SOFT_DECAY_FLOOR, RECOVERY_HEALTH_RESTORE, MAX_HEALTH, PLANT_SKINS } from '../gameplay/config'
import type { PlantState, StreakState } from '../gameplay/types'

let passed = 0
let failed = 0
function assert(label: string, actual: unknown, expected: unknown) {
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    passed++
  } else {
    failed++
    console.error(`FAIL: ${label} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
  }
}

const FRESH_PLANT: PlantState = {
  level: 1, xp: 0, health: 100, stage: 'seed',
  totalWater: 0, totalSun: 0, totalFertilizer: 0, totalRoots: 0,
}

assert('DAILY_QUEST_DEFS has 3 quests', DAILY_QUEST_DEFS.length, 3)
assert('DAILY_QUEST_DEFS[0].id', DAILY_QUEST_DEFS[0].id, 'review_5')
assert('DAILY_QUEST_DEFS[1].id', DAILY_QUEST_DEFS[1].id, 'listening_1')
assert('DAILY_QUEST_DEFS[2].id', DAILY_QUEST_DEFS[2].id, 'speaking_1')

const noProgress = buildDailyQuestStates({})
assert('empty progress: all not done', noProgress.every(q => !q.done), true)
assert('empty progress: all 0 progress', noProgress.every(q => q.progress === 0), true)

const partialProgress = buildDailyQuestStates({ review_5: 3, listening_1: 1 })
assert('partial review not done', partialProgress[0].done, false)
assert('partial review progress', partialProgress[0].progress, 3)
assert('listening done', partialProgress[1].done, true)
assert('speaking not done', partialProgress[2].done, false)

const fullProgress = buildDailyQuestStates({ review_5: 5, listening_1: 1, speaking_1: 1 })
assert('full: all done', fullProgress.every(q => q.done), true)

const overProgress = buildDailyQuestStates({ review_5: 10 })
assert('over progress capped at target', overProgress[0].progress, 5)
assert('over progress is done', overProgress[0].done, true)

const mondayBounds = isoWeekBounds('2026-03-09')
assert('Monday of 2026-03-09', mondayBounds.monday, '2026-03-09')
assert('Sunday of 2026-03-09', mondayBounds.sunday, '2026-03-15')

const wednesdayBounds = isoWeekBounds('2026-03-11')
assert('Monday of 2026-03-11 (Wed)', wednesdayBounds.monday, '2026-03-09')
assert('Sunday of 2026-03-11 (Wed)', wednesdayBounds.sunday, '2026-03-15')

const sundayBounds = isoWeekBounds('2026-03-15')
assert('Monday of 2026-03-15 (Sun)', sundayBounds.monday, '2026-03-09')
assert('Sunday of 2026-03-15 (Sun)', sundayBounds.sunday, '2026-03-15')

const saturdayBounds = isoWeekBounds('2026-03-07')
assert('Monday of 2026-03-07 (Sat)', saturdayBounds.monday, '2026-03-02')
assert('Sunday of 2026-03-07 (Sat)', saturdayBounds.sunday, '2026-03-08')

assert('weekKey is Monday', weekKeyFromDate('2026-03-11'), '2026-03-09')

const notAchieved = buildWeeklyMilestone(3, '2026-03-09', null)
assert('milestone not achieved', notAchieved.achieved, false)
assert('milestone sessionCount', notAchieved.sessionCount, 3)

const achieved = buildWeeklyMilestone(5, '2026-03-09', null)
assert('milestone achieved', achieved.achieved, true)

const withSkin = buildWeeklyMilestone(6, '2026-03-09', 'desert')
assert('milestone skin', withSkin.skinUnlocked, 'desert')

assert('next skin with none unlocked', nextUnlockableSkin(['classic']), 'desert')
assert('next skin with some unlocked', nextUnlockableSkin(['classic', 'desert']), 'tropical')
assert('next skin skips classic', nextUnlockableSkin([]), 'desert')
const allIds = PLANT_SKINS.map(s => s.id)
assert('all unlocked returns null', nextUnlockableSkin(allIds), null)

const healthAfterNoMiss = computeDecayOnly(FRESH_PLANT, '2026-03-07', '2026-03-07')
assert('no miss: health unchanged', healthAfterNoMiss, 100)

const healthAfter1Miss = computeDecayOnly(FRESH_PLANT, '2026-03-05', '2026-03-07')
assert('1 missed day: health decays', healthAfter1Miss, 95)

const lowHealthPlant: PlantState = { ...FRESH_PLANT, health: 12 }
const healthAfterMany = computeDecayOnly(lowHealthPlant, '2026-03-01', '2026-03-07')
assert('many missed days: never below floor', healthAfterMany >= SOFT_DECAY_FLOOR, true)

const veryLowPlant: PlantState = { ...FRESH_PLANT, health: 15 }
const afterDecay = computeDecayOnly(veryLowPlant, '2026-02-01', '2026-03-07')
assert('extreme miss: floor is 10', afterDecay, SOFT_DECAY_FLOOR)

const highRootsPlant: PlantState = { ...FRESH_PLANT, health: 50, totalRoots: 200 }
const rootsDecay = computeDecayOnly(highRootsPlant, '2026-03-04', '2026-03-07')
assert('roots reduce decay', rootsDecay > 50 - 5 * 2, true)

const oldStreak: StreakState = { currentStreak: 3, lastSessionDate: '2026-03-04' }
const rewards = computeSessionRewards({ skillType: 'vocabulary', difficulty: 'medium', accuracy: 0.8, durationSec: 120 })
const plantAfterMiss = applyRewardsToPlant(FRESH_PLANT, rewards, oldStreak, '2026-03-07')
assert('plant after 2 missed days: health < 100', plantAfterMiss.health < 100, true)
assert('plant after miss: health >= floor + regen', plantAfterMiss.health >= SOFT_DECAY_FLOOR, true)

const nearDeathPlant: PlantState = { ...FRESH_PLANT, health: 20 }
const nearDeathStreak: StreakState = { currentStreak: 0, lastSessionDate: '2026-02-15' }
const afterLongMiss = applyRewardsToPlant(nearDeathPlant, rewards, nearDeathStreak, '2026-03-07')
assert('long miss: floor + regen applied', afterLongMiss.health, SOFT_DECAY_FLOOR + 5)

const recoveryHealth = Math.min(MAX_HEALTH, SOFT_DECAY_FLOOR + 5 + RECOVERY_HEALTH_RESTORE)
assert('recovery would restore to', recoveryHealth, 30)

assert('PLANT_SKINS has 8 entries', PLANT_SKINS.length, 8)
assert('first skin is classic', PLANT_SKINS[0].id, 'classic')
assert('each skin has 5 stages', PLANT_SKINS.every(s => Object.keys(s.emojis).length === 5), true)

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
