import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useTransfers } from '@/features/transfers/hooks/use-transfers'
import type { CanonicalPaymentStatus, PaymentOrder } from '@/types/granville'
import { type ColumnDef } from '@tanstack/react-table'

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

const salesColumns: ColumnDef<PaymentOrder>[] = [
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
    header: 'From',
    cell: ({ row }) => row.original.beneficiaryReference ?? '—',
  },
  {
    accessorKey: 'createdAt',
    header: 'Received',
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
]

export function Sales() {
  const [globalFilter, setGlobalFilter] = useState('')
  const { data = [], isLoading } = useTransfers()

  const inbound = data.filter((p) => p.direction === 'inbound')

  const table = useReactTable({
    data: inbound,
    columns: salesColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  })

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
            <h1 className='text-2xl font-bold tracking-tight'>Sales</h1>
            <p className='text-sm text-muted-foreground'>Inbound transfers</p>
          </div>
        </div>

        <div className='mb-3'>
          <Input
            placeholder='Filter by ID, status…'
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className='max-w-sm'
          />
        </div>

        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((h) => (
                    <TableHead key={h.id}>
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={salesColumns.length} className='py-10 text-center text-muted-foreground'>
                    Loading…
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={salesColumns.length} className='py-10 text-center text-muted-foreground'>
                    No sales yet.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Main>
    </>
  )
}
