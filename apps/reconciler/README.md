# granville-reconciler

Purpose:

- Match provider-side state with Granville operational state and ledger postings
- Detect, classify, and manage breaks
- Produce operator-visible reconciliation cases

Milestone 1 scope:

- API-based reconciliation for the first live provider
- Manual break queue and replay workflow
- `src/reconciler.ts` performs transaction-level checks across payment orders, provider transaction records, and ledger postings.
- Completed payments without provider evidence or posted ledger effects become reconciliation exceptions.

Later scope:

- Statement ingestion
- Auto-resolution rules
- Aging and escalation policies
