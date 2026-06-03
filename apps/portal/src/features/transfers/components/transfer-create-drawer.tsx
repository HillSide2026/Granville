import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Icon } from '@/components/ui/icon'
import { useCreateTransfer } from '../hooks/use-transfers'

const schema = z.object({
  customerId: z.string().uuid('Must be a valid UUID'),
  paymentAccountId: z.string().uuid('Must be a valid UUID'),
  amount: z.string().min(1, 'Required'),
  asset: z.string().min(1, 'Required'),
  direction: z.enum(['outbound', 'inbound']),
  transactionType: z.enum(['payment', 'refund', 'payout', 'transfer']),
  beneficiaryReference: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const transactionTypeLabels: Record<FormValues['transactionType'], string> = {
  payment: 'Payment',
  refund: 'Refund',
  payout: 'Payout',
  transfer: 'Internal movement',
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransferCreateDrawer({ open, onOpenChange }: Props) {
  const create = useCreateTransfer()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { direction: 'outbound', transactionType: 'transfer' },
  })
  const amount = form.watch('amount')
  const asset = form.watch('asset')
  const direction = form.watch('direction')
  const transactionType = form.watch('transactionType')

  function onSubmit(values: FormValues) {
    create.mutate(values, {
      onSuccess: () => {
        toast.success('Payment order created')
        form.reset()
        onOpenChange(false)
      },
      onError: () => toast.error('Failed to create payment order'),
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex w-full flex-col gap-0 p-0 sm:max-w-xl'>
        <SheetHeader className='border-b px-6 py-5 text-left'>
          <div className='flex items-center gap-3'>
            <span className='flex size-10 items-center justify-center rounded-full bg-[var(--portal-status-submitted-bg)] text-[var(--portal-status-submitted-text)] ring-1 ring-[var(--portal-status-submitted-border)]'>
              <Icon name='payment-flow' className='size-5' />
            </span>
            <div>
              <SheetTitle>New payment</SheetTitle>
              <SheetDescription>
                Create a payment order for partner processing.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='flex min-h-0 flex-1 flex-col'>
            <div className='min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5'>
              <section className='space-y-4'>
                <div>
                  <h3 className='text-sm font-semibold'>Customer scope</h3>
                  <p className='mt-1 text-xs text-muted-foreground'>Orders are associated to an existing customer and payment account.</p>
                </div>
                <FormField control={form.control} name='customerId' render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer ID *</FormLabel>
                    <FormControl><Input placeholder='UUID' {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name='paymentAccountId' render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment account ID *</FormLabel>
                    <FormControl><Input placeholder='UUID' {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </section>

              <section className='space-y-4 rounded-lg border bg-muted/25 p-4'>
                <div>
                  <h3 className='text-sm font-semibold'>Payment details</h3>
                  <p className='mt-1 text-xs text-muted-foreground'>Granville orchestrates the order; custody and execution remain with regulated partners.</p>
                </div>
                <div className='grid grid-cols-2 gap-3'>
                  <FormField control={form.control} name='amount' render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount *</FormLabel>
                      <FormControl><Input placeholder='1000.00' {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name='asset' render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder='Select' /></SelectTrigger></FormControl>
                        <SelectContent>
                          {['GBP', 'USD', 'EUR', 'AED'].map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className='grid gap-3 sm:grid-cols-2'>
                  <FormField control={form.control} name='direction' render={({ field }) => (
                    <FormItem>
                      <FormLabel>Direction</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value='outbound'>Outbound</SelectItem>
                          <SelectItem value='inbound'>Inbound</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name='transactionType' render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          {(['payment', 'payout', 'refund', 'transfer'] as const).map((t) => (
                            <SelectItem key={t} value={t}>{transactionTypeLabels[t]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name='beneficiaryReference' render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beneficiary reference</FormLabel>
                    <FormControl><Input placeholder='Account number or reference' {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </section>

              <section className='rounded-lg border p-4'>
                <div className='flex items-start justify-between gap-4'>
                  <div>
                    <h3 className='text-sm font-semibold'>Order summary</h3>
                    <p className='mt-1 text-xs text-muted-foreground'>Review before creating the payment order.</p>
                  </div>
                  <span className='rounded-full bg-[var(--portal-status-created-bg)] px-2 py-1 text-xs font-medium text-[var(--portal-status-created-text)] ring-1 ring-[var(--portal-status-created-border)]'>
                    Created
                  </span>
                </div>
                <dl className='mt-4 grid grid-cols-2 gap-3 text-sm'>
                  <div>
                    <dt className='text-xs text-muted-foreground'>Amount</dt>
                    <dd className='mt-1 font-semibold tabular-nums'>{amount && asset ? `${amount} ${asset}` : '—'}</dd>
                  </div>
                  <div>
                    <dt className='text-xs text-muted-foreground'>Direction</dt>
                    <dd className='mt-1 capitalize'>{direction ?? '—'}</dd>
                  </div>
                  <div>
                    <dt className='text-xs text-muted-foreground'>Type</dt>
                    <dd className='mt-1'>{transactionType ? transactionTypeLabels[transactionType] : '—'}</dd>
                  </div>
                  <div>
                    <dt className='text-xs text-muted-foreground'>Execution</dt>
                    <dd className='mt-1'>Regulated partner</dd>
                  </div>
                </dl>
              </section>
            </div>

            <SheetFooter className='border-t bg-background px-6 py-4'>
              <div className='flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                <p className='text-xs text-muted-foreground'>Creates an order for review and processing. Granville does not hold funds.</p>
                <Button type='submit' className='sm:min-w-44' disabled={create.isPending}>
                  {create.isPending ? 'Creating…' : 'Create payment order'}
                </Button>
              </div>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
