import { WEEKLY_MILESTONE_TARGET } from '../gameplay/config'

export interface PlantStatusSnapshot {
  plantCreatedAt: string
  stage: string
  level: number
  displayHealth: number
  totalWater: number
  totalSun: number
  totalFertilizer: number
  totalRoots: number
  currentStreak: number
  lastSessionDate: string | null
  dueCount: number
  weekSessionCount: number
  totalSessions: number
  todayKey: string
  recentSessions: Array<{
    id: number
    date: string
    xpEarned: number
    skillType?: string
  }>
  skinUnlocks: Array<{
    skinId: string
    unlockedAt: string
  }>
}

export type PlantMoodKind = 'recovery' | 'thriving' | 'steady'
export type PlantRiskKind = 'high' | 'watch' | 'low'
export type PlantDiagnosisKind =
  | 'health_low'
  | 'review_backlog'
  | 'streak_support'
  | 'weekly_momentum'
  | 'new_growth'
  | 'steady_growth'

export type PlantRecommendationKind =
  | 'recovery'
  | 'review'
  | 'keep_streak'
  | 'boost_milestone'
  | 'steady_session'

export interface PlantDiagnosis {
  kind: PlantDiagnosisKind
  params?: Record<string, string | number>
}

export interface PlantRecommendation {
  kind: PlantRecommendationKind
  href: '/session' | '/session?recovery=1'
}

export type PlantTimelineItem =
  | {
      id: string
      kind: 'stage'
      date: string
      stage: string
    }
  | {
      id: string
      kind: 'session'
      date: string
      skillType: string
      xpEarned: number
    }
  | {
      id: string
      kind: 'skin'
      date: string
      skinId: string
    }
  | {
      id: string
      kind: 'streak'
      date: string
      streak: number
    }
  | {
      id: string
      kind: 'start'
      date: string
    }

export interface PlantStatusSummary {
  mood: PlantMoodKind
  risk: PlantRiskKind
  diagnoses: PlantDiagnosis[]
  recommendation: PlantRecommendation
  timeline: PlantTimelineItem[]
}

function toIsoFromDateKey(dateKey: string): string {
  return `${dateKey}T12:00:00.000Z`
}

function byNewestDate(a: { date: string }, b: { date: string }): number {
  return Date.parse(b.date) - Date.parse(a.date)
}

export function getPlantMood(snapshot: PlantStatusSnapshot): PlantMoodKind {
  if (snapshot.displayHealth < 80) return 'recovery'
  if (snapshot.weekSessionCount >= WEEKLY_MILESTONE_TARGET || snapshot.currentStreak >= 7) {
    return 'thriving'
  }
  return 'steady'
}

export function getPlantRisk(snapshot: PlantStatusSnapshot): PlantRiskKind {
  const missedToday = snapshot.lastSessionDate !== snapshot.todayKey
  if (snapshot.displayHealth < 65 || (missedToday && snapshot.dueCount >= 10)) {
    return 'high'
  }
  if (snapshot.displayHealth < 85 || snapshot.dueCount >= 6) {
    return 'watch'
  }
  return 'low'
}

export function getPlantDiagnoses(snapshot: PlantStatusSnapshot): PlantDiagnosis[] {
  const diagnoses: PlantDiagnosis[] = []

  if (snapshot.displayHealth < 80) {
    diagnoses.push({
      kind: 'health_low',
      params: { health: snapshot.displayHealth },
    })
  }

  if (snapshot.dueCount >= 8) {
    diagnoses.push({
      kind: 'review_backlog',
      params: { count: snapshot.dueCount },
    })
  }

  if (snapshot.currentStreak >= 3) {
    diagnoses.push({
      kind: 'streak_support',
      params: { streak: snapshot.currentStreak },
    })
  }

  if (snapshot.weekSessionCount >= 3) {
    diagnoses.push({
      kind: 'weekly_momentum',
      params: { count: snapshot.weekSessionCount, target: WEEKLY_MILESTONE_TARGET },
    })
  }

  if (snapshot.totalSessions <= 2) {
    diagnoses.push({ kind: 'new_growth' })
  }

  if (diagnoses.length === 0) {
    diagnoses.push({ kind: 'steady_growth' })
  }

  return diagnoses.slice(0, 3)
}

export function getPlantRecommendation(snapshot: PlantStatusSnapshot): PlantRecommendation {
  if (snapshot.displayHealth < 80) {
    return { kind: 'recovery', href: '/session?recovery=1' }
  }

  if (snapshot.dueCount >= 8) {
    return { kind: 'review', href: '/session' }
  }

  if (snapshot.lastSessionDate !== snapshot.todayKey) {
    return { kind: 'keep_streak', href: '/session' }
  }

  if (snapshot.weekSessionCount < WEEKLY_MILESTONE_TARGET) {
    return { kind: 'boost_milestone', href: '/session' }
  }

  return { kind: 'steady_session', href: '/session' }
}

export function buildPlantTimeline(snapshot: PlantStatusSnapshot): PlantTimelineItem[] {
  const items: PlantTimelineItem[] = []

  const stageDate = snapshot.recentSessions[0]?.date ?? snapshot.plantCreatedAt
  items.push({
    id: `stage-${snapshot.stage}`,
    kind: 'stage',
    date: stageDate,
    stage: snapshot.stage,
  })

  for (const session of snapshot.recentSessions.slice(0, 2)) {
    items.push({
      id: `session-${session.id}`,
      kind: 'session',
      date: session.date,
      skillType: session.skillType ?? 'vocabulary',
      xpEarned: session.xpEarned,
    })
  }

  for (const skinUnlock of snapshot.skinUnlocks.slice(0, 2)) {
    items.push({
      id: `skin-${skinUnlock.skinId}-${skinUnlock.unlockedAt}`,
      kind: 'skin',
      date: skinUnlock.unlockedAt,
      skinId: skinUnlock.skinId,
    })
  }

  if (snapshot.currentStreak >= 7 && snapshot.lastSessionDate) {
    items.push({
      id: `streak-${snapshot.currentStreak}-${snapshot.lastSessionDate}`,
      kind: 'streak',
      date: toIsoFromDateKey(snapshot.lastSessionDate),
      streak: snapshot.currentStreak,
    })
  }

  const deduped = items
    .sort(byNewestDate)
    .slice(0, 5)

  if (deduped.length > 0) {
    return deduped
  }

  return [
    {
      id: 'start',
      kind: 'start',
      date: snapshot.plantCreatedAt,
    },
  ]
}

export function buildPlantStatusSummary(snapshot: PlantStatusSnapshot): PlantStatusSummary {
  return {
    mood: getPlantMood(snapshot),
    risk: getPlantRisk(snapshot),
    diagnoses: getPlantDiagnoses(snapshot),
    recommendation: getPlantRecommendation(snapshot),
    timeline: buildPlantTimeline(snapshot),
  }
}
