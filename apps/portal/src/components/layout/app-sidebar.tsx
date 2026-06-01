import { useAuthStore } from '@/stores/auth-store'
import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { getSidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { OrgSwitcher } from './org-switcher'
import { PlatformFooter } from './platform-footer'
import { SidebarCollapseButton } from './sidebar-collapse-button'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const { auth } = useAuthStore()

  const data = getSidebarData(auth.role, auth.user?.email, auth.user?.organizationName)

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <OrgSwitcher organisation={data.organisation} />
      </SidebarHeader>
      <SidebarContent>
        {data.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarCollapseButton />
        <PlatformFooter />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
