const BARS = [
  { in: 44, out: 30 }, { in: 35, out: 42 }, { in: 55, out: 28 },
  { in: 23, out: 34 }, { in: 68, out: 44 }, { in: 15, out: 21 },
  { in: 28, out: 25 }, { in: 77, out: 52 }, { in: 51, out: 38 },
  { in: 31, out: 27 }, { in: 61, out: 43 }, { in: 41, out: 32 },
]
const LABELS = ['05-04','05-05','05-06','05-07','05-08','05-09','05-10','05-11','05-12','05-13','05-14','05-15']

const ACTIVITY = [
  { ref: 'REC-2281',   date: 'Jun 1', status: 'Completed',  amount: '24,000 USD', in: true  },
  { ref: 'PAY-8814',   date: 'Jun 1', status: 'Processing', amount: '8,500 GBP',  in: false },
  { ref: 'PAYMT-0042', date: 'May 31', status: 'Completed', amount: '11,200 EUR', in: false },
  { ref: 'REC-2280',   date: 'May 31', status: 'Completed', amount: '18,750 USD', in: true  },
  { ref: 'PAY-8801',   date: 'May 30', status: 'Pending',   amount: '3,200 GBP',  in: false },
]

function SidebarLabel({ children }: { children: string }) {
  return (
    <div className="px-2 pt-3 pb-1 text-[6.5px] font-semibold uppercase tracking-[0.15em] text-white/25">
      {children}
    </div>
  )
}

function SidebarItem({ label, active, muted, badge }: { label: string; active?: boolean; muted?: boolean; badge?: string }) {
  return (
    <div className={`mx-1 flex items-center gap-1.5 rounded px-1.5 py-[4px] ${active ? 'bg-white/[0.07] text-white/90' : 'text-white/40'} ${muted ? 'opacity-40' : ''}`}>
      <div className="size-[7px] rounded-sm bg-current opacity-50 shrink-0" />
      <span className="flex-1 text-[8px] leading-none">{label}</span>
      {badge && <span className="rounded px-1 py-px text-[5.5px] text-white/25 ring-1 ring-white/15">{badge}</span>}
    </div>
  )
}

