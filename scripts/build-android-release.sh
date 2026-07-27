#!/usr/bin/env bash
set -euo pipefail

# Build a release Android APK locally.
#
# Ported from the Kaori app's build-android-release.sh. Runs on Windows via Git Bash
# (also works on macOS/Linux). Windows specifics vs Kaori's macOS script:
#   - GNU `sed -i` (no BSD '' argument)
#   - reveal the APK in Explorer instead of Finder
#
# Windows path-length note (why the preflight below matters):
#   The native C++ build (CMake/ninja) mirrors each source's absolute path inside the object
#   directory, so the project path effectively counts twice. This is fine here *as long as
#   node_modules is flat*: `expo-modules-core` must sit at the top level, not nested under
#   `node_modules/expo/node_modules/` — the extra `expo\node_modules\` (counted twice) is what
#   pushes object paths over Windows' limit and makes ninja fail with
#   `ninja: error: mkdir(...): No such file or directory`. `babel-preset-expo` must likewise be
#   top-level or the JS bundle step can't resolve it. `npm dedupe` won't reliably hoist them; a
#   clean reinstall (`rm -rf node_modules package-lock.json && npm install`) does, and
#   `babel-preset-expo` is pinned as a direct devDependency to keep it hoisted.
#
# Recovery: if a Gradle daemon wedges (hangs or OOMs mid-build), run
#   cd android && ./gradlew.bat --stop
# then re-run this script.

# Resolve repo root (script lives in <repo>/scripts/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

if [ -t 1 ]; then
  C_BOLD=$'\033[1m'; C_BLUE=$'\033[34m'; C_GREEN=$'\033[32m'
  C_RED=$'\033[31m'; C_YELLOW=$'\033[33m'; C_DIM=$'\033[2m'; C_RESET=$'\033[0m'
else
  C_BOLD=""; C_BLUE=""; C_GREEN=""; C_RED=""; C_YELLOW=""; C_DIM=""; C_RESET=""
fi

step() { printf '\n%s==> %s%s\n' "${C_BOLD}${C_BLUE}" "$1" "$C_RESET"; }
warn() { printf '  %swarn%s — %s\n' "${C_BOLD}${C_YELLOW}" "$C_RESET" "$1" >&2; }
fail() { printf '%sERROR:%s %s\n' "${C_BOLD}${C_RED}" "$C_RESET" "$1" >&2; exit 1; }

printf '%sCalimali Android release build%s %s(%s)%s\n' \
  "$C_BOLD" "$C_RESET" "$C_DIM" "$(date '+%Y-%m-%d %H:%M:%S')" "$C_RESET"

IS_WINDOWS=0
case "$(uname -s 2>/dev/null || echo unknown)" in
  MINGW*|MSYS*|CYGWIN*) IS_WINDOWS=1 ;;
esac

# --- Preflight: EXPO_PUBLIC_API_URL must be baked in at build time ---
# It is inlined during the JS bundle step; without it the APK ships with no backend URL.
if [ -n "${EXPO_PUBLIC_API_URL:-}" ]; then
  printf '  %sok%s — EXPO_PUBLIC_API_URL set in environment\n' "$C_GREEN" "$C_RESET"
elif [ -f "$REPO_ROOT/.env" ] && grep -qE '^EXPO_PUBLIC_API_URL=.+' "$REPO_ROOT/.env"; then
  printf '  %sok%s — EXPO_PUBLIC_API_URL found in .env\n' "$C_GREEN" "$C_RESET"
else
  warn "EXPO_PUBLIC_API_URL is not set (env or .env) — the APK will have no backend URL baked in"
fi

# --- Preflight: dependencies must be hoisted (flat node_modules) ---
# Nested copies blow the Windows path limit (expo-modules-core) or break the bundler
# (babel-preset-expo). Fix with: rm -rf node_modules package-lock.json && npm install
nested=""
[ -d "$REPO_ROOT/node_modules/expo/node_modules/expo-modules-core" ] && nested="expo-modules-core"
[ ! -d "$REPO_ROOT/node_modules/babel-preset-expo" ] && nested="${nested:+$nested, }babel-preset-expo"
if [ -n "$nested" ]; then
  fail "dependencies not hoisted ($nested). Run: rm -rf node_modules package-lock.json && npm install   (see docs/RELEASE.md)"
fi
printf '  %sok%s — deps hoisted (expo-modules-core & babel-preset-expo at top level)\n' "$C_GREEN" "$C_RESET"

