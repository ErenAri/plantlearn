import { getSetting, setSetting } from '@/db'
import * as StoreReview from 'expo-store-review'

const REVIEW_COOLDOWN_DAYS = 30

/**
 * Attempt to show the in-app review prompt if conditions are met:
 * - expo-store-review is available on this platform
 * - User hasn't been prompted in the last 30 days
 * - User hasn't already dismissed/reviewed
 */
export async function maybeRequestReview(): Promise<boolean> {
  const isAvailable = await StoreReview.isAvailableAsync()
  if (!isAvailable) return false

  const lastPrompt = await getSetting('lastReviewPrompt')
  if (lastPrompt) {
    const lastDate = new Date(lastPrompt).getTime()
    const now = Date.now()
    const daysSince = (now - lastDate) / (1000 * 60 * 60 * 24)
    if (daysSince < REVIEW_COOLDOWN_DAYS) return false
  }

  await StoreReview.requestReview()
  await setSetting('lastReviewPrompt', new Date().toISOString())
  return true
}
