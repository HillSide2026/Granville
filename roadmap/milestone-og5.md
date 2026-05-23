# Milestone OG5 — Operational Monitoring & Alerting

**Status: Not started — metrics endpoint exists but no automated alerting.**
**Track: Operational Governance**

---

## Objective

Surface operational anomalies automatically so that operators are alerted before issues become incidents. Monitoring should cover reconciliation drift, provider latency, payment failure rates, queue backlogs, and settlement delays.

---

## Scope

- Reconciliation drift alerts (mismatches exceeding threshold)
- Provider latency monitoring
- Payment failure rate monitoring
- Queue backlog monitoring
- Settlement delay alerts (payments in `pending_settlement` beyond SLA)

---

## What Is Done

- `metricsSnapshot()` exposes `paymentFailureRate`, `webhookFailureCount`, `queueBacklog`, `ledgerPostingFailures`, `reconciliationExceptionCount`, `providerOutageStatus`
- `GET /admin/metrics` endpoint
- Ops-ui dashboard renders key metrics with color-coded thresholds
- `ops/observability/` directory exists (OTEL/Prometheus stubs)

---

## What Is Outstanding

| Item | Notes |
|---|---|
| OTEL traces | Traces are not emitted — `ops/observability/` is a stub |
| Prometheus metrics | No Prometheus scrape endpoint |
| Automated alerting | No alert rules; no integration with PagerDuty, OpsGenie, Slack, or equivalent |
| Provider latency monitoring | Provider call durations not measured or exposed |
| Settlement delay detection | No alert when a payment has been in `pending_settlement` beyond SLA |
| Reconciliation drift alerts | No alert when `reconciliationExceptionCount` exceeds a threshold |

---

## What Is Blocked

Nothing code-blocking. OTEL/Prometheus integration can begin independently of other milestones.

---

## Acceptance Criteria

- Operational anomalies surfaced automatically: alert fires when failure rate, queue backlog, or reconciliation exception count exceeds configured thresholds
- Alerting integrated into operational workflows: alerts route to the on-call operator and link to the relevant ops-ui page or runbook
