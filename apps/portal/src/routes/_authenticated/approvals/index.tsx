import { createFileRoute } from '@tanstack/react-router'
import { Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/approvals/')({
  component: () => <Navigate to='/' replace />,
})
