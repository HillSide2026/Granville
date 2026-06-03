import { useState } from 'react'
import { Icon } from '@/components/ui/icon'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PortalEmptyState, TableRowsSkeleton } from '@/components/portal-state'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useTransfers } from '@/features/transfers/hooks/use-transfers'
import { TransferCreateDrawer } from '@/features/transfers/components/transfer-create-drawer'
import { paymentsColumns } from './components/payments-columns'

export function Payments() {
  const [createOpen, setCreateOpen] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')
  const { data = [], isLoading } = useTransfers()

  const outbound = data.filter((p) => p.direction === 'outbound')

  const table = useReactTable({
    data: outbound,
    columns: paymentsColumns,
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

      <Main className='portal-page'>
        <div className='portal-page-header flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
          <div>
            <p className='text-label text-muted-foreground'>Payment operations</p>
            <h1 className='mt-2 text-h2'>Payments</h1>
            <p className='mt-1 text-sm text-muted-foreground'>Outbound payment orders submitted for partner processing</p>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <Button variant='outline' size='sm' asChild>
              <Link to='/beneficiaries'>
                <Icon name='users' className='mr-1 h-4 w-4' /> Beneficiaries
              </Link>
            </Button>
            <Button onClick={() => setCreateOpen(true)} size='sm'>
                <Icon name='plus' className='mr-1 h-4 w-4' /> New payment
            </Button>
          </div>
        </div>

        <div className='mb-4 flex flex-col gap-3 rounded-lg border bg-card p-3 md:flex-row md:items-center md:justify-between'>
          <div className='relative w-full md:max-w-md'>
            <Icon name='search' className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder='Search payments by ID, status, beneficiary, or account'
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className='h-10 pl-9'
            />
          </div>
          <p className='text-xs text-muted-foreground'>
            {outbound.length} outbound payment order{outbound.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className='overflow-hidden rounded-lg border bg-card'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((h) => (
                    <TableHead key={h.id} className='h-11 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRowsSkeleton rows={5} columns={paymentsColumns.length} />
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={paymentsColumns.length} className='p-0'>
                    <PortalEmptyState
                      icon='payment-flow'
                      title={globalFilter ? 'No matching payments' : 'No outbound payments yet'}
                      description={
                        globalFilter
                          ? 'Try a different ID, status, beneficiary, or payment account.'
                          : 'Create a payment order when you are ready to submit instructions for partner processing.'
                      }
                      action={globalFilter ? undefined : { label: 'New payment', onClick: () => setCreateOpen(true) }}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className='h-[var(--portal-table-row-height)] hover:bg-muted/35'>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className='px-4 py-3'>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <TransferCreateDrawer open={createOpen} onOpenChange={setCreateOpen} />
      </Main>
    </>
  )
}
