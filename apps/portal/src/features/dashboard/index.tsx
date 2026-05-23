import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import type {
  AuditEvent,
  PlatformMetrics,
  PaymentOrder,
  ReconciliationException,
} from '@/types/granville'
import { api } from '@/lib/api'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import type { IconName } from '@/components/ui/icon-registry'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'

function MetricCard({
  title,
  value,
  icon,
  alert,
  sub,
}: {
  title: string
  value: number | string
  icon: IconName
  alert?: boolean
  sub?: string
}) {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
        <Icon
          name={icon}
          className={`size-4 ${alert ? 'text-destructive' : 'text-muted-foreground'}`}
        />
      </CardHeader>
      <CardContent>
        <div
          className={`text-2xl font-bold ${alert ? 'text-destructive' : ''}`}
        >
          {value}
        </div>
        {sub && <p className='mt-1 text-xs text-muted-foreground'>{sub}</p>}
      </CardContent>
    </Card>
  )
}

export function Dashboard() {
  const { data: metrics } = useQuery<PlatformMetrics>({
    queryKey: ['metrics'],
    queryFn: () => api.get('/admin/metrics').then((r) => r.data),
  })

  const { data: payments = [] } = useQuery<PaymentOrder[]>({
    queryKey: ['payments'],
    queryFn: () => api.get('/admin/payments').then((r) => r.data),
  })

  const { data: exceptions = [] } = useQuery<ReconciliationException[]>({
    queryKey: ['exceptions'],
    queryFn: () =>
      api.get('/admin/reconciliation/exceptions').then((r) => r.data),
  })

  const { data: auditEvents = [] } = useQuery<AuditEvent[]>({
    queryKey: ['audit-events'],
    queryFn: () => api.get('/admin/audit-events').then((r) => r.data),
  })

  const pendingApprovals = payments.filter(
    (p) => p.status === 'pending_review'
  ).length
  const openExceptions = exceptions.filter((e) => e.status === 'open').length
  const recentActivity = [...auditEvents].reverse().slice(0, 10)

  return (
    <>
      <Header fixed>
        <div className='ml-auto flex items-center gap-2'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
          <p className='text-muted-foreground'>Platform overview</p>
        </div>

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <MetricCard
            title='Total Wallets'
            value={metrics?.totalPaymentAccounts ?? '—'}
            icon='wallet'
            sub='Payment accounts'
          />
          <MetricCard
            title='Transfers'
            value={metrics?.totalPaymentOrders ?? '—'}
            icon='payment-flow'
            sub={`${metrics?.completedPayments ?? 0} completed`}
          />
          <MetricCard
            title='Pending Approvals'
            value={pendingApprovals}
            icon='compliance'
            alert={pendingApprovals > 0}
            sub={pendingApprovals > 0 ? 'Requires action' : 'None pending'}
          />
          <MetricCard
            title='Open Exceptions'
            value={openExceptions}
            icon='shield'
            alert={openExceptions > 0}
            sub={openExceptions > 0 ? 'Reconciliation issues' : 'All clear'}
          />
        </div>

        <div className='mt-6 grid gap-4 lg:grid-cols-7'>
          <Card className='lg:col-span-4'>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest platform events</CardDescription>
            </CardHeader>
            <CardContent className='space-y-0'>
              {recentActivity.length === 0 ? (
                <p className='py-6 text-center text-sm text-muted-foreground'>
                  No activity yet.
                </p>
              ) : (
                recentActivity.map((e) => (
                  <div
                    key={e.id}
                    className='flex items-start gap-3 border-b py-3 text-sm last:border-0'
                  >
                    <span className='mt-0.5 font-medium'>{e.actorType}</span>
                    <span className='font-mono text-xs text-muted-foreground'>
                      {e.action}
                    </span>
                    <span className='ml-auto shrink-0 text-xs text-muted-foreground'>
                      {new Date(e.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className='lg:col-span-3'>
            <CardHeader>
              <CardTitle>Platform Status</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm'>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>Customers</span>
                <span className='font-medium'>
                  {metrics?.totalCustomers ?? '—'}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>Failed payments</span>
                <span
                  className={`font-medium ${(metrics?.failedPayments ?? 0) > 0 ? 'text-destructive' : ''}`}
                >
                  {metrics?.failedPayments ?? '—'}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>
                  Active routing rules
                </span>
                <span className='font-medium'>
                  {metrics?.activeRoutingRules ?? '—'}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>
                  Ledger queue depth
                </span>
                <span className='font-medium'>
                  {metrics?.ledgerPostingQueueDepth ?? '—'}
                </span>
              </div>
              <div className='mt-4 space-y-2 border-t pt-4'>
                <Link
                  to='/transfers'
                  className='flex items-center gap-1 text-xs text-primary hover:underline'
                >
                  <Icon name='payment-flow' className='size-3' /> View all
                  transfers →
                </Link>
                <Link
                  to='/approvals'
                  className='flex items-center gap-1 text-xs text-primary hover:underline'
                >
                  <Icon name='compliance' className='size-3' /> View approvals →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}
