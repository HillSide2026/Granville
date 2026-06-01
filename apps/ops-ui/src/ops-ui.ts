import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

const API_URL = process.env.GRANVILLE_API_URL ?? "http://localhost:8080";
const API_TOKEN = process.env.GRANVILLE_API_TOKEN ?? "dev-admin";
const PORT = Number(process.env.OPS_UI_PORT ?? 8081);

async function adminFetch(path: string): Promise<unknown> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${API_TOKEN}` },
  });
  if (!response.ok) {
    throw new Error(`Admin API error ${response.status} for ${path}`);
  }
  return response.json();
}

async function adminPost(path: string, body: Record<string, unknown> = {}): Promise<unknown> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Admin API error ${response.status}: ${text}`);
  }
  return response.json();
}

function html(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Granville Ops</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; background: #f5f5f5; color: #222; }
    nav { background: #1a1a2e; color: #eee; padding: 12px 24px; display: flex; gap: 20px; align-items: center; }
    nav a { color: #7eb8f7; text-decoration: none; font-size: 14px; }
    nav a:hover { text-decoration: underline; }
    nav .brand { font-weight: 700; color: #fff; margin-right: 16px; }
    main { padding: 24px; }
    h1 { font-size: 20px; margin: 0 0 16px; }
    table { border-collapse: collapse; width: 100%; background: #fff; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.1); font-size: 13px; }
    th { background: #f0f0f0; text-align: left; padding: 8px 12px; font-weight: 600; border-bottom: 1px solid #ddd; }
    td { padding: 7px 12px; border-bottom: 1px solid #f0f0f0; vertical-align: top; word-break: break-all; max-width: 320px; }
    tr:last-child td { border-bottom: none; }
    .badge { display: inline-block; padding: 2px 7px; border-radius: 10px; font-size: 11px; font-weight: 600; }
    .badge-green { background: #d4edda; color: #155724; }
    .badge-red { background: #f8d7da; color: #721c24; }
    .badge-yellow { background: #fff3cd; color: #856404; }
    .badge-grey { background: #e2e3e5; color: #383d41; }
    .badge-blue { background: #cce5ff; color: #004085; }
    .action-form { display: inline; }
    .btn { padding: 4px 10px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600; }
    .btn-primary { background: #0d6efd; color: #fff; }
    .btn-danger { background: #dc3545; color: #fff; }
    .btn-success { background: #198754; color: #fff; }
    .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 24px; }
    .stat { background: #fff; border-radius: 6px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,.1); }
    .stat-label { font-size: 12px; color: #666; margin-bottom: 4px; }
    .stat-value { font-size: 28px; font-weight: 700; }
    .empty { color: #888; font-style: italic; padding: 20px; text-align: center; }
    .error { background: #f8d7da; color: #721c24; padding: 12px 16px; border-radius: 6px; margin-bottom: 16px; }
  </style>
</head>
<body>
  <nav>
    <span class="brand">Granville Ops</span>
    <a href="/">Dashboard</a>
    <a href="/providers">Providers</a>
    <a href="/routing-rules">Routing Rules</a>
    <a href="/payments">Payments</a>
    <a href="/webhooks">Webhooks</a>
    <a href="/ledger">Ledger</a>
    <a href="/reconciliation">Reconciliation</a>
    <a href="/reports">Reports</a>
    <a href="/audit">Audit Log</a>
  </nav>
  <main>
    <h1>${title}</h1>
    ${content}
  </main>
</body>
</html>`;
}

function statusBadge(status: string): string {
  const map: Record<string, string> = {
    completed: "badge-green",
    posted: "badge-green",
    processed: "badge-green",
    matched: "badge-green",
    resolved: "badge-green",
    healthy: "badge-green",
    failed: "badge-red",
    dead_lettered: "badge-red",
    critical: "badge-red",
    missing_provider_transaction: "badge-red",
    open: "badge-yellow",
    warning: "badge-yellow",
    stale_pending_transaction: "badge-yellow",
    processing: "badge-blue",
    queued: "badge-blue",
    pending: "badge-blue",
    disabled: "badge-grey",
    ignored: "badge-grey",
    unmatched: "badge-grey",
    active: "badge-green",
    inactive: "badge-grey",
  };
  const cls = map[status] ?? "badge-grey";
  return `<span class="badge ${cls}">${status}</span>`;
}

function table(
  columns: string[],
  rows: Array<Record<string, unknown>>,
  renderRow: (row: Record<string, unknown>) => string,
): string {
  if (rows.length === 0) {
    return `<p class="empty">No records found.</p>`;
  }
  const head = columns.map((c) => `<th>${c}</th>`).join("");
  const body = rows.map(renderRow).join("");
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function short(id: string): string {
  return `<span title="${id}">${id.slice(0, 8)}…</span>`;
}

function ts(value: unknown): string {
  if (!value) return "—";
  const d = new Date(String(value));
  return `<span title="${d.toISOString()}">${d.toLocaleString()}</span>`;
}

function humanAge(createdAt: unknown): string {
  const ms = Date.now() - new Date(String(createdAt)).getTime();
  if (ms < 60_000) return `${Math.floor(ms / 1000)}s`;
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m`;
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

async function handleDashboard(): Promise<string> {
  const [payments, webhooks, exceptions, postings, rules, auditEvents] = await Promise.all([
    adminFetch("/admin/payments") as Promise<Array<Record<string, unknown>>>,
    adminFetch("/admin/webhook-events") as Promise<Array<Record<string, unknown>>>,
    adminFetch("/admin/reconciliation/exceptions") as Promise<Array<Record<string, unknown>>>,
    adminFetch("/admin/ledger-postings") as Promise<Array<Record<string, unknown>>>,
    adminFetch("/admin/routing-rules") as Promise<Array<Record<string, unknown>>>,
    adminFetch("/admin/audit-events") as Promise<Array<Record<string, unknown>>>,
  ]);
  const openExceptions = exceptions.filter((e) => e.status === "open").length;
  const deadLetteredPostings = postings.filter((p) => p.status === "dead_lettered").length;
  const failedWebhooks = webhooks.filter((w) => w.processingStatus === "failed").length;
  const completedPayments = payments.filter((p) => p.status === "completed").length;
  const activeRules = rules.filter((r) => r.active).length;

  const recentActivity =
    [...auditEvents]
      .reverse()
      .slice(0, 10)
      .map(
        (e) => `
    <div style="display:flex;gap:12px;padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:12px">
      <span style="color:#666;white-space:nowrap">${ts(e.createdAt)}</span>
      <span><strong>${e.actorType}</strong> <code style="font-size:11px">${e.action}</code> on ${e.resourceType}/${short(String(e.resourceId))}</span>
    </div>`,
      )
      .join("") || `<p class="empty">No activity yet.</p>`;

  return `
    <div class="stat-grid">
      <div class="stat"><div class="stat-label">Total Payments</div><div class="stat-value">${payments.length}</div></div>
      <div class="stat"><div class="stat-label">Completed Payments</div><div class="stat-value" style="color:#198754">${completedPayments}</div></div>
      <div class="stat"><div class="stat-label">Open Exceptions</div><div class="stat-value" style="color:${openExceptions > 0 ? "#dc3545" : "#198754"}">${openExceptions}</div></div>
      <div class="stat"><div class="stat-label">Failed Webhooks</div><div class="stat-value" style="color:${failedWebhooks > 0 ? "#dc3545" : "#198754"}">${failedWebhooks}</div></div>
      <div class="stat"><div class="stat-label">Dead-Lettered Postings</div><div class="stat-value" style="color:${deadLetteredPostings > 0 ? "#dc3545" : "#198754"}">${deadLetteredPostings}</div></div>
      <div class="stat"><div class="stat-label">Routing Rules (active)</div><div class="stat-value">${activeRules}</div></div>
    </div>
    <p><a href="/payments">View all payments →</a> &nbsp; <a href="/reconciliation">View exceptions →</a> &nbsp; <a href="/routing-rules">Manage routing rules →</a></p>
    <h2 style="font-size:15px;margin:16px 0 8px">Recent Activity</h2>
    <div style="background:#fff;border-radius:6px;padding:12px 16px;box-shadow:0 1px 3px rgba(0,0,0,.1)">
      ${recentActivity}
    </div>`;
}

async function handlePayments(): Promise<string> {
  const rows = (await adminFetch("/admin/payments")) as Array<Record<string, unknown>>;
  return table(
    ["ID", "Status", "Amount", "Account", "Created"],
    rows,
    (r) => `<tr>
      <td><a href="/payments/${r.id}">${short(String(r.id))}</a></td>
      <td>${statusBadge(String(r.status))}</td>
      <td>${r.amount ? `${(r.amount as Record<string, unknown>).amount} ${(r.amount as Record<string, unknown>).asset}` : "—"}</td>
      <td>${short(String(r.paymentAccountId))}</td>
      <td>${ts(r.createdAt)}</td>
    </tr>`,
  );
}

async function handlePaymentDetail(id: string): Promise<string> {
  const [payment, allAttempts] = await Promise.all([
    adminFetch(`/payments/${id}`) as Promise<Record<string, unknown>>,
    adminFetch("/admin/payment-attempts") as Promise<Array<Record<string, unknown>>>,
  ]);
  const attempts = allAttempts.filter((a) => a.paymentOrderId === id);
  const amount = payment.amount as Record<string, unknown> | null;

  const attemptsSection =
    attempts.length === 0
      ? `<p class="empty">No payment attempts.</p>`
      : `<table>
           <thead><tr><th>#</th><th>Provider Binding</th><th>Status</th><th>Started</th><th>Completed</th><th>Error</th></tr></thead>
           <tbody>
             ${attempts
               .map(
                 (a) => `<tr>
               <td>${a.attemptNumber}</td>
               <td>${short(String(a.providerBindingId))}</td>
               <td>${statusBadge(String(a.status))}</td>
               <td>${ts(a.submittedAt)}</td>
               <td>${ts(a.completedAt)}</td>
               <td style="color:#dc3545;font-size:11px">${a.lastError ?? "—"}</td>
             </tr>`,
               )
               .join("")}
           </tbody>
         </table>`;

  return `
    <p style="margin-bottom:16px"><a href="/payments">← Back to Payments</a></p>
    <div style="background:#fff;border-radius:6px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,.1);margin-bottom:20px;font-size:13px">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px">
        <div><strong>Status</strong><br>${statusBadge(String(payment.status))}</div>
        <div><strong>Amount</strong><br>${amount ? `${amount.amount} ${amount.asset}` : "—"}</div>
        <div><strong>Customer</strong><br>${short(String(payment.customerId))}</div>
        <div><strong>Account</strong><br>${short(String(payment.paymentAccountId))}</div>
        <div><strong>Created</strong><br>${ts(payment.createdAt)}</div>
        <div><strong>Submitted</strong><br>${ts(payment.submittedAt)}</div>
        <div><strong>Completed</strong><br>${ts(payment.completedAt)}</div>
      </div>
    </div>
    <h2 style="font-size:15px;margin:0 0 8px">Payment Attempts Timeline</h2>
    ${attemptsSection}`;
}

async function handleRoutingRules(): Promise<string> {
  const rules = (await adminFetch("/admin/routing-rules")) as Array<Record<string, unknown>>;
  return table(
    ["Name", "Priority", "Active", "Conditions", "Outcome", "Created", "Action"],
    rules,
    (r) => {
      const deactivateBtn = r.active
        ? `<form class="action-form" method="POST" action="/admin/routing-rules/${r.id}/deactivate">
             <button class="btn btn-danger" type="submit">Deactivate</button>
           </form>`
        : "";
      return `<tr>
        <td>${r.name}${r.description ? `<br><span style="font-size:11px;color:#666">${r.description}</span>` : ""}</td>
        <td>${r.priority}</td>
        <td>${statusBadge(r.active ? "active" : "inactive")}</td>
        <td><code style="font-size:10px;word-break:break-all">${JSON.stringify(r.conditions)}</code></td>
        <td><code style="font-size:10px;word-break:break-all">${JSON.stringify(r.outcome)}</code></td>
        <td>${ts(r.createdAt)}</td>
        <td>${deactivateBtn}</td>
      </tr>`;
    },
  );
}

async function handleWebhooks(): Promise<string> {
  const rows = (await adminFetch("/admin/webhook-events")) as Array<Record<string, unknown>>;
  const rowsHtml = rows.map((r) => {
    const retryBtn =
      r.processingStatus === "failed" || r.processingStatus === "ignored"
        ? `<form class="action-form" method="POST" action="/admin/webhooks/${r.id}/retry">
             <button class="btn btn-primary" type="submit">Retry</button>
           </form>`
        : "";
    return `<tr>
      <td>${short(String(r.id))}</td>
      <td>${r.providerCode}</td>
      <td>${statusBadge(String(r.processingStatus))}</td>
      <td>${ts(r.receivedAt)}</td>
      <td>${r.lastError ? `<span title="${r.lastError}" style="color:#dc3545">⚠ error</span>` : "—"}</td>
      <td>${retryBtn}</td>
    </tr>`;
  });
  if (rowsHtml.length === 0) {
    return `<p class="empty">No webhook events.</p>`;
  }
  return `<table><thead><tr><th>ID</th><th>Provider</th><th>Status</th><th>Received</th><th>Error</th><th>Action</th></tr></thead><tbody>${rowsHtml.join("")}</tbody></table>`;
}

async function handleLedger(): Promise<string> {
  const rows = (await adminFetch("/admin/ledger-postings")) as Array<Record<string, unknown>>;
  const rowsHtml = rows.map((r) => {
    const retryBtn =
      r.status === "dead_lettered" || r.status === "failed"
        ? `<form class="action-form" method="POST" action="/admin/ledger-postings/${r.id}/retry">
             <button class="btn btn-primary" type="submit">Retry</button>
           </form>`
        : "";
    return `<tr>
      <td>${short(String(r.id))}</td>
      <td>${r.aggregateType} ${short(String(r.aggregateId))}</td>
      <td>${statusBadge(String(r.status))}</td>
      <td>${r.retryCount ?? 0}</td>
      <td>${r.lastError ? `<span title="${String(r.lastError)}" style="color:#dc3545">⚠ error</span>` : "—"}</td>
      <td>${retryBtn}</td>
    </tr>`;
  });
  if (rowsHtml.length === 0) {
    return `<p class="empty">No ledger postings.</p>`;
  }
  return `<table><thead><tr><th>ID</th><th>Aggregate</th><th>Status</th><th>Retries</th><th>Error</th><th>Action</th></tr></thead><tbody>${rowsHtml.join("")}</tbody></table>`;
}

async function handleReconciliation(): Promise<string> {
  const [runs, exceptions] = await Promise.all([
    adminFetch("/admin/reconciliation/runs") as Promise<Array<Record<string, unknown>>>,
    adminFetch("/admin/reconciliation/exceptions") as Promise<Array<Record<string, unknown>>>,
  ]);

  const recentRuns = [...runs].reverse().slice(0, 10);
  const runsSection =
    recentRuns.length === 0
      ? `<p class="empty">No reconciliation runs yet.</p>`
      : `<table>
           <thead><tr><th>ID</th><th>Type</th><th>Status</th><th>Period</th><th>Exceptions</th><th>Completed</th></tr></thead>
           <tbody>
             ${recentRuns
               .map((r) => {
                 const summary = (r.summary as Record<string, unknown>) ?? {};
                 const period = r.periodStart
                   ? `${String(r.periodStart).slice(0, 10)} → ${r.periodEnd ? String(r.periodEnd).slice(0, 10) : "∞"}`
                   : "—";
                 return `<tr>
                   <td>${short(String(r.id))}</td>
                   <td>${r.runType}</td>
                   <td>${statusBadge(String(r.status))}</td>
                   <td style="font-size:11px">${period}</td>
                   <td>${summary.exceptionCount ?? "—"}</td>
                   <td>${ts(r.completedAt)}</td>
                 </tr>`;
               })
               .join("")}
           </tbody>
         </table>`;

  const rowsHtml = exceptions.map((r) => {
    const resolveBtn =
      r.status === "open"
        ? `<form class="action-form" method="POST" action="/admin/reconciliation/exceptions/${r.id}/resolve">
             <button class="btn btn-success" type="submit">Resolve</button>
           </form>`
        : "";
    const ignoreBtn =
      r.status === "open"
        ? `<form class="action-form" method="POST" action="/admin/reconciliation/exceptions/${r.id}/ignore">
             <button class="btn btn-danger" type="submit">Ignore</button>
           </form>`
        : "";
    const ageColor = r.severity === "critical" ? "color:#dc3545;font-weight:700" : "";
    return `<tr>
      <td>${short(String(r.id))}</td>
      <td><code style="font-size:11px">${r.category}</code></td>
      <td>${statusBadge(String(r.severity))}</td>
      <td>${statusBadge(String(r.status))}</td>
      <td style="max-width:220px;font-size:12px">${r.description}</td>
      <td style="font-size:11px;${ageColor}">${humanAge(r.createdAt)}</td>
      <td style="white-space:nowrap">${resolveBtn} ${ignoreBtn}</td>
    </tr>`;
  });

  const exceptionsSection =
    rowsHtml.length === 0
      ? `<p class="empty">No reconciliation exceptions — all clear.</p>`
      : `<table><thead><tr><th>ID</th><th>Category</th><th>Severity</th><th>Status</th><th>Description</th><th>Age</th><th>Action</th></tr></thead><tbody>${rowsHtml.join("")}</tbody></table>`;

  return `
    <h2 style="font-size:15px;margin:0 0 8px">Recent Runs</h2>
    ${runsSection}
    <h2 style="font-size:15px;margin:24px 0 8px">Exceptions</h2>
    ${exceptionsSection}`;
}

async function handleReports(): Promise<string> {
  const [metrics, settlement] = await Promise.all([
    adminFetch("/admin/metrics") as Promise<Record<string, unknown>>,
    adminFetch("/admin/reports/settlement") as Promise<Array<Record<string, unknown>>>,
  ]);

  const providerStatuses = metrics.providerOutageStatus as Record<string, string>;
  const providerRows = Object.entries(providerStatuses)
    .map(
      ([key, status]) =>
        `<tr><td>${key}</td><td>${statusBadge(status)}</td><td>—</td><td>—</td></tr>`,
    )
    .join("");

  const failureRatePct = (Number(metrics.paymentFailureRate) * 100).toFixed(2);
  const failureColor =
    Number(metrics.paymentFailureRate) > 0.05
      ? "#dc3545"
      : Number(metrics.paymentFailureRate) > 0
        ? "#856404"
        : "#198754";

  const settlementRows = settlement.map(
    (r) => `<tr>
      <td style="font-size:11px">${r.providerBindingId}</td>
      <td>${r.asset}</td>
      <td>${r.completedCount}</td>
      <td><strong>${r.totalAmount}</strong></td>
      <td>${r.failedCount}</td>
      <td>${r.returnedCount}</td>
    </tr>`,
  );

  const settlementTable =
    settlement.length === 0
      ? `<p class="empty">No completed payments in range.</p>`
      : `<table>
           <thead><tr><th>Provider Binding</th><th>Asset</th><th>Completed</th><th>Total Amount</th><th>Failed</th><th>Returned</th></tr></thead>
           <tbody>${settlementRows.join("")}</tbody>
         </table>`;

  return `
    <h2 style="font-size:16px;margin:0 0 12px">Platform Metrics</h2>
    <div class="stat-grid">
      <div class="stat">
        <div class="stat-label">Payment Failure Rate</div>
        <div class="stat-value" style="color:${failureColor}">${failureRatePct}%</div>
      </div>
      <div class="stat">
        <div class="stat-label">Webhook Failures</div>
        <div class="stat-value" style="color:${Number(metrics.webhookFailureCount) > 0 ? "#dc3545" : "#198754"}">${metrics.webhookFailureCount}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Queue Backlog</div>
        <div class="stat-value" style="color:${Number(metrics.queueBacklog) > 10 ? "#856404" : "#198754"}">${metrics.queueBacklog}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Ledger Posting Failures</div>
        <div class="stat-value" style="color:${Number(metrics.ledgerPostingFailures) > 0 ? "#dc3545" : "#198754"}">${metrics.ledgerPostingFailures}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Open Exceptions</div>
        <div class="stat-value" style="color:${Number(metrics.reconciliationExceptionCount) > 0 ? "#dc3545" : "#198754"}">${metrics.reconciliationExceptionCount}</div>
      </div>
    </div>

    <h2 style="font-size:16px;margin:16px 0 8px">Provider Status</h2>
    <table style="width:auto"><thead><tr><th>Adapter</th><th>Status</th><th>Failure Count</th><th>Last Error</th></tr></thead><tbody>${providerRows}</tbody></table>

    <h2 style="font-size:16px;margin:24px 0 8px">Settlement Summary (all time)</h2>
    ${settlementTable}

    <h2 style="font-size:16px;margin:24px 0 8px">Export</h2>
    <p style="font-size:13px">
      <a href="${API_URL}/admin/reports/payment-history" target="_blank">Payment history (JSON)</a>
      &nbsp;·&nbsp;
      <a href="${API_URL}/admin/reports/audit-export" target="_blank">Audit export (NDJSON)</a>
      &nbsp;·&nbsp;
      <a href="${API_URL}/admin/reports/settlement" target="_blank">Settlement summary (JSON)</a>
      &nbsp;·&nbsp;
      <a href="${API_URL}/admin/reports/compliance-payments" target="_blank">Compliance payments (JSON)</a>
    </p>
    <p style="font-size:11px;color:#888">Metrics as of ${ts(metrics.calculatedAt)}</p>`;
}

async function handleProviders(): Promise<string> {
  const providers = (await adminFetch("/admin/providers")) as Array<Record<string, unknown>>;

  if (providers.length === 0) {
    return `<p class="empty">No provider bindings configured.</p>`;
  }

  const rows = providers.map((p) => {
    const status = String(p.status ?? "unknown");
    const failureCount = Number(p.failureCount ?? 0);
    const isDisabled = status === "disabled";
    const action = isDisabled
      ? `<form class="action-form" method="POST" action="/admin/providers/${p.adapterKey}/enable">
           <button class="btn btn-success" type="submit">Enable</button>
         </form>`
      : `<form class="action-form" method="POST" action="/admin/providers/${p.adapterKey}/disable">
           <button class="btn btn-danger" type="submit">Disable</button>
         </form>`;

    return `<tr>
      <td><strong>${p.adapterKey}</strong></td>
      <td style="font-size:11px;word-break:break-all">${p.bindingId}</td>
      <td>${p.currency ?? "—"}</td>
      <td>${p.country ?? "—"}</td>
      <td>${statusBadge(status)}</td>
      <td style="color:${failureCount > 0 ? "#dc3545" : "#198754"}">${failureCount}</td>
      <td style="font-size:11px">${p.reason ?? "—"}</td>
      <td style="font-size:11px">${p.checkedAt ? ts(p.checkedAt) : "—"}</td>
      <td>${action}</td>
    </tr>`;
  });

  const head = [
    "Adapter",
    "Binding ID",
    "Currency",
    "Country",
    "Status",
    "Failures",
    "Reason",
    "Checked At",
    "Action",
  ]
    .map((c) => `<th>${c}</th>`)
    .join("");
  return `<table><thead><tr>${head}</tr></thead><tbody>${rows.join("")}</tbody></table>`;
}

async function handleAudit(): Promise<string> {
  const rows = (await adminFetch("/admin/audit-events")) as Array<Record<string, unknown>>;
  const recent = [...rows].reverse().slice(0, 200);
  return table(
    ["Time", "Actor", "Action", "Resource", "Resource ID"],
    recent,
    (r) => `<tr>
      <td>${ts(r.createdAt)}</td>
      <td>${r.actorType}${r.actorId ? `:${r.actorId}` : ""}</td>
      <td><code style="font-size:11px">${r.action}</code></td>
      <td>${r.resourceType}</td>
      <td>${short(String(r.resourceId))}</td>
    </tr>`,
  );
}

async function handleAdminPost(path: string): Promise<string> {
  const parts = path.split("/").filter(Boolean);
  // POST /admin/webhooks/:id/retry
  if (parts[0] === "admin" && parts[1] === "webhooks" && parts[3] === "retry") {
    await adminPost(`/admin/webhooks/${parts[2]}/retry`);
    return "ok";
  }
  // POST /admin/ledger-postings/:id/retry
  if (parts[0] === "admin" && parts[1] === "ledger-postings" && parts[3] === "retry") {
    await adminPost(`/admin/ledger-postings/${parts[2]}/retry`);
    return "ok";
  }
  // POST /admin/reconciliation/exceptions/:id/resolve
  if (
    parts[0] === "admin" &&
    parts[1] === "reconciliation" &&
    parts[2] === "exceptions" &&
    parts[4] === "resolve"
  ) {
    await adminPost(`/admin/reconciliation/exceptions/${parts[3]}/resolve`, {
      resolvedBy: "ops-ui",
    });
    return "ok";
  }
  // POST /admin/reconciliation/exceptions/:id/ignore
  if (
    parts[0] === "admin" &&
    parts[1] === "reconciliation" &&
    parts[2] === "exceptions" &&
    parts[4] === "ignore"
  ) {
    await adminPost(`/admin/reconciliation/exceptions/${parts[3]}/ignore`, {
      ignoredBy: "ops-ui",
    });
    return "ok";
  }
  // POST /admin/routing-rules/:id/deactivate
  if (parts[0] === "admin" && parts[1] === "routing-rules" && parts[3] === "deactivate") {
    await adminPost(`/admin/routing-rules/${parts[2]}/deactivate`);
    return "ok";
  }
  // POST /admin/providers/:adapterKey/disable
  if (parts[0] === "admin" && parts[1] === "providers" && parts[3] === "disable") {
    await adminPost(`/admin/providers/${parts[2]}/disable`);
    return "ok";
  }
  // POST /admin/providers/:adapterKey/enable
  if (parts[0] === "admin" && parts[1] === "providers" && parts[3] === "enable") {
    await adminPost(`/admin/providers/${parts[2]}/enable`);
    return "ok";
  }
  throw new Error(`Unknown action: ${path}`);
}

async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
  const path = url.pathname;

  try {
    // Admin action POST — redirect back to referrer after
    if (req.method === "POST") {
      await handleAdminPost(path);
      res.writeHead(303, { Location: req.headers.referer ?? "/" });
      res.end();
      return;
    }

    let title = "Dashboard";
    let content: string;

    if (path === "/" || path === "") {
      content = await handleDashboard();
    } else if (path === "/payments") {
      title = "Payments";
      content = await handlePayments();
    } else if (path.startsWith("/payments/") && path.split("/").length === 3) {
      const id = path.split("/")[2];
      title = `Payment ${id.slice(0, 8)}…`;
      content = await handlePaymentDetail(id);
    } else if (path === "/providers") {
      title = "Provider Health";
      content = await handleProviders();
    } else if (path === "/routing-rules") {
      title = "Routing Rules";
      content = await handleRoutingRules();
    } else if (path === "/webhooks") {
      title = "Webhook Events";
      content = await handleWebhooks();
    } else if (path === "/ledger") {
      title = "Ledger Postings";
      content = await handleLedger();
    } else if (path === "/reconciliation") {
      title = "Reconciliation Exceptions";
      content = await handleReconciliation();
    } else if (path === "/reports") {
      title = "Reports & Metrics";
      content = await handleReports();
    } else if (path === "/audit") {
      title = "Audit Log";
      content = await handleAudit();
    } else {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html(title, content));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html("Error", `<div class="error">${message}</div>`));
  }
}

export function createOpsUiServer() {
  return createServer((req, res) => {
    void handle(req, res);
  });
}

if (process.argv[1] === import.meta.filename) {
  const server = createOpsUiServer();
  server.listen(PORT, () => {
    console.log(`Granville Ops UI running at http://localhost:${PORT}`);
    console.log(`  Proxying admin API at ${API_URL}`);
  });
}
