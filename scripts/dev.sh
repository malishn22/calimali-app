#!/usr/bin/env bash
set -euo pipefail

# One-command local dev for Calimali, over USB (no Wi-Fi, no open ports, no firewall).
# Starts the backend API (dotnet run, background) against a local SQLite file, wires
# the phone's localhost to this PC with `adb reverse`, then runs Metro for the
# installed development build (foreground). Ctrl+C tears the backend down.
#
# The phone connects over the USB cable: `adb reverse` forwards the phone's
# localhost:5035 (API) and localhost:8081 (Metro) to this PC. Nothing is exposed on
# the network, so there is nothing to allow through the firewall.
#
# Run from Git Bash:  ./scripts/dev.sh          (or  npm run dev )
#   First-time setup:  ./scripts/dev.sh --seed
#     ( --seed creates the local SQLite schema and loads the system + exercise seed data )
#
# Requirements: phone plugged in via USB with Developer Options → USB debugging ON
# (tap "Allow" on the phone the first time). The .NET 8 SDK, Node 20+, and the Android
# SDK platform-tools (adb) must be installed. If the dev build isn't on the phone yet,
# this script builds + installs it via `expo run:android` (first run only, a few min).

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP="$(dirname "$SCRIPT_DIR")"
BACKEND="$APP/../calimali-backend"
API_PROJECT="$BACKEND/CalimaliAPI"
BACKEND_PORT=5035
METRO_PORT=8081
APP_PACKAGE="com.calimali.app"
BACKEND_LOG="$APP/.dev-backend.log"
DEV_SETTINGS="$API_PROJECT/appsettings.Development.json"
DEV_ENV_FILE="$APP/.env.development.local"
DEV_URL="http://localhost:$BACKEND_PORT"

# Flags
SEED=0
for arg in "$@"; do
  case "$arg" in
    --seed) SEED=1 ;;
    *) echo "Unknown option: $arg (supported: --seed)" >&2; exit 1 ;;
  esac
done

AMBER='\033[0;33m'
DIM='\033[2m'
RESET='\033[0m'
BOLD='\033[1m'
RED='\033[0;31m'

info()    { echo -e "${BOLD}==> $*${RESET}"; }
backend() { echo -e "${AMBER}[backend]${RESET} $*"; }
warn()    { echo -e "${AMBER}!  $*${RESET}"; }
err()     { echo -e "${RED}✖  $*${RESET}" >&2; }

# ── Tooling ───────────────────────────────────────────────────────────────────
command -v dotnet >/dev/null || { err "dotnet not found — install the .NET 8 SDK."; exit 1; }
command -v npx    >/dev/null || { err "npx/node not found — install Node 20+."; exit 1; }

# Resolve adb: PATH first, then the standard Android SDK location(s). Expo's own
# commands find adb via the SDK, but our explicit `adb reverse` calls need a path.
ADB="$(command -v adb || true)"
if [[ -z "$ADB" ]]; then
  for base in "${ANDROID_HOME:-}" "${ANDROID_SDK_ROOT:-}" "${LOCALAPPDATA:-}/Android/Sdk"; do
    [[ -n "$base" ]] || continue
    cand="${base//\\//}/platform-tools/adb.exe"   # normalize backslashes for the bash test
    if [[ -x "$cand" ]]; then ADB="$cand"; break; fi
  done
fi
[[ -n "$ADB" ]] || { err "adb not found — install the Android SDK platform-tools (ships with Android Studio)."; exit 1; }

# ── Select the target phone ───────────────────────────────────────────────────
# Robust to leftover/offline emulators and stale wireless-adb entries: pick the one
# ONLINE physical device (or honor CALIMALI_DEVICE=<serial>), then pin every adb and
# Expo command to it via ANDROID_SERIAL — so a dead 'emulator-xxxx' can't break us.
ADB_TABLE="$("$ADB" devices 2>/dev/null | tr -d '\r' | tail -n +2 || true)"
ONLINE_SERIALS="$(printf '%s\n' "$ADB_TABLE" | awk '$2=="device"{print $1}')"
if printf '%s\n' "$ADB_TABLE" | awk '$2=="unauthorized"{f=1} END{exit !f}'; then
  warn "A device shows as 'unauthorized' — unlock the phone and tap 'Allow USB debugging' (check 'Always')."
fi

