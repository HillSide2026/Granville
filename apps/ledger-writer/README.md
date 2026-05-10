# granville-ledger-writer

Purpose:

- Convert Granville domain events into normalized ledger postings
- Isolate ledger account naming, transaction templates, and posting idempotency from orchestration logic

Target dependency:

- Root checkout Formance Ledger APIs and semantics, especially immutable logs and idempotency in [internal/log.go](/Users/matthewajlevinelaw/Repos/Granville/internal/log.go:88) and [internal/controller/ledger/log_process.go](/Users/matthewajlevinelaw/Repos/Granville/internal/controller/ledger/log_process.go:148)

Milestone 1 scope:

- Post payment authorization, execution, reversal, and fee events
- Keep posting templates versioned and auditable
- `src/ledger-writer.ts` consumes pending posting requests and records deterministic mock Formance transaction references for the acceptance flow.
- Posting templates live under `libs/ledger-postings/src`.
- Failed postings can be replayed through `LedgerWriter.replay`.
- Account taxonomy is documented in `libs/ledger/account-taxonomy.md`.
