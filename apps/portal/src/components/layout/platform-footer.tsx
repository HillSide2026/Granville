import { Icon } from '@/components/ui/icon'

export function PlatformFooter() {
  return (
    <div className='flex items-center gap-2 px-2 py-2'>
      <Icon
        name='brand-mark'
        className='size-4 shrink-0'
        style={{ opacity: 0.35 }}
      />
      <div className='grid leading-tight group-data-[collapsible=icon]:hidden'>
        <span className='text-xs font-medium text-sidebar-foreground/50'>Granville</span>
        <span className='text-xs text-sidebar-foreground/35'>Payments Platform</span>
      </div>
    </div>
  )
}
