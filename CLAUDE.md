# Calimali App - AI Context

## Overview
Calimali is a calisthenics fitness tracking mobile app. This repo is the **frontend** (Expo / React Native + TypeScript). The backend lives in a sibling repo.

## Tech Stack
- Language / Runtime: TypeScript / React Native 0.83 (Node >= 20, pinned via `.nvmrc`)
- Framework: Expo ~55, Expo Router ~55 (file-based routing)
- Styling: TailwindCSS 3 + NativeWind 4
- Key libs: react-native-reanimated, @gorhom/bottom-sheet
- State: React Context (CacheContext, CalendarContext)

## Development Workflow

### Running locally
- `npm run dev` (`scripts/dev.sh`, Git Bash) — one-command **isolated** dev **over USB**:
  backend (`dotnet run` on `127.0.0.1:5035`) + Metro for the **development build**
  (`com.calimali.app`), with the backend on a **local SQLite file** (`calimali_dev.db`).
  `adb reverse` forwards the phone's localhost:5035/8081 to this PC, so **no Wi-Fi, no
  open ports, no firewall**. This is a dev-build project (expo-dev-client + reanimated 4),
  **not** Expo Go. First-time: plug phone in (USB debugging on); `dev.sh` installs the dev
  build if missing (or `npm run android`). `./scripts/dev.sh --seed` seeds the SQLite DB;
  reset by deleting the `.db` file and re-seeding. Prod untouched (PostgreSQL).
- The script auto-writes `.env.development.local` with
  `EXPO_PUBLIC_API_URL=http://<PC-LAN-IP>:5035`. `expo start` runs in *development*
  mode and loads `.env.development.local` **above** `.env`, so the app targets the
  local dev backend in dev; release builds run in *production* mode, ignore that
  file, and use the prod `EXPO_PUBLIC_API_URL` in `.env`. Don't commit
  `.env.development.local` (git-ignored, regenerated each run).
- Manual/advanced: `npx expo start` with `EXPO_PUBLIC_API_URL` set in `.env` (the
  app is API-only); the backend must be running separately.

### Release build
- Built as an APK for Android — see `docs/RELEASE.md`; build profiles in `eas.json`
- Local one-command build: `npm run build:android` (`scripts/build-android-release.sh`, Git Bash on
  Windows) → prebuild + `gradlew assembleRelease` → APK at
  `android/app/build/outputs/apk/release/app-release.apk`
- CI: `.github/workflows/app-ci.yml` runs `npm ci` + `npm run typecheck` on PRs/`main`

### Scripts
- `npm run typecheck` — `tsc --noEmit` (also the CI gate; catches API contract drift)
- `npm run gen:api` — regenerate `services/api/generated.ts` from the backend `openapi.json`

## API Types (generated from backend OpenAPI)
- `services/api/generated.ts` is generated from the backend `openapi.json` (single
  source of truth). The `Api*` types in `services/api/types.ts` are derived from it
  via `Pick`, so a backend field rename/removal breaks `typecheck` here.
- Regenerate with `npm run gen:api`. The spec path comes from `CALIMALI_OPENAPI`
  in `.env` (auto-loaded by `npm run`). See `.env.example`.

## Environment Variables
| Variable | Description | Secret? |
|----------|-------------|---------|
| `EXPO_PUBLIC_API_URL` | Backend API base URL (inlined at build time) | No |
| `EXPO_PUBLIC_ADMIN_RESET_TOKEN` | Optional; sent as `X-Admin-Token` on `POST /system/reset` when the backend requires it | No (inlined) |

## Key File Paths
| Purpose | Path |
|---------|------|
| Root layout | `app/_layout.tsx` |
| Tab screens | `app/(tabs)/` — index, planner, profile, vault |
| Live session | `app/live-session.tsx` |
| API services | `services/api/` — config.ts, exercises.ts, sessions.ts, profile.ts |
| Types / enums | `constants/Types.ts`, `Enums.ts` |
| Context providers | `context/` — CacheContext.tsx, CalendarContext.tsx |
| Env config | `.env` (`.env.example` for reference) |
| App config | `app.json` |

## Data Access
- The app is **API-only** — every screen goes through the singleton `Api` object
  (`services/api/index.ts`, spreading `exercises.ts`/`sessions.ts`/`profile.ts`), which fetches
  from `EXPO_PUBLIC_API_URL`. There is no local/offline persistence.
- Read failures are caught in the service functions and return empty lists (no crash) so the UI
  degrades gracefully when the backend is unreachable.

## Known Quirks
- Domain models and the API are both camelCase; `services/api/*.ts` maps API DTOs to domain types (API-side shapes derive from generated types)
- `ScheduledSession.exercises` and `SessionHistory.performanceData` are JSON-stringified fields
- `updatePlannedSession` is a delete+re-create workaround (no PUT endpoint on backend)
- Cleartext HTTP — no TLS; requires `usesCleartextTraffic: true` in `app.json`

## Counterpart
- Backend: sibling repo (ASP.NET Core 8 + PostgreSQL)
- The phone reaches the API via Tailscale or LAN IP