# --- Preflight: stop leftover build daemons so prebuild --clean can delete android/ ---
# A Gradle or Kotlin daemon left running by a previous build keeps file handles open in
# android/app/build (e.g. classes.dex), which makes `expo prebuild --clean` fail with
# "EBUSY: resource busy or locked". Stop them first. (gradlew --stop only covers the Gradle
# daemon, not the Kotlin compile daemon, so on Windows we stop both by process.)
step "stop leftover Gradle/Kotlin daemons (release android/ locks)"
if [ "$IS_WINDOWS" -eq 1 ]; then
  powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='java.exe'\" -ErrorAction SilentlyContinue | Where-Object { \$_.CommandLine -match 'GradleDaemon|KotlinCompileDaemon' } | ForEach-Object { Stop-Process -Id \$_.ProcessId -Force -ErrorAction SilentlyContinue }" >/dev/null 2>&1 || true
elif [ -f "$REPO_ROOT/android/gradlew" ]; then
  ( cd "$REPO_ROOT/android" && ./gradlew --stop ) >/dev/null 2>&1 || true
fi
printf '  %sok%s — daemons stopped\n' "$C_GREEN" "$C_RESET"

# Force-remove any leftover android/ ourselves (with retries), so a transient handle from a file
# indexer / AV / shell scanning the previous build's output can't make `prebuild --clean` fail.
if [ -d "$REPO_ROOT/android" ]; then
  for attempt in 1 2 3 4 5; do
    rm -rf "$REPO_ROOT/android" 2>/dev/null && break
    [ ! -d "$REPO_ROOT/android" ] && break
    warn "android/ still locked (indexer/AV?) — retrying ($attempt/5)"
    sleep 3
  done
  [ -d "$REPO_ROOT/android" ] && warn "could not remove android/ — close any Explorer window showing it, or wait a moment and re-run" || printf '  %sok%s — cleared leftover android/\n' "$C_GREEN" "$C_RESET"
fi

# --- Step 1: prebuild ---
step "prebuild — expo prebuild --platform android --clean"
npx expo prebuild --platform android --clean

# --- Step 2: patch gradle.properties (prebuild reset it) ---
step "patch android/gradle.properties (heap 4G / metaspace 1G)"
GRADLE_PROPS="$REPO_ROOT/android/gradle.properties"
TARGET_LINE='org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m'

[ -f "$GRADLE_PROPS" ] || fail "missing $GRADLE_PROPS after prebuild"

# GNU sed (Git Bash / Linux) — replace the jvmargs line in place.
# Without this, prebuild's default heap OOMs the Gradle daemon
# (OutOfMemoryError: Metaspace) while compiling RN modules.
sed -i -E "s|^org\\.gradle\\.jvmargs=.*|${TARGET_LINE}|" "$GRADLE_PROPS"

if ! grep -qF "$TARGET_LINE" "$GRADLE_PROPS"; then
  fail "gradle.properties patch did not apply — expected line not found after sed"
fi
printf '  %sok%s — %s\n' "$C_GREEN" "$C_RESET" "$TARGET_LINE"

# --- Step 3: gradle assembleRelease ---
step "gradlew assembleRelease"
cd "$REPO_ROOT/android"
if [ "$IS_WINDOWS" -eq 1 ]; then
  ./gradlew.bat assembleRelease
else
  ./gradlew assembleRelease
fi

# --- Summary ---
cd "$REPO_ROOT"
APK_DIR="$REPO_ROOT/android/app/build/outputs/apk/release"
APK="$APK_DIR/app-release.apk"

printf '\n%sBUILD SUCCESSFUL%s\n' "${C_BOLD}${C_GREEN}" "$C_RESET"
shopt -s nullglob
found=("$APK_DIR"/app-release*.apk)
if [ -f "$APK" ]; then
  ls -lh "$APK" | awk '{printf "  %s  (%s)\n", $NF, $5}'
elif [ ${#found[@]} -gt 0 ]; then
  for f in "${found[@]}"; do ls -lh "$f" | awk '{printf "  %s  (%s)\n", $NF, $5}'; done
else
  printf '  %s(no APK found under %s)%s\n' "$C_DIM" "$APK_DIR" "$C_RESET"
fi

# --- Step 4: reveal output in Explorer (Windows) / Finder (macOS) ---
step "reveal output"
if [ "$IS_WINDOWS" -eq 1 ] && command -v explorer.exe >/dev/null 2>&1; then
  if [ -f "$APK" ]; then
    # explorer.exe returns a non-zero exit code even on success — guard against set -e.
    explorer.exe //select,"$(cygpath -w "$APK")" || true
    printf '  %sok%s — revealed in Explorer\n' "$C_GREEN" "$C_RESET"
  else
    explorer.exe "$(cygpath -w "$APK_DIR")" 2>/dev/null || true
    printf '  %sok%s — opened output folder\n' "$C_GREEN" "$C_RESET"
  fi
elif command -v open >/dev/null 2>&1 && [ -f "$APK" ]; then
  open -R "$APK"    # macOS
  printf '  %sok%s — revealed in Finder\n' "$C_GREEN" "$C_RESET"
else
  printf '  %sskip%s — no file explorer; APK is at %s\n' "$C_DIM" "$C_RESET" "$APK"
fi
