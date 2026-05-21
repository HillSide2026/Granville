import { createFileRoute } from '@tanstack/react-router'
import { Transfers } from '@/features/transfers'

export const Route = createFileRoute('/_authenticated/transfers/')({
  component: Transfers,
})
