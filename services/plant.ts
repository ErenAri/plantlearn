import {
  getActivePlant,
  getDueCount,
  getSetting,
  getStreak,
  getTotalSessionCount,
  getWeekSessionCount,
  listSessionsInRange,
  listSessions,
  listUnlockedSkinHistory,
} from '@/db'
import { getDevNowIso, getDevTodayKey } from '@/dev/clock'
import { computeDecayOnly, isoWeekBounds, PLANT_SKINS } from '@/gameplay'
import {
  addDateKeyDays,
  buildDailyGrowthActivity,
  buildGrowthForecast,
  buildGrowthProgress,
  countActiveGrowthDays,
  sumGrowthXp,
  type DailyGrowthActivity,
  type GrowthForecast,
  type GrowthProgress,
} from '@/utils/growth'

import {
  buildPlantStatusSummary,
  type PlantStatusSnapshot,
  type PlantStatusSummary,
} from './plantStatusService'

const EMPTY_PLANT = {
  speciesId: 'starter-fern',
  createdAt: '',
  level: 1,
  xp: 0,
  health: 100,
  stage: 'seed',
  totalWater: 0,
  totalSun: 0,
  totalFertilizer: 0,
  totalRoots: 0,
}

export interface PlantDashboardData {
  plant: {
    speciesId: string
    level: number
    xp: number
    stage: string
    displayHealth: number
    totalWater: number
    totalSun: number
    totalFertilizer: number
    totalRoots: number
    createdAt: string
  }
  activeSkinId: string
  activeSkinName: string
  streak: number
  dueCount: number
  weekSessionCount: number
  totalSessions: number
  growth: GrowthProgress
  forecast: GrowthForecast
  last7Days: DailyGrowthActivity[]
  last7DaysSummary: {
    sessionCount: number
    xpEarned: number
    activeDays: number
  }
  insights: PlantStatusSummary
}

export async function getPlantDashboardData(): Promise<PlantDashboardData> {
  const todayKey = getDevTodayKey()
  const now = getDevNowIso()
  const { monday, sunday } = isoWeekBounds(todayKey)
  const sevenDayStart = addDateKeyDays(todayKey, -6)
  // Expo SQLite on the new architecture has been unstable with dense parallel reads
  // against the same connection. Keep this dashboard fetch serialized.
  const plantRecord = await getActivePlant()
  const streak = await getStreak()
  const dueCount = await getDueCount()
  const weekSessionCount = await getWeekSessionCount(monday, sunday)
  const totalSessions = await getTotalSessionCount()
  const recentSessions = await listSessions(4)
  const skinUnlocks = await listUnlockedSkinHistory(4)
  const activeSkinId = await getSetting('activeSkin')
  const last7SessionRows = await listSessionsInRange(sevenDayStart, todayKey)

  const plant = plantRecord ?? {
    ...EMPTY_PLANT,
    createdAt: now,
  }
  const displayHealth = Math.round(
    computeDecayOnly(
      {
        level: plant.level,
        xp: plant.xp,
        health: plant.health,
        stage: plant.stage,
        totalWater: plant.totalWater,
        totalSun: plant.totalSun,
        totalFertilizer: plant.totalFertilizer,
        totalRoots: plant.totalRoots,
      },
      streak.lastSessionDate,
      now,
    ),
  )
  const growth = buildGrowthProgress(plant.xp)
  const last7Days = buildDailyGrowthActivity(todayKey, last7SessionRows)
  const forecast = buildGrowthForecast({
    plant: {
      level: plant.level,
      xp: plant.xp,
      health: plant.health,
      stage: plant.stage,
      totalWater: plant.totalWater,
      totalSun: plant.totalSun,
      totalFertilizer: plant.totalFertilizer,
      totalRoots: plant.totalRoots,
    },
    displayHealth,
    todayKey,
    recentSessions: last7SessionRows,
  })

  const snapshot: PlantStatusSnapshot = {
    plantCreatedAt: plant.createdAt,
    stage: plant.stage,
    level: plant.level,
    displayHealth,
    totalWater: plant.totalWater,
    totalSun: plant.totalSun,
    totalFertilizer: plant.totalFertilizer,
    totalRoots: plant.totalRoots,
    currentStreak: streak.currentStreak,
    lastSessionDate: streak.lastSessionDate,
    dueCount,
    weekSessionCount,
    totalSessions,
    todayKey,
    recentSessions,
    skinUnlocks: skinUnlocks.map((item) => ({
      skinId: item.skinId,
      unlockedAt: item.unlockedAt,
    })),
  }

  const resolvedSkinId = activeSkinId ?? 'classic'
  const activeSkin = PLANT_SKINS.find((item) => item.id === resolvedSkinId) ?? PLANT_SKINS[0]

  return {
    plant: {
      speciesId: plant.speciesId,
      level: plant.level,
      xp: plant.xp,
      stage: plant.stage,
      displayHealth,
      totalWater: plant.totalWater,
      totalSun: plant.totalSun,
      totalFertilizer: plant.totalFertilizer,
      totalRoots: plant.totalRoots,
      createdAt: plant.createdAt,
    },
    activeSkinId: activeSkin.id,
    activeSkinName: activeSkin.name,
    streak: streak.currentStreak,
    dueCount,
    weekSessionCount,
    totalSessions,
    growth,
    forecast,
    last7Days,
    last7DaysSummary: {
      sessionCount: last7Days.reduce((sum, item) => sum + item.sessionCount, 0),
      xpEarned: sumGrowthXp(last7Days),
      activeDays: countActiveGrowthDays(last7Days),
    },
    insights: buildPlantStatusSummary(snapshot),
  }
}
