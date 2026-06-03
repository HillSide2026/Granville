import { createFileRoute } from '@tanstack/react-router'
import { Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/transfers/')({
  component: () => <Navigate to='/payments' replace />,
})
