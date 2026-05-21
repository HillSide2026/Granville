import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

  function onSubmit(values: FormValues) {
    create.mutate(values, {
      onSuccess: () => {
        toast.success('Transfer created')
        form.reset()
        onOpenChange(false)
      },
      onError: () => toast.error('Failed to create transfer'),
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>New Transfer</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='mt-4 space-y-4 px-1'>
            <FormField control={form.control} name='customerId' render={({ field }) => (
              <FormItem>
                <FormLabel>Customer ID *</FormLabel>
                <FormControl><Input placeholder='UUID' {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name='paymentAccountId' render={({ field }) => (
              <FormItem>
                <FormLabel>Wallet / Account ID *</FormLabel>
                <FormControl><Input placeholder='UUID' {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
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
                    {['transfer', 'payment', 'payout', 'refund'].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name='beneficiaryReference' render={({ field }) => (
              <FormItem>
                <FormLabel>Beneficiary Reference</FormLabel>
                <FormControl><Input placeholder='Account number or reference' {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type='submit' className='w-full' disabled={create.isPending}>
              {create.isPending ? 'Creating…' : 'Create Transfer'}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
