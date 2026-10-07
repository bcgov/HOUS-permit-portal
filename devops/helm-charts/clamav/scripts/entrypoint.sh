#!/bin/sh
set -e

# Only run freshclam on startup if no database exists yet (first boot)
if [ ! -f /opt/app-root/src/daily.cvd ] && [ ! -f /opt/app-root/src/daily.cld ]; then
  echo "==> No database found, running initial freshclam download..."
  freshclam || echo "WARNING: freshclam failed, clamd may not start correctly"
else
  echo "==> Database already present, skipping freshclam (CronJob handles updates)"
fi

echo "==> Starting clamd..."
exec clamd