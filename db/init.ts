import { getDb } from './client'
import { runMigrations } from './migrations'
import { seedIfEmpty } from './seeds'

let initPromise: Promise<void> | null = null

export async function initializeDb(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const db = await getDb()
      await runMigrations(db)
      await seedIfEmpty(db)
    })()
  }

  return initPromise
}

export async function resetDb(): Promise<void> {
  const db = await getDb()
  await db.execAsync(`
    DROP TABLE IF EXISTS plants;
    DROP TABLE IF EXISTS streaks;
    DROP TABLE IF EXISTS srs_cards;
    DROP TABLE IF EXISTS sessions;
    DROP TABLE IF EXISTS daily_quests;
    DROP TABLE IF EXISTS unlocked_skins;
    DROP TABLE IF EXISTS user_settings;
    PRAGMA user_version = 0;
  `)
  initPromise = null
  await initializeDb()
}
