import { CreditCard, Settings, TrendingUp, Users } from 'lucide-react'
import { createPortalIcon } from '@/components/ui/portal-icon'
import { type SidebarData } from '../types'

export type PortalRole = 'customer' | 'ops' | 'compliance' | 'admin'

const AnalyticsIcon = createPortalIcon('analytics')
const BankIcon = createPortalIcon('bank')
const ComplianceIcon = createPortalIcon('compliance')
const PaymentFlowIcon = createPortalIcon('payment-flow')
const ShieldIcon = createPortalIcon('shield')
const WalletIcon = createPortalIcon('wallet')

export function getSidebarData(role: PortalRole = 'customer'): SidebarData {
  const isOps = role === 'ops' || role === 'admin'
  const isCompliance = role === 'compliance' || role === 'admin'

  return {
    user: {
      name: 'Granville',
      email: '',
      avatar: '',
    },
    teams: [
      {
        name: 'Granville',
        logo: BankIcon,
        plan: 'Payments Platform',
      },
    ],
    navGroups: [
      {
        title: 'General',
        items: [
          {
            title: 'Dashboard',
            url: '/',
            icon: AnalyticsIcon,
          },
        ],
      },
      {
        title: 'Accounts',
        items: [
          {
            title: 'Wallets',
            url: '/wallets',
            icon: WalletIcon,
          },
          {
            title: 'Balances',
            url: '/balances',
            icon: AnalyticsIcon,
          },
        ],
      },
      {
        title: 'Payments',
        items: [
          {
            title: 'Transfers',
            url: '/transfers',
            icon: PaymentFlowIcon,
          },
          {
            title: 'Beneficiaries',
            url: '/beneficiaries',
            icon: Users,
          },
        ],
      },
      {
        title: 'Products',
        items: [
          {
            title: 'FX',
            url: '/fx',
            icon: TrendingUp,
            badge: 'Soon',
          },
          {
            title: 'Cards',
            url: '/cards',
            icon: CreditCard,
            badge: 'Soon',
          },
        ],
      },
      ...(isOps || isCompliance
        ? [
            {
              title: 'Operations',
              items: [
                ...(isOps
                  ? [
                      {
                        title: 'Approvals',
                        url: '/approvals' as const,
                        icon: ComplianceIcon,
                      },
                    ]
                  : []),
                ...(isOps || isCompliance
                  ? [
                      {
                        title: 'Compliance',
                        url: '/compliance' as const,
                        icon: ShieldIcon,
                      },
                    ]
                  : []),
              ],
            },
          ]
        : []),
      {
        title: 'Other',
        items: [
          {
            title: 'Settings',
            url: '/settings',
            icon: Settings,
          },
        ],
      },
    ],
  }
}

export const sidebarData = getSidebarData('admin')
