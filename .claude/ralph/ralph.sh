#!/bin/bash
# Ralph - Autonomous AI Coding Loop
# Usage: ./ralph.sh -f <feature-folder> [-n <max-iterations>] [-t <timeout-minutes>]

set +e  # Don't exit on errors — we handle them ourselves

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
MAX_ITERATIONS=16
TIMEOUT_MINUTES=30
FEATURE_FOLDER=""
LOG_FILE=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -f|--feature)
      FEATURE_FOLDER="$2"
      shift 2
      ;;
    -n|--max)
      MAX_ITERATIONS="$2"
      shift 2
      ;;
    -t|--timeout)
      TIMEOUT_MINUTES="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: ./ralph.sh -f <feature-folder> [-n <max-iterations>] [-t <timeout-minutes>]"
      exit 1
      ;;
  esac
done

if [ -z "$FEATURE_FOLDER" ]; then
  echo "❌ Error: Feature folder required"
  echo "Usage: ./ralph.sh -f <feature-folder> [-n <max-iterations>] [-t <timeout-minutes>]"
  echo ""
  echo "Available features:"
  ls -1 "$SCRIPT_DIR/tasks/" 2>/dev/null || echo "  No features found. Create one first!"
  exit 1
fi

TASK_DIR="$SCRIPT_DIR/tasks/$FEATURE_FOLDER"

if [ ! -d "$TASK_DIR" ]; then
  echo "❌ Error: Feature folder not found: $TASK_DIR"
  echo ""
  echo "Available features:"
  ls -1 "$SCRIPT_DIR/tasks/" 2>/dev/null || echo "  No features found"
  exit 1
fi

PRD_FILE="$TASK_DIR/prd.json"
PROGRESS_FILE="$TASK_DIR/progress.txt"
PROMPT_FILE="$SCRIPT_DIR/prompt.md"
LOG_FILE="$TASK_DIR/ralph.log"

if [ ! -f "$PRD_FILE" ]; then
  echo "❌ Error: prd.json not found in $TASK_DIR"
  exit 1
fi

# Logging function
log() {
  local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
  echo "$msg"
  echo "$msg" >> "$LOG_FILE"
}

# macOS-compatible timeout using background process + kill
run_with_timeout() {
  local timeout_secs=$1
  shift

  # Run command in background
  "$@" &
  local cmd_pid=$!

  # Watchdog in background
  (
    sleep "$timeout_secs"
    kill "$cmd_pid" 2>/dev/null
  ) &
  local watchdog_pid=$!

  # Wait for command to finish
  wait "$cmd_pid" 2>/dev/null
  local exit_code=$?

  # Kill watchdog if command finished before timeout
  kill "$watchdog_pid" 2>/dev/null
  wait "$watchdog_pid" 2>/dev/null

  # exit code 137 = killed by signal (timeout)
  return $exit_code
}

# Get story counts
TOTAL_STORIES=$(jq '.userStories | length' "$PRD_FILE")
COMPLETED=$(jq '[.userStories[] | select(.passes == true)] | length' "$PRD_FILE")
TIMEOUT_SECONDS=$((TIMEOUT_MINUTES * 60))

log "╔════════════════════════════════════════════════════════════╗"
log "║                    🤖 RALPH STARTING                       ║"
log "╠════════════════════════════════════════════════════════════╣"
log "║ Feature: $FEATURE_FOLDER"
log "║ Stories: $COMPLETED / $TOTAL_STORIES completed"
log "║ Max iterations: $MAX_ITERATIONS"
log "║ Timeout per iteration: ${TIMEOUT_MINUTES}min"
log "║ Log file: $LOG_FILE"
log "║ Project: $PROJECT_DIR"
log "╚════════════════════════════════════════════════════════════╝"

for ((i=1; i<=$MAX_ITERATIONS; i++)); do
  # Refresh counts
  COMPLETED=$(jq '[.userStories[] | select(.passes == true)] | length' "$PRD_FILE")
  REMAINING=$((TOTAL_STORIES - COMPLETED))
  NEXT_STORY=$(jq -r '[.userStories[] | select(.passes == false)][0].id // "NONE"' "$PRD_FILE")
  NEXT_TITLE=$(jq -r '[.userStories[] | select(.passes == false)][0].title // "NONE"' "$PRD_FILE")

  log ""
  log "═══════════════════════════════════════════════════════════════"
  log "📍 Iteration $i / $MAX_ITERATIONS | Completed: $COMPLETED / $TOTAL_STORIES | Remaining: $REMAINING"
  log "🎯 Next story: $NEXT_STORY - $NEXT_TITLE"
  log "═══════════════════════════════════════════════════════════════"

  ITERATION_START=$(date +%s)

  # Run Claude from the project directory (claude -p has no --cwd flag)
  cd "$PROJECT_DIR"
  OUTPUT=$(claude -p --dangerously-skip-permissions \
    "@$PRD_FILE @$PROGRESS_FILE @$PROMPT_FILE" 2>&1 \
    | tee /dev/stderr) || true

  ITERATION_END=$(date +%s)
  DURATION=$(( (ITERATION_END - ITERATION_START) / 60 ))

  log "⏱️  Iteration $i completed in ${DURATION}min"

  # Check for completion signal
  if echo "$OUTPUT" | grep -q "<promise>COMPLETE</promise>"; then
    log ""
    log "╔════════════════════════════════════════════════════════════╗"
    log "║                    ✅ RALPH COMPLETE                       ║"
    log "╠════════════════════════════════════════════════════════════╣"
    log "║ All $TOTAL_STORIES stories completed in $i iterations!"
    log "╚════════════════════════════════════════════════════════════╝"
    exit 0
  fi

  # Log git status after each iteration
  cd "$PROJECT_DIR"
  LAST_COMMIT=$(git log --oneline -1 2>/dev/null || echo "no commits yet")
  log "📝 Last commit: $LAST_COMMIT"

  sleep 2
done

log ""
log "╔════════════════════════════════════════════════════════════╗"
log "║                    ⚠️  MAX ITERATIONS                       ║"
log "╠════════════════════════════════════════════════════════════╣"
log "║ Reached $MAX_ITERATIONS iterations. Run again to continue."
log "╚════════════════════════════════════════════════════════════╝"
exit 1
