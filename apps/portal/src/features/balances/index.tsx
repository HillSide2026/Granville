import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ChartSkeleton, PortalEmptyState } from '@/components/portal-state'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Skeleton } from '@/components/ui/skeleton'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { PaymentAccount, PaymentOrder } from '@/types/granville'

const periods = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
]

export function Balances() {
  const [period, setPeriod] = useState(30)

  const { data: accounts = [], isLoading: accountsLoading } = useQuery<PaymentAccount[]>({
    queryKey: ['payment-accounts'],
    queryFn: () => api.get('/payment-accounts').then((r) => r.data),
  })

  const { data: payments = [], isLoading: paymentsLoading } = useQuery<PaymentOrder[]>({
    queryKey: ['payments'],
    queryFn: () => api.get('/payments').then((r) => r.data),
  })

  const cutoff = new Date(Date.now() - period * 86400000)
  const visiblePayments = payments.filter((payment) => new Date(payment.createdAt) >= cutoff)
  const completedPayments = visiblePayments.filter((payment) => payment.status === 'completed')
  const pendingPayments = visiblePayments.filter((payment) =>
    ['created', 'pending_review', 'submitted_to_provider', 'provider_accepted', 'processing'].includes(payment.status),
  )
  const failedPayments = visiblePayments.filter((payment) =>
    ['failed', 'returned', 'cancelled'].includes(payment.status),
  )

  const chartData = completedPayments.map((payment) => ({
    date: payment.completedAt?.slice(0, 10) ?? payment.createdAt.slice(0, 10),
    amount: parseFloat(payment.amount?.amount ?? '0'),
  }))

  return (
    <>
      <Header fixed>
        <div className='ml-auto flex items-center gap-2'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='portal-page'>
        <div className='portal-page-header flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
          <div>
            <p className='text-label text-muted-foreground'>Partner-reported activity</p>
            <h1 className='mt-2 text-h2'>Balances</h1>
            <p className='mt-1 text-sm text-muted-foreground'>Reported payment account activity from connected partners</p>
          </div>
          <div className='flex gap-1'>
            {periods.map((p) => (
              <Button
                key={p.days}
                variant={period === p.days ? 'default' : 'outline'}
                size='sm'
                onClick={() => setPeriod(p.days)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        <div className='mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <Card className='bg-card'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>Payment accounts</CardTitle>
              <span className='flex size-8 items-center justify-center rounded-full bg-[var(--portal-status-submitted-bg)] text-[var(--portal-status-submitted-text)] ring-1 ring-[var(--portal-status-submitted-border)]'>
                <Icon name='bank' className='size-4' />
              </span>
            </CardHeader>
            <CardContent>
              {accountsLoading ? (
                <div className='space-y-3'>
                  <Skeleton className='h-8 w-14' />
                  <Skeleton className='h-3 w-36' />
                </div>
              ) : (
                <>
                  <div className='text-2xl font-semibold tabular-nums'>{accounts.length}</div>
                  <p className='mt-1 text-xs text-muted-foreground'>Connected partner reports</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card className='bg-card'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>Completed payments</CardTitle>
              <span className='flex size-8 items-center justify-center rounded-full bg-[var(--portal-status-completed-bg)] text-[var(--portal-status-completed-text)] ring-1 ring-[var(--portal-status-completed-border)]'>
                <Icon name='circle-check' className='size-4' />
              </span>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div className='space-y-3'>
                  <Skeleton className='h-8 w-14' />
                  <Skeleton className='h-3 w-40' />
                </div>
              ) : (
                <>
                  <div className='text-2xl font-semibold tabular-nums text-[var(--portal-status-completed-text)]'>{completedPayments.length}</div>
                  <p className='mt-1 text-xs text-muted-foreground'>Partner-reported completions</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card className='bg-card'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>In progress</CardTitle>
              <span className='flex size-8 items-center justify-center rounded-full bg-[var(--portal-status-processing-bg)] text-[var(--portal-status-processing-text)] ring-1 ring-[var(--portal-status-processing-border)]'>
                <Icon name='refresh' className='size-4' />
              </span>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div className='space-y-3'>
                  <Skeleton className='h-8 w-14' />
                  <Skeleton className='h-3 w-44' />
                </div>
              ) : (
                <>
                  <div className='text-2xl font-semibold tabular-nums'>{pendingPayments.length}</div>
                  <p className='mt-1 text-xs text-muted-foreground'>Created, submitted, or processing</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card className={failedPayments.length > 0 ? 'border-[var(--portal-status-failed-border)] bg-[var(--portal-status-failed-bg)]/30' : 'bg-card'}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>Exceptions</CardTitle>
              <span className={`flex size-8 items-center justify-center rounded-full ring-1 ${failedPayments.length > 0 ? 'bg-[var(--portal-status-failed-bg)] text-[var(--portal-status-failed-text)] ring-[var(--portal-status-failed-border)]' : 'bg-[var(--portal-status-completed-bg)] text-[var(--portal-status-completed-text)] ring-[var(--portal-status-completed-border)]'}`}>
                <Icon name={failedPayments.length > 0 ? 'shield' : 'circle-check'} className='size-4' />
              </span>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div className='space-y-3'>
                  <Skeleton className='h-8 w-14' />
                  <Skeleton className='h-3 w-40' />
                </div>
              ) : (
                <>
                  <div className={`text-2xl font-semibold tabular-nums ${failedPayments.length > 0 ? 'text-[var(--portal-status-failed-text)]' : ''}`}>
                    {failedPayments.length}
                  </div>
                  <p className='mt-1 text-xs text-muted-foreground'>Failed, returned, or cancelled</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className='bg-card'>
          <CardHeader className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
            <div>
              <CardTitle>Completed payment activity</CardTitle>
              <p className='mt-1 text-sm text-muted-foreground'>Partner-reported completed payment volume for the selected period</p>
            </div>
            <span className='rounded-full bg-[var(--portal-status-completed-bg)] px-2.5 py-1 text-xs font-medium text-[var(--portal-status-completed-text)] ring-1 ring-[var(--portal-status-completed-border)]'>
              {completedPayments.length} completed
            </span>
          </CardHeader>
          <CardContent>
            {paymentsLoading ? (
              <ChartSkeleton />
            ) : chartData.length === 0 ? (
              <PortalEmptyState
                icon='analytics'
                title='No completed activity for this period'
                description='Completed partner-reported payment volume will appear here when payment orders settle during the selected window.'
                className='py-16'
              />
            ) : (
              <ResponsiveContainer width='100%' height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray='3 3' stroke='var(--color-muted-foreground)' strokeOpacity={0.12} vertical={false} />
                  <XAxis dataKey='date' tick={{ fontSize: 12 }} stroke='var(--color-muted-foreground)' strokeOpacity={0.45} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12 }} stroke='var(--color-muted-foreground)' strokeOpacity={0.45} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-card)' }}
                    cursor={{ stroke: 'var(--portal-status-completed-text)', strokeOpacity: 0.25 }}
                    formatter={(value) => [Number(value).toLocaleString('en-CA'), 'Amount']}
                  />
                  <Line type='monotone' dataKey='amount' stroke='var(--portal-status-completed-text)' strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
