import { cn } from '@/lib/utils'
import {
  SidebarGroup,
  SidebarGroupLabel,
  useSidebar,
} from '@/components/ui/sidebar'

// ── Integration registry ──────────────────────────────────────────────────────
// Add future integrations here. Status is static until API integration.

type IntegrationStatus = 'connected' | 'pending' | 'error'

type Integration = {
  id: string
  name: string
  abbr: string
  bgColor: string
  textColor: string
  status: IntegrationStatus
}

const integrations: Integration[] = [
  {
    id: 'airwallex',
    name: 'Airwallex',
    abbr: 'AW',
    bgColor: '#0D2B4A',
    textColor: '#38bdf8',
    status: 'connected',
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks Online',
    abbr: 'QB',
    bgColor: '#2CA01C',
    textColor: '#ffffff',
    status: 'pending',
  },
  {
    id: 'shopify',
    name: 'Shopify',
    abbr: 'S',
    bgColor: '#008060',
    textColor: '#ffffff',
    status: 'pending',
  },
]

// ── Status dot ────────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: IntegrationStatus }) {
  return (
    <span
      className={cn(
        'inline-block size-1.5 shrink-0 rounded-full',
        status === 'connected' && 'bg-emerald-500',
        status === 'pending'   && 'bg-sidebar-foreground/25',
        status === 'error'     && 'bg-destructive',
      )}
    />
  )
}

// ── Brand badge ───────────────────────────────────────────────────────────────

function BrandBadge({ integration }: { integration: Integration }) {
  return (
    <span
      className='inline-flex size-5 shrink-0 items-center justify-center rounded text-[9px] font-bold tracking-tight'
      style={{ backgroundColor: integration.bgColor, color: integration.textColor }}
    >
      {integration.abbr}
    </span>
  )
}

// ── Integration status list ───────────────────────────────────────────────────

export function IntegrationStatus() {
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  return (
    <SidebarGroup className='px-2 py-1'>
      <SidebarGroupLabel>Integrations</SidebarGroupLabel>

      <ul className='space-y-0.5'>
        {integrations.map((integration) => (
          <li key={integration.id}>
            <div
              className={cn(
                'flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sidebar-foreground/70',
                isCollapsed && 'justify-center px-0',
              )}
              title={isCollapsed ? `${integration.name} · ${integration.status}` : undefined}
            >
              <BrandBadge integration={integration} />

              {!isCollapsed && (
                <>
                  <span className='min-w-0 flex-1 truncate text-xs'>
                    {integration.name}
                  </span>
                  <div className='flex shrink-0 items-center gap-1.5'>
                    <StatusDot status={integration.status} />
                    <span
                      className={cn(
                        'text-xs',
                        integration.status === 'connected'
                          ? 'text-emerald-500'
                          : 'text-sidebar-foreground/40',
                      )}
                    >
                      {integration.status === 'connected' ? 'Active' : 'Pending'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </SidebarGroup>
  )
}
