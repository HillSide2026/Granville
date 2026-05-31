import { Icon } from '@/components/ui/icon'
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
          icon={<Icon name='wallet' className='h-8 w-8' />}
          title='Wallets'
          description='Wallet functionality is not yet available.'
          badge='Coming Soon'
        />
      </Main>
    </>
  )
}