function KPI({ title, value, sub, accent }: { title: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-card p-2.5 flex flex-col gap-0.5">
      <div className="text-[7px] text-muted-foreground leading-none">{title}</div>
      <div className={`text-[12px] font-bold leading-tight tabular-nums ${accent ? 'text-destructive' : ''}`}>{value}</div>
      <div className="text-[6.5px] text-muted-foreground leading-none border-t border-border pt-1.5 mt-0.5">{sub}</div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === 'Completed' ? 'bg-primary/10 text-primary' :
    status === 'Processing' ? 'bg-muted text-muted-foreground' :
    'bg-muted text-muted-foreground'
  return <span className={`rounded px-1 py-px text-[6px] leading-none ${cls}`}>{status}</span>
}

export function DashboardMockup() {
  const maxVal = Math.max(...BARS.map((b) => b.in + b.out))
  const H = 72

  return (
    <div className="absolute inset-0 flex overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className="w-[130px] shrink-0 border-r border-white/[0.06] bg-[#07111f] flex flex-col py-2">
        {/* Org switcher */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 mb-1">
          <div className="flex size-[22px] shrink-0 items-center justify-center rounded-lg bg-[#07111f] border border-white/10">
            <div className="size-[11px] rounded-sm bg-[#38bdf8] opacity-90" />
          </div>
          <div>
            <div className="text-[8px] font-semibold text-white/80 leading-none">Acme Corp</div>
            <div className="text-[6.5px] text-white/35 leading-none mt-0.5">Treasury Workspace</div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <SidebarLabel>Workspace</SidebarLabel>
          <SidebarItem label="Overview" active />

          <SidebarLabel>Payment operations</SidebarLabel>
          <SidebarItem label="Balances" />
          <SidebarItem label="Payments" />
          <SidebarItem label="Beneficiaries" />
        </div>

        {/* Footer brand */}
        <div className="mx-2 mt-2 flex items-center gap-2 rounded-lg px-2 py-1.5 border border-white/[0.05]">
          <div className="flex size-[18px] shrink-0 items-center justify-center rounded-[6px] bg-[#f8fafc]">
            <div className="size-[9px] bg-[#d5bf9b]" style={{ clipPath: 'polygon(70% 0%,100% 0%,100% 30%,30% 100%,0% 100%,0% 70%)' }} />
          </div>
          <div>
            <div className="text-[7px] font-bold tracking-wide text-[#d5bf9b] leading-none">Granville</div>
            <div className="text-[5.5px] text-[#c8ad7f]/60 leading-none mt-0.5 tracking-wide">Finance</div>
          </div>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────── */}
      <main className="flex-1 bg-background flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="flex h-9 shrink-0 items-center justify-end gap-2 border-b border-border px-4">
          <div className="size-5 rounded-full bg-muted" />
        </div>

        {/* Dashboard body */}
        <div className="flex-1 overflow-hidden p-4 flex flex-col gap-3">
          {/* Heading + period buttons */}
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[13px] font-bold leading-tight">Overview</div>
              <div className="text-[8px] text-muted-foreground">Monday, June 2, 2026</div>
            </div>
            <div className="flex gap-1">
              {['7d', '30d', '90d'].map((l, i) => (
                <div key={l} className={`rounded px-1.5 py-0.5 text-[7px] border ${i === 1 ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}>
                  {l}
                </div>
              ))}
            </div>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-4 gap-2">
            <KPI title="Reported balances" value="3 accounts" sub="Partner-reported" />
            <KPI title="Money in"         value="24,000 USD"  sub="↑ 12% vs prior period" />
            <KPI title="Money out"        value="14,750 USD"  sub="↓ 4% vs prior period" />
            <KPI title="Needs attention"  value="—"           sub="All clear" />
          </div>

          {/* Chart + Activity */}
          <div className="grid grid-cols-7 gap-2 flex-1 min-h-0">
            {/* Cash flow */}
            <div className="col-span-4 rounded-lg border border-border bg-card flex flex-col overflow-hidden">
              <div className="px-3 py-2 text-[9px] font-semibold border-b border-border shrink-0">Cash flow</div>
              <div className="flex-1 px-3 pb-2 pt-1.5 min-h-0 flex flex-col justify-between">
                <svg viewBox={`0 0 ${BARS.length * 16} ${H + 12}`} preserveAspectRatio="none" className="w-full flex-1">
                  {/* Grid lines */}
                  {[0.25, 0.5, 0.75, 1].map((f) => (
                    <line key={f} x1={0} y1={H * (1 - f)} x2={BARS.length * 16} y2={H * (1 - f)}
                      stroke="currentColor" strokeOpacity={0.07} strokeWidth={0.5} />
                  ))}
                  {BARS.map((b, i) => {
                    const inH  = (b.in  / maxVal) * H
                    const outH = (b.out / maxVal) * H
                    const x = i * 16 + 1
                    return (
                      <g key={i}>
                        <rect x={x}     y={H - inH}  width={6} height={inH}  rx={1} fill="var(--color-primary)"           fillOpacity={0.85} />
                        <rect x={x + 7} y={H - outH} width={6} height={outH} rx={1} fill="var(--color-muted-foreground)"  fillOpacity={0.28} />
                      </g>
                    )
                  })}
                </svg>
                {/* X-axis labels (every 3rd) */}
                <div className="flex justify-between">
                  {LABELS.filter((_, i) => i % 3 === 0).map((l) => (
                    <span key={l} className="text-[5.5px] text-muted-foreground">{l}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent activity */}
            <div className="col-span-3 rounded-lg border border-border bg-card flex flex-col overflow-hidden">
              <div className="px-3 py-2 text-[9px] font-semibold border-b border-border shrink-0">Recent activity</div>
              <div className="flex-1 overflow-hidden divide-y divide-border">
                {ACTIVITY.map((row) => (
                  <div key={row.ref} className="flex items-center gap-1.5 px-3 py-1.5">
                    <div className={`size-[7px] rounded-full shrink-0 ${row.in ? 'bg-primary/60' : 'bg-muted-foreground/40'}`} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[7.5px] font-medium truncate leading-none">{row.ref}</div>
                      <div className="text-[6px] text-muted-foreground leading-none mt-0.5">{row.date}</div>
                    </div>
                    <StatusBadge status={row.status} />
                    <span className="text-[6.5px] font-medium tabular-nums shrink-0 text-foreground/70">{row.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
