# Milestone PS4 — Data Protection & Recovery

**Status: Complete (V1 scope)**
**Track: Platform Reliability & Security**

---

## Objective

Ensure the Granville database can be backed up and restored to a known-good state using a documented procedure.

---

## What Is Done

- Backup and recovery procedure documented in `ops/runbooks/database-backup-recovery.md`
- Procedure covers: `pg_dump` backup, verification, full restore, post-restore migration, and smoke check
- Recovery objectives documented: RPO = time since last backup; RTO = under 30 minutes for V1 database sizes
- Managed Postgres recommendation documented (AWS RDS, Cloud SQL, Supabase — PITR available out of the box)

## Architecture: Beyond V1

Automated daily backups to object storage and managed Postgres PITR are the production-grade path. The procedure in place provides the foundation; automation is a deployment decision.
