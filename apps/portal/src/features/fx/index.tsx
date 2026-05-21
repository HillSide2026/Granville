import { TrendingUp } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { EmptyState } from '@/components/empty-state'

export function Fx() {
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
          icon={<TrendingUp className='h-8 w-8' />}
          title='FX Exchange — Coming Soon'
          description='Multi-currency exchange, live rate quotes, and FX payment initiation will be available once the FX provider integration is complete.'
          badge='Planned'
        />
      </Main>
    </>
  )
}
