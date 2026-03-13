import { getDb } from './client'
import { runMigrations } from './migrations'
import { buildDropCurrentTablesSql } from './schema'
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
    ${buildDropCurrentTablesSql()}
    PRAGMA user_version = 0;
  `)
  initPromise = null
  await initializeDb()
}
