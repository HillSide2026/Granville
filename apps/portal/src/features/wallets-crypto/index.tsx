import { Wallet } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { EmptyState } from '@/components/empty-state'

export function CryptoWallets() {
  return (
    <>
      <Header fixed>
        <div className='ml-auto flex items-center gap-2'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <EmptyState
          icon={<Wallet className='h-8 w-8' />}
          title='Crypto Wallets'
          description='Your crypto wallets are managed via mpcium. Contact support to connect your mpcium account.'
          badge='Powered by mpcium'
        />
      </Main>
    </>
  )
}
