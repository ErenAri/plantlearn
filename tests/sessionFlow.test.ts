import { completeSession, type SessionServiceDeps } from '../services/sessionService'

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

const questUpdates: Array<{ dateKey: string; questId: string; amount: number }> = []
let loggedSkillType: string | undefined
let loggedXpEarned: number | undefined
let savedPlantXp = 0
let savedPlantHealth = 0
let unlockedSkinId: string | undefined
let unlockedWeekKey: string | undefined
let achievementTimestamp: string | null = null

const deps: SessionServiceDeps = {
  getNow: () => '2026-03-09T12:00:00.000Z',
  getTodayKey: () => '2026-03-09',
  getTodayXpMultiplier: () => 2,
  getStreak: async () => ({ currentStreak: 3, lastSessionDate: '2026-03-08' }),
  getActivePlant: async () => ({
    level: 3,
    xp: 200,
    health: 70,
    stage: 'sprout',
    totalWater: 10,
    totalSun: 8,
    totalFertilizer: 6,
    totalRoots: 4,
  }),
  logSession: async (record) => {
    loggedSkillType = record.skillType
    loggedXpEarned = record.xpEarned
    return 1
  },
  upsertPlantProgress: async (plant) => {
    savedPlantXp = plant.xp
    savedPlantHealth = plant.health
  },
  updateStreak: async () => ({ currentStreak: 4, lastSessionDate: '2026-03-09' }),
  incrementQuestProgress: async (dateKey, questId, amount) => {
    questUpdates.push({ dateKey, questId, amount })
  },
  getWeekSessionCount: async () => 5,
  getSkinUnlockedForWeek: async () => null,
  getUnlockedSkins: async () => ['classic'],
  unlockSkin: async (skinId, weekKey) => {
    unlockedSkinId = skinId
    unlockedWeekKey = weekKey
  },
  checkAndUnlockAchievements: async (unlockedAt) => {
    achievementTimestamp = unlockedAt
    return ['first_session']
  },
}

;(async () => {
  const result = await completeSession(deps, {
    skillType: 'listening',
    correct: 5,
    wrong: 0,
    reviewCount: 4,
    accuracy: 1,
    difficulty: 'hard',
    durationSec: 180,
  })

  assert('summary uses lesson correct count', result.summary.correct, 5)
  assert('summary uses lesson wrong count', result.summary.wrong, 0)
  assert('review quest uses warmup review count', questUpdates.find((q) => q.questId === 'review_5')?.amount, 4)
  assert('skill quest increments once', questUpdates.find((q) => q.questId === 'listening_1')?.amount, 1)
  assert('session log keeps lesson skill type', loggedSkillType, 'listening')
  assert('weekend multiplier affects logged xp', loggedXpEarned, 64)
  assert('streak bonus affects saved plant xp', savedPlantXp, 274)
  assert('health regen applied to plant', savedPlantHealth, 75)
  assert('achievement check uses persisted timestamp', achievementTimestamp, '2026-03-09T12:00:00.000Z')
  assert('weekly reward unlocks next skin', unlockedSkinId, 'desert')
  assert('weekly reward uses monday week key', unlockedWeekKey, '2026-03-09')
  assert('new achievements propagate to caller', result.newAchievements, ['first_session'])

  console.log(`\n${passed} passed, ${failed} failed`)
  if (failed > 0) process.exit(1)
})().catch((error) => {
  console.error(error)
  process.exit(1)
})
