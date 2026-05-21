import { createFileRoute } from '@tanstack/react-router'
import { Wallets } from '@/features/wallets'

export const Route = createFileRoute('/_authenticated/wallets/')({
  component: Wallets,
})
