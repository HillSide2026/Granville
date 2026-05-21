import { createFileRoute } from '@tanstack/react-router'
import { Balances } from '@/features/balances'

export const Route = createFileRoute('/_authenticated/balances/')({
  component: Balances,
})
