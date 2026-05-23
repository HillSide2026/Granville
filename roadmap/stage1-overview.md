# Granville Stage 1 — EMI-Compatible Financial Operations Infrastructure

## Objective

Stage 1 begins after MVP. MVP demonstrates reliable payment orchestration through a single provider. Stage 1 demonstrates deterministic, replay-safe, and operationally auditable payment orchestration across multiple EMI providers with reconciliation-native financial controls.

---

## Strategic Outcomes

By the end of Stage 1, Granville demonstrates:

- Immutable double-entry financial records
- Provider-agnostic payment orchestration
- Deterministic payment lifecycle management
- Automated reconciliation workflows
- Replay-safe transaction processing
- Operational auditability
- Resilient provider operations
- Institutional onboarding readiness

---

## Milestones

| Milestone | Objective | Doc |
|---|---|---|
| FI1 | Ledger & Payment State Machine | [milestone-fi1.md](milestone-fi1.md) |
| FI4 | Balance & Settlement Reconciliation | [milestone-fi4.md](milestone-fi4.md) |
| FI5 | Audit Trail & Traceability | [milestone-fi5.md](milestone-fi5.md) |
| MP1 | EMI Provider Integration | [milestone-mp1.md](milestone-mp1.md) |
| MP4 | Provider Resilience & Failover | [milestone-mp4.md](milestone-mp4.md) |
| MP5 | Multi-Provider Production Readiness | [milestone-mp5.md](milestone-mp5.md) |
| OG1 | Access Control & Approval Workflows | [milestone-og1.md](milestone-og1.md) |
| OG4 | Incident & Recovery Operations | [milestone-og4.md](milestone-og4.md) |
| OG5 | Operational Monitoring & Alerting | [milestone-og5.md](milestone-og5.md) |
| PS1 | Durable Event Infrastructure | [milestone-ps1.md](milestone-ps1.md) |
| PS3 | Environment & Secrets Management | [milestone-ps3.md](milestone-ps3.md) |
| PS4 | Data Protection & Recovery | [milestone-ps4.md](milestone-ps4.md) |

---

## Exit Criteria

### Financial Integrity

- Immutable double-entry ledger operational
- Balances derived exclusively from journal entries
- Reconciliation continuously validates provider balances and settlements
- Payment lifecycle reconstruction supported end-to-end

### Multi-Provider Operations

- Multiple EMI providers operational simultaneously
- Routing deterministic and replay-safe
- Provider failover operationally validated

### Operational Governance

- Institutional RBAC enforced
- Maker/checker workflows operational
- Immutable operational audit logs complete
- Replay and recovery tooling functional

### Reliability & Security

- Replay-safe infrastructure operational
- Queue architecture production-ready
- Secrets centrally managed
- Recovery procedures validated

### Institutional Readiness

- Operational controls suitable for EMI onboarding diligence
- Financial state reconstructable end-to-end
- Reconciliation and audit workflows operational
