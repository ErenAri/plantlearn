import { useCallback, useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/hooks/useTheme'
import { Card, Button } from '@/components/ui'
import { spacing, typography } from '@/constants/Tokens'
import {
  getDb,
  getActivePlant,
  getDueCards,
  reviewCard,
  logSession,
  listSessions,
  upsertPlantProgress,
  updateStreak,
  getStreak,
  getOrCreateDailyQuests,
  incrementQuestProgress,
  getWeekSessionCount,
  getUnlockedSkins,
  unlockSkin,
  getSkinUnlockedForWeek,
  type PlantRecord,
  type SessionRow,
  type DailyQuestRecord,
} from '@/db'
import {
  computeSessionRewards,
  applyRewardsToPlant,
  applyStreakUpdate,
  computeDecayOnly,
  buildDailyQuestStates,
  isoWeekBounds,
  weekKeyFromDate,
  nextUnlockableSkin,
  RECOVERY_HEALTH_RESTORE,
  MAX_HEALTH,
  WEEKLY_MILESTONE_TARGET,
  PLANT_SKINS,
  type PlantState,
  type StreakState,
  type DailyQuestState,
} from '@/gameplay'
import { simulate7Days, formatSimResults } from '@/gameplay/simulation'
import { getDevNowIso, getDevTodayKey, advanceDays, resetClock, getOffsetDays } from '@/dev/clock'

type Counts = {
  plants: number
  streaks: number
  srs_cards: number
  sessions: number
  daily_quests: number
  unlocked_skins: number
}

export default function DbDebugScreen() {
  const theme = useTheme()
  const [counts, setCounts] = useState<Counts>({ plants: 0, streaks: 0, srs_cards: 0, sessions: 0, daily_quests: 0, unlocked_skins: 0 })
  const [activePlant, setActivePlant] = useState<PlantRecord | null>(null)
  const [recentSessions, setRecentSessions] = useState<SessionRow[]>([])
  const [runningFakeSession, setRunningFakeSession] = useState(false)
  const [simOutput, setSimOutput] = useState<string | null>(null)
  const [clockOffset, setClockOffset] = useState(getOffsetDays())
  const [quests, setQuests] = useState<DailyQuestState[]>([])
  const [weekSessions, setWeekSessions] = useState(0)
  const [unlockedSkins, setUnlockedSkins] = useState<string[]>([])
  const [streakInfo, setStreakInfo] = useState<{ streak: number; lastDate: string | null }>({ streak: 0, lastDate: null })
  const [decayedHealth, setDecayedHealth] = useState(100)

  const loadSnapshot = useCallback(async () => {
    const db = await getDb()
    const todayKey = getDevTodayKey()

    const [plantsCount, streaksCount, cardsCount, sessionsCount, questsCount, skinsCount, plant, sessions] = await Promise.all([
      db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM plants'),
      db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM streaks'),
      db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM srs_cards'),
      db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM sessions'),
      db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM daily_quests'),
      db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM unlocked_skins'),
      getActivePlant(),
      listSessions(5),
    ])

    setCounts({
      plants: plantsCount?.count ?? 0,
      streaks: streaksCount?.count ?? 0,
      srs_cards: cardsCount?.count ?? 0,
      sessions: sessionsCount?.count ?? 0,
      daily_quests: questsCount?.count ?? 0,
      unlocked_skins: skinsCount?.count ?? 0,
    })
    setActivePlant(plant)
    setRecentSessions(sessions)

    const questRows = await getOrCreateDailyQuests(todayKey)
    const progressMap: Record<string, number> = {}
    for (const q of questRows) progressMap[q.questId] = q.progress
    setQuests(buildDailyQuestStates(progressMap))

    const { monday, sunday } = isoWeekBounds(todayKey)
    const wCount = await getWeekSessionCount(monday, sunday)
    setWeekSessions(wCount)

    const skins = await getUnlockedSkins()
    setUnlockedSkins(skins)

    const s = await getStreak()
    setStreakInfo({ streak: s.currentStreak, lastDate: s.lastSessionDate })

    if (plant) {
      const plantState: PlantState = { level: plant.level, xp: plant.xp, health: plant.health, stage: plant.stage, totalWater: plant.totalWater, totalSun: plant.totalSun, totalFertilizer: plant.totalFertilizer, totalRoots: plant.totalRoots }
      setDecayedHealth(Math.round(computeDecayOnly(plantState, s.lastSessionDate, getDevNowIso())))
    }
  }, [])

  const runFakeSession = useCallback(async () => {
    if (runningFakeSession) return
    setRunningFakeSession(true)

    const now = getDevNowIso()
    const todayKey = getDevTodayKey()
    const dueCards = await getDueCards(5)
    const reviewedCards = dueCards.slice(0, 3)

    for (const [i, card] of reviewedCards.entries()) {
      await reviewCard(card.id, i === 0 ? 4 : 3)
    }

    const reviewed = reviewedCards.length
    const accuracy = reviewed === 0 ? 1 : 0.8

    const rewards = computeSessionRewards({
      skillType: 'vocabulary',
      difficulty: 'medium',
      accuracy,
      durationSec: Math.max(60, reviewed * 20),
    })

    const streakRow = await getStreak()
    const oldStreak: StreakState = { currentStreak: streakRow.currentStreak, lastSessionDate: streakRow.lastSessionDate }

    const plantRow = await getActivePlant()
    const oldPlant: PlantState = plantRow
      ? { level: plantRow.level, xp: plantRow.xp, health: plantRow.health, stage: plantRow.stage, totalWater: plantRow.totalWater, totalSun: plantRow.totalSun, totalFertilizer: plantRow.totalFertilizer, totalRoots: plantRow.totalRoots }
      : { level: 1, xp: 0, health: 100, stage: 'seed', totalWater: 0, totalSun: 0, totalFertilizer: 0, totalRoots: 0 }

    const newPlant = applyRewardsToPlant(oldPlant, rewards, oldStreak, now)

    await logSession({
      date: now,
      durationSec: Math.max(60, reviewed * 20),
      accuracy,
      xpEarned: rewards.xp,
      nutrientsJson: JSON.stringify(rewards.nutrients),
    })

    await upsertPlantProgress({
      xp: newPlant.xp,
      level: newPlant.level,
      health: newPlant.health,
      stage: newPlant.stage,
      totalWater: newPlant.totalWater,
      totalSun: newPlant.totalSun,
      totalFertilizer: newPlant.totalFertilizer,
      totalRoots: newPlant.totalRoots,
    })

    await updateStreak(now)

    if (reviewed > 0) {
      await incrementQuestProgress(todayKey, 'review_5', reviewed)
    }

    const { monday, sunday } = isoWeekBounds(todayKey)
    const weekKey = weekKeyFromDate(todayKey)
    const weekCount = await getWeekSessionCount(monday, sunday)
    if (weekCount >= WEEKLY_MILESTONE_TARGET) {
      const existing = await getSkinUnlockedForWeek(weekKey)
      if (!existing) {
        const ids = await getUnlockedSkins()
        const next = nextUnlockableSkin(ids)
        if (next) await unlockSkin(next, weekKey)
      }
    }

    await loadSnapshot()
    setRunningFakeSession(false)
  }, [loadSnapshot, runningFakeSession])

  const runRecoverySession = useCallback(async () => {
    if (runningFakeSession) return
    setRunningFakeSession(true)

    const now = getDevNowIso()
    const todayKey = getDevTodayKey()

    const rewards = computeSessionRewards({
      skillType: 'vocabulary',
      difficulty: 'easy',
      accuracy: 0.8,
      durationSec: 120,
    })

    const streakRow = await getStreak()
    const oldStreak: StreakState = { currentStreak: streakRow.currentStreak, lastSessionDate: streakRow.lastSessionDate }
    const plantRow = await getActivePlant()
    const oldPlant: PlantState = plantRow
      ? { level: plantRow.level, xp: plantRow.xp, health: plantRow.health, stage: plantRow.stage, totalWater: plantRow.totalWater, totalSun: plantRow.totalSun, totalFertilizer: plantRow.totalFertilizer, totalRoots: plantRow.totalRoots }
      : { level: 1, xp: 0, health: 100, stage: 'seed', totalWater: 0, totalSun: 0, totalFertilizer: 0, totalRoots: 0 }

    const newPlant = applyRewardsToPlant(oldPlant, rewards, oldStreak, now)
    newPlant.health = Math.min(MAX_HEALTH, newPlant.health + RECOVERY_HEALTH_RESTORE)

    await logSession({ date: now, durationSec: 120, accuracy: 0.8, xpEarned: rewards.xp, nutrientsJson: JSON.stringify(rewards.nutrients) })
    await upsertPlantProgress({ xp: newPlant.xp, level: newPlant.level, health: newPlant.health, stage: newPlant.stage, totalWater: newPlant.totalWater, totalSun: newPlant.totalSun, totalFertilizer: newPlant.totalFertilizer, totalRoots: newPlant.totalRoots })
    await updateStreak(now)
    await incrementQuestProgress(todayKey, 'review_5', 3)

    await loadSnapshot()
    setRunningFakeSession(false)
  }, [loadSnapshot, runningFakeSession])

  const forceCompleteQuests = useCallback(async () => {
    const todayKey = getDevTodayKey()
    await incrementQuestProgress(todayKey, 'review_5', 5)
    await incrementQuestProgress(todayKey, 'listening_1', 1)
    await incrementQuestProgress(todayKey, 'speaking_1', 1)
    await loadSnapshot()
  }, [loadSnapshot])

  const runSimulation = useCallback(() => {
    const results = simulate7Days()
    setSimOutput(formatSimResults(results))
  }, [])

  useEffect(() => {
    loadSnapshot()
  }, [loadSnapshot])

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      <Text style={[typography.h2, { color: theme.text }]}>DB Debug</Text>
      <Text style={[typography.bodySmall, { color: theme.textSecondary, marginTop: spacing.xs }]}>
        Row counts, plant state, and simulation
      </Text>

      <Card style={styles.card}>
        <Text style={[typography.body, { color: theme.text, fontWeight: '600' }]}>Row Counts</Text>
        <View style={styles.row}>
          <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>plants</Text>
          <Text style={[typography.body, { color: theme.text }]}>{counts.plants}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>streaks</Text>
          <Text style={[typography.body, { color: theme.text }]}>{counts.streaks}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>srs_cards</Text>
          <Text style={[typography.body, { color: theme.text }]}>{counts.srs_cards}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>sessions</Text>
          <Text style={[typography.body, { color: theme.text }]}>{counts.sessions}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>daily_quests</Text>
          <Text style={[typography.body, { color: theme.text }]}>{counts.daily_quests}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>unlocked_skins</Text>
          <Text style={[typography.body, { color: theme.text }]}>{counts.unlocked_skins}</Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={[typography.body, { color: theme.text, fontWeight: '600' }]}>Active Plant</Text>
        {activePlant ? (
          <View style={styles.plantBlock}>
            <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>speciesId: {activePlant.speciesId}</Text>
            <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>level: {activePlant.level}  xp: {activePlant.xp}  health: {activePlant.health}</Text>
            <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>stage: {activePlant.stage}</Text>
            <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>W:{activePlant.totalWater} S:{activePlant.totalSun} F:{activePlant.totalFertilizer} R:{activePlant.totalRoots}</Text>
          </View>
        ) : (
          <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>No active plant</Text>
        )}
      </Card>

      <Card style={styles.card}>
        <Text style={[typography.body, { color: theme.text, fontWeight: '600' }]}>Recent Sessions</Text>
        {recentSessions.length === 0 ? (
          <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>No sessions logged</Text>
        ) : (
          recentSessions.map(session => (
            <View style={styles.sessionRow} key={session.id}>
              <Text style={[typography.caption, { color: theme.textSecondary }]}>#{session.id}</Text>
              <Text style={[typography.caption, { color: theme.textSecondary }]}>xp {session.xpEarned}</Text>
              <Text style={[typography.caption, { color: theme.textSecondary }]}>acc {Math.round(session.accuracy * 100)}%</Text>
            </View>
          ))
        )}
      </Card>

      <Button
        title={runningFakeSession ? 'Running...' : 'Run Fake Session'}
        onPress={runFakeSession}
        disabled={runningFakeSession}
        style={styles.button}
      />

      <Button
        title={runningFakeSession ? 'Running...' : 'Simulate Recovery'}
        onPress={runRecoverySession}
        disabled={runningFakeSession}
        style={styles.button}
      />

      <Button title="Force Complete Quests" variant="secondary" onPress={forceCompleteQuests} style={styles.button} />

      <Button title="Refresh Snapshot" variant="secondary" onPress={loadSnapshot} style={styles.button} />

      <Button title="Run 7-Day Simulation" variant="secondary" onPress={runSimulation} style={styles.button} />

      <Card style={styles.card}>
        <Text style={[typography.body, { color: theme.text, fontWeight: '600' }]}>Time Travel (Dev)</Text>
        <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>Offset: {clockOffset} days</Text>
        <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>Dev "now": {getDevNowIso().slice(0, 16)}</Text>
        <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>Today key: {getDevTodayKey()}</Text>
        <View style={styles.clockRow}>
          <Button title="+1 Day" variant="secondary" onPress={() => { advanceDays(1); setClockOffset(getOffsetDays()); loadSnapshot() }} style={styles.clockBtn} />
          <Button title="+7 Days" variant="secondary" onPress={() => { advanceDays(7); setClockOffset(getOffsetDays()); loadSnapshot() }} style={styles.clockBtn} />
          <Button title="Reset" variant="secondary" onPress={() => { resetClock(); setClockOffset(0); loadSnapshot() }} style={styles.clockBtn} />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={[typography.body, { color: theme.text, fontWeight: '600' }]}>Retention: Daily Quests</Text>
        <Text style={[typography.caption, { color: theme.textSecondary }]}>Date: {getDevTodayKey()}</Text>
        {quests.map(q => (
          <View style={styles.row} key={q.id}>
            <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>{q.done ? '✅' : '⬜'} {q.title}</Text>
            <Text style={[typography.body, { color: theme.text }]}>{q.progress}/{q.target}</Text>
          </View>
        ))}
      </Card>

      <Card style={styles.card}>
        <Text style={[typography.body, { color: theme.text, fontWeight: '600' }]}>Retention: Weekly Milestone</Text>
        <View style={styles.row}>
          <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>Sessions this week</Text>
          <Text style={[typography.body, { color: theme.text }]}>{weekSessions}/{WEEKLY_MILESTONE_TARGET}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>Milestone</Text>
          <Text style={[typography.body, { color: weekSessions >= WEEKLY_MILESTONE_TARGET ? theme.accent : theme.text }]}>
            {weekSessions >= WEEKLY_MILESTONE_TARGET ? '🏆 Achieved' : 'In progress'}
          </Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={[typography.body, { color: theme.text, fontWeight: '600' }]}>Retention: Streak & Decay</Text>
        <View style={styles.row}>
          <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>Streak</Text>
          <Text style={[typography.body, { color: theme.text }]}>🔥 {streakInfo.streak}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>Last session</Text>
          <Text style={[typography.body, { color: theme.text }]}>{streakInfo.lastDate ?? 'never'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>Stored health</Text>
          <Text style={[typography.body, { color: theme.text }]}>{activePlant?.health ?? 100}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>Decayed health</Text>
          <Text style={[typography.body, { color: decayedHealth < 30 ? theme.danger : theme.text }]}>{decayedHealth}</Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={[typography.body, { color: theme.text, fontWeight: '600' }]}>Unlocked Skins</Text>
        {unlockedSkins.map(id => {
          const skin = PLANT_SKINS.find(s => s.id === id)
          return (
            <Text key={id} style={[typography.bodySmall, { color: theme.textSecondary }]}>
              {skin ? `${skin.emojis.bloom} ${skin.name}` : id}
            </Text>
          )
        })}
      </Card>

      {simOutput && (
        <Card style={styles.card}>
          <Text style={[typography.body, { color: theme.text, fontWeight: '600' }]}>Simulation Output</Text>
          <Text style={[typography.caption, { color: theme.textSecondary, fontFamily: 'monospace' }]}>{simOutput}</Text>
        </Card>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  card: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  plantBlock: {
    gap: spacing.xs,
  },
  sessionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  button: {
    marginTop: spacing.xs,
  },
  clockRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  clockBtn: {
    flex: 1,
  },
})
