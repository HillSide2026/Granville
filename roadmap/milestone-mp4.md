# Milestone MP4 — Provider Resilience & Failover

**Status: Partial — resilience primitives done; automatic circuit breaker and mid-flight failover pending.**
**Track: Multi-Provider Orchestration**

---

## Objective

Isolate provider failures so that a single provider's degradation does not cascade into platform-wide payment failures. Failover behavior must be deterministic and auditable.

---

## Scope

- Provider degradation handling
- Circuit breakers (automatic health state transitions)
- Fallback routing when a provider is unhealthy
- Retry isolation between providers

---

## What Is Done

- Provider health tracking: `healthy`, `degraded`, `disabled` states enforced at command claim time
- Disabled-provider guard: commands against a disabled binding are dead-lettered immediately without consuming retry budget
- Transient error handling: HTTP 429, 502, 503, 504 from provider reset the command without burning a retry slot; backoff delay applied
- Dead-letter threshold: three consecutive non-transient failures dead-letter the command and mark the payment attempt `failed`
- Manual disable/enable: operators can disable and re-enable a provider via admin API (`POST /admin/providers/:id/disable` / `enable`) and ops-ui `/providers` page
- Duplicate provider reference detection prevents stale references from corrupting retry logic

---

## What Is Outstanding

| Item | Notes |
|---|---|
| Automatic circuit breaker | Provider health does not automatically degrade after N failures within a time window — operators must disable manually |
| Mid-flight failover | When a payment attempt fails and the provider is degraded, routing does not automatically re-route to a fallback provider for the same payment |
| Retry isolation | All retries for a dead-lettered command target the same binding; no automatic provider substitution |
| Degraded state usage | `degraded` health state is defined but not automatically set by the runtime |

---

## Acceptance Criteria

- Provider outages operationally isolated: a failing provider does not exhaust retry budget for unrelated payments on other providers
- Failover behavior deterministic and auditable: when a provider is unavailable, fallback selection follows the same routing rules and emits an audit event
- Failed provider retries contained safely: retries for a degraded provider do not block healthy providers
