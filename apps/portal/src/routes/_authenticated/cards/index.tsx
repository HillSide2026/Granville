import { createFileRoute } from '@tanstack/react-router'
import { Cards } from '@/features/cards'

export const Route = createFileRoute('/_authenticated/cards/')({
  component: Cards,
})
