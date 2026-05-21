import { Badge } from '@/components/ui/badge'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  badge?: string
}

export function EmptyState({ icon, title, description, badge }: EmptyStateProps) {
  return (
    <div className='flex flex-col items-center justify-center py-24 text-center'>
      <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground'>
        {icon}
      </div>
      <div className='flex items-center gap-2'>
        <h2 className='text-xl font-semibold'>{title}</h2>
        {badge && <Badge variant='secondary'>{badge}</Badge>}
      </div>
      <p className='mt-2 max-w-sm text-sm text-muted-foreground'>{description}</p>
    </div>
  )
}
