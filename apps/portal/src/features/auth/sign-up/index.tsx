import { Link } from '@tanstack/react-router'
import { Icon } from '@/components/ui/icon'
import { BrandHead } from '@/components/brand-head'
import authPanel from '../assets/auth-panel.png'
import { SignUpForm } from './components/sign-up-form'

export function SignUp() {
  return (
    <div className='relative container grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <BrandHead state='public' />
      <div className='lg:p-8'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:w-120 sm:p-8'>
          <div className='mb-6 flex flex-col items-center gap-2.5'>
            <div className='flex h-12 w-12 items-center justify-center rounded-[12px] bg-foreground/8'>
              <Icon name='brand-mark' className='size-7 text-[#d5bf9b]' />
            </div>
            <div className='text-center leading-tight'>
              <div className='font-heading text-sm font-bold tracking-[0.16em] uppercase text-[#d5bf9b]'>Granville</div>
              <div className='text-[0.68rem] font-medium tracking-[0.2em] uppercase text-muted-foreground'>Finance</div>
            </div>
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
