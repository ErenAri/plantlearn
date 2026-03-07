let _offsetMs = 0

export function getDevNow(): Date {
  return new Date(Date.now() + _offsetMs)
}

export function getDevNowIso(): string {
  return getDevNow().toISOString()
}

export function getDevTodayKey(): string {
  return getDevNowIso().slice(0, 10)
}

export function advanceDays(days: number): void {
  _offsetMs += days * 24 * 60 * 60 * 1000
}

export function resetClock(): void {
  _offsetMs = 0
}

export function getOffsetDays(): number {
  return Math.round(_offsetMs / (24 * 60 * 60 * 1000))
}
