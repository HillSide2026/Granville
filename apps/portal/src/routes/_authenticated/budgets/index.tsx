import { createFileRoute } from '@tanstack/react-router'
import { Budgets } from '@/features/wallets'

export const Route = createFileRoute('/_authenticated/budgets/')({
  component: Budgets,
})
