import { Link, useSearch } from '@tanstack/react-router'
import { Icon } from '@/components/ui/icon'
import { BrandHead } from '@/components/brand-head'
import authPanel from '../assets/auth-panel.png'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })

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
            <h2 className='text-lg font-semibold tracking-tight'>Sign in</h2>
            <p className='text-sm text-muted-foreground'>
              Enter your email and password below.{' '}
              Don't have an account?{' '}
              <Link
                to='/sign-up'
                className='text-nowrap underline underline-offset-4 hover:text-primary'
              >
                Sign up
              </Link>
            </p>
          </div>
          <UserAuthForm redirectTo={redirect} />
          <p className='px-8 text-center text-sm text-muted-foreground'>
            By signing in, you agree to our{' '}
            <a href='/terms' className='underline underline-offset-4 hover:text-primary'>
              Terms of Service
            </a>{' '}
            and{' '}
            <a href='/privacy' className='underline underline-offset-4 hover:text-primary'>
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>

      <div className='relative h-full overflow-hidden max-lg:hidden'>
        <img
          src={authPanel}
          className='absolute inset-0 h-full w-full object-cover object-top select-none'
          alt=''
          aria-hidden='true'
        />
      </div>
    </div>
  )
}
