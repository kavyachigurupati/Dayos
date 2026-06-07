#!/bin/bash
# Nightly Planner — local prep job (run by launchd at 21:00 America/New_York).
# Runs Claude Code headless to: sync Canvas, compute tomorrow's open slots from
# the vault's fixed commitments, and draft a proposed plan into Planner/plans/.
# It does NOT make final placement decisions — you review/finalize in the morning.

set -uo pipefail

# --- paths ---
export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"
VAULT_REPO="/Users/kavya/Desktop/DEV_MODE/Dayos"
LOG_DIR="$VAULT_REPO/Planner/.logs"
mkdir -p "$LOG_DIR"
LOG="$LOG_DIR/nightly-$(date +%Y%m%d).log"

# --- target date = tomorrow, Eastern ---
TZ="America/New_York"; export TZ
TOMORROW="$(date -v+1d +%Y-%m-%d)"
WEEKDAY="$(date -v+1d +%A)"

echo "=== Nightly Planner run: $(date) — planning $WEEKDAY $TOMORROW ===" >> "$LOG"

cd "$VAULT_REPO" || { echo "vault repo missing" >> "$LOG"; exit 1; }

PROMPT="You are the Nightly Planner running UNATTENDED at 9 PM. Do the PREP phase only — never wait for input. All times are America/New_York (Eastern).

Tomorrow is ${WEEKDAY} ${TOMORROW}.

Steps:
1. Read ./SKILL.md for the full procedure (nightly-planner).
2. Read Planner/preferences.md and Planner/tasks.md.
3. SYNC CANVAS: call get_my_upcoming_assignments (look ahead 14 days) and get_my_todo_items. For each assignment not already in Planner/tasks.md, add it under 'Assignments (with deadlines)' in the format '- [ ] <name> — ~90m — due <YYYY-MM-DD HH:MM> ET — _<course>_'. Convert Canvas UTC due times to Eastern. Dedupe using the '<!-- synced from Canvas -->' marker; do not duplicate existing items.
4. COMPUTE OPEN SLOTS for ${TOMORROW}: start from the default availability windows in preferences.md, then subtract the blocked office hours and every recurring fixed commitment (class, workouts) that falls on ${WEEKDAY}. List the remaining free slots with durations.
5. DRAFT a proposed plan into Planner/plans/${TOMORROW}.md. Include: a 'DRAFT — review & finalize in the morning' header, the fixed blocks, the open slots, and a SUGGESTED placement of due-soon assignments (earliest deadline first) into slots that fit. Mark it clearly as a suggestion, not final.
6. Do not modify tasks.md beyond the Canvas sync in step 3.

Be concise. When done, print a one-line summary of what you drafted."

# Run headless. Allow the vault tools + Canvas MCP; auto-accept file edits.
"$HOME/.local/bin/claude" -p "$PROMPT" \
  --permission-mode acceptEdits \
  --allowedTools "Read,Write,Edit,Bash,mcp__canvas-api__get_my_upcoming_assignments,mcp__canvas-api__get_my_todo_items,mcp__canvas-api__list_assignments" \
  >> "$LOG" 2>&1

STATUS=$?
echo "=== exit status: $STATUS ===" >> "$LOG"

# --- notify ---
if [ -f "Planner/plans/${TOMORROW}.md" ]; then
  osascript -e "display notification \"Draft plan for ${WEEKDAY} ${TOMORROW} is ready — review in Obsidian.\" with title \"🌙 Nightly Planner\" sound name \"Glass\""
else
  osascript -e "display notification \"Nightly Planner ran but no plan file was created — check the log.\" with title \"⚠️ Nightly Planner\""
fi

exit $STATUS
