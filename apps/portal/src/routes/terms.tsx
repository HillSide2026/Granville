import { createFileRoute } from '@tanstack/react-router'
import { TermsOfUse } from '@/features/legal/terms'

export const Route = createFileRoute('/terms')({
  component: TermsOfUse,
})
