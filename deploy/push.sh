#!/usr/bin/env bash
# Ships the committed HEAD to the server and runs deploy.sh there.
#
#   deploy/push.sh            (from the project root; uses the SSH host alias below)
#   DEPLOY_HOST=user@host deploy/push.sh
set -euo pipefail

APP="$(basename "$(git rev-parse --show-toplevel)")"
HOST="${DEPLOY_HOST:-common-services}"
TARBALL="/tmp/$APP-$(git rev-parse --short HEAD).tar.gz"

git archive --format=tar.gz HEAD | ssh "$HOST" "cat > '$TARBALL'"
ssh "$HOST" "bash /var/www/html/.site-deploy/deploy.sh '$APP' '$TARBALL'; status=\$?; rm -f '$TARBALL'; exit \$status"
