import { useState } from 'react'
import { Icon } from '@/components/ui/icon'
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
import { useTransfers } from './hooks/use-transfers'
import { transfersColumns } from './components/transfers-columns'
import { TransferCreateDrawer } from './components/transfer-create-drawer'

export function Transfers() {
  const [createOpen, setCreateOpen] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')
  const { data = [], isLoading } = useTransfers()

  const table = useReactTable({
    data,
    columns: transfersColumns,
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
            <h1 className='text-2xl font-bold tracking-tight'>Transfers</h1>
            <p className='text-sm text-muted-foreground'>Payment orders</p>
          </div>
          <Button onClick={() => setCreateOpen(true)} size='sm'>
            <Icon name='plus' className='mr-1 h-4 w-4' /> New Transfer
          </Button>
        </div>

        <div className='mb-3 flex items-center gap-2'>
          <Input
            placeholder='Filter by ID, status, beneficiary…'
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
                  <TableCell colSpan={transfersColumns.length} className='py-10 text-center text-muted-foreground'>
                    Loading…
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={transfersColumns.length} className='py-10 text-center text-muted-foreground'>
                    No transfers yet.
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

        <TransferCreateDrawer open={createOpen} onOpenChange={setCreateOpen} />
      </Main>
    </>
  )
}
