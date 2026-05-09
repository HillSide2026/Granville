# MVP Milestone 2 Sketch

Objective:

- Prove portability by adding a second execution path and hardening the control plane for production operations.

Expected themes:

1. Second provider integration
   Add a second EMI or PSP path to prove the Granville adapter boundary and routing portability.

2. Direct-bank adapter framework
   Implement the first native bank adapter without requiring Formance Payments changes.

3. Multi-provider routing
   Add cost, corridor, risk, and fallback-aware routing policies.

4. Reconciliation expansion
   Add statement ingestion, scheduled matching, break aging, and manual resolution workflow.

5. Ops UI
   Ship payment timelines, provider health, webhook replay, and reconciliation dashboards.

6. Reliability hardening
   Add dead-letter handling, backfill jobs, replay safety, and disaster recovery runbooks.

7. Security and tenancy
   Add production auth, tenant isolation, secret rotation, and audit-friendly operator actions.

Milestone 2 success signal:

- Granville can switch or add providers without rewriting orchestration, ledger logic, customer models, or reconciliation models.
