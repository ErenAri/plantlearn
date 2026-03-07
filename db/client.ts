import * as SQLite from 'expo-sqlite'

const DB_NAME = 'plantlearn.db'

let db: SQLite.SQLiteDatabase | null = null

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DB_NAME)
  }
  return db
}
