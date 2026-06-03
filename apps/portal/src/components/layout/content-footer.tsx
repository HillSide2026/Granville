export function ContentFooter() {
  return (
    <footer className='mt-auto border-t border-border/40 px-6 py-4 has-data-[layout=fixed]:hidden'>
      <div className='flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-xs text-muted-foreground'>
          Granville Finance is a trading name of 17409052 Canada Inc.
        </p>
        <nav className='flex gap-4'>
          <a
            href='https://granville.finance/terms'
            target='_blank'
            rel='noopener noreferrer'
            className='text-xs text-muted-foreground underline-offset-4 hover:underline hover:text-foreground transition-colors'
          >
            Terms
          </a>
          <a
            href='https://granville.finance/privacy'
            target='_blank'
            rel='noopener noreferrer'
            className='text-xs text-muted-foreground underline-offset-4 hover:underline hover:text-foreground transition-colors'
          >
            Privacy
          </a>
        </nav>
      </div>
    </footer>
  )
}
