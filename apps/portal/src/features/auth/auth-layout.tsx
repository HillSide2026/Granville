import { Icon } from '@/components/ui/icon'
import { BrandHead } from '@/components/brand-head'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='container grid h-svh max-w-none items-center justify-center'>
      <BrandHead state='public' />
      <div className='mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:p-8'>
        <div className='mb-4 flex items-center justify-center'>
          <Icon name='brand-mark' className='me-2 size-6 text-foreground' />
          <h1 className='text-xl font-medium'>Granville Finance</h1>
        </div>
        {children}
      </div>
    </div>
  )
}
