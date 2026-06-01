import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/icon'
import { BrandHead } from '@/components/brand-head'
import dashboardDark from '../sign-in/assets/dashboard-dark.png'
import dashboardLight from '../sign-in/assets/dashboard-light.png'
import { SignUpForm } from './components/sign-up-form'

export function SignUp() {
  return (
    <div className='relative container grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <BrandHead state='public' />
      <div className='lg:p-8'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:w-120 sm:p-8'>
          <div className='mb-4 flex items-center justify-center'>
            <Icon name='brand-mark' className='me-2 size-6 text-foreground' />
            <h1 className='text-xl font-medium'>Granville Finance</h1>
          </div>
        </div>
        <div className='mx-auto flex w-full max-w-sm flex-col justify-center space-y-2'>
          <div className='flex flex-col space-y-2 text-start'>
            <h2 className='text-lg font-semibold tracking-tight'>Create an account</h2>
            <p className='text-sm text-muted-foreground'>
              Enter your details below to register.{' '}
              Already have an account?{' '}
              <Link
                to='/sign-in'
                className='text-nowrap underline underline-offset-4 hover:text-primary'
              >
                Sign in
              </Link>
            </p>
          </div>
          <SignUpForm />
          <p className='px-8 text-center text-sm text-muted-foreground'>
            By creating an account, you agree to our{' '}
            <a
              href='/terms'
              className='underline underline-offset-4 hover:text-primary'
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href='/privacy'
              className='underline underline-offset-4 hover:text-primary'
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>

      <div
        className={cn(
          'relative h-full overflow-hidden bg-muted max-lg:hidden',
          '[&>img]:absolute [&>img]:top-[15%] [&>img]:left-20 [&>img]:h-full [&>img]:w-full [&>img]:object-cover [&>img]:object-top-left [&>img]:select-none'
        )}
      >
        <img
          src={dashboardLight}
          className='dark:hidden'
          width={1024}
          height={1151}
          alt='Granville Finance dashboard'
        />
        <img
          src={dashboardDark}
          className='hidden dark:block'
          width={1024}
          height={1138}
          alt='Granville Finance dashboard'
        />
      </div>
    </div>
  )
}
