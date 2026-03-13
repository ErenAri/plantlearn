import {
  averageDifficulty,
  buildTimedAccuracyLessonResult,
  pickQuestionsByDifficulty,
  shuffleArray,
  type QuestionDistribution,
} from '../utils/lessonUtils'

type PromptStub = {
  id: string
  difficulty: 'easy' | 'medium' | 'hard'
}

let passed = 0
let failed = 0

function assert(label: string, actual: unknown, expected: unknown) {
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    passed++
  } else {
    failed++
    console.error(`FAIL: ${label} - expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
  }
}

function createRandom(sequence: number[]): () => number {
  let index = 0
  return () => sequence[index++] ?? 0
}

const prompts: PromptStub[] = [
  { id: 'e1', difficulty: 'easy' },
  { id: 'e2', difficulty: 'easy' },
  { id: 'e3', difficulty: 'easy' },
  { id: 'm1', difficulty: 'medium' },
  { id: 'm2', difficulty: 'medium' },
  { id: 'h1', difficulty: 'hard' },
  { id: 'h2', difficulty: 'hard' },
]

const sampleDistribution: QuestionDistribution = {
  easy: 1,
  medium: 1,
  hard: 1,
}

const shuffled = shuffleArray([1, 2, 3, 4], createRandom([0.9, 0.1, 0.5]))
assert('shuffleArray preserves Fisher-Yates behavior', shuffled, [3, 2, 1, 4])

const originalOrder = prompts.map((prompt) => prompt.id)
const picked = pickQuestionsByDifficulty(
  prompts,
  sampleDistribution,
  createRandom([0, 0, 0, 0.9, 0.1]),
)
assert(
  'pickQuestionsByDifficulty selects the requested mix with deterministic shuffle',
  picked.map((prompt) => prompt.id),
  ['m2', 'h1', 'e2'],
)
assert(
  'pickQuestionsByDifficulty does not mutate the source collection',
  prompts.map((prompt) => prompt.id),
  originalOrder,
)
assert(
  'pickQuestionsByDifficulty returns available prompts when a bucket is short',
  pickQuestionsByDifficulty(
    prompts,
    { easy: 0, medium: 0, hard: 3 },
    createRandom([0, 0]),
  ).map((prompt) => prompt.id),
  ['h1', 'h2'],
)

assert(
  'averageDifficulty resolves easy threshold',
  averageDifficulty([
    { difficulty: 'easy' },
    { difficulty: 'easy' },
    { difficulty: 'medium' },
  ]),
  'easy',
)
assert(
  'averageDifficulty resolves medium threshold',
  averageDifficulty([
    { difficulty: 'easy' },
    { difficulty: 'medium' },
    { difficulty: 'hard' },
  ]),
  'medium',
)
assert(
  'averageDifficulty preserves hard fallback for empty lists',
  averageDifficulty([]),
  'hard',
)

const originalNow = Date.now
Date.now = () => 7_000
const result = buildTimedAccuracyLessonResult(
  3,
  2,
  4_000,
  [
    { difficulty: 'easy' },
    { difficulty: 'medium' },
    { difficulty: 'medium' },
    { difficulty: 'hard' },
    { difficulty: 'hard' },
  ],
)
Date.now = originalNow

assert(
  'buildTimedAccuracyLessonResult returns the shared timed accuracy shape',
  result,
  {
    correct: 3,
    wrong: 2,
    total: 5,
    accuracy: 0.6,
    durationSec: 3,
    difficulty: 'medium',
  },
)

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
