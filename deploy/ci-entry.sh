#!/usr/bin/env bash
# The only command the CI deploy key may run (forced via authorized_keys `command=`).
# Accepts exactly:
#   deploy <app>   source tarball on stdin → deploy.sh
#   seed <app>     re-run the idempotent starter-content seed on the live release
set -euo pipefail

read -r action app extra <<<"${SSH_ORIGINAL_COMMAND:-}"
[ -z "${extra:-}" ] || { echo "unexpected arguments" >&2; exit 2; }
case "${app:-}" in unarosewood | terrythedog | elzayko) ;; *) echo "unknown app: ${app:-}" >&2; exit 2 ;; esac

case "$action" in
  deploy)
    tarball="$(mktemp "/tmp/ci-$app-XXXXXX.tar.gz")"
    trap 'rm -f "$tarball"' EXIT
    head -c 300000000 >"$tarball" # source only; 300 MB is far above any real archive
    bash /var/www/html/.site-deploy/deploy.sh "$app" "$tarball"
    ;;
  seed)
    cd "/var/www/html/$app/current"
    PATH="/opt/node22/bin:$PATH" npm run -s db:seed
    ;;
  *)
    echo "only 'deploy <app>' or 'seed <app>' are allowed" >&2
    exit 2
    ;;
esac
