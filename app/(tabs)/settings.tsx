import { AppHeader, Button, Card } from '@/components/ui'
import { layout, radius, spacing, typography } from '@/constants/Tokens'
import { getSetting, getUnlockedAchievements, getUnlockedSkins, resetDb, setSetting, type AchievementRecord } from '@/db'
import { ACHIEVEMENT_DEFS, PLANT_SKINS } from '@/gameplay'
import { setSoundMuted } from '@/hooks/useAudio'
import { setHapticsMuted } from '@/hooks/useHaptics'
import {
    getNotificationSettings,
    requestNotificationPermissions,
    saveNotificationSettings,
    syncNotifications,
} from '@/hooks/useNotifications'
import { useTheme } from '@/hooks/useTheme'
import i18n from '@/i18n'
import { getPlacementState } from '@/services/placement'
import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const HOUR_OPTIONS = [7, 8, 9, 10, 12, 14, 17, 19, 20, 21]

const TIER_COLORS: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
}

export default function SettingsScreen() {
  const theme = useTheme()
  const router = useRouter()
  const { t } = useTranslation()
  const [resetting, setResetting] = useState(false)
  const [notifEnabled, setNotifEnabled] = useState(false)
  const [notifHour, setNotifHour] = useState(9)
  const [activeSkin, setActiveSkin] = useState('classic')
  const [unlockedSkins, setUnlockedSkins] = useState<string[]>(['classic'])
  const [soundMuted, setSoundMutedState] = useState(false)
  const [hapticsMuted, setHapticsMutedState] = useState(false)
  const [achievements, setAchievements] = useState<AchievementRecord[]>([])
  const [learningLevel, setLearningLevel] = useState('A1')
  const [recommendedLevel, setRecommendedLevel] = useState<string | null>(null)
  const [placementScore, setPlacementScore] = useState<string | null>(null)

  const loadSettings = useCallback(async () => {
    const { enabled, hour } = await getNotificationSettings()
    setNotifEnabled(enabled)
    setNotifHour(hour)
    const skins = await getUnlockedSkins()
    setUnlockedSkins(skins)
    const current = await getSetting('activeSkin')
    setActiveSkin(current ?? 'classic')
    const sm = await getSetting('soundMuted')
    setSoundMutedState(sm === '1')
    const hm = await getSetting('hapticsMuted')
    setHapticsMutedState(hm === '1')
    const achs = await getUnlockedAchievements()
    setAchievements(achs)
    const placement = await getPlacementState()
    setLearningLevel(placement.learningLevel)
    setRecommendedLevel(placement.recommendedLevel)
    if (placement.correctCount != null && placement.totalQuestions != null) {
      setPlacementScore(`${placement.correctCount}/${placement.totalQuestions}`)
    } else {
      setPlacementScore(null)
    }
  }, [])

  useFocusEffect(useCallback(() => {
    void loadSettings()
  }, [loadSettings]))

  async function handleReset() {
    if (resetting) return
    setResetting(true)
    await resetDb()
    setResetting(false)
  }

  async function toggleNotifications() {
    const next = !notifEnabled
    if (next) {
      const granted = await requestNotificationPermissions()
      if (!granted) return
    }
    setNotifEnabled(next)
    await saveNotificationSettings(next, notifHour, 0)
    if (next) {
      await syncNotifications(false, 0)
    }
  }

  async function changeHour(hour: number) {
    setNotifHour(hour)
    await saveNotificationSettings(notifEnabled, hour, 0)
    if (notifEnabled) {
      await syncNotifications(false, 0)
    }
  }

  async function selectSkin(skinId: string) {
    setActiveSkin(skinId)
    await setSetting('activeSkin', skinId)
  }

  async function changeLanguage(lang: string) {
    await i18n.changeLanguage(lang)
    await setSetting('language', lang)
  }

  async function toggleSound() {
    const next = !soundMuted
    setSoundMutedState(next)
    setSoundMuted(next)
    await setSetting('soundMuted', next ? '1' : '0')
  }

  async function toggleHaptics() {
    const next = !hapticsMuted
    setHapticsMutedState(next)
    setHapticsMuted(next)
    await setSetting('hapticsMuted', next ? '1' : '0')
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <AppHeader eyebrow={t('tabs.settings')} title={t('settings.title')} />

        <Card style={styles.card} tone="muted">
          <Text style={[typography.body, { color: theme.text, fontWeight: '600' }]}>{t('settings.learningLevel')}</Text>
          <Text style={[typography.bodySmall, { color: theme.textSecondary, marginTop: spacing.xs }]}>
            {t('settings.learningLevelHint', { level: learningLevel })}
          </Text>
          {recommendedLevel ? (
            <Text style={[typography.caption, { color: theme.textSecondary, marginTop: spacing.sm }]}>
              {t('settings.recommendedLevel', { level: recommendedLevel, score: placementScore ?? '-' })}
            </Text>
          ) : null}
          <Button
            title={t('settings.retakePlacement')}
            variant="secondary"
            onPress={() => router.push('/placement?from=settings' as any)}
            style={styles.button}
          />
        </Card>

        <Card style={styles.card} tone="muted">
          <Text style={[typography.body, { color: theme.text, fontWeight: '600' }]}>{t('settings.language')}</Text>
          <View style={styles.hourRow}>
            <Button
              title={t('settings.turkish')}
              variant={i18n.language === 'tr' ? 'primary' : 'ghost'}
              onPress={() => changeLanguage('tr')}
              style={styles.hourBtn}
            />
            <Button
              title={t('settings.english')}
              variant={i18n.language === 'en' ? 'primary' : 'ghost'}
              onPress={() => changeLanguage('en')}
              style={styles.hourBtn}
            />
          </View>
        </Card>

        <Card style={styles.card} tone="muted">
          <Text style={[typography.body, { color: theme.text, fontWeight: '600' }]}>{t('settings.soundAndHaptics')}</Text>
          <View style={styles.hourRow}>
            <Button
              title={soundMuted ? t('settings.soundOff') : t('settings.soundOn')}
              variant={soundMuted ? 'ghost' : 'primary'}
              onPress={toggleSound}
              style={styles.hourBtn}
            />
            <Button
              title={hapticsMuted ? t('settings.hapticsOff') : t('settings.hapticsOn')}
              variant={hapticsMuted ? 'ghost' : 'primary'}
              onPress={toggleHaptics}
              style={styles.hourBtn}
            />
          </View>
        </Card>

        <Card style={styles.card} tone="muted">
          <Text style={[typography.body, { color: theme.text, fontWeight: '600' }]}>{t('settings.notifications')}</Text>
          <Button
            title={notifEnabled ? t('settings.disableReminders') : t('settings.enableReminders')}
            variant={notifEnabled ? 'secondary' : 'primary'}
            onPress={toggleNotifications}
            style={styles.button}
          />
          {notifEnabled && (
            <View style={styles.hourRow}>
              {HOUR_OPTIONS.map(h => (
                <Button
                  key={h}
                  title={`${h}:00`}
                  variant={notifHour === h ? 'primary' : 'ghost'}
                  onPress={() => changeHour(h)}
                  style={styles.hourBtn}
                />
              ))}
            </View>
          )}
        </Card>

        <Card style={styles.card} tone="muted">
          <Text style={[typography.body, { color: theme.text, fontWeight: '600' }]}>
            {t('settings.achievements')} ({achievements.length}/{ACHIEVEMENT_DEFS.length})
          </Text>
          <View style={styles.achievementGrid}>
            {ACHIEVEMENT_DEFS.map(def => {
              const unlocked = achievements.some(a => a.id === def.id)
              return (
                <View key={def.id} style={[styles.achievementTile, { backgroundColor: unlocked ? theme.surface : theme.background, borderColor: unlocked ? TIER_COLORS[def.tier] : theme.border }]}>
                  <Text style={{ fontSize: 28, opacity: unlocked ? 1 : 0.3 }}>{def.icon}</Text>
                  <Text style={[typography.caption, { color: unlocked ? theme.text : theme.textSecondary, textAlign: 'center' }]} numberOfLines={2}>
                    {t(`achievements.${def.id}.name` as any)}
                  </Text>
                  {unlocked && (
                    <View style={[styles.tierBadge, { backgroundColor: TIER_COLORS[def.tier] }]}>
                      <Text style={[typography.caption, { color: '#fff', fontSize: 9 }]}>
                        {t(`achievements.tierLabel.${def.tier}` as any)}
                      </Text>
                    </View>
                  )}
                </View>
              )
            })}
          </View>
        </Card>

        <Card style={styles.card} tone="muted">
          <Text style={[typography.body, { color: theme.text, fontWeight: '600' }]}>{t('settings.plantSkin')}</Text>
          <View style={styles.skinGrid}>
            {PLANT_SKINS.filter(s => unlockedSkins.includes(s.id)).map(s => (
              <Button
                key={s.id}
                title={`${s.emojis.bloom} ${s.name}`}
                variant={activeSkin === s.id ? 'primary' : 'ghost'}
                onPress={() => selectSkin(s.id)}
                style={styles.skinBtn}
              />
            ))}
          </View>
          {unlockedSkins.length < PLANT_SKINS.length && (
            <Text style={[typography.caption, { color: theme.textSecondary, marginTop: spacing.xs }]}>
              {t('settings.unlockMoreSkins')}
            </Text>
          )}
        </Card>

        <Card style={styles.card} tone="muted">
          <Text style={[typography.body, { color: theme.text, fontWeight: '600' }]}>{t('settings.data')}</Text>
          <Text style={[typography.bodySmall, { color: theme.textSecondary, marginTop: spacing.xs }]}>
            {t('settings.dataStoredLocally')}
          </Text>
          <Button
            title={resetting ? t('settings.resetting') : t('settings.resetAllData')}
            variant="secondary"
            onPress={handleReset}
            disabled={resetting}
            style={styles.button}
          />
        </Card>

        {__DEV__ && (
          <Card style={styles.card} tone="muted">
            <Text style={[typography.body, { color: theme.text, fontWeight: '600' }]}>{t('settings.developer')}</Text>
            <Button
              title={t('settings.openDbDebug')}
              onPress={() => router.push('./db-debug')}
              style={styles.button}
            />
          </Card>
        )}

        <Text style={[typography.caption, styles.version, { color: theme.textSecondary }]}>{t('settings.version', { version: '1.0.0' })}</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: layout.screenGutter,
    paddingBottom: spacing.xxl,
  },
  card: {
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.md,
  },
  version: {
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  hourRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  hourBtn: {
    paddingHorizontal: spacing.sm,
  },
  skinGrid: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  skinBtn: {
    alignSelf: 'flex-start',
  },
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  achievementTile: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
    width: 90,
    minHeight: 90,
    gap: spacing.xs,
  },
  tierBadge: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 1,
    borderRadius: radius.sm,
  },
})
