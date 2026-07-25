#!/usr/bin/env bash
set -euo pipefail

# One-command local dev for Calimali: starts the backend API (dotnet run) in the
# background and the Expo dev server in the foreground, then tears the backend
# down when you Ctrl+C out of Expo.
#
# Run from Git Bash:  ./scripts/dev.sh   (or  npm run dev )
# You run the app in Expo Go on your phone: scan the QR Expo prints below.
# Phone and PC must be on the same Wi-Fi, and EXPO_PUBLIC_API_URL must use the
# PC's LAN IP (see the hints the script prints).

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP="$(dirname "$SCRIPT_DIR")"
BACKEND="$APP/../calimali-backend"
API_PROJECT="$BACKEND/CalimaliAPI"
BACKEND_PORT=5035
BACKEND_LOG="$APP/.dev-backend.log"
DEV_SETTINGS="$API_PROJECT/appsettings.Development.json"

AMBER='\033[0;33m'
DIM='\033[2m'
RESET='\033[0m'
BOLD='\033[1m'
RED='\033[0;31m'

info()    { echo -e "${BOLD}==> $*${RESET}"; }
backend() { echo -e "${AMBER}[backend]${RESET} $*"; }
warn()    { echo -e "${AMBER}!  $*${RESET}"; }
err()     { echo -e "${RED}✖  $*${RESET}" >&2; }

# Best-effort: list the PC's private LAN IPv4 addresses (the phone reaches the
# backend at one of these). Filters to 192.168/10/172.16-31, drops loopback.
lan_ips() {
  ipconfig 2>/dev/null | tr -d '\r' | grep -a 'IPv4' | sed 's/.*:[[:space:]]*//' \
    | grep -E '^(192\.168|10|172\.(1[6-9]|2[0-9]|3[01]))\.' || true
}

# ── Tooling ───────────────────────────────────────────────────────────────────
command -v dotnet >/dev/null || { err "dotnet not found — install the .NET 8 SDK."; exit 1; }
command -v npx    >/dev/null || { err "npx/node not found — install Node 20+."; exit 1; }

# ── Frontend .env ─────────────────────────────────────────────────────────────
# Prefer a 192.168.* address (typical home Wi-Fi) over virtual/VPN 10.*/172.* adapters.
IP_HINT="$(lan_ips | grep -E '^192\.168\.' | head -1)"
[[ -z "$IP_HINT" ]] && IP_HINT="$(lan_ips | head -1)"
IP_HINT="${IP_HINT:-<your-PC-LAN-IP>}"

if [[ ! -f "$APP/.env" ]]; then
  info "Creating calimali-app/.env from .env.example"
  cp "$APP/.env.example" "$APP/.env"
  echo ""
  echo -e "${AMBER}  .env was just created. Edit it before continuing:${RESET}"
  echo "    EXPO_PUBLIC_API_URL=http://$IP_HINT:$BACKEND_PORT"
  echo -e "    ${DIM}(your PC's LAN IP + backend port — your phone reaches the backend here; 'localhost' won't work from the phone)${RESET}"
  echo ""
  echo "  Then re-run: ./scripts/dev.sh"
  exit 1
fi

# Surface which backend the app will actually hit — the script starts a LOCAL
# backend on :$BACKEND_PORT, but the app uses whatever EXPO_PUBLIC_API_URL points at.
API_URL="$(grep -E '^EXPO_PUBLIC_API_URL=' "$APP/.env" | head -1 | cut -d= -f2- || true)"
info "App will call: ${API_URL:-<unset>}"
if echo "$API_URL" | grep -qiE 'localhost|127\.0\.0\.1|10\.0\.2\.2'; then
  warn "That address can't be reached from Expo Go on a physical phone."
  warn "Use your PC's LAN IP: EXPO_PUBLIC_API_URL=http://$IP_HINT:$BACKEND_PORT"
elif ! echo "$API_URL" | grep -q ":$BACKEND_PORT"; then
  warn "That is NOT the local backend this script starts (:$BACKEND_PORT)."
  warn "To use the local one from your phone, set: EXPO_PUBLIC_API_URL=http://$IP_HINT:$BACKEND_PORT"
  warn "Otherwise the app talks to the above URL and the local backend goes unused."
fi
CANDIDATES="$(lan_ips | paste -sd ' ' -)"
[[ -n "$CANDIDATES" ]] && info "PC LAN IP candidates: $CANDIDATES  (use one, with :$BACKEND_PORT)"

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

# ── Launch backend (background, logged) ───────────────────────────────────────
BACKEND_PID=""
cleanup() {
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

# Bind all interfaces (0.0.0.0) so the phone on the LAN can reach it — not just
# localhost. Set the env explicitly since we skip the launch profile; Development
# loads appsettings.Development.json (DB connection + auth secrets).
info "Starting backend (dotnet run) on http://0.0.0.0:$BACKEND_PORT (reachable on the LAN)"
info "Backend logs → $BACKEND_LOG"
(
  cd "$API_PROJECT" \
    && ASPNETCORE_ENVIRONMENT=Development \
       ASPNETCORE_URLS="http://0.0.0.0:$BACKEND_PORT" \
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
  # Any HTTP response (even 503 when the DB is down) proves the host is listening.
  if curl -s -o /dev/null "http://localhost:$BACKEND_PORT/health" 2>/dev/null; then
    UP=1
    break
  fi
  sleep 1
done

if [[ "$UP" -ne 1 ]]; then
  warn "Backend didn't answer on :$BACKEND_PORT within 40s — starting Expo anyway."
  warn "Check $BACKEND_LOG (is the dev Postgres reachable for startup migrations?)."
else
  backend "up on http://localhost:$BACKEND_PORT"
fi

# ── Launch Expo (foreground, interactive) ─────────────────────────────────────
echo ""
info "Starting Expo. Open Expo Go on your phone and scan the QR below."
echo -e "  ${DIM}Phone + PC on the same Wi-Fi. If the app can't reach the API, allow inbound${RESET}"
echo -e "  ${DIM}TCP :$BACKEND_PORT in the PC firewall (or try 'npx expo start --tunnel').${RESET}"
echo -e "  ${DIM}Backend logs: $BACKEND_LOG   ·   Ctrl+C to stop everything${RESET}"
echo ""
cd "$APP" && npx expo start
