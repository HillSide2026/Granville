import { type ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Icon } from '@/components/ui/icon'
import type { PaymentOrder } from '@/types/granville'
import { useSubmitTransfer, useCancelTransfer, useRetryTransfer } from '@/features/transfers/hooks/use-transfers'
import {
  formatPaymentAmount,
  formatPaymentDate,
  PaymentActivitySummary,
  PaymentStatusBadge,
} from './payment-activity'

function RowActions({ payment }: { payment: PaymentOrder }) {
  const submit = useSubmitTransfer()
  const cancel = useCancelTransfer()
  const retry = useRetryTransfer()

  const canSubmit = payment.status === 'created' || payment.status === 'pending_review'
  const canCancel = !['completed', 'cancelled'].includes(payment.status)
  const canRetry = payment.status === 'failed' || payment.status === 'returned'

  if (!canSubmit && !canCancel && !canRetry) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='h-7 w-7'>
          <Icon name='more-horizontal' className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {canSubmit && (
          <DropdownMenuItem onClick={() => submit.mutate(payment.id, { onSuccess: () => toast.success('Submitted for processing'), onError: () => toast.error('Failed') })}>
            Submit for processing
          </DropdownMenuItem>
        )}
        {canRetry && (
          <DropdownMenuItem onClick={() => retry.mutate(payment.id, { onSuccess: () => toast.success('Retried'), onError: () => toast.error('Failed') })}>
            Retry
          </DropdownMenuItem>
        )}
        {canCancel && (
          <DropdownMenuItem className='text-destructive' onClick={() => cancel.mutate(payment.id, { onSuccess: () => toast.success('Cancelled'), onError: () => toast.error('Failed') })}>
            Cancel
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const paymentsColumns: ColumnDef<PaymentOrder>[] = [
  {
    accessorKey: 'id',
    header: 'Payment',
    size: 340,
    cell: ({ row }) => (
      <PaymentActivitySummary payment={row.original} />
    ),
  },
  {
    accessorKey: 'status',
    header: 'Lifecycle',
    cell: ({ row }) => (
      <PaymentStatusBadge status={row.original.status} />
    ),
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => (
      <span className='block text-right font-semibold tabular-nums text-foreground'>
        {formatPaymentAmount(row.original)}
      </span>
    ),
  },
  {
    accessorKey: 'paymentAccountId',
    header: 'Payment account',
    cell: ({ row }) => (
      <span className='font-mono text-xs text-muted-foreground' title={row.original.paymentAccountId}>
        {row.original.paymentAccountId.slice(0, 8)}
      </span>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => (
      <span className='text-sm text-muted-foreground'>
        {formatPaymentDate(row.original.createdAt)}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className='flex justify-end'>
        <RowActions payment={row.original} />
      </div>
    ),
  },
]
