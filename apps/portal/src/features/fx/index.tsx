import { Icon } from '@/components/ui/icon'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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
        <div className='flex flex-col items-center justify-center py-24 text-center'>
          <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground'>
            <Icon name='trending-up' className='h-8 w-8' />
          </div>
          <div className='flex items-center gap-2'>
            <h2 className='text-xl font-semibold'>FX not enabled for your account</h2>
            <Badge variant='secondary'>Access required</Badge>
          </div>
          <p className='mt-2 max-w-sm text-sm text-muted-foreground'>
            Multi-currency exchange and FX payment initiation requires approval. Contact your account manager to enable FX for your account.
          </p>
          <Button
            variant='outline'
            size='sm'
            className='mt-6'
            onClick={() => { window.location.href = 'mailto:support@granvillefinance.ca?subject=FX Access Request' }}
          >
            Request FX access
          </Button>
        </div>
      </Main>
    </>
  )
}
