import type { SVGProps } from 'react'

export function IconGoogle({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      className={className}
      aria-hidden='true'
      {...props}
    >
      <title>Google</title>
      <path
        fill='#4285F4'
        d='M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.64v2.98h3.89c2.28-2.1 3.53-5.19 3.53-8.86Z'
      />
      <path
        fill='#34A853'
        d='M12 24c3.24 0 5.96-1.07 7.95-2.88l-3.89-2.98c-1.08.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.95H1.25v3.07A12 12 0 0 0 12 24Z'
      />
      <path
        fill='#FBBC05'
        d='M5.27 14.34a7.18 7.18 0 0 1 0-4.68V6.59H1.25a12 12 0 0 0 0 10.82l4.02-3.07Z'
      />
      <path
        fill='#EA4335'
        d='M12 4.71c1.76 0 3.34.61 4.59 1.8l3.45-3.45A11.57 11.57 0 0 0 12 0 12 12 0 0 0 1.25 6.59l4.02 3.07C6.22 6.82 8.87 4.71 12 4.71Z'
      />
    </svg>
  )
}
