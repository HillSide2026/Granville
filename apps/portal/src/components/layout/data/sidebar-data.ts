import { Settings, TrendingUp } from 'lucide-react'
import { createPortalIcon } from '@/components/ui/portal-icon'
import { type SidebarData } from '../types'

export type PortalRole = 'customer' | 'ops' | 'compliance' | 'admin'

const AnalyticsIcon = createPortalIcon('analytics')
const BankIcon = createPortalIcon('bank')
const PaymentFlowIcon = createPortalIcon('payment-flow')
const WalletIcon = createPortalIcon('wallet')

export function getSidebarData(_role: PortalRole = 'customer'): SidebarData {
  return {
    user: { name: '', email: '', avatar: '' },
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
        title: 'Finance',
        items: [
          {
            title: 'Budgets',
            url: '/budgets',
            icon: WalletIcon,
          },
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
        title: 'Transactions',
        items: [
          {
            title: 'Payments',
            url: '/payments',
            icon: PaymentFlowIcon,
          },
          {
            title: 'Sales',
            url: '/sales',
            icon: PaymentFlowIcon,
          },
        ],
      },
      {
        title: 'Services',
        items: [
          {
            title: 'FX',
            url: '/fx',
            icon: TrendingUp,
          },
        ],
      },
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
