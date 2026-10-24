# Deployment

Production runs on the shared `common-services` server (Ubuntu 24.04), next to other apps.

| Site | App (localhost) | Public (nginx) | Folder |
|---|---|---|---|
| unarosewood | 127.0.0.1:3101 | :8101 | `/var/www/html/unarosewood` |
| terrythedog | 127.0.0.1:3102 | :8102 | `/var/www/html/terrythedog` |
| elzayko | 127.0.0.1:3103 | :8103 | `/var/www/html/elzayko` |

- Builds use an isolated Node 22 in `/opt/node22`; the server's system Node 18 (used by other apps) is untouched.
- Each deploy builds into `releases/<timestamp>` and only switches the `current` symlink after a successful build, so a failed build never takes the site down. The three newest releases are kept.
- Settings live in `shared/.env` and uploads in `shared/storage`; both survive deploys.
- Builds take a server-wide lock (one at a time) with a 1.5 GB heap cap, because the server is busy.
- The process runs under pm2 as `<site>` and is saved for restarts on reboot.

## Deploying

From the project root, with the `common-services` SSH alias configured:

```bash
deploy/push.sh
```

It uploads the committed `HEAD` (via `git archive`) and runs `deploy.sh` on the server.
Uncommitted changes are not deployed.

## Useful commands on the server

```bash
pm2 logs unarosewood            # app logs
pm2 restart unarosewood         # restart without rebuilding
ls -lt /var/www/html/unarosewood/releases   # releases; roll back by re-pointing `current` and `pm2 reload`
```
