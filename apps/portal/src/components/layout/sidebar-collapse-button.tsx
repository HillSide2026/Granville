import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/icon'
import { useSidebar } from '@/components/ui/sidebar'

export function SidebarCollapseButton() {
  const { state, toggleSidebar } = useSidebar()
  const isCollapsed = state === 'collapsed'

  return (
    <button
      onClick={toggleSidebar}
      title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      className={cn(
        'flex w-full items-center py-2 px-2 transition-colors',
        'text-sidebar-foreground/30 hover:text-sidebar-foreground/60',
        isCollapsed ? 'justify-center' : 'justify-end',
      )}
    >
      <Icon
        name={isCollapsed ? 'double-arrow-right' : 'double-arrow-left'}
        className='size-3.5 shrink-0'
      />
    </button>
  )
}
