import { ChevronsUpDown } from 'lucide-react'
import { Icon } from '@/components/ui/icon'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { type Organisation } from './types'

type OrgSwitcherProps = {
  organisation: Organisation
}

export function OrgSwitcher({ organisation }: OrgSwitcherProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size='lg'
          tooltip={organisation.name}
          className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
        >
          <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shrink-0'>
            <Icon name='brand-mark' className='size-4' />
          </div>
          <div className='grid flex-1 text-start text-sm leading-tight'>
            <span className='truncate font-semibold'>{organisation.name}</span>
            <span className='truncate text-xs text-sidebar-foreground/60'>
              {organisation.workspaceName}
            </span>
          </div>
          <ChevronsUpDown className='ms-auto shrink-0' />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
