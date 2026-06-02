import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { PaymentOrder, PaymentAccount } from '@/types/granville'
import { api } from '@/lib/api'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'

// ── Status badge map ──────────────────────────────────────────────────────────

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  completed: 'default',
  processing: 'secondary',
  provider_accepted: 'secondary',
  submitted_to_provider: 'secondary',
  pending_review: 'outline',
  created: 'outline',
  failed: 'destructive',
  returned: 'destructive',
  cancelled: 'destructive',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseAmount(p: PaymentOrder): number {
  const n = parseFloat(p.amount?.amount ?? '0')
  return isNaN(n) ? 0 : n
}

function primaryAsset(orders: PaymentOrder[]): string {
  if (orders.length === 0) return ''
  const freq: Record<string, number> = {}
  orders.forEach((p) => { freq[p.amount?.asset ?? ''] = (freq[p.amount?.asset ?? ''] ?? 0) + 1 })
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''
}

function sumForAsset(orders: PaymentOrder[], asset: string): number {
  return orders
    .filter((p) => p.amount?.asset === asset)
    .reduce((acc, p) => acc + parseAmount(p), 0)
}

function formatAmt(n: number, asset: string): string {
  if (n === 0) return '—'
  return `${n.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${asset}`
}

function deltaPct(current: number, previous: number): { label: string; positive: boolean } {
  if (previous === 0 && current === 0) return { label: '—', positive: true }
  if (previous === 0) return { label: '↑ new', positive: true }
  const pct = Math.round(((current - previous) / previous) * 100)
  return { label: `${pct > 0 ? '↑' : '↓'} ${Math.abs(pct)}% vs prior period`, positive: pct >= 0 }
}

function bucketByDay(orders: PaymentOrder[], days: number) {
  const now = new Date()
  const result: Record<string, { in: number; out: number }> = {}
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    result[d.toISOString().slice(0, 10)] = { in: 0, out: 0 }
  }
  orders.forEach((p) => {
    if (p.status !== 'completed') return
    const key = p.createdAt.slice(0, 10)
    if (!(key in result)) return
    const amt = parseAmount(p)
    if (p.direction === 'inbound') result[key].in += amt
    else result[key].out += amt
  })
  return Object.entries(result).map(([date, v]) => ({
    date: date.slice(5),
    in: v.in,
    out: v.out,
  }))
}

function sparklineData(orders: PaymentOrder[], days = 14) {
  const now = new Date()
  const buckets: Record<string, number> = {}
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    buckets[d.toISOString().slice(0, 10)] = 0
  }
  orders.forEach((p) => {
    if (p.status !== 'completed') return
    const key = p.createdAt.slice(0, 10)
    if (key in buckets) buckets[key] += parseAmount(p)
  })
  return Object.values(buckets).map((v) => ({ v }))
}

function inPeriod(orders: PaymentOrder[], days: number): PaymentOrder[] {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  return orders.filter((p) => new Date(p.createdAt) >= cutoff)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
}

// ── Placeholder chart data (shown when no real transactions exist) ────────────

const PLACEHOLDER_CHART: { date: string; in: number; out: number }[] = [
  { date: '05-04', in: 12400, out: 8200  },
  { date: '05-05', in: 9800,  out: 11500 },
  { date: '05-06', in: 15200, out: 7600  },
  { date: '05-07', in: 6300,  out: 9400  },
  { date: '05-08', in: 18700, out: 12100 },
  { date: '05-09', in: 4200,  out: 5800  },
  { date: '05-10', in: 7600,  out: 6900  },
  { date: '05-11', in: 21300, out: 14200 },
  { date: '05-12', in: 13900, out: 10500 },
  { date: '05-13', in: 8400,  out: 7300  },
  { date: '05-14', in: 16800, out: 11900 },
  { date: '05-15', in: 11200, out: 8700  },
]

// ── Dashboard ─────────────────────────────────────────────────────────────────

const PERIODS = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
] as const

