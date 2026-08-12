#!/usr/bin/env bash
# Pull the latest code and restart the site. Run as the `sai` user:
#   cd /srv/sai-social && ./deploy/update.sh
set -euo pipefail

cd "$(dirname "$0")/.."

echo "→ fetching"
git pull --ff-only

echo "→ installing production dependencies"
npm ci --omit=dev

echo "→ restarting"
sudo systemctl restart sai-social

# Give it a moment to bind, then prove it actually came back up. A restart that
# "succeeds" while the process crash-loops is the failure mode worth catching.
sleep 2
if curl -fsS --max-time 5 http://127.0.0.1:3000/healthz >/dev/null; then
  echo "✓ live"
else
  echo "✗ health check failed — journalctl -u sai-social -n 50" >&2
  exit 1
fi
