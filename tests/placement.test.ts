import { getAdjacentLevel, getPlacementQuestionSet, evaluatePlacement } from '../services/placementService'

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

function getWrongOptionId(question: ReturnType<typeof getPlacementQuestionSet>[number]): string {
  return question.options.find((option) => option.id !== question.correctOptionId)?.id ?? question.correctOptionId
}

const a2Questions = getPlacementQuestionSet('A2')
const allCorrectA2 = Object.fromEntries(
  a2Questions.map((question) => [question.id, question.correctOptionId]),
)
const halfCorrectA2 = Object.fromEntries(
  a2Questions.map((question, index) => [
    question.id,
    index % 2 === 0 ? question.correctOptionId : getWrongOptionId(question),
  ]),
)
const lowCorrectA2 = Object.fromEntries(
  a2Questions.map((question, index) => [
    question.id,
    index < 2 ? question.correctOptionId : getWrongOptionId(question),
  ]),
)

const unsureQuestions = getPlacementQuestionSet('not_sure')
const allWrongUnsure = Object.fromEntries(
  unsureQuestions.map((question) => [question.id, getWrongOptionId(question)]),
)

assert('A2 question count', a2Questions.length, 6)
assert('adjacent level upward', getAdjacentLevel('A2', 1), 'B1')
assert('adjacent level downward edge', getAdjacentLevel('A1', -1), null)
assert(
  'strong A2 performance moves up',
  evaluatePlacement('A2', allCorrectA2, a2Questions).recommendedLevel,
  'B1',
)
assert(
  'mid A2 performance stays',
  evaluatePlacement('A2', halfCorrectA2, a2Questions).recommendedLevel,
  'A2',
)
assert(
  'low A2 performance moves down',
  evaluatePlacement('A2', lowCorrectA2, a2Questions).recommendedLevel,
  'A1',
)
assert(
  'not sure path can move down to A1',
  evaluatePlacement('not_sure', allWrongUnsure, unsureQuestions).recommendedLevel,
  'A1',
)

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
