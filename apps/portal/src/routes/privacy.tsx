import { createFileRoute } from '@tanstack/react-router'
import { PrivacyPolicy } from '@/features/legal/privacy'

export const Route = createFileRoute('/privacy')({
  component: PrivacyPolicy,
})
