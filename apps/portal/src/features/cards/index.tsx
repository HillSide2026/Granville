import { CreditCard } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { EmptyState } from '@/components/empty-state'

export function Cards() {
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
          icon={<CreditCard className='h-8 w-8' />}
          title='Cards — Coming Soon'
          description='Virtual and physical card issuance, spending controls, and transaction history will be available in a future release.'
          badge='Planned'
        />
      </Main>
    </>
  )
}
