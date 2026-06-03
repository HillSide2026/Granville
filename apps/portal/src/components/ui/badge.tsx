import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-colors overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        created:
          'border-[var(--portal-status-created-border)] bg-[var(--portal-status-created-bg)] text-[var(--portal-status-created-text)]',
        review:
          'border-[var(--portal-status-review-border)] bg-[var(--portal-status-review-bg)] text-[var(--portal-status-review-text)]',
        submitted:
          'border-[var(--portal-status-submitted-border)] bg-[var(--portal-status-submitted-bg)] text-[var(--portal-status-submitted-text)]',
        processing:
          'border-[var(--portal-status-processing-border)] bg-[var(--portal-status-processing-bg)] text-[var(--portal-status-processing-text)]',
        completed:
          'border-[var(--portal-status-completed-border)] bg-[var(--portal-status-completed-bg)] text-[var(--portal-status-completed-text)]',
        failed:
          'border-[var(--portal-status-failed-border)] bg-[var(--portal-status-failed-bg)] text-[var(--portal-status-failed-text)]',
        returned:
          'border-[var(--portal-status-returned-border)] bg-[var(--portal-status-returned-bg)] text-[var(--portal-status-returned-text)]',
        cancelled:
          'border-[var(--portal-status-cancelled-border)] bg-[var(--portal-status-cancelled-bg)] text-[var(--portal-status-cancelled-text)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot='badge'
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
