# Calimali App

Mobile client for Calimali — a calisthenics fitness tracking app. Browse exercises, plan workouts, track live sessions, log body weight, and earn XP/streaks.

## Tech Stack
- Expo ~54 / React Native 0.81 / TypeScript
- Expo Router ~6 (file-based routing)
- TailwindCSS 3 + NativeWind 4
- react-native-reanimated, @gorhom/bottom-sheet

## Quick Start

### One command (over USB — no Wi-Fi, no ports, no firewall)

This is a **development-build** project (expo-dev-client + reanimated 4), so it runs
as your installed dev build (`com.calimali.app`), **not** Expo Go. Dev runs entirely
on this PC and reaches the phone over the **USB cable** via `adb reverse` — the phone's
`localhost` is forwarded to this PC, so there's nothing to open in the firewall. The
backend uses a **local SQLite file** (`calimali_dev.db`) — no Postgres/Docker/homelab,
and production is untouched.

**One-time:** plug the phone in, enable **Developer Options → USB debugging**, tap
**Allow** on the phone. Then, if the dev build isn't installed yet, `dev.sh` builds and
installs it for you (or run `npm run android` once).

From **Git Bash**:

```bash
./scripts/dev.sh --seed       # first-time: create the SQLite schema + seed data, then run
./scripts/dev.sh              # daily run
```

What it does: verifies a USB device is connected, sets `adb reverse` for `5035` (API)
and `8081` (Metro), writes `.env.development.local` with
`EXPO_PUBLIC_API_URL=http://localhost:5035` (loaded above `.env`, so dev targets this
local backend while release builds keep the prod URL), starts the backend on
`127.0.0.1:5035`, and runs Metro for the dev build (`expo start --dev-client`). Open the
Calimali app on the phone (or press `a` in the terminal to launch it).

Requirements: **.NET 8 SDK**, **Node 20+**, and the **Android SDK platform-tools**
(`adb`, resolved from PATH or the default SDK location).

Backend logs stream to `.dev-backend.log`. To reset the dev data, delete
`../calimali-backend/CalimaliAPI/calimali_dev.db` and run `./scripts/dev.sh --seed`
again.

### Manual

```bash
npm install
```

Create `.env` from the example and fill in your values:
```bash
cp .env.example .env
```

Start the dev server (backend must be running separately):
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
