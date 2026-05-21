import { createFileRoute } from '@tanstack/react-router'
import { Compliance } from '@/features/compliance'

export const Route = createFileRoute('/_authenticated/compliance/')({
  component: Compliance,
})
