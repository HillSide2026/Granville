import { type ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import type { CanonicalPaymentStatus, PaymentOrder } from '@/types/granville'
import { useSubmitTransfer, useCancelTransfer, useRetryTransfer } from '@/features/transfers/hooks/use-transfers'

const statusVariant: Record<CanonicalPaymentStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
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
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {canSubmit && (
          <DropdownMenuItem onClick={() => submit.mutate(payment.id, { onSuccess: () => toast.success('Submitted'), onError: () => toast.error('Failed') })}>
            Submit
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
    header: 'ID',
    cell: ({ row }) => (
      <span className='font-mono text-xs' title={row.original.id}>
        {row.original.id.slice(0, 8)}…
      </span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.original.status] ?? 'secondary'}>
        {row.original.status.replace(/_/g, ' ')}
      </Badge>
    ),
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) =>
      row.original.amount ? `${row.original.amount.amount} ${row.original.amount.asset}` : '—',
  },
  {
    accessorKey: 'transactionType',
    header: 'Type',
    cell: ({ row }) => row.original.transactionType,
  },
  {
    accessorKey: 'beneficiaryReference',
    header: 'Beneficiary',
    cell: ({ row }) => row.original.beneficiaryReference ?? '—',
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    id: 'actions',
    cell: ({ row }) => <RowActions payment={row.original} />,
  },
]
