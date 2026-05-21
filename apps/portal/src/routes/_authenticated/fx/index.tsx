import { createFileRoute } from '@tanstack/react-router'
import { Fx } from '@/features/fx'

export const Route = createFileRoute('/_authenticated/fx/')({
  component: Fx,
})