SERIAL="${CALIMALI_DEVICE:-}"
if [[ -z "$SERIAL" ]]; then
  N_ONLINE="$(printf '%s\n' "$ONLINE_SERIALS" | grep -c . || true)"
  if [[ "$N_ONLINE" -eq 1 ]]; then
    SERIAL="$(printf '%s\n' "$ONLINE_SERIALS" | grep .)"
  elif [[ "$N_ONLINE" -gt 1 ]]; then
    # More than one online — prefer a single physical device over emulators.
    PHYS="$(printf '%s\n' "$ONLINE_SERIALS" | grep -v '^emulator-' || true)"
    [[ "$(printf '%s\n' "$PHYS" | grep -c . || true)" -eq 1 ]] && SERIAL="$(printf '%s\n' "$PHYS" | grep .)"
  fi
fi

if [[ -z "$SERIAL" ]]; then
  err "Couldn't pick a target device. adb currently sees:"
  "$ADB" devices -l >&2 || true
  err "Plug in your phone (USB debugging on, tap Allow), or pick one: CALIMALI_DEVICE=<serial> ./scripts/dev.sh"
  exit 1
fi
export ANDROID_SERIAL="$SERIAL"   # adb + expo default to this device
ADB_T=("$ADB" -s "$SERIAL")
info "Target device: $SERIAL"

# ── USB port-forwards (phone localhost → this PC) ─────────────────────────────
info "Wiring USB port-forwards (adb reverse) — phone localhost → this PC"
"${ADB_T[@]}" reverse "tcp:$BACKEND_PORT" "tcp:$BACKEND_PORT" >/dev/null \
  || { err "adb reverse failed for $SERIAL."; exit 1; }
"${ADB_T[@]}" reverse "tcp:$METRO_PORT" "tcp:$METRO_PORT" >/dev/null || true

# ── Frontend env: point the app at THIS local backend over USB ────────────────
# Bootstrap .env from the example if missing (holds CALIMALI_OPENAPI for gen:api
# and the prod EXPO_PUBLIC_API_URL used by release builds). Not fatal if absent.
if [[ ! -f "$APP/.env" && -f "$APP/.env.example" ]]; then
  info "Creating calimali-app/.env from .env.example"
  cp "$APP/.env.example" "$APP/.env"
fi

# `expo start` loads .env.development.local ABOVE .env, so this wins in dev; release
# builds run in production mode and ignore it. Over USB the phone's localhost is the PC.
cat > "$DEV_ENV_FILE" <<EOF
# Auto-generated by scripts/dev.sh — do not edit or commit (git-ignored).
# Over USB the phone reaches this PC's backend at localhost via 'adb reverse'.
EXPO_PUBLIC_API_URL=$DEV_URL
EOF
info "App dev target → $DEV_URL  (wrote $(basename "$DEV_ENV_FILE"), via adb reverse)"

# ── Backend dev config sanity ─────────────────────────────────────────────────
if [[ ! -f "$DEV_SETTINGS" ]]; then
  warn "Missing $DEV_SETTINGS — the backend reads its DB connection and auth secrets from it."
  warn "Create it with ConnectionStrings:DefaultConnection plus JWT_KEY, AUTH_USERNAME, AUTH_PASSWORD."
elif ! grep -q 'JWT_KEY' "$DEV_SETTINGS"; then
  warn "No JWT_KEY in appsettings.Development.json — the API now fails to start without it."
  warn "Add JWT_KEY (>=32 chars), AUTH_USERNAME and AUTH_PASSWORD to that file."
fi

# ── Frontend deps ─────────────────────────────────────────────────────────────
if [[ ! -d "$APP/node_modules" ]]; then
  info "Installing frontend dependencies"
  npm --prefix "$APP" install --silent
fi

# ── Dev database (local SQLite file) ──────────────────────────────────────────
# The backend runs on a local SQLite file (calimali_dev.db in the CalimaliAPI
# folder), configured in appsettings.Development.json as "Data Source=...". No
# network, no Postgres, no Docker — the file is created on first run and is fully
# isolated from production (which uses PostgreSQL). Delete the file to reset.
info "Dev DB: local SQLite file (calimali-backend/CalimaliAPI/calimali_dev.db)"

