import { Link } from '@tanstack/react-router'
import { BrandHead } from '@/components/brand-head'
import { Icon } from '@/components/ui/icon'

interface LegalPageProps {
  title: string
  lastUpdated: string
  children: React.ReactNode
}

export function LegalPage({ title, lastUpdated, children }: LegalPageProps) {
  return (
    <div className='min-h-svh bg-background'>
      <BrandHead state='public' />

      <header className='border-b border-border/40 bg-background/80 backdrop-blur sticky top-0 z-10'>
        <div className='mx-auto flex max-w-3xl items-center justify-between px-6 py-4'>
          <Link to='/sign-in' className='flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors'>
            <Icon name='arrow-left' className='size-4' />
            Back
          </Link>
          <Link to='/' className='flex items-center gap-2'>
            <Icon name='brand-mark' className='size-5 text-foreground' />
            <span className='text-sm font-medium'>Granville Finance</span>
          </Link>
          <div className='w-12' />
        </div>
      </header>

      <main className='mx-auto max-w-3xl px-6 py-12'>
        <div className='mb-8'>
          <p className='text-sm text-muted-foreground mb-2'>Last updated: {lastUpdated}</p>
          <h1 className='text-3xl font-bold tracking-tight'>{title}</h1>
        </div>

        <div className='legal-content text-sm text-muted-foreground leading-relaxed [&_h2]:text-base [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground [&_h2]:mt-8 [&_h2]:mb-3 [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1 [&_strong]:text-foreground [&_strong]:font-semibold [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary'>
          {children}
        </div>
      </main>

      <footer className='border-t border-border/40 mt-16'>
        <div className='mx-auto max-w-3xl px-6 py-8 flex flex-wrap gap-4 items-center justify-between text-xs text-muted-foreground'>
          <span>© {new Date().getFullYear()} 17409052 Canada Inc. Trading as Granville Finance.</span>
          <div className='flex gap-4'>
            <Link to='/terms' className='hover:text-foreground transition-colors'>Terms</Link>
            <Link to='/privacy' className='hover:text-foreground transition-colors'>Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
