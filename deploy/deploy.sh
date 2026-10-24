#!/usr/bin/env bash
# Builds and releases one site on the server from a source tarball.
#
#   deploy.sh <app> <source.tar.gz>
#
# Layout under /var/www/html/<app>:
#   deploy.env       APP_NAME, PORT (read here)
#   shared/.env      production settings (linked into every release)
#   shared/storage   uploaded media (outside releases, survives deploys)
#   releases/<ts>/   one folder per deploy; the last 3 are kept
#   current ->       symlink to the live release (switched only after a good build)
set -euo pipefail

APP="${1:?usage: deploy.sh <app> <source.tar.gz>}"
SRC="${2:?usage: deploy.sh <app> <source.tar.gz>}"
case "$APP" in unarosewood | terrythedog | elzayko) ;; *) echo "unknown app: $APP" >&2; exit 2 ;; esac

ROOT="/var/www/html/$APP"
NODE_HOME="/opt/node22" # isolated Node 22; the system Node 18 used by other apps is untouched
# shellcheck source=/dev/null
source "$ROOT/deploy.env"
# pm2 itself runs on the system Node like the server's other apps; only builds use Node 22.
SYSTEM_PATH="$PATH"
pm2() { PATH="$SYSTEM_PATH" command pm2 "$@"; }
export PATH="$NODE_HOME/bin:$PATH"

# Only one deploy per site, and only one build at a time on this shared server.
exec 9>"$ROOT/.deploy.lock"
flock -n 9 || { echo "a deploy of $APP is already running" >&2; exit 1; }
exec 8>/var/www/html/.site-build.lock
echo "waiting for the shared build slot…"
flock 8

REL="$ROOT/releases/$(date +%Y%m%d%H%M%S)"
mkdir -p "$REL"
trap 'echo "deploy failed; live site unchanged" >&2; rm -rf "$REL"' ERR

tar -xzf "$SRC" -C "$REL"
cd "$REL"
ln -s "$ROOT/shared/.env" .env

npm ci --no-audit --no-fund --loglevel=error
npx prisma generate
npx prisma migrate deploy
NODE_OPTIONS="--max-old-space-size=1536" npx next build

trap - ERR
ln -sfn "$REL" "$ROOT/current"

# Serve on localhost only; nginx publishes it. pm2 keeps it alive and restarts it on reboot.
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 reload "$APP_NAME" --update-env
else
  pm2 start "$ROOT/current/node_modules/next/dist/bin/next" --name "$APP_NAME" \
    --interpreter "$NODE_HOME/bin/node" --cwd "$ROOT/current" --max-memory-restart 600M \
    -- start -p "$PORT" -H 127.0.0.1
fi
pm2 save >/dev/null

# Keep the three newest releases.
ls -1dt "$ROOT"/releases/*/ | tail -n +4 | xargs -r rm -rf
echo "deployed $APP → $REL on 127.0.0.1:$PORT"
