#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

has_env_file=false
for candidate in \
  ".env" \
  ".env.local" \
  ".env.development" \
  ".env.production" \
  ".env.test"
do
  if [[ -f "$ROOT_DIR/$candidate" ]]; then
    has_env_file=true
    break
  fi
done

if [[ "$has_env_file" == "false" ]]; then
  # For SessionStart, use stderr to send error feedback + exit 2
  echo "Session blocked: no .env file found at workspace root. Create one (e.g. .env or .env.local) before using tools." >&2
  exit 2
fi

# Success — inject a systemMessage Claude will see
printf '{"systemMessage": "Environment file found. Session is ready."}\n'