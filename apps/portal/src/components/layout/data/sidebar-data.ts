import {
  ArrowLeftRight,
  BarChart3,
  CheckCircle2,
  CreditCard,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'
import { type SidebarData } from '../types'

export type PortalRole = 'customer' | 'ops' | 'compliance' | 'admin'

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
        logo: Wallet,
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
            icon: LayoutDashboard,
          },
        ],
      },
      {
        title: 'Accounts',
        items: [
          {
            title: 'Wallets',
            url: '/wallets',
            icon: Wallet,
          },
          {
            title: 'Balances',
            url: '/balances',
            icon: BarChart3,
          },
        ],
      },
      {
        title: 'Payments',
        items: [
          {
            title: 'Transfers',
            url: '/transfers',
            icon: ArrowLeftRight,
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
                        icon: CheckCircle2,
                      },
                    ]
                  : []),
                ...(isOps || isCompliance
                  ? [
                      {
                        title: 'Compliance',
                        url: '/compliance' as const,
                        icon: ShieldCheck,
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