# ── Optional: create + seed a fresh dev DB (./scripts/dev.sh --seed) ───────────
# Run once on first setup — creates the SQLite schema, then loads seed data.
# Each command applies then exits.
if [[ "$SEED" -eq 1 ]]; then
  info "Seeding dev DB (create schema + system + exercises)"
  (
    cd "$API_PROJECT" \
      && ASPNETCORE_ENVIRONMENT=Development dotnet run --no-launch-profile -- --migrate \
      && ASPNETCORE_ENVIRONMENT=Development dotnet run --no-launch-profile -- --seed:system --apply \
      && ASPNETCORE_ENVIRONMENT=Development dotnet run --no-launch-profile -- --seed:exercises --apply
  )
  backend "seed complete"
fi

# ── Launch backend (background, logged) ───────────────────────────────────────
BACKEND_PID=""
cleanup() {
  # Tidy up the USB forward we added (best-effort).
  [[ -n "${SERIAL:-}" ]] && "$ADB" -s "$SERIAL" reverse --remove "tcp:$BACKEND_PORT" >/dev/null 2>&1 || true
  [[ -n "$BACKEND_PID" ]] || return 0
  echo ""
  info "Shutting down backend..."
  kill "$BACKEND_PID" 2>/dev/null || true
  # dotnet run spawns a child app process; on Windows/Git Bash kill the whole tree.
  if command -v taskkill >/dev/null 2>&1; then
    taskkill //F //T //PID "$BACKEND_PID" >/dev/null 2>&1 || true
  fi
  wait "$BACKEND_PID" 2>/dev/null || true
  BACKEND_PID=""
}
trap cleanup EXIT INT TERM

# Bind localhost only — the phone reaches it through the USB `adb reverse` forward,
# so there's no need to expose the backend on the network. Set the env explicitly
# since we skip the launch profile; Development loads appsettings.Development.json.
info "Starting backend (dotnet run) on $DEV_URL (localhost — reached over USB)"
info "Backend logs → $BACKEND_LOG"
(
  cd "$API_PROJECT" \
    && ASPNETCORE_ENVIRONMENT=Development \
       ASPNETCORE_URLS="http://127.0.0.1:$BACKEND_PORT" \
       dotnet run --no-launch-profile
) > "$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!

# ── Wait for the backend to accept connections ────────────────────────────────
info "Waiting for the backend to come up..."
UP=0
for _ in $(seq 1 40); do
  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    err "Backend exited during startup. Last lines of $BACKEND_LOG:"
    tail -n 20 "$BACKEND_LOG" >&2 || true
    exit 1
  fi
  # Any HTTP response proves the host is listening.
  if curl -s -o /dev/null "http://localhost:$BACKEND_PORT/health" 2>/dev/null; then
    UP=1
    break
  fi
  sleep 1
done

if [[ "$UP" -ne 1 ]]; then
  warn "Backend didn't answer on :$BACKEND_PORT within 40s — starting Metro anyway."
  warn "Check $BACKEND_LOG (SQLite schema is created on first startup)."
else
  backend "up on $DEV_URL"
fi

# ── Launch Metro for the development build (foreground, interactive) ───────────
# This is a dev-build project (expo-dev-client + reanimated 4), not an Expo Go one.
# --clear wipes Metro's cache so the dev EXPO_PUBLIC_API_URL (written above) is
# re-inlined into the bundle (EXPO_PUBLIC_* vars are baked in at bundle time and
# cached by source content, not by env value — a stale URL would otherwise persist).
echo ""
if "${ADB_T[@]}" shell pm list packages 2>/dev/null | tr -d '\r' | grep -q "^package:$APP_PACKAGE$"; then
  info "Starting Metro for the dev build (expo start --dev-client --clear)."
  echo -e "  ${DIM}Open the Calimali app on your phone (or press 'a' here to launch it).${RESET}"
  echo -e "  ${DIM}All over USB — no Wi-Fi, no firewall. Wait for 'Android Bundled' before it loads.${RESET}"
  echo -e "  ${DIM}Verify on the Vault tab: 'Target:' should show $DEV_URL.${RESET}"
  echo -e "  ${DIM}Backend logs: $BACKEND_LOG   ·   Ctrl+C to stop everything${RESET}"
  echo ""
  cd "$APP" && npx expo start --dev-client --clear
else
  warn "Dev build '$APP_PACKAGE' isn't installed on the phone yet."
  info "Building & installing it over USB now (first run — a few minutes). Metro starts after."
  echo -e "  ${DIM}If an old build named com.anonymous.calimaliapp is on the phone, uninstall it.${RESET}"
  echo ""
  cd "$APP" && npx expo run:android
fi
