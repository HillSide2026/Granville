import { createFileRoute } from '@tanstack/react-router'
import { Beneficiaries } from '@/features/beneficiaries'

export const Route = createFileRoute('/_authenticated/beneficiaries/')({
  component: Beneficiaries,
})
