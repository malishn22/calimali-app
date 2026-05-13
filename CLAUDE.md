# Calimali App - AI Context

## Overview
Calimali is a calisthenics fitness tracking mobile app. This repo is the **frontend** (Expo / React Native + TypeScript). The backend lives in a sibling repo.

## Tech Stack
- Language / Runtime: TypeScript / React Native 0.81
- Framework: Expo ~54, Expo Router ~6 (file-based routing)
- Styling: TailwindCSS 3 + NativeWind 4
- Key libs: react-native-reanimated, @gorhom/bottom-sheet
- State: React Context (CacheContext, CalendarContext)

## Development Workflow

### Running locally
- `npx expo start` from the repo root
- Set `EXPO_PUBLIC_API_URL` in `.env` to point at the backend
- For mock mode (no backend): set `EXPO_PUBLIC_USE_MOCK=true` in `.env`

### Release build
- Built as an APK for Android — see `docs/RELEASE.md`
- Not deployed via CI

## Environment Variables
| Variable | Description | Secret? |
|----------|-------------|---------|
| `EXPO_PUBLIC_API_URL` | Backend API base URL | No |
| `EXPO_PUBLIC_USE_MOCK` | Set to `true` to use mock data instead of real API | No |

## Key File Paths
| Purpose | Path |
|---------|------|
| Root layout | `app/_layout.tsx` |
| Tab screens | `app/(tabs)/` — index, planner, profile, vault |
| Live session | `app/live-session.tsx` |
| API services | `services/api/` — config.ts, exercises.ts, sessions.ts, profile.ts |
| Mock data layer | `services/api/__mocks__/` — generated + hand-written mock data |
| Mock data generator | `scripts/generate-mock-exercises.js` |
| Types / enums | `constants/Types.ts`, `Enums.ts` |
| Context providers | `context/` — CacheContext.tsx, CalendarContext.tsx |
| Env config | `.env` (`.env.example` for reference) |
| App config | `app.json` |

## Mock Mode

### Toggle
Set in `.env`:
```
EXPO_PUBLIC_USE_MOCK=true   # use mock data (no backend needed)
EXPO_PUBLIC_USE_MOCK=false  # use real API (default)
```

### How It Works
- Each service function in `services/api/` checks `USE_MOCK` at the top and returns in-memory data instead of fetching
- Mutations (POST/PUT/DELETE) update the in-memory stores within a session — data resets on app reload
- A red "MOCK" badge appears in the top-right corner when mock mode is active

### Mock Data Location
- `services/api/__mocks__/exercises.generated.ts` — all exercises (generated from backend seed data)
- `services/api/__mocks__/categories.generated.ts` — exercise categories (generated)
- `services/api/__mocks__/sessions.mock.ts` — planned sessions + session history
- `services/api/__mocks__/profile.mock.ts` — user profile (level, XP, streak)
- `services/api/__mocks__/activities.mock.ts` — activities (future use)
- `services/api/__mocks__/bodyWeight.mock.ts` — body weight entries (future use)
- `services/api/__mocks__/utils.ts` — mockDelay and createMockStore helpers

### Regenerating Exercise Data
When backend seed data changes, regenerate the mock exercises:
```bash
node scripts/generate-mock-exercises.js
```
This reads from the backend's `CalimaliAPI/seed/` directory and writes to the `__mocks__/` directory.

## Known Quirks
- Uses snake_case for model fields (e.g. `default_reps`, `is_unilateral`), API returns camelCase
- `ScheduledSession.exercises` and `SessionHistory.performance_data` are JSON-stringified fields
- `updatePlannedSession` is a delete+re-create workaround (no PUT endpoint on backend)
- Cleartext HTTP — no TLS; requires `usesCleartextTraffic: true` in `app.json`

## Counterpart
- Backend: sibling repo (ASP.NET Core 8 + PostgreSQL)
- The phone reaches the API via Tailscale or LAN IP
