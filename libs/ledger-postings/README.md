# granville-ledger-postings

This package owns:

- Account naming conventions
- Posting templates
- Balance model assumptions
- Posting idempotency key derivation

Design rule:

- Orchestration emits domain events
- Ledger posting templates decide how those events map into Formance Ledger transactions
