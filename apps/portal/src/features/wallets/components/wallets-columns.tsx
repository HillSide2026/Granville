import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import type { PaymentAccount } from '@/types/granville'

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  created: 'secondary',
  suspended: 'outline',
  closed: 'destructive',
}

export const walletsColumns: ColumnDef<PaymentAccount>[] = [
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
    accessorKey: 'displayName',
    header: 'Name',
    cell: ({ row }) => row.original.displayName ?? <span className='text-muted-foreground'>—</span>,
  },
  {
    accessorKey: 'kind',
    header: 'Kind',
    cell: ({ row }) => <Badge variant='secondary'>{row.original.kind}</Badge>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.original.status] ?? 'secondary'}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'currencyCode',
    header: 'Currency',
    cell: ({ row }) => row.original.currencyCode ?? '—',
  },
  {
    accessorKey: 'customerId',
    header: 'Customer',
    cell: ({ row }) => (
      <span className='font-mono text-xs' title={row.original.customerId}>
        {row.original.customerId.slice(0, 8)}…
      </span>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
]
