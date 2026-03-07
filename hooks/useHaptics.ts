import * as Haptics from 'expo-haptics'
import { useCallback } from 'react'
import { Platform } from 'react-native'
import { getSetting } from '@/db'

let muted = false

export async function loadHapticSetting() {
  const val = await getSetting('hapticsMuted')
  muted = val === '1'
}

export function setHapticsMuted(value: boolean) {
  muted = value
}

export function useHaptics() {
  const light = useCallback(() => {
    if (muted || Platform.OS === 'web') return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }, [])

  const medium = useCallback(() => {
    if (muted || Platform.OS === 'web') return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  }, [])

  const heavy = useCallback(() => {
    if (muted || Platform.OS === 'web') return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
  }, [])

  const success = useCallback(() => {
    if (muted || Platform.OS === 'web') return
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }, [])

  const warning = useCallback(() => {
    if (muted || Platform.OS === 'web') return
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
  }, [])

  const error = useCallback(() => {
    if (muted || Platform.OS === 'web') return
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
  }, [])

  return { light, medium, heavy, success, warning, error }
}