export function Dashboard() {
  const [period, setPeriod] = useState<7 | 30 | 90>(30)

  const { data: accounts = [] } = useQuery<PaymentAccount[]>({
    queryKey: ['wallets'],
    queryFn: () => api.get('/payment-accounts').then((r) => r.data),
  })

  const { data: payments = [] } = useQuery<PaymentOrder[]>({
    queryKey: ['transfers'],
    queryFn: () => api.get('/payments').then((r) => r.data),
  })

  const currentInbound  = useMemo(() => inPeriod(payments.filter((p) => p.direction === 'inbound'), period), [payments, period])
  const currentOutbound = useMemo(() => inPeriod(payments.filter((p) => p.direction === 'outbound'), period), [payments, period])
  const prevInbound     = useMemo(() => {
    const start = new Date(); start.setDate(start.getDate() - period * 2)
    const end   = new Date(); end.setDate(end.getDate() - period)
    return payments.filter((p) => p.direction === 'inbound' && p.status === 'completed' && new Date(p.createdAt) >= start && new Date(p.createdAt) < end)
  }, [payments, period])
  const prevOutbound    = useMemo(() => {
    const start = new Date(); start.setDate(start.getDate() - period * 2)
    const end   = new Date(); end.setDate(end.getDate() - period)
    return payments.filter((p) => p.direction === 'outbound' && p.status === 'completed' && new Date(p.createdAt) >= start && new Date(p.createdAt) < end)
  }, [payments, period])

  const completedInbound  = useMemo(() => currentInbound.filter((p) => p.status === 'completed'), [currentInbound])
  const completedOutbound = useMemo(() => currentOutbound.filter((p) => p.status === 'completed'), [currentOutbound])
  const attentionItems    = useMemo(() => payments.filter((p) => ['pending_review', 'created', 'failed', 'returned'].includes(p.status)), [payments])

  const inAsset  = primaryAsset(completedInbound)
  const outAsset = primaryAsset(completedOutbound)
  const inTotal  = sumForAsset(completedInbound, inAsset)
  const outTotal = sumForAsset(completedOutbound, outAsset)

  const inDelta  = deltaPct(inTotal,  sumForAsset(prevInbound.filter((p) => p.status === 'completed'), inAsset))
  const outDelta = deltaPct(outTotal, sumForAsset(prevOutbound.filter((p) => p.status === 'completed'), outAsset))

  const inSparkline  = useMemo(() => sparklineData(completedInbound), [completedInbound])
  const outSparkline = useMemo(() => sparklineData(completedOutbound), [completedOutbound])
  const chartData    = useMemo(() => bucketByDay(payments, period), [payments, period])

  const recentActivity = useMemo(
    () => [...payments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6),
    [payments],
  )

  const hasAttention = attentionItems.length > 0

  return (
    <>
      <Header fixed>
        <div className='ml-auto flex items-center gap-2'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        {/* ── Page heading ─────────────────────────────────────────────── */}
        <div className='mb-6 flex items-end justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Overview</h1>
            <p className='text-muted-foreground'>
              {new Date().toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className='flex gap-1'>
            {PERIODS.map(({ label, days }) => (
              <Button
                key={days}
                variant={period === days ? 'default' : 'outline'}
                size='sm'
                onClick={() => setPeriod(days as 7 | 30 | 90)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* ── Financial position — 4 metric cards ──────────────────────── */}
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>

          {/* Available Cash */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>Available cash</CardTitle>
              <Icon name='bank' className='size-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {accounts.length > 0 ? `${accounts.length} account${accounts.length !== 1 ? 's' : ''}` : '—'}
              </div>
              <p className='mt-1 text-xs text-muted-foreground'>Real-time balance</p>
              <div className='mt-3 border-t pt-3'>
                <Link to='/balances' className='text-xs text-muted-foreground hover:text-foreground'>
                  View balances →
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Money In */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>Money in</CardTitle>
              <Icon name='arrow-up' className='size-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='flex items-start justify-between gap-2'>
                <div>
                  <div className='text-2xl font-bold tabular-nums'>{formatAmt(inTotal, inAsset)}</div>
                  <p className={`mt-1 text-xs ${inDelta.positive ? 'text-muted-foreground' : 'text-destructive'}`}>
                    {inDelta.label}
                  </p>
                </div>
                <div className='h-10 w-20 shrink-0'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <AreaChart data={inSparkline}>
                      <Area type='monotone' dataKey='v' stroke='var(--color-muted-foreground)' fill='var(--color-muted-foreground)' fillOpacity={0.12} strokeWidth={1.5} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className='mt-3 border-t pt-3'>
                <p className='text-xs text-muted-foreground'>
                  {completedInbound.length === 0 ? 'No receipts this period' : `${completedInbound.length} receipt${completedInbound.length !== 1 ? 's' : ''} · ${period}d`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Money Out */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>Money out</CardTitle>
              <Icon name='arrow-down' className='size-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='flex items-start justify-between gap-2'>
                <div>
                  <div className='text-2xl font-bold tabular-nums'>{formatAmt(outTotal, outAsset)}</div>
                  <p className={`mt-1 text-xs ${outDelta.positive ? 'text-muted-foreground' : 'text-destructive'}`}>
                    {outDelta.label}
                  </p>
                </div>
                <div className='h-10 w-20 shrink-0'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <AreaChart data={outSparkline}>
                      <Area type='monotone' dataKey='v' stroke='var(--color-muted-foreground)' fill='var(--color-muted-foreground)' fillOpacity={0.12} strokeWidth={1.5} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className='mt-3 border-t pt-3'>
                <p className='text-xs text-muted-foreground'>
                  {completedOutbound.length === 0 ? 'No payments this period' : `${completedOutbound.length} payment${completedOutbound.length !== 1 ? 's' : ''} · ${period}d`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Needs Attention */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>Needs attention</CardTitle>
              <Icon name='shield' className={`size-4 ${hasAttention ? 'text-destructive' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${hasAttention ? 'text-destructive' : ''}`}>
                {attentionItems.length === 0 ? '—' : attentionItems.length}
              </div>
              <p className='mt-1 text-xs text-muted-foreground'>
                {hasAttention ? `${attentionItems.filter((p) => p.status === 'failed' || p.status === 'returned').length} failed · ${attentionItems.filter((p) => p.status === 'pending_review' || p.status === 'created').length} pending` : 'All clear'}
              </p>
              <div className='mt-3 border-t pt-3'>
                {hasAttention ? (
                  <Link to='/payments' className='text-xs text-destructive hover:underline'>
                    Review now →
                  </Link>
                ) : (
                  <p className='text-xs text-muted-foreground'>Nothing to action</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Cash flow chart + activity ────────────────────────────────── */}
        <div className='mt-6 grid gap-4 lg:grid-cols-7'>

          {/* Cash flow trend */}
          <Card className='lg:col-span-4'>
            <CardHeader>
              <CardTitle>Cash flow</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const display = chartData.some((d) => d.in > 0 || d.out > 0) ? chartData : PLACEHOLDER_CHART
                const isPlaceholder = display === PLACEHOLDER_CHART
                return (
                  <div className='relative'>
                    <ResponsiveContainer width='100%' height={220}>
                      <BarChart data={display} barGap={2}>
                        <CartesianGrid strokeDasharray='3 3' stroke='var(--color-muted-foreground)' strokeOpacity={0.12} vertical={false} />
                        <XAxis dataKey='date' tick={{ fontSize: 11 }} stroke='var(--color-muted-foreground)' strokeOpacity={0.4} tickLine={false} axisLine={false} interval='preserveStartEnd' />
                        <YAxis tick={{ fontSize: 11 }} stroke='var(--color-muted-foreground)' strokeOpacity={0.4} tickLine={false} axisLine={false} width={48} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                        <Tooltip
                          contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-card)' }}
                          cursor={{ fill: 'var(--color-muted)', opacity: 0.3 }}
                          formatter={(v: number) => [`${v.toLocaleString()}`, undefined]}
                        />
                        <Bar dataKey='in'  name='Money in'  fill='var(--color-primary)' radius={[3, 3, 0, 0]} maxBarSize={18} />
                        <Bar dataKey='out' name='Money out' fill='var(--color-muted-foreground)' fillOpacity={0.35} radius={[3, 3, 0, 0]} maxBarSize={18} />
                      </BarChart>
                    </ResponsiveContainer>
                    {isPlaceholder && (
                      <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
                        <span className='rounded-md bg-background/80 px-2 py-1 text-xs text-muted-foreground backdrop-blur-sm'>
                          Sample data — connect your accounts to see live figures
                        </span>
                      </div>
                    )}
                  </div>
                )
              })()}
            </CardContent>
          </Card>

          {/* Recent activity */}
          <Card className='lg:col-span-3'>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
            </CardHeader>
            <CardContent className='space-y-0'>
              {recentActivity.length === 0 ? (
                <p className='py-6 text-center text-sm text-muted-foreground'>No activity yet.</p>
              ) : (
                recentActivity.map((p) => (
                  <div key={p.id} className='flex items-center gap-2 border-b py-2.5 text-sm last:border-0'>
                    <Icon
                      name={p.direction === 'inbound' ? 'arrow-up' : 'arrow-down'}
                      className='size-3 shrink-0 text-muted-foreground'
                    />
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-xs font-medium'>
                        {p.beneficiaryReference ?? p.id.slice(0, 8) + '…'}
                      </p>
                      <p className='text-xs text-muted-foreground'>{formatDate(p.createdAt)}</p>
                    </div>
                    <Badge variant={statusVariant[p.status] ?? 'secondary'} className='shrink-0 text-xs'>
                      {p.status.replace(/_/g, ' ')}
                    </Badge>
                    <span className='shrink-0 text-xs font-medium tabular-nums'>
                      {p.amount ? `${p.amount.amount} ${p.amount.asset}` : '—'}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}
