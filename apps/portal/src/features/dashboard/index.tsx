import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import type { PaymentOrder, PaymentAccount } from '@/types/granville'
import { api } from '@/lib/api'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'

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

export function Dashboard() {
  const { data: budgets = [] } = useQuery<PaymentAccount[]>({
    queryKey: ['wallets'],
    queryFn: () => api.get('/payment-accounts').then((r) => r.data),
  })

  const { data: payments = [] } = useQuery<PaymentOrder[]>({
    queryKey: ['transfers'],
    queryFn: () => api.get('/payments').then((r) => r.data),
  })

  const recentPayments = [...payments].reverse().slice(0, 5)
  const pendingPayments = payments.filter((p) => p.status === 'pending_review' || p.status === 'created')

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
          <p className='text-muted-foreground'>Your financial overview</p>
        </div>

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Budgets</CardTitle>
              <Icon name='budget' className='size-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {budgets.length === 0 ? '0' : budgets.length}
              </div>
              <p className='mt-1 text-xs text-muted-foreground'>Active budgets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Payments</CardTitle>
              <Icon name='payment-flow' className='size-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {payments.filter((p) => p.direction === 'outbound').length}
              </div>
              <p className='mt-1 text-xs text-muted-foreground'>
                {payments.filter((p) => p.direction === 'outbound' && p.status === 'completed').length} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Pending</CardTitle>
              <Icon name='shield' className={`size-4 ${pendingPayments.length > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${pendingPayments.length > 0 ? 'text-destructive' : ''}`}>
                {pendingPayments.length}
              </div>
              <p className='mt-1 text-xs text-muted-foreground'>
                {pendingPayments.length > 0 ? 'Requires attention' : 'All clear'}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className='mt-6 grid gap-4 lg:grid-cols-7'>
          <Card className='lg:col-span-4'>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest payments and sales</CardDescription>
            </CardHeader>
            <CardContent className='space-y-0'>
              {recentPayments.length === 0 ? (
                <p className='py-6 text-center text-sm text-muted-foreground'>
                  No transactions yet.
                </p>
              ) : (
                recentPayments.map((p) => (
                  <div key={p.id} className='flex items-center gap-3 border-b py-3 text-sm last:border-0'>
                    <span className='font-mono text-xs text-muted-foreground' title={p.id}>
                      {p.id.slice(0, 8)}…
                    </span>
                    <Badge variant={statusVariant[p.status] ?? 'secondary'} className='text-xs'>
                      {p.status.replace(/_/g, ' ')}
                    </Badge>
                    <span className='text-xs text-muted-foreground capitalize'>{p.direction}</span>
                    <span className='ml-auto shrink-0 font-medium'>
                      {p.amount ? `${p.amount.amount} ${p.amount.asset}` : '—'}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className='lg:col-span-3'>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm'>
              <Link to='/budgets' className='flex items-center gap-2 rounded-md p-2 hover:bg-muted'>
                <Icon name='budget' className='size-4 text-muted-foreground' />
                <span>Manage budgets</span>
                <span className='ml-auto text-muted-foreground'>→</span>
              </Link>
              <Link to='/payments' className='flex items-center gap-2 rounded-md p-2 hover:bg-muted'>
                <Icon name='payment-flow' className='size-4 text-muted-foreground' />
                <span>New payment</span>
                <span className='ml-auto text-muted-foreground'>→</span>
              </Link>
              <Link to='/sales' className='flex items-center gap-2 rounded-md p-2 hover:bg-muted'>
                <Icon name='credit-card' className='size-4 text-muted-foreground' />
                <span>View sales</span>
                <span className='ml-auto text-muted-foreground'>→</span>
              </Link>
              <Link to='/balances' className='flex items-center gap-2 rounded-md p-2 hover:bg-muted'>
                <Icon name='bank' className='size-4 text-muted-foreground' />
                <span>Check balances</span>
                <span className='ml-auto text-muted-foreground'>→</span>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}
