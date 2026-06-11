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
1. Read preferences.md (blocked hours, recurring fixed commitments, daily growth schedule, default availability), tasks.md, and feedback.md — APPLY the learned rules in feedback.md when placing items (e.g. avoid times the user repeatedly skips).
2. SYNC CANVAS: call get_my_upcoming_assignments (14 days) and get_my_todo_items. For each assignment not already in tasks.md, add it under 'Assignments (synced from Canvas)' as '- [ ] <name> — ~90m — due <YYYY-MM-DD HH:MM> ET — _<course>_'. Convert Canvas UTC due times to Eastern. Dedupe using the '<!-- synced from Canvas -->' marker.
3. SWEEP EMAIL BACKLOG: call Gmail search_threads with query 'label:Planner/Backlog'. Each thread is something the user wants to read/do. For each, treat the subject (and any link) as a candidate item needing ~45m (use a duration in parentheses in the subject if present, e.g. '(30m)'). After scheduling it in step 6, MOVE the thread out of the backlog: label_thread with Label_5 (Planner/Scheduled) and unlabel_thread with Label_4 (Planner/Backlog), so it is never scheduled twice. If the backlog is empty, skip.
4. COMPUTE OPEN SLOTS for ${TOMORROW}: start from default availability, subtract office hours and every recurring fixed commitment (class, reading group, workouts) and daily-growth block (communication, LinkedIn on Thu/Fri, idea review) that falls on ${WEEKDAY}. List remaining free slots with durations.
5. Also surface, as candidates: one 'next action' from each active note in projects/, and the daily-growth items from tasks.md.
6. DRAFT a plan into plans/${TOMORROW}.md: a 'DRAFT — review & finalize in the morning' header, the fixed blocks, the open slots, and a SUGGESTED placement (earliest deadline first) using checkbox lines ('- [ ] HH:MM–HH:MM → ...'). Place due-soon assignments first, then email-backlog reading items into remaining slots (heavy/papers into morning focus slots, lighter items into evening gaps). Mark it a suggestion, not final.
7. Do not modify tasks.md beyond the Canvas sync.

Be concise. Print a one-line summary when done."

"$HOME/.local/bin/claude" -p "$PROMPT" \
  --permission-mode acceptEdits \
  --allowedTools "Read,Write,Edit,Bash,mcp__canvas-api__get_my_upcoming_assignments,mcp__canvas-api__get_my_todo_items,mcp__canvas-api__list_assignments,mcp__claude_ai_Gmail__search_threads,mcp__claude_ai_Gmail__list_labels,mcp__claude_ai_Gmail__label_thread,mcp__claude_ai_Gmail__unlabel_thread" \
  >> "$LOG" 2>&1
STATUS=$?
echo "=== exit status: $STATUS ===" >> "$LOG"

if [ -f "plans/${TOMORROW}.md" ]; then
  osascript -e "display notification \"Draft plan for ${WEEKDAY} ${TOMORROW} is ready — review in Obsidian.\" with title \"🌙 Nightly Planner\" sound name \"Glass\""
else
  osascript -e "display notification \"Ran but no plan file was created — check the log.\" with title \"⚠️ Nightly Planner\""
fi
exit $STATUS
