import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/icon'

interface BrandLogotypeProps {
  className?: string
}

export function BrandLogotype({ className }: BrandLogotypeProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#f8fafc]">
        <Icon name="brand-mark" className="size-5 text-[#d5bf9b]" />
      </div>
      <div className="leading-none group-data-[collapsible=icon]:hidden">
        <div className="font-heading text-[0.72rem] font-bold tracking-[0.18em] text-[#d5bf9b] uppercase">
          Granville
        </div>
        <div className="mt-[3px] text-[0.58rem] font-medium tracking-[0.22em] text-[#c8ad7f]/70 uppercase">
          Finance
        </div>
      </div>
    </div>
  )
}
