import { useState, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useTheme } from '@/hooks/useTheme'
import { Card, Button } from '@/components/ui'
import { spacing, typography } from '@/constants/Tokens'
import { resetDb, getUnlockedSkins, getSetting, setSetting } from '@/db'
import { PLANT_SKINS } from '@/gameplay'
import {
  getNotificationSettings,
  saveNotificationSettings,
  syncNotifications,
  requestNotificationPermissions,
} from '@/hooks/useNotifications'

const HOUR_OPTIONS = [7, 8, 9, 10, 12, 14, 17, 19, 20, 21]

export default function SettingsScreen() {
  const theme = useTheme()
  const router = useRouter()
  const [resetting, setResetting] = useState(false)
  const [notifEnabled, setNotifEnabled] = useState(false)
  const [notifHour, setNotifHour] = useState(9)
  const [activeSkin, setActiveSkin] = useState('classic')
  const [unlockedSkins, setUnlockedSkins] = useState<string[]>(['classic'])

  useEffect(() => {
    ;(async () => {
      const { enabled, hour } = await getNotificationSettings()
      setNotifEnabled(enabled)
      setNotifHour(hour)
      const skins = await getUnlockedSkins()
      setUnlockedSkins(skins)
      const current = await getSetting('activeSkin')
      setActiveSkin(current ?? 'classic')
    })()
  }, [])

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

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[typography.h2, styles.title, { color: theme.text }]}>Settings</Text>

      <Card style={styles.card}>
        <Text style={[typography.body, { color: theme.text, fontWeight: '600' }]}>Notifications</Text>
        <Button
          title={notifEnabled ? 'Disable Reminders' : 'Enable Reminders'}
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

      <Card style={styles.card}>
        <Text style={[typography.body, { color: theme.text, fontWeight: '600' }]}>Plant Skin</Text>
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
            Complete 5 sessions in a week to unlock more skins
          </Text>
        )}
      </Card>

      <Card style={styles.card}>
        <Text style={[typography.body, { color: theme.text, fontWeight: '600' }]}>Data</Text>
        <Text style={[typography.bodySmall, { color: theme.textSecondary, marginTop: spacing.xs }]}>
          Data is stored locally with SQLite.
        </Text>
        <Button
          title={resetting ? 'Resetting...' : 'Reset All Data'}
          variant="secondary"
          onPress={handleReset}
          disabled={resetting}
          style={styles.button}
        />
      </Card>

      {__DEV__ && (
        <Card style={styles.card}>
          <Text style={[typography.body, { color: theme.text, fontWeight: '600' }]}>Developer</Text>
          <Button
            title="Open DB Debug"
            onPress={() => router.push('./db-debug')}
            style={styles.button}
          />
        </Card>
      )}

      <Text style={[typography.caption, styles.version, { color: theme.textSecondary }]}>PlantLearn v1.0.0</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
  },
  title: {
    marginBottom: spacing.md,
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
})
