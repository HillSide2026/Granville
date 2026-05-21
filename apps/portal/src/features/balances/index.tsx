import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { PlatformMetrics } from '@/types/granville'

const periods = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
]

interface SettlementLine {
  date?: string
  amount?: string
  asset?: string
  [key: string]: unknown
}

export function Balances() {
  const [period, setPeriod] = useState(30)

  const from = new Date(Date.now() - period * 86400000).toISOString().split('T')[0]
  const to = new Date().toISOString().split('T')[0]

  const { data: metrics } = useQuery<PlatformMetrics>({
    queryKey: ['metrics'],
    queryFn: () => api.get('/admin/metrics').then((r) => r.data),
  })

  const { data: settlement = [] } = useQuery<SettlementLine[]>({
    queryKey: ['settlement', from, to],
    queryFn: () => api.get(`/admin/reports/settlement?from=${from}&to=${to}`).then((r) => r.data),
  })

  const chartData = settlement.map((s) => ({
    date: s.date ?? '',
    amount: parseFloat(String(s.amount ?? 0)),
  }))

  return (
    <>
      <Header fixed>
        <div className='ml-auto flex items-center gap-2'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Balances</h1>
            <p className='text-sm text-muted-foreground'>Settlement overview</p>
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
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>Total Wallets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{metrics?.totalPaymentAccounts ?? '—'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>Completed Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>{metrics?.completedPayments ?? '—'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{metrics?.pendingPayments ?? '—'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>Failed (all time)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${(metrics?.failedPayments ?? 0) > 0 ? 'text-destructive' : ''}`}>
                {metrics?.failedPayments ?? '—'}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Settlement Volume</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <p className='py-12 text-center text-sm text-muted-foreground'>No settlement data for this period.</p>
            ) : (
              <ResponsiveContainer width='100%' height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
                  <XAxis dataKey='date' tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type='monotone' dataKey='amount' stroke='hsl(var(--primary))' strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
