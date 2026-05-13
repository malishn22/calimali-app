# Calimali App

Mobile client for Calimali — a calisthenics fitness tracking app. Browse exercises, plan workouts, track live sessions, log body weight, and earn XP/streaks.

## Tech Stack
- Expo ~54 / React Native 0.81 / TypeScript
- Expo Router ~6 (file-based routing)
- TailwindCSS 3 + NativeWind 4
- react-native-reanimated, @gorhom/bottom-sheet

## Quick Start

```bash
npm install
```

Create `.env` from the example and fill in your values:
```bash
cp .env.example .env
```

Start the dev server:
```bash
npx expo start
```

## Docs
- [Setup Guide](docs/SETUP.md) — full setup + troubleshooting
- [Quick Start Checklist](docs/QUICK_START.md) — daily dev checklist
- [Release Build](docs/RELEASE.md) — build an installable APK
- [Gamification Ideas](docs/GAMIFICATION_IDEAS.md) — future feature ideas

## Backend
The API server lives in the sibling repo.
