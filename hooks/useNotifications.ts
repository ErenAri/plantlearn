import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { getSetting, setSetting } from '@/db'

const DAILY_ID = 'daily-reminder'
const STREAK_RISK_ID = 'streak-risk'

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync()
    if (existing === 'granted') return true
    const { status } = await Notifications.requestPermissionsAsync()
    return status === 'granted'
  } catch {
    return false
  }
}

export async function syncNotifications(
  hasSessionToday: boolean,
  currentStreak: number,
): Promise<void> {
  try {
    const enabled = await getSetting('notificationsEnabled')
    if (enabled !== '1') return

    const granted = await requestNotificationPermissions()
    if (!granted) return

    const hourStr = await getSetting('reminderHour')
    const minuteStr = await getSetting('reminderMinute')
    const hour = hourStr ? parseInt(hourStr, 10) : 9
    const minute = minuteStr ? parseInt(minuteStr, 10) : 0

    await Notifications.cancelAllScheduledNotificationsAsync()

    if (Platform.OS === 'web') return

    await Notifications.scheduleNotificationAsync({
      identifier: DAILY_ID,
      content: {
        title: '🌱 Time to learn!',
        body: 'Your plant is waiting. Start a quick session!',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    })

    if (!hasSessionToday && currentStreak > 0) {
      const riskHour = Math.min(hour + 4, 21)
      await Notifications.scheduleNotificationAsync({
        identifier: STREAK_RISK_ID,
        content: {
          title: '🌿 Quick check-in',
          body: 'Your plant needs a quick check-in',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: riskHour,
          minute: 0,
        },
      })
    }
  } catch {
    // gracefully ignore on unsupported platforms
  }
}

export async function cancelStreakRiskNotification(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(STREAK_RISK_ID)
  } catch {
    // noop
  }
}

export async function getNotificationSettings(): Promise<{
  enabled: boolean
  hour: number
  minute: number
}> {
  const enabled = await getSetting('notificationsEnabled')
  const hourStr = await getSetting('reminderHour')
  const minuteStr = await getSetting('reminderMinute')
  return {
    enabled: enabled === '1',
    hour: hourStr ? parseInt(hourStr, 10) : 9,
    minute: minuteStr ? parseInt(minuteStr, 10) : 0,
  }
}

export async function saveNotificationSettings(
  enabled: boolean,
  hour: number,
  minute: number,
): Promise<void> {
  await setSetting('notificationsEnabled', enabled ? '1' : '0')
  await setSetting('reminderHour', String(hour))
  await setSetting('reminderMinute', String(minute))
}
