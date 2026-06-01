# Runbook: Database Backup and Recovery

## Overview

The Granville operational database (Postgres) holds all financial state: payment orders, attempts, provider transactions, ledger postings, reconciliation records, and audit events. This runbook covers how to take a backup and how to restore from one.

---

## Taking a Backup

### Manual backup (pg_dump)

```sh
pg_dump "$DATABASE_URL" \
  --format=custom \
  --no-acl \
  --no-owner \
  --file="granville-backup-$(date +%Y%m%d-%H%M%S).pgdump"
```

`--format=custom` produces a compressed binary dump that supports parallel restore and selective table restore. Store the output file in a location outside the database host (S3, GCS, or equivalent object storage).

### Verify the backup is readable

```sh
pg_restore --list granville-backup-<timestamp>.pgdump | head -20
```

This lists the contents without restoring anything. If the command exits cleanly, the dump is intact.

---

## Restoring from a Backup

### Step 1: Stop the API

Prevent new writes during the restore.

```sh
# If running via Docker Compose:
docker compose -f ops/docker-compose.local.yml stop granville-api

# If running standalone: send SIGTERM to the API process.
```

### Step 2: Drop and recreate the database

```sh
psql "$DATABASE_URL" -c "DROP DATABASE IF EXISTS granville;"
psql "$DATABASE_URL" -c "CREATE DATABASE granville;"
```

### Step 3: Restore

```sh
pg_restore \
  --dbname "$DATABASE_URL" \
  --no-acl \
  --no-owner \
  --jobs=4 \
  granville-backup-<timestamp>.pgdump
```

`--jobs=4` runs the restore in parallel — adjust to available CPU cores.

### Step 4: Run migrations

Migrations are idempotent. Running them after a restore ensures the schema matches the current application version.

```sh
npm run db:migrate
```

### Step 5: Restart the API and verify

```sh
docker compose -f ops/docker-compose.local.yml up -d granville-api
```

Smoke check:
```sh
curl -H "Authorization: Bearer $GRANVILLE_API_TOKEN" http://localhost:8080/admin/metrics
```

Confirm `paymentOrderCount` and `customerCount` match pre-restore expectations.

---

## Recovery Objectives (V1)

| Objective | Target |
|---|---|
| Recovery Point Objective (RPO) | Time since last manual backup |
| Recovery Time Objective (RTO) | Under 30 minutes for a database under 10 GB |

V1 uses manual backups. For production, automate daily backups to object storage using the `pg_dump` command above via a scheduled job (cron, cloud scheduler, or equivalent).

---

## Managed Postgres (Recommended for Production)

When deployed on a managed Postgres service (AWS RDS, Google Cloud SQL, Supabase, Neon, etc.), point-in-time recovery (PITR) is typically available out of the box, replacing the need for manual dumps. In that case, this runbook serves as a fallback for cases where PITR is unavailable.

---

## Related

- `ops/docker-compose.local.yml` — local Postgres service definition
- `libs/db/migrate.ts` — migration runner
- Milestone PS4 — Data Protection & Recovery
