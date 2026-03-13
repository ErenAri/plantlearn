import type { CefrLevel } from '@/db/types'

export interface PlacementOption {
  id: string
  label: string
}

export interface PlacementQuestion {
  id: string
  level: CefrLevel
  skill: 'grammar' | 'reading' | 'vocabulary'
  prompt: string
  options: PlacementOption[]
  correctOptionId: string
}

export const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  {
    id: 'a1-1',
    level: 'A1',
    skill: 'grammar',
    prompt: 'Choose the correct sentence: I ___ a student.',
    options: [
      { id: 'a', label: 'am' },
      { id: 'b', label: 'is' },
      { id: 'c', label: 'are' },
      { id: 'd', label: 'be' },
    ],
    correctOptionId: 'a',
  },
  {
    id: 'a1-2',
    level: 'A1',
    skill: 'vocabulary',
    prompt: 'Choose the best answer: "Good morning!"',
    options: [
      { id: 'a', label: 'Good morning!' },
      { id: 'b', label: 'Good night!' },
      { id: 'c', label: 'See you yesterday!' },
      { id: 'd', label: 'I am pencil.' },
    ],
    correctOptionId: 'a',
  },
  {
    id: 'a1-3',
    level: 'A1',
    skill: 'grammar',
    prompt: 'Where ___ you from?',
    options: [
      { id: 'a', label: 'is' },
      { id: 'b', label: 'am' },
      { id: 'c', label: 'are' },
      { id: 'd', label: 'be' },
    ],
    correctOptionId: 'c',
  },
  {
    id: 'a2-1',
    level: 'A2',
    skill: 'grammar',
    prompt: 'Yesterday I ___ to the market with my sister.',
    options: [
      { id: 'a', label: 'go' },
      { id: 'b', label: 'went' },
      { id: 'c', label: 'goes' },
      { id: 'd', label: 'going' },
    ],
    correctOptionId: 'b',
  },
  {
    id: 'a2-2',
    level: 'A2',
    skill: 'reading',
    prompt: 'Tom gets up at 7, takes the bus, and starts work at 8. How does Tom go to work?',
    options: [
      { id: 'a', label: 'By bus' },
      { id: 'b', label: 'By train' },
      { id: 'c', label: 'By car' },
      { id: 'd', label: 'On foot' },
    ],
    correctOptionId: 'a',
  },
  {
    id: 'a2-3',
    level: 'A2',
    skill: 'grammar',
    prompt: 'Choose the best reply: "What did you do last weekend?"',
    options: [
      { id: 'a', label: 'I visited my aunt.' },
      { id: 'b', label: 'I am visit my aunt.' },
      { id: 'c', label: 'I visiting my aunt.' },
      { id: 'd', label: 'I has visited my aunt.' },
    ],
    correctOptionId: 'a',
  },
  {
    id: 'b1-1',
    level: 'B1',
    skill: 'grammar',
    prompt: 'If it rains, we ___ at home.',
    options: [
      { id: 'a', label: 'stayed' },
      { id: 'b', label: 'stays' },
      { id: 'c', label: 'will stay' },
      { id: 'd', label: 'staying' },
    ],
    correctOptionId: 'c',
  },
  {
    id: 'b1-2',
    level: 'B1',
    skill: 'grammar',
    prompt: 'I have lived here ___ 2019.',
    options: [
      { id: 'a', label: 'since' },
      { id: 'b', label: 'for' },
      { id: 'c', label: 'from' },
      { id: 'd', label: 'at' },
    ],
    correctOptionId: 'a',
  },
  {
    id: 'b1-3',
    level: 'B1',
    skill: 'reading',
    prompt:
      'Sara was tired after work, but she still went to the gym because she wanted to stay healthy. Why did she go to the gym?',
    options: [
      { id: 'a', label: 'She had a meeting there.' },
      { id: 'b', label: 'She wanted to stay healthy.' },
      { id: 'c', label: 'She forgot her bag there.' },
      { id: 'd', label: 'Her office was inside the gym.' },
    ],
    correctOptionId: 'b',
  },
  {
    id: 'b2-1',
    level: 'B2',
    skill: 'grammar',
    prompt: 'By the time I arrived, they ___ dinner.',
    options: [
      { id: 'a', label: 'finish' },
      { id: 'b', label: 'had finished' },
      { id: 'c', label: 'have finished' },
      { id: 'd', label: 'were finish' },
    ],
    correctOptionId: 'b',
  },
  {
    id: 'b2-2',
    level: 'B2',
    skill: 'grammar',
    prompt: 'The report was delayed ___ several team members were absent.',
    options: [
      { id: 'a', label: 'because' },
      { id: 'b', label: 'although' },
      { id: 'c', label: 'unless' },
      { id: 'd', label: 'however' },
    ],
    correctOptionId: 'a',
  },
  {
    id: 'b2-3',
    level: 'B2',
    skill: 'reading',
    prompt:
      'The article argues that remote work can improve productivity, but only when teams have clear routines and strong communication. What is the main idea?',
    options: [
      { id: 'a', label: 'Remote work always reduces productivity.' },
      { id: 'b', label: 'Productivity improves automatically at home.' },
      { id: 'c', label: 'Remote work works best with structure and communication.' },
      { id: 'd', label: 'Teams should avoid remote work completely.' },
    ],
    correctOptionId: 'c',
  },
]
