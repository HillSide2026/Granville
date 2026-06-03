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
        <div className='mb-6 flex flex-col items-center gap-2.5'>
          <div className='flex h-12 w-12 items-center justify-center rounded-[12px] bg-foreground/8'>
            <Icon name='brand-mark' className='size-7 text-[#d5bf9b]' />
          </div>
          <div className='text-center leading-tight'>
            <div className='font-heading text-sm font-bold tracking-[0.16em] uppercase text-[#d5bf9b]'>Granville</div>
            <div className='text-[0.68rem] font-medium tracking-[0.2em] uppercase text-muted-foreground'>Finance</div>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
