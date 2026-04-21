#!/bin/bash
# setup.sh — first-time setup for DAYOS
# Run once after cloning: bash setup.sh

set -e

echo ""
echo "Setting up DAYOS..."
echo ""

# 1. Install dependencies
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
else
  echo "Dependencies already installed."
fi

# 2. Create .env from example if it doesn't exist
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "Created .env from .env.example — add your API keys before starting."
else
  echo ".env already exists."
fi

# 3. Create profile.json from template if it doesn't exist
if [ ! -f "profile.json" ]; then
  cat > profile.json << 'EOF'
{
  "identity": {
    "name": "Your Name",
    "city": "New York",
    "neighborhood": "Manhattan"
  },

  "interests": [
    "add your interests here",
    "e.g. badminton",
    "e.g. AI and machine learning",
    "e.g. hackathons",
    "e.g. trying new restaurants"
  ],

  "recurring_commitments": [
    { "day": "Monday", "time": "9:00 AM", "type": "work", "label": "weekly standup" }
  ],

  "upcoming_plans": [
    "Add things you are looking for or planning"
  ],

  "conference_interests": [
    "Add conferences or events you follow"
  ],

  "habits": {
    "morning": "describe your morning habits",
    "activity": "describe your activity habits",
    "social": "describe your social habits",
    "work": "describe your work habits"
  },

  "reminders": [
    "things you tend to forget",
    "things you always want to be reminded about"
  ],

  "proactive_suggestions": [
    "if weather is nice, suggest somewhere to go outside",
    "if there is a tech event happening soon, flag it"
  ],

  "behavioral_patterns": {
    "acted_on": [],
    "ignored": [],
    "active_hours": ["8am", "9am", "6pm", "7pm"],
    "preferred_activity_days": ["Saturday", "Sunday"]
  },

  "last_updated": "2026-04-20"
}
EOF
  echo "Created profile.json from template — edit it with your personal details."
else
  echo "profile.json already exists."
fi

echo ""
echo "Setup complete."
echo ""
echo "Next steps:"
echo "  1. Edit .env and add your BASETEN_API_KEY and YDC_API_KEY"
echo "  2. Edit profile.json with your real interests, schedule, and reminders"
echo "  3. Run: npm start"
echo ""
