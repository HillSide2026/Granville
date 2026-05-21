import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useBeneficiaries } from './hooks/use-beneficiaries'
import type { Beneficiary, CreateBeneficiaryInput } from '@/types/granville'

const schema = z.object({
  displayName: z.string().min(1, 'Required'),
  accountNumber: z.string().min(1, 'Required'),
  sortCode: z.string().optional(),
  iban: z.string().optional(),
  bankName: z.string().optional(),
  countryCode: z.string().min(2, 'Required').max(2),
  currency: z.string().min(3, 'Required').max(3),
})

type FormValues = z.infer<typeof schema>

export function Beneficiaries() {
  const { items, create, update, remove } = useBeneficiaries()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<Beneficiary | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const form = useForm<FormValues>({ resolver: zodResolver(schema) })

  function openCreate() {
    form.reset({})
    setEditing(null)
    setDrawerOpen(true)
  }

  function openEdit(b: Beneficiary) {
    form.reset(b)
    setEditing(b)
    setDrawerOpen(true)
  }

  function onSubmit(values: FormValues) {
    if (editing) {
      update(editing.id, values as CreateBeneficiaryInput)
      toast.success('Beneficiary updated')
    } else {
      create(values as CreateBeneficiaryInput)
      toast.success('Beneficiary added')
    }
    setDrawerOpen(false)
    setEditing(null)
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
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Beneficiaries</h1>
            <p className='text-sm text-muted-foreground'>Saved payment recipients</p>
          </div>
          <Button size='sm' onClick={openCreate}>
            <Plus className='mr-1 h-4 w-4' /> Add Beneficiary
          </Button>
        </div>

        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Account Number</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Added</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className='py-10 text-center text-muted-foreground'>
                    No beneficiaries yet. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className='font-medium'>{b.displayName}</TableCell>
                    <TableCell className='font-mono text-xs'>{b.accountNumber}</TableCell>
                    <TableCell>{b.bankName ?? '—'}</TableCell>
                    <TableCell>{b.countryCode}</TableCell>
                    <TableCell>{b.currency}</TableCell>
                    <TableCell className='text-xs text-muted-foreground'>
                      {new Date(b.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className='flex gap-1'>
                        <Button size='icon' variant='ghost' className='h-7 w-7' onClick={() => openEdit(b)}>
                          <Pencil className='h-3 w-3' />
                        </Button>
                        <Button size='icon' variant='ghost' className='h-7 w-7 text-destructive' onClick={() => setDeleting(b.id)}>
                          <Trash2 className='h-3 w-3' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{editing ? 'Edit Beneficiary' : 'Add Beneficiary'}</SheetTitle>
            </SheetHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className='mt-4 space-y-4 px-1'>
                <FormField control={form.control} name='displayName' render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name *</FormLabel>
                    <FormControl><Input placeholder='Jane Smith' {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name='accountNumber' render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number *</FormLabel>
                    <FormControl><Input placeholder='12345678' {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className='grid grid-cols-2 gap-3'>
                  <FormField control={form.control} name='sortCode' render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Code</FormLabel>
                      <FormControl><Input placeholder='00-00-00' {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name='iban' render={({ field }) => (
                    <FormItem>
                      <FormLabel>IBAN</FormLabel>
                      <FormControl><Input placeholder='GB00...' {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name='bankName' render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl><Input placeholder='Barclays' {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className='grid grid-cols-2 gap-3'>
                  <FormField control={form.control} name='countryCode' render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country *</FormLabel>
                      <FormControl><Input placeholder='GB' maxLength={2} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name='currency' render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency *</FormLabel>
                      <FormControl><Input placeholder='GBP' maxLength={3} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <Button type='submit' className='w-full'>
                  {editing ? 'Save Changes' : 'Add Beneficiary'}
                </Button>
              </form>
            </Form>
          </SheetContent>
        </Sheet>

        <AlertDialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Beneficiary</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove this beneficiary. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className='bg-destructive text-destructive-foreground'
                onClick={() => { if (deleting) { remove(deleting); toast.success('Removed'); setDeleting(null) } }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Main>
    </>
  )
}
