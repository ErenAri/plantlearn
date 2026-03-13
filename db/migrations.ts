import type { SQLiteDatabase } from 'expo-sqlite'

import { buildDropCurrentTablesSql } from './schema'

const TARGET_VERSION = 6

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  const versionRow = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version')
  const currentVersion = versionRow?.user_version ?? 0

  if (currentVersion >= TARGET_VERSION) {
    await ensureSchema(db)
    return
  }

  await db.execAsync(`
    DROP TABLE IF EXISTS words;
    ${buildDropCurrentTablesSql()}
  `)

  await ensureSchema(db)
  await db.execAsync(`PRAGMA user_version = ${TARGET_VERSION};`)
}

async function ensureSchema(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS plants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      speciesId TEXT NOT NULL,
      level INTEGER NOT NULL DEFAULT 1,
      xp INTEGER NOT NULL DEFAULT 0,
      health INTEGER NOT NULL DEFAULT 100,
      stage TEXT NOT NULL DEFAULT 'seed',
      totalWater INTEGER NOT NULL DEFAULT 0,
      totalSun INTEGER NOT NULL DEFAULT 0,
      totalFertilizer INTEGER NOT NULL DEFAULT 0,
      totalRoots INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS streaks (
      id INTEGER PRIMARY KEY,
      currentStreak INTEGER NOT NULL DEFAULT 0,
      lastSessionDate TEXT
    );

    CREATE TABLE IF NOT EXISTS srs_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT NOT NULL,
      meaning TEXT NOT NULL,
      example TEXT,
      level TEXT NOT NULL DEFAULT 'A1',
      category TEXT NOT NULL DEFAULT 'general',
      phonetic TEXT,
      interval INTEGER NOT NULL DEFAULT 1,
      ease REAL NOT NULL DEFAULT 2.5,
      dueDate TEXT NOT NULL,
      lastReview TEXT,
      lapses INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      durationSec INTEGER NOT NULL,
      accuracy REAL NOT NULL,
      xpEarned INTEGER NOT NULL,
      nutrientsJson TEXT NOT NULL,
      skillType TEXT NOT NULL DEFAULT 'vocabulary'
    );

    CREATE TABLE IF NOT EXISTS daily_quests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dateKey TEXT NOT NULL,
      questId TEXT NOT NULL,
      progress INTEGER NOT NULL DEFAULT 0,
      target INTEGER NOT NULL,
      completedAt TEXT,
      UNIQUE(dateKey, questId)
    );

    CREATE TABLE IF NOT EXISTS unlocked_skins (
      skinId TEXT PRIMARY KEY,
      weekKey TEXT NOT NULL,
      unlockedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_srs_cards_dueDate ON srs_cards(dueDate);
    CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
    CREATE INDEX IF NOT EXISTS idx_daily_quests_dateKey ON daily_quests(dateKey);

    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      tier TEXT NOT NULL DEFAULT 'bronze',
      unlockedAt TEXT NOT NULL
    );
  `)
}
