import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import type { IconName } from '@/components/ui/icon-registry'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type PortalEmptyStateProps = {
  icon: IconName
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function PortalEmptyState({
  icon,
  title,
  description,
  action,
  className,
}: PortalEmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center whitespace-normal px-6 py-16 text-center', className)}>
      <span className='flex size-12 items-center justify-center rounded-full bg-[var(--portal-status-submitted-bg)] text-[var(--portal-status-submitted-text)] ring-1 ring-[var(--portal-status-submitted-border)]'>
        <Icon name={icon} className='size-5' />
      </span>
      <h2 className='mt-4 max-w-full text-base font-semibold text-foreground'>{title}</h2>
      <p className='mt-2 max-w-sm break-words text-sm text-muted-foreground'>{description}</p>
      {action && (
        <Button type='button' size='sm' className='mt-5' onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}

export function MetricCardSkeleton() {
  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between gap-3'>
        <Skeleton className='h-4 w-28' />
        <Skeleton className='size-8 rounded-full' />
      </div>
      <Skeleton className='h-8 w-24' />
      <Skeleton className='h-3 w-36' />
      <Skeleton className='h-px w-full' />
      <Skeleton className='h-3 w-20' />
    </div>
  )
}

export function ActivityRowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className='space-y-2 p-2'>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className='portal-list-row flex items-center gap-3 rounded-md px-2 py-2'>
          <Skeleton className='size-8 rounded-full' />
          <div className='min-w-0 flex-1 space-y-2'>
            <div className='flex items-center justify-between gap-3'>
              <Skeleton className='h-4 w-32 max-w-full' />
              <Skeleton className='h-4 w-20' />
            </div>
            <Skeleton className='h-3 w-44 max-w-full' />
          </div>
        </div>
      ))}
    </div>
  )
}

export function TableRowsSkeleton({
  rows = 5,
  columns = 5,
}: {
  rows?: number
  columns?: number
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className='h-[var(--portal-table-row-height)] border-b'>
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <td key={columnIndex} className='px-4 py-3'>
              <Skeleton className={cn('h-4', columnIndex === 0 ? 'w-56 max-w-full' : 'w-24 max-w-full')} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex h-[300px] flex-col justify-end gap-3 rounded-md border bg-muted/20 p-4', className)}>
      <div className='flex flex-1 items-end gap-2'>
        {[45, 64, 38, 72, 52, 84, 48, 70, 58, 76, 43, 61].map((height, index) => (
          <Skeleton
            key={index}
            className='flex-1 rounded-t-sm rounded-b-none'
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
      <div className='flex justify-between'>
        <Skeleton className='h-3 w-10' />
        <Skeleton className='h-3 w-10' />
        <Skeleton className='h-3 w-10' />
        <Skeleton className='h-3 w-10' />
      </div>
    </div>
  )
}
