import { getDb } from '../client'
import type { PlantProgressPatch, PlantRecord } from '../types'

const PLANT_COLUMNS = 'id, speciesId, level, xp, health, stage, totalWater, totalSun, totalFertilizer, totalRoots, createdAt'

export async function getActivePlant(): Promise<PlantRecord | null> {
  const db = await getDb()
  return db.getFirstAsync<PlantRecord>(
    `SELECT ${PLANT_COLUMNS} FROM plants ORDER BY id DESC LIMIT 1`,
  )
}

export async function upsertPlantProgress(patch: PlantProgressPatch): Promise<PlantRecord> {
  const db = await getDb()
  const current = await getActivePlant()

  if (!current) {
    const createdAt = new Date().toISOString()
    const result = await db.runAsync(
      'INSERT INTO plants (speciesId, level, xp, health, stage, totalWater, totalSun, totalFertilizer, totalRoots, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      patch.speciesId ?? 'starter-fern',
      patch.level ?? 1,
      patch.xp ?? 0,
      patch.health ?? 100,
      patch.stage ?? 'seed',
      patch.totalWater ?? 0,
      patch.totalSun ?? 0,
      patch.totalFertilizer ?? 0,
      patch.totalRoots ?? 0,
      createdAt,
    )

    const inserted = await db.getFirstAsync<PlantRecord>(
      `SELECT ${PLANT_COLUMNS} FROM plants WHERE id = ?`,
      Number(result.lastInsertRowId),
    )

    if (!inserted) {
      throw new Error('Unable to create active plant')
    }

    return inserted
  }

  const next = {
    speciesId: patch.speciesId ?? current.speciesId,
    level: patch.level ?? current.level,
    xp: patch.xp ?? current.xp,
    health: patch.health ?? current.health,
    stage: patch.stage ?? current.stage,
    totalWater: patch.totalWater ?? current.totalWater,
    totalSun: patch.totalSun ?? current.totalSun,
    totalFertilizer: patch.totalFertilizer ?? current.totalFertilizer,
    totalRoots: patch.totalRoots ?? current.totalRoots,
  }

  await db.runAsync(
    'UPDATE plants SET speciesId = ?, level = ?, xp = ?, health = ?, stage = ?, totalWater = ?, totalSun = ?, totalFertilizer = ?, totalRoots = ? WHERE id = ?',
    next.speciesId,
    next.level,
    next.xp,
    next.health,
    next.stage,
    next.totalWater,
    next.totalSun,
    next.totalFertilizer,
    next.totalRoots,
    current.id,
  )

  const updated = await db.getFirstAsync<PlantRecord>(
    `SELECT ${PLANT_COLUMNS} FROM plants WHERE id = ?`,
    current.id,
  )

  if (!updated) {
    throw new Error('Unable to update active plant')
  }

  return updated
}
