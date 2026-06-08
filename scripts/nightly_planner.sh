#!/bin/bash
# Nightly Planner — local prep job (run by launchd at 21:00 America/New_York).
# Lives OUTSIDE ~/Desktop so macOS (TCC) lets launchd execute it and touch the vault.
# Syncs Canvas, computes tomorrow's open slots from the vault's fixed commitments,
# and drafts a proposed plan into plans/. You review/finalize in the morning.

set -uo pipefail

export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"
VAULT="$HOME/DayosPlanner"
LOG_DIR="$VAULT/.logs"
mkdir -p "$LOG_DIR"
LOG="$LOG_DIR/nightly-$(date +%Y%m%d).log"

TZ="America/New_York"; export TZ
TOMORROW="$(date -v+1d +%Y-%m-%d)"
WEEKDAY="$(date -v+1d +%A)"

echo "=== Nightly Planner run: $(date) — planning $WEEKDAY $TOMORROW ===" >> "$LOG"
cd "$VAULT" || { echo "vault missing" >> "$LOG"; exit 1; }

PROMPT="You are the Nightly Planner running UNATTENDED at 9 PM. Do the PREP phase only — never wait for input. All times are America/New_York (Eastern). The vault is the current directory.

Tomorrow is ${WEEKDAY} ${TOMORROW}.

Steps:
1. Read preferences.md (blocked hours, recurring fixed commitments, daily growth schedule, default availability) and tasks.md.
2. SYNC CANVAS: call get_my_upcoming_assignments (14 days) and get_my_todo_items. For each assignment not already in tasks.md, add it under 'Assignments (synced from Canvas)' as '- [ ] <name> — ~90m — due <YYYY-MM-DD HH:MM> ET — _<course>_'. Convert Canvas UTC due times to Eastern. Dedupe using the '<!-- synced from Canvas -->' marker.
3. COMPUTE OPEN SLOTS for ${TOMORROW}: start from default availability, subtract office hours and every recurring fixed commitment (class, reading group, workouts) and daily-growth block (communication, LinkedIn on Thu/Fri, idea review) that falls on ${WEEKDAY}. List remaining free slots with durations.
4. Also surface, as candidates: one 'next action' from each active note in projects/, and the daily-growth items from tasks.md.
5. DRAFT a plan into plans/${TOMORROW}.md: a 'DRAFT — review & finalize in the morning' header, the fixed blocks, the open slots, and a SUGGESTED placement of due-soon assignments (earliest deadline first) using checkbox lines ('- [ ] HH:MM–HH:MM → ...'). Mark it a suggestion, not final.
6. Do not modify tasks.md beyond the Canvas sync.

Be concise. Print a one-line summary when done."

"$HOME/.local/bin/claude" -p "$PROMPT" \
  --permission-mode acceptEdits \
  --allowedTools "Read,Write,Edit,Bash,mcp__canvas-api__get_my_upcoming_assignments,mcp__canvas-api__get_my_todo_items,mcp__canvas-api__list_assignments" \
  >> "$LOG" 2>&1
STATUS=$?
echo "=== exit status: $STATUS ===" >> "$LOG"

if [ -f "plans/${TOMORROW}.md" ]; then
  osascript -e "display notification \"Draft plan for ${WEEKDAY} ${TOMORROW} is ready — review in Obsidian.\" with title \"🌙 Nightly Planner\" sound name \"Glass\""
else
  osascript -e "display notification \"Ran but no plan file was created — check the log.\" with title \"⚠️ Nightly Planner\""
fi
exit $STATUS
