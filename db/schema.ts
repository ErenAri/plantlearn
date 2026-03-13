export const CURRENT_TABLES = [
  'plants',
  'streaks',
  'srs_cards',
  'sessions',
  'daily_quests',
  'unlocked_skins',
  'user_settings',
  'achievements',
] as const

export function buildDropCurrentTablesSql(): string {
  return CURRENT_TABLES.map((table) => `DROP TABLE IF EXISTS ${table};`).join('\n')
}
