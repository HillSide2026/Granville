import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useSubmitTransfer, useCancelTransfer } from '../transfers/hooks/use-transfers'
import type { PaymentOrder } from '@/types/granville'

function humanAge(createdAt: string) {
  const ms = Date.now() - new Date(createdAt).getTime()
  if (ms < 60_000) return `${Math.floor(ms / 1000)}s ago`
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ago`
  return `${Math.floor(ms / 3_600_000)}h ago`
}

export function Approvals() {
  const [selected, setSelected] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null)

  const { data: allPayments = [], isLoading } = useQuery<PaymentOrder[]>({
    queryKey: ['transfers'],
    queryFn: () => api.get('/admin/payments').then((r) => r.data),
  })

  const pending = allPayments.filter((p) => p.status === 'pending_review')
  const submit = useSubmitTransfer()
  const cancel = useCancelTransfer()

  function handleConfirm() {
    if (!selected) return
    if (selected.action === 'approve') {
      submit.mutate(selected.id, {
        onSuccess: () => { toast.success('Payment approved'); setSelected(null) },
        onError: () => toast.error('Failed to approve'),
      })
    } else {
      cancel.mutate(selected.id, {
        onSuccess: () => { toast.success('Payment rejected'); setSelected(null) },
        onError: () => toast.error('Failed to reject'),
      })
    }
  }

  return (
    <>
      <Header fixed>
        <div className='ml-auto flex items-center gap-2'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-4'>
          <h1 className='text-2xl font-bold tracking-tight'>Approvals</h1>
          <p className='text-sm text-muted-foreground'>
            Payments requiring manual review
            {pending.length > 0 && (
              <Badge variant='destructive' className='ml-2'>{pending.length}</Badge>
            )}
          </p>
        </div>

        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className='py-10 text-center text-muted-foreground'>Loading…</TableCell>
                </TableRow>
              ) : pending.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className='py-10 text-center text-muted-foreground'>
                    No pending approvals — all clear.
                  </TableCell>
                </TableRow>
              ) : (
                pending.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <span className='font-mono text-xs' title={p.id}>{p.id.slice(0, 8)}…</span>
                    </TableCell>
                    <TableCell>{p.amount ? `${p.amount.amount} ${p.amount.asset}` : '—'}</TableCell>
                    <TableCell>
                      <span className='font-mono text-xs'>{p.paymentAccountId.slice(0, 8)}…</span>
                    </TableCell>
                    <TableCell>
                      <span className='font-mono text-xs'>{p.customerId.slice(0, 8)}…</span>
                    </TableCell>
                    <TableCell className='text-xs text-muted-foreground'>{humanAge(p.createdAt)}</TableCell>
                    <TableCell>
                      <div className='flex gap-2'>
                        <Button
                          size='sm'
                          variant='default'
                          onClick={() => setSelected({ id: p.id, action: 'approve' })}
                        >
                          Approve
                        </Button>
                        <Button
                          size='sm'
                          variant='destructive'
                          onClick={() => setSelected({ id: p.id, action: 'reject' })}
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selected?.action === 'approve' ? 'Approve Payment' : 'Reject Payment'}
              </DialogTitle>
              <DialogDescription>
                {selected?.action === 'approve'
                  ? 'This will submit the payment for routing and execution.'
                  : 'This will cancel the payment. This cannot be undone.'}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant='outline' onClick={() => setSelected(null)}>Cancel</Button>
              <Button
                variant={selected?.action === 'approve' ? 'default' : 'destructive'}
                onClick={handleConfirm}
                disabled={submit.isPending || cancel.isPending}
              >
                {selected?.action === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Main>
    </>
  )
}
