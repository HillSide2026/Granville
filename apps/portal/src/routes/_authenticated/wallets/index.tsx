import { createFileRoute } from '@tanstack/react-router'
import { CryptoWallets } from '@/features/wallets-crypto'

export const Route = createFileRoute('/_authenticated/wallets/')({
  component: CryptoWallets,
})
