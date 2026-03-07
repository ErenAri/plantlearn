# PlantLearn 🌱

A gamified language-learning app where every study session grows a virtual plant. Built with Expo SDK 55 and React Native.

## Features

### Core Learning
- **SRS Flashcards** — SM-2 spaced repetition with 195 English→Turkish vocabulary cards
- **Listening Lessons** — TTS audio prompts with 3-choice answers (30 A1-A2 prompts)
- **Speaking Lessons** — On-device speech-to-text with similarity scoring (30 A1-A2 sentences)

### Plant & Progression
- **Plant Growth** — 5 stages: Seed → Sprout → Sapling → Mature → Bloom
- **Nutrients** — Water, Sun, Fertilizer, Roots earned per session based on skill type
- **Health System** — Soft decay on missed days (never kills the plant), recovery sessions to restore health
- **XP & Levels** — Streak bonuses, difficulty multipliers, duration bonuses

### Retention Mechanics
- **Daily Quests** — Review 5 cards, complete 1 listening set, complete 1 speaking set
- **Weekly Milestone** — 5 sessions per week unlocks a new cosmetic plant skin
- **8 Plant Skins** — Classic Fern, Desert Cactus, Tropical Palm, Garden Bloom, Forest Pine, Ocean Garden, Moonlight, Fruit Garden
- **Notifications** — Daily reminder at user-selected time + softer streak-risk reminder
- **Recovery Session** — 2-minute SRS review restores health when plant is struggling

### Session Flow
1. **Warmup** — Review up to 5 due SRS cards (60s limit)
2. **Focus Chooser** — Pick Listening or Speaking
3. **Lesson** — Interactive 3-minute lesson with scoring
4. **Summary** — XP, nutrients, streak, level-ups, skin unlocks

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 55, React Native 0.83.2, React 19.2 |
| Navigation | expo-router ~55.0.4 (file-based) |
| Database | expo-sqlite ~55.0.10 (local SQLite, versioned migrations) |
| TTS | expo-speech ~55.0.8 |
| STT | expo-speech-recognition 3.1.1 |
| Notifications | expo-notifications ~55.0.11 |
| Language | TypeScript ~5.9.2, strict mode |

## Project Structure

```
plantlearn/
├── app/                      # Screens (expo-router file-based routing)
│   ├── (tabs)/
│   │   ├── index.tsx         # Home: plant, health, quests, milestones
│   │   ├── session.tsx       # Session flow: warmup → lesson → summary
│   │   ├── collection.tsx    # Word collection browser
│   │   ├── settings.tsx      # Notifications, skins, data reset
│   │   └── db-debug.tsx      # Dev-only debug panel
│   └── _layout.tsx           # Root layout with DB init
├── gameplay/                 # Pure game logic (no side effects)
│   ├── engine.ts             # Rewards, decay, streak calculations
│   ├── quests.ts             # Daily quests, weekly milestones, skins
│   ├── config.ts             # XP tables, nutrient weights, constants
│   ├── types.ts              # Type definitions
│   └── simulation.ts         # 7-day simulation for testing
├── db/                       # SQLite persistence
│   ├── migrations.ts         # Schema v4 (7 tables)
│   ├── seeds.ts              # 195 Turkish vocab cards + starter plant
│   └── repositories/        # Data access per entity
├── components/               # Reusable UI
│   ├── ListeningLesson.tsx   # TTS + multiple choice
│   ├── SpeakingLesson.tsx    # STT + similarity scoring
│   └── ui/                   # Button, Card primitives
├── hooks/                    # Custom hooks (TTS, STT, DB, notifications)
├── content/                  # 30 listening + 30 speaking prompts
├── utils/                    # Levenshtein distance, similarity scoring
├── dev/                      # Time-travel clock for testing
├── tests/                    # Unit tests (82 assertions total)
└── constants/                # Colors, spacing, typography tokens
```

## Getting Started

```bash
# Install dependencies
npm install

# Start Expo dev server
npm start

# Run on specific platform
npm run android
npm run ios
npm run web

# Type check
npm run typecheck
```

## Testing

```bash
npx tsx tests/retention.test.ts       # 42 assertions — quests, decay, milestones
npx tsx tests/speakingScoring.test.ts  # 26 assertions — similarity, feedback
npx tsx tests/listeningScoring.test.ts # 14 assertions — listening scoring
```

## Dev Tools

The debug panel (Settings → Open DB Debug) provides:
- Row counts for all 7 tables
- Time travel (+1 day, +7 days, reset) for testing quest resets and decay
- Fake session / recovery session simulation
- Daily quest and weekly milestone state inspection
- Streak and decayed health display
- Unlocked skins list

## License

Private project.
