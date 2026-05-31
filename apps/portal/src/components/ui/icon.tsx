import { type ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/utils'
import { iconRegistry, type IconName } from './icon-registry'

type IconProps = ComponentPropsWithoutRef<'span'> & {
  name: IconName
  label?: string
  size?: number
}

export function Icon({ name, label, size, className, style, ...props }: IconProps) {
  const src = iconRegistry[name]

  return (
    <span
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      className={cn('inline-block size-4 shrink-0 bg-current pointer-events-none', className)}
      style={{
        mask: `url(${src}) center / contain no-repeat`,
        WebkitMask: `url(${src}) center / contain no-repeat`,
        ...(size != null ? { width: size, height: size } : {}),
        ...style,
      }}
      {...props}
    />
  )
}
