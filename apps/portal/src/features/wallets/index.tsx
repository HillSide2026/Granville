import { useState } from 'react'
import { Plus } from 'lucide-react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useWallets } from './hooks/use-wallets'
import { walletsColumns } from './components/wallets-columns'
import { WalletsCreateDrawer } from './components/wallets-create-drawer'

export function Wallets() {
  const [createOpen, setCreateOpen] = useState(false)
  const { data = [], isLoading } = useWallets()

  const table = useReactTable({
    data,
    columns: walletsColumns,
    getCoreRowModel: getCoreRowModel(),
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
            <h1 className='text-2xl font-bold tracking-tight'>Wallets</h1>
            <p className='text-sm text-muted-foreground'>Payment accounts</p>
          </div>
          <Button onClick={() => setCreateOpen(true)} size='sm'>
            <Plus className='mr-1 h-4 w-4' /> New Wallet
          </Button>
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
                  <TableCell colSpan={walletsColumns.length} className='py-10 text-center text-muted-foreground'>
                    Loading…
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={walletsColumns.length} className='py-10 text-center text-muted-foreground'>
                    No wallets yet.
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

        <WalletsCreateDrawer open={createOpen} onOpenChange={setCreateOpen} />
      </Main>
    </>
  )
}
