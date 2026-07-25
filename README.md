# Calimali App

Mobile client for Calimali — a calisthenics fitness tracking app. Browse exercises, plan workouts, track live sessions, log body weight, and earn XP/streaks.

## Tech Stack
- Expo ~54 / React Native 0.81 / TypeScript
- Expo Router ~6 (file-based routing)
- TailwindCSS 3 + NativeWind 4
- react-native-reanimated, @gorhom/bottom-sheet

## Quick Start

### One command (backend + app)

From **Git Bash**, this starts the backend API (background, bound to `0.0.0.0:5035`
so your phone can reach it) and the Expo dev server (foreground), then stops the
backend when you Ctrl+C:

```bash
./scripts/dev.sh
```

Open **Expo Go on your phone** and scan the QR. Requirements:
- Phone and PC on the **same Wi-Fi**.
- `EXPO_PUBLIC_API_URL=http://<PC-LAN-IP>:5035` in `.env` (the script prints your
  LAN IP candidates; `localhost`/`10.0.2.2` won't work from a physical phone).
- If the app can't reach the API, allow inbound TCP `:5035` in the PC firewall (or
  run `npx expo start --tunnel`).

Backend logs stream to `.dev-backend.log`.

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
