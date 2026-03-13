import { CURRENT_TABLES, buildDropCurrentTablesSql } from '../db/schema'

let passed = 0
let failed = 0

function assert(label: string, actual: unknown, expected: unknown) {
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    passed++
  } else {
    failed++
    console.error(`FAIL: ${label} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
  }
}

const dropSql = buildDropCurrentTablesSql()

assert('current tables include achievements', CURRENT_TABLES.includes('achievements'), true)
assert('current tables length', CURRENT_TABLES.length, 8)
assert('drop sql removes achievements', dropSql.includes('DROP TABLE IF EXISTS achievements;'), true)
assert('drop sql removes plants', dropSql.includes('DROP TABLE IF EXISTS plants;'), true)

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
