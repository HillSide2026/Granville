import { Badge, badgeVariants } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'
import type { IconName } from '@/components/ui/icon-registry'
import { cn } from '@/lib/utils'
import type { CanonicalPaymentStatus, PaymentOrder } from '@/types/granville'
import type { VariantProps } from 'class-variance-authority'

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

type StatusPresentation = {
  label: string
  variant: BadgeVariant
  icon: IconName
  markerClass: string
}

const statusPresentation: Record<CanonicalPaymentStatus, StatusPresentation> = {
  created: {
    label: 'Created',
    variant: 'created',
    icon: 'circle',
    markerClass: 'bg-[var(--portal-status-created-bg)] text-[var(--portal-status-created-text)] ring-[var(--portal-status-created-border)]',
  },
  pending_review: {
    label: 'Pending review',
    variant: 'review',
    icon: 'shield',
    markerClass: 'bg-[var(--portal-status-review-bg)] text-[var(--portal-status-review-text)] ring-[var(--portal-status-review-border)]',
  },
  submitted_to_provider: {
    label: 'Submitted',
    variant: 'submitted',
    icon: 'arrow-right',
    markerClass: 'bg-[var(--portal-status-submitted-bg)] text-[var(--portal-status-submitted-text)] ring-[var(--portal-status-submitted-border)]',
  },
  provider_accepted: {
    label: 'Accepted',
    variant: 'submitted',
    icon: 'check',
    markerClass: 'bg-[var(--portal-status-submitted-bg)] text-[var(--portal-status-submitted-text)] ring-[var(--portal-status-submitted-border)]',
  },
  processing: {
    label: 'Processing',
    variant: 'processing',
    icon: 'refresh',
    markerClass: 'bg-[var(--portal-status-processing-bg)] text-[var(--portal-status-processing-text)] ring-[var(--portal-status-processing-border)]',
  },
  completed: {
    label: 'Completed',
    variant: 'completed',
    icon: 'circle-check',
    markerClass: 'bg-[var(--portal-status-completed-bg)] text-[var(--portal-status-completed-text)] ring-[var(--portal-status-completed-border)]',
  },
  failed: {
    label: 'Failed',
    variant: 'failed',
    icon: 'x',
    markerClass: 'bg-[var(--portal-status-failed-bg)] text-[var(--portal-status-failed-text)] ring-[var(--portal-status-failed-border)]',
  },
  returned: {
    label: 'Returned',
    variant: 'returned',
    icon: 'arrow-left',
    markerClass: 'bg-[var(--portal-status-returned-bg)] text-[var(--portal-status-returned-text)] ring-[var(--portal-status-returned-border)]',
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'cancelled',
    icon: 'minus',
    markerClass: 'bg-[var(--portal-status-cancelled-bg)] text-[var(--portal-status-cancelled-text)] ring-[var(--portal-status-cancelled-border)]',
  },
}

export function paymentStatusLabel(status: CanonicalPaymentStatus): string {
  return statusPresentation[status].label
}

export function paymentActivityTitle(payment: PaymentOrder): string {
  return payment.beneficiaryReference || `${payment.direction === 'outbound' ? 'Outbound' : 'Inbound'} payment`
}

export function formatPaymentAmount(payment: PaymentOrder): string {
  if (!payment.amount) return '—'
  const amount = Number(payment.amount.amount)
  const formatted = Number.isFinite(amount)
    ? amount.toLocaleString('en-CA', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : payment.amount.amount
  return `${formatted} ${payment.amount.asset}`
}

export function formatPaymentDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function PaymentStatusBadge({
  status,
  className,
}: {
  status: CanonicalPaymentStatus
  className?: string
}) {
  const presentation = statusPresentation[status]
  return (
    <Badge variant={presentation.variant} className={cn('capitalize', className)}>
      {presentation.label}
    </Badge>
  )
}

export function PaymentActivityMarker({
  payment,
  className,
}: {
  payment: PaymentOrder
  className?: string
}) {
  const presentation = statusPresentation[payment.status]
  return (
    <span
      className={cn(
        'flex size-9 items-center justify-center rounded-full ring-1',
        presentation.markerClass,
        className,
      )}
    >
      <Icon name={presentation.icon} className='size-4' />
    </span>
  )
}

export function PaymentActivitySummary({ payment }: { payment: PaymentOrder }) {
  return (
    <div className='flex min-w-0 items-center gap-3'>
      <PaymentActivityMarker payment={payment} />
      <div className='min-w-0'>
        <div className='truncate font-medium text-foreground'>
          {paymentActivityTitle(payment)}
        </div>
        <div className='mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground'>
          <span className='font-mono'>{payment.id.slice(0, 8)}</span>
          <span aria-hidden='true'>·</span>
          <span>{payment.transactionType.replace(/_/g, ' ')}</span>
          <span aria-hidden='true'>·</span>
          <span>{payment.direction}</span>
        </div>
      </div>
    </div>
  )
}
